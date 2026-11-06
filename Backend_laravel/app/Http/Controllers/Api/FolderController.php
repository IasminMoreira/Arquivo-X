<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FolderResource;
use App\Models\Folder;
use Illuminate\Http\Request;

class FolderController extends Controller
{
    // GET /api/folders
    public function index(Request $request)
    {
        // Retorna todas as pastas do utilizador para o front-end gerir a árvore localmente
        $folders = $request->user()->folders()
            ->withCount(['files' => fn ($q) => $q->notTrashed()])
            ->withSum(['files' => fn ($q) => $q->notTrashed()], 'size_bytes')
            ->orderBy('name')
            ->get();

        return FolderResource::collection($folders);
    }

    // GET /api/folders/{folder}
    public function show(Request $request, Folder $folder)
    {
        $this->authorizeOwner($request, $folder);

        $folder->loadCount(['files' => fn ($q) => $q->notTrashed()]);
        $folder->loadSum(['files' => fn ($q) => $q->notTrashed()], 'size_bytes');

        return new FolderResource($folder);
    }

    // POST /api/folders
    public function store(Request $request)
    {
        $rawParentId = $request->input('parent_id');
        if (in_array($rawParentId, ['null', '', 'undefined'], true)) {
            $request->merge(['parent_id' => null]);
        }

        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'parent_id' => ['nullable', 'exists:folders,id'],
        ]);

        $folder = $request->user()->folders()->create([
            'name' => $data['name'] ?: 'Nova pasta',
            'description' => $data['description'] ?? null,
            'parent_id' => $data['parent_id'] ?? null,
        ]);

        $folder->loadCount(['files' => fn ($q) => $q->notTrashed()]);
        $folder->loadSum(['files' => fn ($q) => $q->notTrashed()], 'size_bytes');

        return (new FolderResource($folder))->response()->setStatusCode(201);
    }

    // PATCH /api/folders/{folder}  { name?, description?, parent_id? }
    public function update(Request $request, Folder $folder)
    {
        $this->authorizeOwner($request, $folder);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'parent_id' => ['sometimes', 'nullable', 'exists:folders,id'],
        ]);

        $folder->update($data);

        $folder->loadCount(['files' => fn ($q) => $q->notTrashed()]);
        $folder->loadSum(['files' => fn ($q) => $q->notTrashed()], 'size_bytes');

        return new FolderResource($folder);
    }

    // DELETE /api/folders/{folder}
    public function destroy(Request $request, Folder $folder)
    {
        $this->authorizeOwner($request, $folder);

        // Remove arquivos da pasta
        foreach ($folder->files as $file) {
            if ($file->source === 'local' && $file->path && file_exists($file->path)) {
                @unlink($file->path);
            }
            $file->delete();
        }

        $folder->delete();

        return response()->noContent();
    }

    // POST /api/folders/{folder}/shortcut { parent_id? }
    public function createShortcut(Request $request, Folder $folder)
    {
        $this->authorizeOwner($request, $folder);

        $data = $request->validate([
            'parent_id' => ['nullable', 'exists:folders,id'],
        ]);

        $shortcut = $request->user()->folders()->create([
            'name' => "Atalho para {$folder->name}",
            'description' => "Atalho de pasta apontando para {$folder->name}",
            'parent_id' => $data['parent_id'] ?? null,
            'is_shortcut' => true,
            'shortcut_target_id' => $folder->id,
        ]);

        return new FolderResource($shortcut);
    }

    private function authorizeOwner(Request $request, Folder $folder): void
    {
        abort_if($folder->user_id !== $request->user()->id, 403);
    }
}
