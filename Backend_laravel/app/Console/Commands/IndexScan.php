<?php

namespace App\Console\Commands;

use App\Models\FileItem;
use App\Models\Folder;
use App\Models\WatchedFolder;
use App\Services\FileTypeResolver;
use Illuminate\Console\Command;

class IndexScan extends Command
{
    protected $signature = 'index:scan {watchedFolderId? : ID de uma watched_folder específica (opcional, senão varre todas)}';

    protected $description = 'Varre as pastas registradas no disco e atualiza o índice de arquivos/pastas.';

    public function handle(): int
    {
        $query = WatchedFolder::query();

        if ($id = $this->argument('watchedFolderId')) {
            $query->where('id', $id);
        }

        $watchedFolders = $query->get();

        if ($watchedFolders->isEmpty()) {
            $this->warn('Nenhuma watched_folder encontrada.');

            return self::SUCCESS;
        }

        foreach ($watchedFolders as $watched) {
            $this->info("Escaneando: {$watched->path}");
            $this->scanDirectory($watched, $watched->path, null);
            $watched->update(['last_scanned_at' => now()]);
        }

        return self::SUCCESS;
    }

    private function scanDirectory(WatchedFolder $watched, string $path, ?int $parentFolderId): void
    {
        if (! is_dir($path) || ! is_readable($path)) {
            $this->warn("  Ignorando (não existe ou sem permissão): {$path}");

            return;
        }

        foreach (scandir($path) as $entry) {
            if ($entry === '.' || $entry === '..') {
                continue;
            }

            $fullPath = rtrim($path, '/').'/'.$entry;

            if (is_dir($fullPath)) {
                $folder = Folder::updateOrCreate(
                    [
                        'user_id' => $watched->user_id,
                        'watched_folder_id' => $watched->id,
                        'path' => $fullPath,
                    ],
                    [
                        'name' => $entry,
                        'parent_id' => $parentFolderId,
                    ]
                );

                $this->scanDirectory($watched, $fullPath, $folder->id);
            } else {
                FileItem::updateOrCreate(
                    [
                        'user_id' => $watched->user_id,
                        'watched_folder_id' => $watched->id,
                        'path' => $fullPath,
                    ],
                    [
                        'folder_id' => $parentFolderId,
                        'name' => $entry,
                        'type' => FileTypeResolver::fromFilename($entry),
                        'mime_type' => @mime_content_type($fullPath) ?: null,
                        'size_bytes' => @filesize($fullPath) ?: 0,
                        'source' => 'local',
                        'indexed_at' => now(),
                    ]
                );
            }
        }

        // Nota: este comando não remove do índice arquivos apagados do disco
        // desde o último scan. Se isso for importante para você, dá pra
        // adicionar uma marcação "seen_at" e, no fim do scan, mover para a
        // lixeira (trashed_at) tudo que não foi visto na passada atual.
    }
}
