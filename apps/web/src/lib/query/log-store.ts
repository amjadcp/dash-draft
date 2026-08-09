import { QueryLogEntrySchema, type QueryLogEntry } from '@repo/mcp-contracts';
import { readTextFileFromDirectory, writeTextFileToDirectory } from '../fs-access';
import { QUERY_LOG_FILE_PATH } from '../config-manager';
import { generateNanoid } from '../user-id';

export async function readQueryLogs(
  dirHandle: FileSystemDirectoryHandle
): Promise<QueryLogEntry[]> {
  const rawText = await readTextFileFromDirectory(dirHandle, QUERY_LOG_FILE_PATH);
  if (!rawText) return [];

  try {
    const json = JSON.parse(rawText);
    if (Array.isArray(json)) {
      const parsedEntries: QueryLogEntry[] = [];
      for (const item of json) {
        const result = QueryLogEntrySchema.safeParse(item);
        if (result.success) {
          parsedEntries.push(result.data);
        }
      }
      return parsedEntries;
    }
  } catch {
    // Ignore JSON parse errors
  }
  return [];
}

export async function saveQueryLogs(
  dirHandle: FileSystemDirectoryHandle,
  entries: QueryLogEntry[]
): Promise<boolean> {
  const jsonText = JSON.stringify(entries, null, 2);
  return await writeTextFileToDirectory(dirHandle, QUERY_LOG_FILE_PATH, jsonText);
}

export async function addQueryLogEntry(
  dirHandle: FileSystemDirectoryHandle | null,
  existingLogs: QueryLogEntry[],
  newEntryData: Omit<QueryLogEntry, 'id' | 'workspaceId' | 'timestamp'>
): Promise<{ updatedLogs: QueryLogEntry[]; entry: QueryLogEntry }> {
  const entry: QueryLogEntry = {
    id: `log_${generateNanoid(16)}`,
    workspaceId: 'default',
    timestamp: new Date().toISOString(),
    ...newEntryData,
  };

  const updatedLogs = [entry, ...existingLogs];

  if (dirHandle) {
    await saveQueryLogs(dirHandle, updatedLogs);
  }

  return { updatedLogs, entry };
}

export async function deleteQueryLogEntries(
  dirHandle: FileSystemDirectoryHandle | null,
  existingLogs: QueryLogEntry[],
  idsToDelete: string[]
): Promise<QueryLogEntry[]> {
  const deleteSet = new Set(idsToDelete);
  const updatedLogs = existingLogs.filter((entry) => !deleteSet.has(entry.id));

  if (dirHandle) {
    await saveQueryLogs(dirHandle, updatedLogs);
  }

  return updatedLogs;
}
