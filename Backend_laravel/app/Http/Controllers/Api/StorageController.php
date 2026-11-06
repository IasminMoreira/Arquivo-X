<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class StorageController extends Controller
{
    // GET /api/storage/usage
    public function usage(Request $request)
    {
        $quotaBytes = 100 * 1073741824; // Cota do plano (100 GB)

        $totalsByType =$request->user()->files()
            ->notTrashed()
            ->selectRaw('type, SUM(size_bytes) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        $byType = [];
        $byTypeBytes = [];$totalBytesUsed = 0;

        foreach (['image', 'video', 'doc', 'code'] as $type) {$bytes = (int) ($totalsByType[$type] ?? 0);
            $totalBytesUsed +=$bytes;
            $byTypeBytes[$type] =$bytes;
            $byType[$type] = round($bytes / 1073741824, 4);
        }

        $totalGB = round($quotaBytes / 1073741824, 1);$usedGB = round($totalBytesUsed / 1073741824, 4);$freeGB = round(max(0, $quotaBytes -$totalBytesUsed) / 1073741824, 1);

        $localBytes = (int)$request->user()->files()->notTrashed()->where('source', 'local')->sum('size_bytes');
        $cloudBytes = (int)$request->user()->files()->notTrashed()->where('source', 'google_drive')->sum('size_bytes');

        return response()->json([
            'totalGB' => $totalGB,
            'usedGB' => $usedGB,
            'freeGB' => $freeGB,
            'usedBytes' => $totalBytesUsed,
            'totalBytes' => $quotaBytes,
            'freeBytes' => max(0, $quotaBytes -$totalBytesUsed),
            'byType' => $byType,
            'byTypeBytes' => $byTypeBytes,
            'devices' => [
                'local' => [
                    'label' => 'Armazenamento Local',
                    'usedBytes' => $localBytes,
                    'usedGB' => round($localBytes / 1073741824, 4),
                ],
                'cloud' => [
                    'label' => 'Nuvem (Google Drive)',
                    'usedBytes' => $cloudBytes,
                    'usedGB' => round($cloudBytes / 1073741824, 4),
                ],
            ],
        ]);
    }
}