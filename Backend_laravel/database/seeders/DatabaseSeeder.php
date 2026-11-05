<?php

namespace Database\Seeders;

use App\Models\Album;
use App\Models\FileItem;
use App\Models\Folder;
use App\Models\User;
use App\Services\FileTypeResolver;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Cria usuário padrão para testes rápidos
        $user = User::updateOrCreate(
            ['email' => 'teste@arquivox.com'],
            [
                'name' => 'Aluno PI',
                'password' => Hash::make('password'),
            ]
        );

        // Usuário Google demonstrativo
        User::updateOrCreate(
            ['email' => 'usuario.google@gmail.com'],
            [
                'name' => 'Usuário Google',
                'password' => Hash::make('password'),
            ]
        );

        $userDir = storage_path("app/user_files/{$user->id}");
        if (! is_dir($userDir)) {
            mkdir($userDir, 0755, true);
        }

        // Pastas principais
        $d1 = Folder::updateOrCreate(['user_id' => $user->id, 'name' => 'Imagens do projeto'], [
            'description' => 'Fotografias, capturas de tela e assets gráficos.',
        ]);
        $d2 = Folder::updateOrCreate(['user_id' => $user->id, 'name' => 'Vídeos demo'], [
            'description' => 'Vídeos de demonstração e gravações de reuniões.',
        ]);
        $d3 = Folder::updateOrCreate(['user_id' => $user->id, 'name' => 'Documentos'], [
            'description' => 'Relatórios, contratos e planilhas financeiras.',
        ]);
        $d4 = Folder::updateOrCreate(['user_id' => $user->id, 'name' => 'Código-fonte'], [
            'description' => 'Scripts, esquemas de banco e integrações de API.',
        ]);

        // Arquivos de exemplo
        $sampleFiles = [
            // Raiz
            ['name' => 'escopo-mvp.pdf', 'folder_id' => null, 'fav' => true, 'trashed' => false, 'content' => '%PDF-1.4 Escopo do MVP - Projeto ArquivoX'],
            ['name' => 'logo-arquivox.png', 'folder_id' => null, 'fav' => true, 'trashed' => false, 'content' => 'PNG_DEMO_DATA'],
            ['name' => 'roadmap.xlsx', 'folder_id' => null, 'fav' => false, 'trashed' => false, 'content' => 'Planilha de Roadmap do PI'],

            // d1 (Imagens)
            ['name' => 'praia-sunset.jpg', 'folder_id' => $d1->id, 'fav' => true, 'trashed' => false, 'content' => 'JPEG_DEMO_IMAGE'],
            ['name' => 'wireframe-v2.png', 'folder_id' => $d1->id, 'fav' => false, 'trashed' => false, 'content' => 'PNG_DEMO_IMAGE'],
            ['name' => 'banner-home.png', 'folder_id' => $d1->id, 'fav' => false, 'trashed' => false, 'content' => 'PNG_DEMO_BANNER'],

            // d2 (Vídeos)
            ['name' => 'reuniao-kickoff.mp4', 'folder_id' => $d2->id, 'fav' => false, 'trashed' => false, 'content' => 'MP4_SAMPLE_VIDEO_DATA'],
            ['name' => 'demo-interface.mov', 'folder_id' => $d2->id, 'fav' => true, 'trashed' => false, 'content' => 'MOV_SAMPLE_VIDEO_DATA'],

            // d3 (Documentos)
            ['name' => 'planilha-custos.xlsx', 'folder_id' => $d3->id, 'fav' => false, 'trashed' => false, 'content' => 'Planilha de Custos Operacionais'],
            ['name' => 'contrato-drive.docx', 'folder_id' => $d3->id, 'fav' => false, 'trashed' => false, 'content' => 'Minuta de Contrato de Nuvem'],

            // d4 (Código)
            ['name' => 'api-client.ts', 'folder_id' => $d4->id, 'fav' => false, 'trashed' => false, 'content' => '// Cliente API ArquivoX em TypeScript'],
            ['name' => 'schema-banco.sql', 'folder_id' => $d4->id, 'fav' => true, 'trashed' => false, 'content' => 'CREATE TABLE files (id INTEGER PRIMARY KEY);'],

            // Lixeira
            ['name' => 'rascunho-antigo.docx', 'folder_id' => null, 'fav' => false, 'trashed' => true, 'content' => 'Rascunho descartado.'],
            ['name' => 'teste-render.mp4', 'folder_id' => null, 'fav' => false, 'trashed' => true, 'content' => 'Render de teste.'],
            ['name' => 'print-erro.png', 'folder_id' => null, 'fav' => false, 'trashed' => true, 'content' => 'Screenshot de erro.'],
        ];

        $createdFileIds = [];

        foreach ($sampleFiles as $f) {
            $path = $userDir.DIRECTORY_SEPARATOR.$f['name'];
            if (! file_exists($path)) {
                file_put_contents($path, $f['content']);
            }

            $size = strlen($f['content']) > 1000 ? strlen($f['content']) : rand(50000, 2500000);
            $type = FileTypeResolver::fromFilename($f['name']);

            $item = FileItem::updateOrCreate([
                'user_id' => $user->id,
                'name' => $f['name'],
            ], [
                'folder_id' => $f['folder_id'],
                'path' => $path,
                'type' => $type,
                'mime_type' => 'application/octet-stream',
                'size_bytes' => $size,
                'favorite' => $f['fav'],
                'trashed_at' => $f['trashed'] ? now()->subDays(2) : null,
                'source' => 'local',
                'indexed_at' => now(),
            ]);

            $createdFileIds[] = $item->id;
        }

        // Cria álbum inicial de exemplo
        $album = Album::updateOrCreate([
            'user_id' => $user->id,
            'name' => 'Destaques do Projeto',
        ], [
            'description' => 'Arquivos e recursos essenciais para a apresentação do PI.',
        ]);

        if (! empty($createdFileIds)) {
            $album->files()->sync(array_slice($createdFileIds, 0, 3));
        }
    }
}
