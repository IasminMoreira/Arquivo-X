<?php

namespace Tests\Feature;

use App\Models\FileItem;
use App\Models\Folder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EssentialFeaturesTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_receive_sanctum_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Maria Silva',
            'email' => 'maria@example.com',
            'password' => '123456',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token']);

        $this->assertDatabaseHas('users', ['email' => 'maria@example.com']);
        $this->assertDatabaseHas('folders', ['name' => 'Imagens do projeto']);
    }

    public function test_user_can_login_with_email_and_password(): void
    {
        $user = User::factory()->create([
            'email' => 'joao@example.com',
            'password' => bcrypt('secret123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'joao@example.com',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'token']);
    }

    public function test_user_can_login_with_google(): void
    {
        $response = $this->postJson('/api/login/google', [
            'email' => 'usuario.google@gmail.com',
            'name' => 'Usuário Google',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'token']);

        $this->assertDatabaseHas('users', ['email' => 'usuario.google@gmail.com']);
    }

    public function test_file_operations_and_duplicate_check(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        // 1. Criar arquivo
        $createRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/files', [
                'name' => 'documento.txt',
                'content' => 'Conteúdo de teste',
            ]);

        $createRes->assertStatus(201);
        $fileId = $createRes->json('data.id');

        // 2. Checar nome duplicado
        $checkRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/files/check-name', [
                'name' => 'documento.txt',
            ]);

        $checkRes->assertStatus(200)
            ->assertJson(['exists' => true, 'suggestedName' => 'documento (1).txt']);

        // 3. Renomear arquivo
        $renameRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/files/{$fileId}", [
                'name' => 'documento-final.txt',
            ]);

        $renameRes->assertStatus(200)
            ->assertJsonPath('data.name', 'documento-final.txt');

        // 4. Copiar arquivo
        $copyRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/files/{$fileId}/copy");

        $copyRes->assertStatus(201);
        $this->assertDatabaseCount('files', 2);

        // 5. Favoritar
        $favRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/files/{$fileId}", [
                'favorite' => true,
            ]);
        $favRes->assertJsonPath('data.favorite', true);

        // 6. Mover para lixeira e restaurar
        $trashRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/files/{$fileId}", [
                'trashed' => true,
            ]);
        $trashRes->assertJsonPath('data.trashed', true);

        $restoreRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/files/{$fileId}", [
                'trashed' => false,
            ]);
        $restoreRes->assertJsonPath('data.trashed', false);

        // 7. Exclusão definitiva
        $delRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/files/{$fileId}");
        $delRes->assertStatus(204);
    }

    public function test_folders_and_shortcuts(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $folderRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/folders', [
                'name' => 'Minhas Fotos',
                'description' => 'Álbum de fotos de férias',
            ]);

        $folderRes->assertStatus(201);
        $folderId = $folderRes->json('data.id');

        // Criar atalho
        $shortcutRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/folders/{$folderId}/shortcut");

        $shortcutRes->assertStatus(201)
            ->assertJsonPath('data.isShortcut', true);
    }

    public function test_albums_crud(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $albumRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/albums', [
                'name' => 'Álbum de Férias',
                'description' => 'Fotos e memórias',
            ]);

        $albumRes->assertStatus(201);
        $albumId = $albumRes->json('data.id');

        $listRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/albums');

        $listRes->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_storage_usage_endpoint(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $before = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/storage/usage');

        $before->assertStatus(200)
            ->assertJsonStructure(['totalGB', 'usedGB', 'freeGB', 'usedBytes', 'totalBytes', 'byType', 'devices']);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/files', [
                'name' => 'relatorio.txt',
                'content' => str_repeat('A', 2048),
            ])
            ->assertStatus(201);

        $after = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/storage/usage');

        $after->assertOk();
        $this->assertGreaterThan($before->json('usedBytes'), $after->json('usedBytes'));
        $this->assertSame(100.0, $after->json('totalGB'));
    }
}
