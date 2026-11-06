<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FolderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'parentId' => $this->parent_id ? (string) $this->parent_id : null,
            'isShortcut' => (bool) $this->is_shortcut,
            'shortcutTargetId' => $this->shortcut_target_id ? (string) $this->shortcut_target_id : null,
            'fileCount' => (int) ($this->files_count ?? 0),
            'sizeBytes' => (int) ($this->files_sum_size_bytes ?? 0),
            'createdAt' => optional($this->created_at)->toDateString(),
            'updatedAt' => optional($this->updated_at)->toDateString(),
        ];
    }
}