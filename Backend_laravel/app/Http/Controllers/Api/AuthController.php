<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Folder;
use App\Models\User;
use App\Services\FirebaseTokenVerifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use InvalidArgumentException;
use RuntimeException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $this->seedInitialUserFolders($user);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'E-mail ou senha incorretos.'
            ], 422);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Login com o Google. O front faz o login pelo Firebase e envia o ID token;
     * aqui o token é verificado e SÓ o e-mail confirmado dentro dele é usado.
     * Nunca confiar em e-mail/nome enviados direto pelo cliente.
     */
    public function googleLogin(Request $request, FirebaseTokenVerifier $verifier)
    {
        $request->validate([
            'id_token' => 'required|string',
        ]);

        try {
            $claims = $verifier->verify($request->input('id_token'));
        } catch (InvalidArgumentException) {
            return response()->json([
                'message' => 'Não foi possível confirmar o login com o Google. Tente novamente.',
            ], 401);
        } catch (RuntimeException $e) {
            report($e);

            return response()->json([
                'message' => 'Não foi possível validar o login com o Google agora. Tente novamente em instantes.',
            ], 503);
        }

        $email = $claims['email'] ?? null;

        if (($claims['firebase']['sign_in_provider'] ?? null) !== 'google.com'
            || ! is_string($email) || $email === ''
            || ($claims['email_verified'] ?? false) !== true) {
            return response()->json([
                'message' => 'A conta do Google precisa ter um e-mail verificado.',
            ], 422);
        }

        $name = $claims['name'] ?? null;
        if (! is_string($name) || $name === '') {
            $name = Str::before($email, '@');
        }

        $picture = $claims['picture'] ?? null;

        $isNew = ! User::where('email', $email)->exists();

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make(Str::random(24)),
            ]
        );

        if ($isNew) {
            $this->seedInitialUserFolders($user);
        }

        $token = $user->createToken('arquivox')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'displayName' => $user->name,
                'email' => $user->email,
                'photoURL' => is_string($picture) && $picture !== ''
                    ? $picture
                    : 'https://ui-avatars.com/api/?name='.urlencode($user->name).'&background=38bdf8&color=fff',
            ],
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->noContent();
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id' => (string) $user->id,
            'name' => $user->name,
            'displayName' => $user->name,
            'email' => $user->email,
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        return response()->json([
            'message' => 'Se o e-mail estiver cadastrado, as instruções para redefinição de senha foram enviadas.',
        ]);
    }

    private function seedInitialUserFolders(User $user): void
    {
        $folders = [
            'Imagens do projeto' => 'Fotos, capturas e assets visuais',
            'Vídeos demo' => 'Gravações e demonstrações do sistema',
            'Documentos' => 'Relatórios, PDFs e planilhas',
            'Código-fonte' => 'Scripts, esquemas de banco e código-fonte',
        ];

        foreach ($folders as $name => $description) {
            Folder::firstOrCreate([
                'user_id' => $user->id,
                'name' => $name,
            ], [
                'description' => $description,
            ]);
        }
    }
}