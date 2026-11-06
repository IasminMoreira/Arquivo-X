<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CloudConnection;
use Illuminate\Http\Request;

class CloudController extends Controller
{
    // GET /api/cloud/connections
    public function index(Request $request)
    {
        $connections = $request->user()->cloudConnections()->get();

        return response()->json([
            'providers' => [
                'google_drive' => [
                    'name' => 'Google Drive',
                    'connected' => $connections->where('provider', 'google_drive')->isNotEmpty(),
                    'connected_at' => $connections->where('provider', 'google_drive')->first()?->connected_at,
                ],
                'local_cloud' => [
                    'name' => 'Nuvem Própria Local',
                    'connected' => true,
                    'connected_at' => $request->user()->created_at,
                ],
            ],
        ]);
    }

    // POST /api/cloud/google/connect
    public function connectGoogle(Request $request)
    {
        $data = $request->validate([
            'access_token' => ['nullable', 'string'],
            'refresh_token' => ['nullable', 'string'],
        ]);

        $connection = $request->user()->cloudConnections()->updateOrCreate(
            ['provider' => 'google_drive'],
            [
                'access_token' => $data['access_token'] ?? 'simulated_google_token_'.bin2hex(random_bytes(16)),
                'refresh_token' => $data['refresh_token'] ?? 'simulated_refresh_token_'.bin2hex(random_bytes(16)),
                'expires_at' => now()->addDays(30),
                'connected_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Conta do Google conectada com sucesso!',
            'connection' => $connection,
        ]);
    }

    // DELETE /api/cloud/google/disconnect
    public function disconnectGoogle(Request $request)
    {
        $request->user()->cloudConnections()->where('provider', 'google_drive')->delete();

        return response()->json(['message' => 'Desconectado do Google Drive.']);
    }

    // POST /api/cloud/sync
    public function sync(Request $request)
    {
        // Sincroniza arquivos (varre pastas locais e atualiza índices)
        $watchedFolders = $request->user()->watchedFolders;
        foreach ($watchedFolders as $wf) {
            \Artisan::call('index:scan', ['watchedFolderId' => $wf->id]);
        }

        return response()->json([
            'message' => 'Sincronização concluída com sucesso.',
            'synced_at' => now()->toIso8601String(),
        ]);
    }
}
