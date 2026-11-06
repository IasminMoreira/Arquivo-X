<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlbumResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'coverFileId' => $this->cover_file_id ? (string) $this->cover_file_id : null,
            'fileCount' => (int) ($this->files_count ?? $this->files()->count()),
            'createdAt' => optional($this->created_at)->toDateString(),
            'updatedAt' => optional($this->updated_at)->toDateString(),
            'files' => FileResource::collection($this->whenLoaded('files')),
        ];
    }
}
