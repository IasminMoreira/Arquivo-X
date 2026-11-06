@echo off
setlocal enabledelayedexpansion

:: Elevação automática para Administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Solicitando permissoes de Administrador...
    powershell -Command "Start-Process -FilePath '%0' -ArgumentList 'ADMIN_PASSED' -Verb RunAs"
    exit /b
)

chcp 65001 >nul
title ArquivoX - Inicializador do Sistema

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

set "BACKEND=%ROOT%\Backend_laravel"
set "FRONTEND=%ROOT%\Frontend"

echo ===================================================
echo [1/7] Verificando Node.js e npm...
echo ===================================================
where node >nul 2>&1
if !errorLevel! neq 0 (
    echo        Node.js nao encontrado. Baixando instalador...
    curl -L -o "%TEMP%\node_installer.msi" "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
    echo        Instalando Node.js de forma silenciosa...
    msiexec /i "%TEMP%\node_installer.msi" /qn /norestart
    del "%TEMP%\node_installer.msi"
    set "PATH=%PATH%;C:\Program Files\nodejs\"
    echo        Node.js instalado com sucesso.
) else (
    for /f "tokens=*" %%v in ('node -v') do echo        Node.js encontrado: %%v
)

echo.
echo ===================================================
echo [2/7] Verificando PHP e dependencias visuais...
echo ===================================================
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64" >nul 2>&1
if !errorLevel! neq 0 (
    echo        Visual C++ nao encontrado. Baixando...
    curl -L -o "%TEMP%\vc_redist.x64.exe" "https://aka.ms/vs/17/release/vc_redist.x64.exe"
    echo        Instalando Visual C++ silenciosamente...
    start /wait "" "%TEMP%\vc_redist.x64.exe" /quiet /norestart
    del "%TEMP%\vc_redist.x64.exe"
)

where php >nul 2>&1
if !errorLevel! neq 0 (
    echo        PHP nao encontrado. Baixando PHP 8.4...
    curl -L -o "%TEMP%\php.zip" "https://windows.php.net/downloads/releases/php-8.4.1-Win32-vs17-x64.zip"
    echo        Extraindo PHP para C:\php...
    if not exist "C:\php" mkdir "C:\php"
    powershell -Command "Expand-Archive -Path '%TEMP%\php.zip' -DestinationPath 'C:\php' -Force"
    del "%TEMP%\php.zip"
    
    if exist "C:\php\php.ini-development" copy "C:\php\php.ini-development" "C:\php\php.ini" >nul
    
    powershell -Command "$content = Get-Content 'C:\php\php.ini'; $content = $content -replace ';extension=pdo_sqlite', 'extension=pdo_sqlite'; $content = $content -replace ';extension=sqlite3', 'extension=sqlite3'; $content = $content -replace ';extension=mbstring', 'extension=mbstring'; $content = $content -replace ';extension=openssl', 'extension=openssl'; $content = $content -replace ';extension=fileinfo', 'extension=fileinfo'; $content = $content -replace ';extension=curl', 'extension=curl'; Set-Content 'C:\php\php.ini' $content"
    
    setx /M PATH "C:\php;!PATH!" >nul
    set "PATH=C:\php;!PATH!"
    echo        PHP instalado em C:\php
) else (
    for /f "tokens=*" %%v in ('php -r "echo PHP_VERSION;"') do echo        PHP encontrado: %%v
)

echo.
echo ===================================================
echo [3/7] Verificando Composer...
echo ===================================================
if not exist "C:\php\composer.phar" (
    echo        Composer nao encontrado. Baixando...
    curl -L -o "%TEMP%\composer-setup.php" "https://getcomposer.org/installer"
    php "%TEMP%\composer-setup.php" --install-dir="C:\php" --filename=composer.phar
    del "%TEMP%\composer-setup.php"
    
    :: Cria o script wrapper composer.bat em C:\php
    echo @php "C:\php\composer.phar" %%* > "C:\php\composer.bat"
    echo        Composer instalado com sucesso.
) else (
    echo        Composer ja esta instalado em C:\php.
)

echo.
echo ===================================================
echo [4/7] Instalando dependencias do Laravel...
echo ===================================================
if exist "%BACKEND%" (
    cd /d "%BACKEND%"
    php "C:\php\composer.phar" install --no-interaction --prefer-dist
    if !errorLevel! neq 0 (
        echo [ERRO] Falha ao instalar dependencias do Composer.
        pause
        exit /b 1
    )
    echo        Dependencias PHP instaladas.
) else (
    echo [AVISO] Pasta Backend nao encontrada em: %BACKEND%
)

echo.
echo ===================================================
echo [5/7] Configurando o Laravel...
echo ===================================================
if exist "%BACKEND%" (
    cd /d "%BACKEND%"
    if not exist ".env" (
        if exist ".env.example" (
            copy ".env.example" ".env" >nul
            echo        .env criado a partir do .env.example
        )
    )

    php artisan key:generate --no-interaction >nul 2>&1
    echo        APP_KEY verificada.

    if not exist "database\database.sqlite" (
        type nul > "database\database.sqlite"
        echo        Ficheiro database.sqlite criado.
    )

    echo        A correr migrations...
    php artisan migrate --no-interaction --force
    if !errorLevel! neq 0 (
        echo [AVISO] Migrations falharam. Verifique as extensoes no php.ini.
    ) else (
        echo        Migrations concluidas.
    )

    php artisan storage:link --no-interaction >nul 2>&1
    php artisan config:clear >nul 2>&1
    php artisan route:clear >nul 2>&1
    php artisan cache:clear >nul 2>&1
    echo        Caches limpos.
)

echo.
echo ===================================================
echo [6/7] Instalando dependencias do Frontend...
echo ===================================================
if exist "%FRONTEND%" (
    cd /d "%FRONTEND%"
    cmd /c npm install
    if !errorLevel! neq 0 (
        echo [ERRO] Falha ao instalar dependencias do npm.
        pause
        exit /b 1
    )
    echo        Dependencias npm instaladas.
) else (
    echo [AVISO] Pasta Frontend nao encontrada em: %FRONTEND%
)

echo.
echo ===================================================
echo [7/7] Configurando hosts e a iniciar Servidores...
echo ===================================================
set "HOSTS_FILE=C:\Windows\System32\drivers\etc\hosts"
findstr /C:"arquivox.local" "%HOSTS_FILE%" >nul 2>&1
if !errorLevel! neq 0 (
    echo.>> "%HOSTS_FILE%"
    echo 127.0.0.1  arquivox.local>> "%HOSTS_FILE%"
    echo 127.0.0.1  api.arquivox.local>> "%HOSTS_FILE%"
    ipconfig /flushdns >nul 2>&1
    echo        Dominios adicionados ao hosts.
) else (
    echo        Dominios ja existem no hosts.
)

start "ArquivoX - Frontend Vite" cmd /k "cd /d "%FRONTEND%" && npm run dev"
start "ArquivoX - Backend Laravel" cmd /k "cd /d "%BACKEND%" && php artisan serve --host=127.0.0.1 --port=8000"

timeout /t 3 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo [TUDO PRONTO] Os servidores foram iniciados!
pause
exit