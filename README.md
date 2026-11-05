<<<<<<< HEAD
# ArquivoX - Gerenciador de Arquivos e Armazenamento (PI)

Sempre que for executar o projeto ou acessar a interface web do projeto deve executar primeiro o arquivo `exe_server.bat`, ele inicia o serviço em segundo plano e abre o site automaticamente no navegador.

---

## Como Executar

Basta dar dois cliques no arquivo:
```cmd
exe_server.bat
```
Ou executar no terminal (cmd/PowerShell):
```cmd
.\exe_server.bat
```

O script irá:
1. Iniciar o **Backend Laravel** na porta `8000` (`http://127.0.0.1:8000`).
2. Iniciar o **Frontend React (Vite)** na porta `5173` (`http://localhost:5173`).
3. Abrir o navegador automaticamente no endereço local do sistema.

---

## Credenciais de Teste

O banco de dados SQLite já foi populado com usuário demonstrativo e arquivos de exemplo:
- **E-mail:** `teste@arquivox.com`
- **Senha:** `password`

*(Você também pode criar uma nova conta pela tela de cadastro ou clicar em **"Entrar com o Google"**, que autentica localmente com o Laravel Sanctum).*

---

## Arquitetura do Projeto

- **Frontend (`/Frontend`):** Interface visual construída em React 19 + Vite com tema claro/escuro, alternância grade/lista, filtros por tipo e painel lateral de detalhes e ações.
- **Backend (`/Backend_laravel`):** Aplicação Laravel com banco de dados SQLite, migrações, seeders e comandos de varredura/indexação (`php artisan index:scan`).
- **Autenticação:** 100% local com tokens `Bearer` via **Laravel Sanctum** (integração do Firebase removida).
- **API (`/API`):** Cliente de integração JavaScript universal e rotas REST completas registradas em `/api/*`.

---

## Funções Essenciais Implementadas (MVP)

1. **Integração com a nuvem:** API pronta para conexões em nuvem (`cloud_connections`), voltada a nuvem própria local e Google Drive.
2. **Interface visual web:** Gerenciador completo com barra lateral, busca, filtros e visualização.
3. **Banco de dados (Indexação e organização):** Tabelas de arquivos, pastas e comando `index:scan` para varrer diretórios do disco.
4. **Acessibilidade (API):** Rotas REST com padrões JSON e códigos HTTP padronizados.
5. **Autenticação com Google (API):** Rota `/api/login/google` gerando token Sanctum sem depender de Firebase externo.
6. **Autenticação com e-mail registrado:** Registro e login seguros com hash bcrypt via Sanctum.
7. **Verificação de arquivos com nomes idênticos:** Endpoint `/api/files/check-name` e auto-renomeação única (`arquivo (1).ext`) para evitar sobrescrita indevida.
8. **Separação de arquivos por formato:** Resolução e filtros por imagem, vídeo/áudio, documento e código (`FileTypeResolver`).
9. **Lixeira de arquivos:** Soft-delete com data de exclusão (`trashed_at`), restauração e exclusão permanente.
10. **Álbuns/Grupos de arquivos:** Suporte a coleções e agrupamentos de arquivos (`/api/albums`).
11. **Visualização de PDF, documentos e planilhas:** Rota `/api/files/{id}/view` com cabeçalho `inline` para leitura no navegador.
12. **Visualização do espaço disponível e usado:** Endpoint `/api/storage/usage` com métricas em GB por tipo de arquivo e por dispositivo.
13. **Player de música e vídeos:** Endpoint `/api/files/{id}/stream` com suporte a HTTP Range (206 Partial Content) para reprodução fluida.
14. **Sistema de arquivos favoritos:** Marcação rápida com estrela e listagem na seção "Favoritos".
15. **Informações da pasta:** Detalhes de contagem de arquivos internos, tamanho total em bytes, descrição e data de criação.
16. **Ordenação de listagem:** Ordenação por nome (A-Z), tamanho, data de edição e tipo.
17. **Criar, mover, renomear, copiar e colar arquivo:** Ações completas de gerenciamento de arquivos.
18. **Baixar arquivo:** Endpoint `/api/files/{id}/download` para download de arquivos locais ou em nuvem.
19. **Criação de atalhos de pastas:** Criação de referências rápidas para pastas (`is_shortcut`).
20. **Geração de thumbnail (miniatura):** Endpoint `/api/files/{id}/thumbnail` servindo imagens e miniaturas SVG dinâmicas.
=======
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
>>>>>>> 3b20d997ceba732941af3127794346bf735f0340
