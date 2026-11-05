# API do ArquivoX

Este módulo concentra os serviços e a documentação da API REST que conecta o **Frontend (React)** ao **Backend (Laravel)** do projeto ArquivoX.

## Autenticação
A autenticação é feita localmente utilizando **Laravel Sanctum**. Todas as rotas privadas requerem o cabeçalho:
`Authorization: Bearer <seu_token>`

O token é retornado no login/registro e armazenado no navegador (`localStorage`).

---

## Principais Endpoints

### 1. Autenticação (`/api`)
- `POST /api/register` — Cadastra novo usuário (`name`, `email`, `password`) e retorna token.
- `POST /api/login` — Login por e-mail e senha (`email`, `password`).
- `POST /api/login/google` — Login simulado ou integrado com conta Google localmente.
- `POST /api/logout` — Invalida o token atual.
- `GET /api/user` — Retorna dados do usuário autenticado.
- `POST /api/password/reset` — Solicitação de recuperação de senha.

### 2. Pastas (`/api/folders`)
- `GET /api/folders?parent_id=` — Lista pastas do usuário (ou subpastas).
- `POST /api/folders` — Cria nova pasta (`name`, `description`, `parent_id`).
- `GET /api/folders/{id}` — Detalhes completos da pasta (contagem de arquivos, tamanho total, descrição, data).
- `PATCH /api/folders/{id}` — Renomeia ou altera descrição/pasta mãe.
- `DELETE /api/folders/{id}` — Exclui pasta e arquivos internos.
- `POST /api/folders/{id}/shortcut` — Cria um atalho para a pasta.

### 3. Arquivos (`/api/files`)
- `GET /api/files?section=&folder_id=&type=&sort=&direction=&q=` — Listagem de arquivos com suporte a filtros e ordenação.
- `POST /api/files` — Criação de arquivo de texto ou upload via `multipart/form-data`.
- `GET /api/files/{id}` — Detalhes de um arquivo.
- `PATCH /api/files/{id}` — Atualiza nome, status de favorito, lixeira (`trashed: true/false`) ou move de pasta.
- `DELETE /api/files/{id}` — Exclusão definitiva do arquivo.
- `DELETE /api/trash/empty` — Esvazia a lixeira permanentemente.
- `POST /api/files/{id}/copy` — Copia e duplica o arquivo no banco e no disco.
- `POST /api/files/{id}/move` — Move o arquivo para outra pasta.
- `POST /api/files/check-name` — Verifica se já existe arquivo com o mesmo nome na pasta e sugere nome único.
- `GET /api/files/duplicates` — Lista todos os arquivos com nomes idênticos no sistema.

### 4. Visualização, Streaming e Miniaturas
- `GET /api/files/{id}/view` — Exibe PDF, documentos e imagens diretamente no navegador (`inline`).
- `GET /api/files/{id}/download` — Faz o download do arquivo.
- `GET /api/files/{id}/stream` — Streaming de vídeo e áudio com suporte a HTTP Range (Seek / Player).
- `GET /api/files/{id}/thumbnail` — Retorna a miniatura do arquivo.

### 5. Álbuns e Coleções (`/api/albums`)
- `GET /api/albums` — Lista os álbuns do usuário.
- `POST /api/albums` — Cria novo álbum (`name`, `description`).
- `GET /api/albums/{id}` — Detalhes do álbum com seus arquivos.
- `PATCH /api/albums/{id}` — Edita nome e descrição do álbum.
- `DELETE /api/albums/{id}` — Remove álbum.
- `POST /api/albums/{id}/files` — Adiciona arquivo ao álbum.
- `DELETE /api/albums/{id}/files/{file_id}` — Remove arquivo do álbum.

### 6. Armazenamento e Nuvem
- `GET /api/storage/usage` — Retorna espaço total, espaço usado, espaço livre e consumo por formato (imagem, vídeo, documento, código) e dispositivo.
- `GET /api/cloud/connections` — Exibe status de conexões na nuvem (Google Drive, nuvem própria local).
- `POST /api/cloud/google/connect` — Conecta/simula integração com Google Drive.
- `DELETE /api/cloud/google/disconnect` — Desconecta o Google Drive.
- `POST /api/cloud/sync` — Sincroniza arquivos entre nuvem e disco local.

### 7. Indexação de Pastas Locais
- `GET /api/watched-folders` — Lista pastas monitoradas no computador.
- `POST /api/watched-folders` — Registra nova pasta local para monitoramento (`path`, `label`).
- `POST /api/watched-folders/{id}/scan` — Dispara varredura e indexação dos arquivos da pasta.
