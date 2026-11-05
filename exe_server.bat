@echo off
title ArquivoX - Inicializador

:: 1. Inicia o Frontend React em um novo terminal
start "Frontend Vite" cmd /k "cd /d "%~dp0Frontend" && npm run dev"

:: 2. Inicia o Backend Laravel em um novo terminal
start "Backend Laravel" cmd /k "cd /d "%~dp0Backend_laravel" && php artisan serve --host=127.0.0.1 --port=8000"

:: 3. Aguarda 3 segundos e abre o navegador
timeout /t 3 /nobreak >nul
start "" "http://localhost:5173"

exit