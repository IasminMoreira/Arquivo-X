const TYPES = ["image", "video", "doc", "code"];
export const DEFAULT_QUOTA_BYTES = 100 * 1073741824;

export function buildStorageFromFiles(fileList, quotaBytes = DEFAULT_QUOTA_BYTES) {
  const byTypeBytes = { image: 0, video: 0, doc: 0, code: 0 };
  let usedBytes = 0;

  for (const file of fileList || []) {
    if (file?.trashed) continue;
    const size = Number(file.sizeBytes) || 0;
    usedBytes += size;
    const type = TYPES.includes(file.type) ? file.type : "doc";
    byTypeBytes[type] += size;
  }

  const totalBytes = quotaBytes > 0 ? quotaBytes : DEFAULT_QUOTA_BYTES;
  const byType = Object.fromEntries(
    TYPES.map((type) => [type, Number((byTypeBytes[type] / 1073741824).toFixed(4))])
  );

  return {
    totalGB: Number((totalBytes / 1073741824).toFixed(1)),
    usedGB: Number((usedBytes / 1073741824).toFixed(4)),
    usedBytes,
    totalBytes,
    byType,
    byTypeBytes,
  };
}
