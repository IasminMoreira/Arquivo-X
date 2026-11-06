<?php

namespace App\Providers;

use App\Services\FirebaseTokenVerifier;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(FirebaseTokenVerifier::class, fn () => new FirebaseTokenVerifier(
            (string) config('services.firebase.project_id')
        ));
    }

    public function boot(): void
    {
        // Desativa o wrapper 'data' em todos os JsonResources
        JsonResource::withoutWrapping();
    }
}
