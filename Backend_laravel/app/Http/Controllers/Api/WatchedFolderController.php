<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WatchedFolder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class WatchedFolderController extends Controller
{
    // GET /api/watched-folders
    public function index(Request $request)
    {
        return $request->user()->watchedFolders()->orderBy('label')->get();
    }

    // POST /api/watched-folders  { path, label }
    public function store(Request $request)
    {
        $data = $request->validate([
            'path' => ['required', 'string'],
            'label' => ['required', 'string', 'max:255'],
        ]);

        abort_unless(is_dir($data['path']), 422, 'Essa pasta não existe no disco do servidor.');

        $watchedFolder = $request->user()->watchedFolders()->create($data);

        return response()->json($watchedFolder, 201);
    }

    // POST /api/watched-folders/{watchedFolder}/scan
    public function scan(Request $request, WatchedFolder $watchedFolder)
    {
        abort_if($watchedFolder->user_id !== $request->user()->id, 403);

        // Roda de forma síncrona por simplicidade; se a árvore de arquivos
        // for muito grande, troque por Artisan::queue() + uma fila configurada.
        Artisan::call('index:scan', ['watchedFolderId' => $watchedFolder->id]);

        return response()->json(['message' => 'Indexação concluída.']);
    }
}
