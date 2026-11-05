<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabela unificada: arquivos locais (indexados do disco) e, no futuro,
// arquivos da nuvem (source = 'google_drive', com external_id preenchido).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('folder_id')->nullable()->constrained('folders')->nullOnDelete();
            $table->foreignId('watched_folder_id')->nullable()->constrained()->nullOnDelete();

            $table->enum('source', ['local', 'google_drive'])->default('local');
            $table->string('external_id')->nullable(); // id do arquivo no provedor de nuvem

            $table->string('name');
            $table->string('path')->nullable(); // caminho absoluto no disco, quando source=local
            $table->enum('type', ['image', 'video', 'doc', 'code'])->default('doc');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size_bytes')->default(0);

            $table->boolean('favorite')->default(false);
            $table->timestamp('trashed_at')->nullable(); // preenchido = está na lixeira
            $table->timestamp('indexed_at')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'folder_id']);
            $table->index(['user_id', 'trashed_at']);
            $table->index(['user_id', 'favorite']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};
