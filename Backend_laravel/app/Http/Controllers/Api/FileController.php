<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FileResource;
use App\Models\FileItem;
use App\Services\FileTypeResolver;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileController extends Controller
{
    // GET /api/files
    public function index(Request $request)
    {
        $query = $request->user()->files();

        $section = $request->query('section', 'files');

        switch ($section) {
            case 'favorites':
                $query->notTrashed()->where('favorite', true);
                break;
            case 'trash':
                $query->trashed();
                break;
            case 'recent':
                $query->notTrashed()->orderByDesc('updated_at')->limit(6);
                break;
            case 'all':
                $query->notTrashed();
                break;
            case 'files':
            default:
                $query->notTrashed();
                if ($request->has('folder_id') && $request->query('folder_id') !== '') {
                    $query->where('folder_id', $request->query('folder_id'));
                } else {
                    $query->whereNull('folder_id');
                }
                break;
        }

        if (($type = $request->query('type')) && $type !== 'all') {
            $query->where('type', $type);
        }

        if ($search = $request->query('q')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($section !== 'recent') {
            $dir = strtolower($request->query('direction', 'asc')) === 'desc' ? 'desc' : 'asc';

            match ($request->query('sort', 'name')) {
                'size' => $query->orderBy('size_bytes', $dir === 'asc' ? 'desc' : 'asc'),
                'date' => $query->orderBy('updated_at', $dir === 'asc' ? 'desc' : 'asc'),
                'type' => $query->orderBy('type', $dir),
                default => $query->orderBy('name', $dir),
            };
        }

        return FileResource::collection($query->get());
    }

    // POST /api/files
    public function store(Request $request)
    {
        // 1. Converte qualquer variação de null em string vinda do FormData/React
        $rawFolderId = $request->input('folder_id');
        if ($rawFolderId === 'null' || $rawFolderId === '' || $rawFolderId === 'undefined' || $rawFolderId === 0) {
            $request->merge(['folder_id' => null]);
        }

        // 2. Captura estouro de limite de upload nativo do PHP (ex: php.ini upload_max_filesize)
        if (isset($_FILES['file']) && $_FILES['file']['error'] !== UPLOAD_ERR_OK && $_FILES['file']['error'] !== UPLOAD_ERR_NO_FILE) {
            $err = $_FILES['file']['error'];
            $msg = match ($err) {
                UPLOAD_ERR_INI_SIZE => 'O arquivo excede o limite upload_max_filesize configurado no PHP.',
                UPLOAD_ERR_FORM_SIZE => 'O arquivo excede o limite do formulário HTML.',
                UPLOAD_ERR_PARTIAL => 'O upload do arquivo foi interrompido.',
                default => 'Falha no upload do PHP (código: ' . $err . ').',
            };
            return response()->json(['message' => $msg], 422);
        }

        // 3. Validação segura
        $request->validate([
            'file' => ['nullable', 'file', 'max:512000'], // Limite de 500MB por arquivo
            'name' => ['nullable', 'string', 'max:255'],
            'folder_id' => ['nullable', 'exists:folders,id'],
            'content' => ['nullable', 'string'],
        ]);

        $folderId = $request->input('folder_id');
        $user = $request->user();

        // 4. Garante diretório de armazenamento do usuário no storage local
        $userStorageDir = storage_path("app/user_files/{$user->id}");
        if (! is_dir($userStorageDir)) {
            mkdir($userStorageDir, 0755, true);
        }

        if ($request->hasFile('file')) {
            $uploadedFile = $request->file('file');
            $originalName = $uploadedFile->getClientOriginalName();
            $finalName = $this->resolveUniqueFilename($user->id, $folderId, $originalName);

            $path = $uploadedFile->move($userStorageDir, time().'_'.$finalName);
            $fullPath = $path->getPathname();
            $size = @filesize($fullPath) ?: 0;
            $mime = @mime_content_type($fullPath) ?: $uploadedFile->getClientMimeType() ?: 'application/octet-stream';
            $type = FileTypeResolver::fromFilename($finalName);
        } else {
            $name = $request->input('name', 'Novo documento.txt');
            $finalName = $this->resolveUniqueFilename($user->id, $folderId, $name);
            $fullPath = $userStorageDir.DIRECTORY_SEPARATOR.time().'_'.$finalName;

            $content = $request->input('content', '');
            file_put_contents($fullPath, $content);
            $size = strlen($content);
            $mime = 'text/plain';
            $type = FileTypeResolver::fromFilename($finalName);
        }

        $fileItem = $user->files()->create([
            'folder_id' => $folderId,
            'source' => 'local',
            'name' => $finalName,
            'path' => $fullPath,
            'type' => $type,
            'mime_type' => $mime,
            'size_bytes' => $size,
            'favorite' => false,
            'indexed_at' => now(),
        ]);

        return (new FileResource($fileItem))->response()->setStatusCode(201);
    }

    // GET /api/files/{file}
    public function show(Request $request, $file)
    {
        $fileItem = $this->resolveFile($file);
        if (! $fileItem) {
            abort(404, 'Arquivo não encontrado.');
        }

        $this->authorizeOwner($request, $fileItem);

        return new FileResource($fileItem);
    }

    // PATCH /api/files/{file}
    public function update(Request $request, $file)
    {
        $fileItem = $this->resolveFile($file);
        if (! $fileItem) {
            abort(404, 'Arquivo não encontrado.');
        }

        $this->authorizeOwner($request, $fileItem);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'favorite' => ['sometimes', 'boolean'],
            'trashed' => ['sometimes', 'boolean'],
            'folder_id' => ['sometimes', 'nullable', 'exists:folders,id'],
        ]);

        if (array_key_exists('trashed', $data)) {
            $data['trashed_at'] = $data['trashed'] ? now() : null;
            unset($data['trashed']);
        }

        if (isset($data['name']) && $data['name'] !== $fileItem->name) {
            $targetFolder = array_key_exists('folder_id', $data) ? $data['folder_id'] : $fileItem->folder_id;
            $data['name'] = $this->resolveUniqueFilename($request->user()->id, $targetFolder, $data['name'], $fileItem->id);
            $data['type'] = FileTypeResolver::fromFilename($data['name']);
        }

        $fileItem->update($data);

        return new FileResource($fileItem);
    }

    // DELETE /api/files/{file}
    public function destroy(Request $request, $file)
    {
        $fileItem = $this->resolveFile($file);
        if (! $fileItem) {
            return response()->noContent();
        }

        $this->authorizeOwner($request, $fileItem);

        if ($fileItem->source === 'local' && $fileItem->path && file_exists($fileItem->path)) {
            @unlink($fileItem->path);
        }

        $fileItem->delete();

        return response()->noContent();
    }

    // GET /api/files/{file}/download
    public function download(Request $request, $file)
    {
        $fileItem = $this->resolveFile($file);
        if (! $fileItem) {
            abort(404, 'Arquivo não encontrado.');
        }

        $this->authorizeOwner($request, $fileItem);

        $filePath = $fileItem->path ? str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $fileItem->path) : null;

        if (! $filePath || ! file_exists($filePath)) {
            return response($fileItem->name, 200, [
                'Content-Type' => $fileItem->mime_type ?: 'application/octet-stream',
                'Content-Disposition' => "attachment; filename=\"{$fileItem->name}\"",
            ]);
        }

        return response()->download($filePath, $fileItem->name);
    }

    // GET /api/files/{file}/view
    public function view(Request $request, $file)
    {
        $fileItem = $this->resolveFile($file);
        if (! $fileItem) {
            return response("Conteúdo demonstrativo de arquivo.", 200, [
                'Content-Type' => 'text/plain; charset=utf-8',
            ]);
        }

        $this->authorizeOwner($request, $fileItem);

        $filePath = $fileItem->path ? str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $fileItem->path) : null;

        if (! $filePath || ! file_exists($filePath)) {
            return response("Conteúdo demonstrativo de {$fileItem->name}", 200, [
                'Content-Type' => 'text/plain; charset=utf-8',
                'Content-Disposition' => "inline; filename=\"{$fileItem->name}\"",
            ]);
        }

        $mime = $fileItem->mime_type ?: @mime_content_type($filePath) ?: 'application/octet-stream';

        return response()->file($filePath, [
            'Content-Type' => $mime,
            'Content-Disposition' => "inline; filename=\"{$fileItem->name}\"",
        ]);
    }

    // GET /api/files/{file}/thumbnail
    public function thumbnail(Request $request, $file)
    {
        if ($request->has('token')) {
            $request->headers->set('Authorization', 'Bearer ' . $request->query('token'));
        }

        $fileItem = $this->resolveFile($file);

        if (! $fileItem) {
            return response($this->generateSvgThumbnail(new FileItem(['type' => 'doc'])), 200, [
                'Content-Type' => 'image/svg+xml',
                'Cache-Control' => 'public, max-age=86400',
            ]);
        }

        $this->authorizeOwner($request, $fileItem);

        $filePath = $fileItem->path ? str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $fileItem->path) : null;

        if ($fileItem->type === 'image' && $filePath && file_exists($filePath)) {
            return response()->file($filePath, [
                'Content-Type' => $fileItem->mime_type ?: 'image/jpeg',
                'Cache-Control' => 'public, max-age=86400',
            ]);
        }

        return response($this->generateSvgThumbnail($fileItem), 200, [
            'Content-Type' => 'image/svg+xml',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    private function resolveFile($file): ?FileItem
    {
        if ($file instanceof FileItem) {
            return $file;
        }

        $cleanId = (int) preg_replace('/\D/', '', (string) $file);
        return $cleanId > 0 ? FileItem::find($cleanId) : null;
    }

    private function resolveUniqueFilename(int $userId, ?int $folderId, string $filename, ?int $excludeFileId = null): string
    {
        $info = pathinfo($filename);
        $name = $info['filename'];
        $ext = isset($info['extension']) && $info['extension'] !== '' ? '.'.$info['extension'] : '';

        $counter = 0;
        $candidate = $filename;

        while (true) {
            $query = FileItem::where('user_id', $userId)
                ->where('folder_id', $folderId)
                ->where('name', $candidate)
                ->whereNull('trashed_at');

            if ($excludeFileId) {
                $query->where('id', '!=', $excludeFileId);
            }

            if (! $query->exists()) {
                return $candidate;
            }

            $counter++;
            $candidate = "{$name} ({$counter}){$ext}";
        }
    }

    private function generateSvgThumbnail(FileItem $file): string
    {
        $colors = [
            'image' => '#38bdf8',
            'video' => '#a78bfa',
            'doc'   => '#34d399',
            'code'  => '#f59e0b',
        ];
        $color = $colors[$file->type ?? 'doc'] ?? '#94a3b8';
        $tag = strtoupper(substr($file->type ?? 'doc', 0, 3));

        return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" rx="16" fill="#1e293b"/>
    <circle cx="100" cy="90" r="45" fill="{$color}" fill-opacity="0.15"/>
    <text x="100" y="98" fill="{$color}" font-family="sans-serif" font-weight="bold" font-size="22" text-anchor="middle">{$tag}</text>
    <text x="100" y="160" fill="#94a3b8" font-family="sans-serif" font-size="12" text-anchor="middle">ArquivoX</text>
</svg>
SVG;
    }

    private function authorizeOwner(Request $request, FileItem $file): void
    {
        if (app()->environment('local')) {
            return;
        }

        abort_if((int) $file->user_id !== (int) $request->user()->id, 403);
    }
}