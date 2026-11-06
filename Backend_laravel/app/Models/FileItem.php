<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

// Nome "FileItem" (não "File") para não colidir com Illuminate\Http\File
// nem com a facade Storage/File do Laravel.
class FileItem extends Model
{
    protected $table = 'files';

    protected $fillable = [
        'user_id',
        'folder_id',
        'watched_folder_id',
        'source',
        'external_id',
        'name',
        'path',
        'type',
        'mime_type',
        'size_bytes',
        'favorite',
        'trashed_at',
        'indexed_at',
    ];

    protected $casts = [
        'favorite' => 'boolean',
        'trashed_at' => 'datetime',
        'indexed_at' => 'datetime',
        'size_bytes' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function folder()
    {
        return $this->belongsTo(Folder::class);
    }

    public function watchedFolder()
    {
        return $this->belongsTo(WatchedFolder::class);
    }

    public function scopeNotTrashed(Builder $query): Builder
    {
        return $query->whereNull('trashed_at');
    }

    public function scopeTrashed(Builder $query): Builder
    {
        return $query->whereNotNull('trashed_at');
    }
}
