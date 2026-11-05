<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Pastas do disco que o usuário registrou para o Laravel indexar.
// Cada watched_folder é uma "raiz" que vira uma árvore em `folders`.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('watched_folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('path');   // caminho absoluto no disco, ex: /home/user/Documentos
            $table->string('label');  // nome amigável mostrado no app
            $table->timestamp('last_scanned_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('watched_folders');
    }
};
