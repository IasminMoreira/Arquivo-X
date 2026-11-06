<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WatchedFolder extends Model
{
    protected $fillable = ['user_id', 'path', 'label', 'last_scanned_at'];

    protected $casts = [
        'last_scanned_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function folders()
    {
        return $this->hasMany(Folder::class);
    }

    public function files()
    {
        return $this->hasMany(FileItem::class);
    }
}
