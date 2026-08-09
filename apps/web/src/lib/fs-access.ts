export interface DirectoryHandleWrapper {
  handle: FileSystemDirectoryHandle | null;
  isNativeSupported: boolean;
}

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

export async function requestDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  if (!isFileSystemAccessSupported()) {
    return null;
  }

  try {
    const handle = await (
      window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }
    ).showDirectoryPicker();
    return handle;
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      return null;
    }
    console.error('Error selecting directory:', err);
    throw err;
  }
}

export async function readTextFileFromDirectory(
  dirHandle: FileSystemDirectoryHandle,
  relativePath: string
): Promise<string | null> {
  try {
    const parts = relativePath.split('/').filter(Boolean);
    let currentDir = dirHandle;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (part) {
        currentDir = await currentDir.getDirectoryHandle(part);
      }
    }

    const fileName = parts[parts.length - 1];
    if (!fileName) return null;

    const fileHandle = await currentDir.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    return await file.text();
  } catch {
    return null;
  }
}

export async function writeTextFileToDirectory(
  dirHandle: FileSystemDirectoryHandle,
  relativePath: string,
  content: string
): Promise<boolean> {
  try {
    const parts = relativePath.split('/').filter(Boolean);
    let currentDir = dirHandle;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (part) {
        currentDir = await currentDir.getDirectoryHandle(part, { create: true });
      }
    }

    const fileName = parts[parts.length - 1];
    if (!fileName) return false;

    const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
    return true;
  } catch (err) {
    console.error('Failed to write file to directory:', err);
    return false;
  }
}

export function triggerDownloadFallback(
  filename: string,
  content: string,
  mimeType: string = 'text/plain'
): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
