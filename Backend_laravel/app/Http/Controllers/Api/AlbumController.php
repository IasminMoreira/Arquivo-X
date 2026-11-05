<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AlbumResource;
use App\Models\Album;
use App\Models\FileItem;
use Illuminate\Http\Request;

class AlbumController extends Controller
{
    // GET /api/albums
    public function index(Request $request)
    {
        $albums = $request->user()->albums()
            ->withCount('files')
            ->orderBy('name')
            ->get();

        return AlbumResource::collection($albums);
    }

    // POST /api/albums { name, description?, cover_file_id? }
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'cover_file_id' => ['nullable', 'exists:files,id'],
        ]);

        $album = $request->user()->albums()->create($data);

        return new AlbumResource($album);
    }

    // GET /api/albums/{album}
    public function show(Request $request, Album $album)
    {
        $this->authorizeOwner($request, $album);
        $album->load('files');

        return new AlbumResource($album);
    }

    // PATCH /api/albums/{album}
    public function update(Request $request, Album $album)
    {
        $this->authorizeOwner($request, $album);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'cover_file_id' => ['sometimes', 'nullable', 'exists:files,id'],
        ]);

        $album->update($data);

        return new AlbumResource($album);
    }

    // DELETE /api/albums/{album}
    public function destroy(Request $request, Album $album)
    {
        $this->authorizeOwner($request, $album);
        $album->delete();

        return response()->noContent();
    }

    // POST /api/albums/{album}/files { file_id }
    public function addFile(Request $request, Album $album)
    {
        $this->authorizeOwner($request, $album);

        $data = $request->validate([
            'file_id' => ['required', 'exists:files,id'],
        ]);

        $file = FileItem::findOrFail($data['file_id']);
        abort_if($file->user_id !== $request->user()->id, 403);

        $album->files()->syncWithoutDetaching([$file->id]);

        return response()->json(['message' => 'Arquivo adicionado ao álbum com sucesso.']);
    }

    // DELETE /api/albums/{album}/files/{file}
    public function removeFile(Request $request, Album $album, FileItem $file)
    {
        $this->authorizeOwner($request, $album);
        abort_if($file->user_id !== $request->user()->id, 403);

        $album->files()->detach($file->id);

        return response()->noContent();
    }

    private function authorizeOwner(Request $request, Album $album): void
    {
        abort_if($album->user_id !== $request->user()->id, 403);
    }
}
