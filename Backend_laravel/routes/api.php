<?php

use App\Http\Controllers\Api\AlbumController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CloudController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\FolderController;
use App\Http\Controllers\Api\StorageController;
use App\Http\Controllers\Api\WatchedFolderController;
use Illuminate\Support\Facades\Route;

// Rotas públicas de autenticação
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/login/google', [AuthController::class, 'googleLogin']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);

// Rotas protegidas (Bearer Token via Laravel Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    // Pastas
    Route::get('/folders', [FolderController::class, 'index']);
    Route::post('/folders', [FolderController::class, 'store']);
    Route::get('/folders/{folder}', [FolderController::class, 'show']);
    Route::patch('/folders/{folder}', [FolderController::class, 'update']);
    Route::delete('/folders/{folder}', [FolderController::class, 'destroy']);
    Route::post('/folders/{folder}/shortcut', [FolderController::class, 'createShortcut']);

    // Arquivos
    Route::get('/files', [FileController::class, 'index']);
    Route::post('/files', [FileController::class, 'store']);
    Route::get('/files/{file}', [FileController::class, 'show']);
    Route::patch('/files/{file}', [FileController::class, 'update']);
    Route::delete('/files/{file}', [FileController::class, 'destroy']);
    Route::delete('/trash/empty', [FileController::class, 'emptyTrash']);

    // Operações em Arquivos (copiar, mover, checar duplicatas)
    Route::post('/files/{file}/copy', [FileController::class, 'copy']);
    Route::post('/files/{file}/move', [FileController::class, 'move']);
    Route::post('/files/check-name', [FileController::class, 'checkName']);
    Route::get('/files/duplicates', [FileController::class, 'duplicates']);

    // Visualização, Download, Streaming e Miniaturas
    Route::get('/files/{file}/download', [FileController::class, 'download']);
    Route::get('/files/{file}/stream', [FileController::class, 'stream']);
    Route::get('/files/{file}/view', [FileController::class, 'view']);
    Route::get('/files/{file}/thumbnail', [FileController::class, 'thumbnail']);

    // Álbuns / Grupos de Arquivos
    Route::get('/albums', [AlbumController::class, 'index']);
    Route::post('/albums', [AlbumController::class, 'store']);
    Route::get('/albums/{album}', [AlbumController::class, 'show']);
    Route::patch('/albums/{album}', [AlbumController::class, 'update']);
    Route::delete('/albums/{album}', [AlbumController::class, 'destroy']);
    Route::post('/albums/{album}/files', [AlbumController::class, 'addFile']);
    Route::delete('/albums/{album}/files/{file}', [AlbumController::class, 'removeFile']);

    // Pastas Monitoradas do Disco Local (Indexação)
    Route::get('/watched-folders', [WatchedFolderController::class, 'index']);
    Route::post('/watched-folders', [WatchedFolderController::class, 'store']);
    Route::post('/watched-folders/{watchedFolder}/scan', [WatchedFolderController::class, 'scan']);

    // Armazenamento
    Route::get('/storage/usage', [StorageController::class, 'usage']);

    // Integração com a Nuvem
    Route::get('/cloud/connections', [CloudController::class, 'index']);
    Route::post('/cloud/google/connect', [CloudController::class, 'connectGoogle']);
    Route::delete('/cloud/google/disconnect', [CloudController::class, 'disconnectGoogle']);
    Route::post('/cloud/sync', [CloudController::class, 'sync']);
});
