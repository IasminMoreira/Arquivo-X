<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('folders', function (Blueprint $table) {
            $table->text('description')->nullable()->after('name');
            $table->boolean('is_shortcut')->default(false)->after('path');
            $table->foreignId('shortcut_target_id')->nullable()->constrained('folders')->nullOnDelete()->after('is_shortcut');
        });

        Schema::create('albums', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('cover_file_id')->nullable()->constrained('files')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('album_file', function (Blueprint $table) {
            $table->id();
            $table->foreignId('album_id')->constrained()->cascadeOnDelete();
            $table->foreignId('file_id')->constrained('files')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['album_id', 'file_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('album_file');
        Schema::dropIfExists('albums');

        Schema::table('folders', function (Blueprint $table) {
            $table->dropForeign(['shortcut_target_id']);
            $table->dropColumn(['description', 'is_shortcut', 'shortcut_target_id']);
        });
    }
};
