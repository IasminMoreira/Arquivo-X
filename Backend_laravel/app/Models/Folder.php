<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Folder extends Model
{
    protected $fillable = [
        'user_id',
        'watched_folder_id',
        'parent_id',
        'name',
        'description',
        'path',
        'is_shortcut',
        'shortcut_target_id',
    ];

    protected $casts = [
        'is_shortcut' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shortcutTarget()
    {
        return $this->belongsTo(Folder::class, 'shortcut_target_id');
    }

    public function watchedFolder()
    {
        return $this->belongsTo(WatchedFolder::class);
    }

    public function parent()
    {
        return $this->belongsTo(Folder::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Folder::class, 'parent_id');
    }

    public function files()
    {
        return $this->hasMany(FileItem::class);
    }
}
