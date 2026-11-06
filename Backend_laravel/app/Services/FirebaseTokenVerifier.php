<?php

namespace App\Services;

use Closure;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;
use JsonException;
use RuntimeException;

/**
 * Valida um ID token do Firebase Authentication (JWT assinado com RS256),
 * seguindo https://firebase.google.com/docs/auth/admin/verify-id-tokens
 *
 * Não depende de pacote externo: a assinatura é conferida com os certificados
 * públicos que o Google publica (openssl) e as claims são checadas à mão.
 *
 * Erros:
 *  - InvalidArgumentException: o token é inválido (assinatura, validade,
 *    projeto, emissor...). Quem chama deve responder 401.
 *  - RuntimeException: não deu para validar agora (projeto não configurado ou
 *    falha ao baixar os certificados). Quem chama deve responder 503.
 */
class FirebaseTokenVerifier
{
    public const CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

    private const CERTS_CACHE_KEY = 'firebase.securetoken.certs';

    private const CERTS_TTL_SECONDS = 3600;

    /** Tolerância para pequenas diferenças de relógio entre servidores. */
    private const LEEWAY_SECONDS = 60;

    /** @var Closure(bool): array<string, string> kid => certificado PEM */
    private Closure $certsProvider;

    /**
     * @param  Closure(bool): array<string, string>|null  $certsProvider  Fornece os certificados (o bool pede para ignorar o cache). Só é passado em testes.
     */
    public function __construct(
        private readonly string $projectId,
        ?Closure $certsProvider = null,
    ) {
        $this->certsProvider = $certsProvider ?? $this->defaultCertsProvider(...);
    }

    /**
     * @return array<string, mixed> as claims do token, já validadas
     *
     * @throws InvalidArgumentException token inválido
     * @throws RuntimeException não foi possível validar agora
     */
    public function verify(string $idToken, ?int $now = null): array
    {
        if ($this->projectId === '') {
            throw new RuntimeException('FIREBASE_PROJECT_ID não está configurado.');
        }

        $now ??= time();

        $parts = explode('.', $idToken);
        if (count($parts) !== 3) {
            throw new InvalidArgumentException('Token malformado.');
        }
        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;

        $header = $this->decodeJson($encodedHeader);
        $claims = $this->decodeJson($encodedPayload);
        $signature = $this->base64UrlDecode($encodedSignature);

        // Só RS256: recusa "none", HS256 etc. (ataques de troca de algoritmo).
        if (($header['alg'] ?? null) !== 'RS256') {
            throw new InvalidArgumentException('Algoritmo de assinatura não permitido.');
        }

        $kid = $header['kid'] ?? null;
        if (! is_string($kid) || $kid === '') {
            throw new InvalidArgumentException('Token sem identificador de chave.');
        }

        $this->assertSignature($encodedHeader.'.'.$encodedPayload, $signature, $kid);
        $this->assertClaims($claims, $now);

        return $claims;
    }

    private function assertSignature(string $signedData, string $signature, string $kid): void
    {
        $certs = ($this->certsProvider)(false);

        if (! isset($certs[$kid])) {
            // O Google troca as chaves de tempos em tempos: tenta uma vez com certificados novos.
            $certs = ($this->certsProvider)(true);
        }

        if (! isset($certs[$kid])) {
            throw new InvalidArgumentException('Chave de assinatura desconhecida.');
        }

        if (openssl_verify($signedData, $signature, $certs[$kid], OPENSSL_ALGO_SHA256) !== 1) {
            throw new InvalidArgumentException('Assinatura inválida.');
        }
    }

    /**
     * @param  array<string, mixed>  $claims
     */
    private function assertClaims(array $claims, int $now): void
    {
        if (($claims['aud'] ?? null) !== $this->projectId) {
            throw new InvalidArgumentException('Token emitido para outro projeto.');
        }

        if (($claims['iss'] ?? null) !== 'https://securetoken.google.com/'.$this->projectId) {
            throw new InvalidArgumentException('Emissor do token inválido.');
        }

        $subject = $claims['sub'] ?? null;
        if (! is_string($subject) || $subject === '') {
            throw new InvalidArgumentException('Token sem usuário (sub).');
        }

        $expiresAt = $claims['exp'] ?? null;
        if (! is_int($expiresAt) || $expiresAt + self::LEEWAY_SECONDS < $now) {
            throw new InvalidArgumentException('Token expirado.');
        }

        $issuedAt = $claims['iat'] ?? null;
        if (! is_int($issuedAt) || $issuedAt - self::LEEWAY_SECONDS > $now) {
            throw new InvalidArgumentException('Token emitido no futuro.');
        }

        $authTime = $claims['auth_time'] ?? null;
        if (! is_int($authTime) || $authTime - self::LEEWAY_SECONDS > $now) {
            throw new InvalidArgumentException('Horário de autenticação inválido.');
        }
    }

    /**
     * @return array<string, string>
     */
    private function defaultCertsProvider(bool $refresh): array
    {
        // Limita a renovação forçada a uma por minuto: sem isso, tokens com
        // "kid" inventado fariam o servidor consultar o Google a cada requisição.
        if ($refresh && Cache::add(self::CERTS_CACHE_KEY.'.refresh_lock', true, 60)) {
            Cache::forget(self::CERTS_CACHE_KEY);
        }

        return Cache::remember(self::CERTS_CACHE_KEY, self::CERTS_TTL_SECONDS, function (): array {
            try {
                $certs = Http::timeout(5)->acceptJson()->get(self::CERTS_URL)->throw()->json();
            } catch (\Throwable $e) {
                throw new RuntimeException('Não foi possível obter os certificados do Google.', 0, $e);
            }

            if (! is_array($certs) || $certs === []) {
                throw new RuntimeException('Resposta inválida ao buscar os certificados do Google.');
            }

            return $certs;
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function decodeJson(string $encoded): array
    {
        try {
            $decoded = json_decode($this->base64UrlDecode($encoded), true, 16, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            throw new InvalidArgumentException('Token malformado.');
        }

        if (! is_array($decoded)) {
            throw new InvalidArgumentException('Token malformado.');
        }

        return $decoded;
    }

    private function base64UrlDecode(string $value): string
    {
        $remainder = strlen($value) % 4;
        if ($remainder !== 0) {
            $value .= str_repeat('=', 4 - $remainder);
        }

        $decoded = base64_decode(strtr($value, '-_', '+/'), true);
        if ($decoded === false) {
            throw new InvalidArgumentException('Token malformado.');
        }

        return $decoded;
    }
}
