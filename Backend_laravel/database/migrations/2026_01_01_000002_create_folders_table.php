<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Espelha a árvore de diretórios de cada watched_folder.
// parent_id nulo = pasta na raiz da watched_folder.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('watched_folder_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('folders')->cascadeOnDelete();
            $table->string('name');
            $table->string('path')->nullable(); // caminho absoluto no disco, quando aplicável
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('folders');
    }
};
