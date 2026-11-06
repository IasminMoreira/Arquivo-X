<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Album extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'cover_file_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function coverFile()
    {
        return $this->belongsTo(FileItem::class, 'cover_file_id');
    }

    public function files()
    {
        return $this->belongsToMany(FileItem::class, 'album_file', 'album_id', 'file_id')
            ->withTimestamps();
    }
}
