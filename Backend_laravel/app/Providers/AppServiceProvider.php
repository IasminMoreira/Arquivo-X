<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // Desativa o wrapper 'data' em todos os JsonResources
        JsonResource::withoutWrapping();
    }
}
