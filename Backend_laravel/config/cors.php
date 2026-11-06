<?php

// Origens extras (ex.: o site no Vercel) vêm do .env, separadas por vírgula:
// CORS_ALLOWED_ORIGINS=https://arquivo-x-orcin.vercel.app
$extra = array_filter(array_map('trim', explode(',', (string) env('CORS_ALLOWED_ORIGINS', ''))));

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_values(array_unique(array_merge(
        ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
        $extra
    ))),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
