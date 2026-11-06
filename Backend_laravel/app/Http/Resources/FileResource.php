<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Traduz colunas do banco (snake_case) para o formato que mockData.js/Home.jsx
// já usam: sizeBytes, folderId, favorite, trashed, updatedAt.
class FileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'sizeBytes' => (int) $this->size_bytes,
            'folderId' => $this->folder_id ? (string) $this->folder_id : null,
            'favorite' => (bool) $this->favorite,
            'trashed' => ! is_null($this->trashed_at),
            'updatedAt' => optional($this->updated_at)->toDateString(),
            'source' => $this->source,
            'mimeType' => $this->mime_type,
        ];
    }
}
