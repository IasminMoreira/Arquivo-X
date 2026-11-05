<?php

namespace App\Services;

class FileTypeResolver
{
    private const MAP = [
        'image' => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'heic', 'tiff'],
        'video' => ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'],
        'code' => [
            'ts', 'tsx', 'js', 'jsx', 'php', 'py', 'java', 'c', 'cpp', 'h',
            'sql', 'json', 'html', 'css', 'scss', 'sh', 'yml', 'yaml', 'rb', 'go', 'cs', 'rs', 'bat', 'cmd', 'ps1',
        ],
        'doc' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'md', 'odt', 'rtf'],
    ];

    public static function fromExtension(string $extension): string
    {
        $extension = strtolower(ltrim($extension, '.'));

        foreach (self::MAP as $type => $extensions) {
            if (in_array($extension, $extensions, true)) {
                return $type;
            }
        }

        return 'doc'; // categoria padrão para extensões desconhecidas
    }

    public static function fromFilename(string $filename): string
    {
        return self::fromExtension(pathinfo($filename, PATHINFO_EXTENSION));
    }
}
