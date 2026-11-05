<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Estrutura pronta para a integração real com Google Drive (fase futura).
class CloudConnection extends Model
{
    protected $fillable = [
        'user_id',
        'provider',
        'access_token',
        'refresh_token',
        'expires_at',
        'scopes',
        'connected_at',
    ];

    protected $hidden = ['access_token', 'refresh_token'];

    protected $casts = [
        'expires_at' => 'datetime',
        'connected_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
