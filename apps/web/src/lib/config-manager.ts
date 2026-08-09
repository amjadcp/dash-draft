import { ConfigSchema, type Config } from '@repo/mcp-contracts';
import { readTextFileFromDirectory, writeTextFileToDirectory } from './fs-access';
import { generateNanoid } from './user-id';

export const CONFIG_FILE_PATH = '.dashdraft/config.json';
export const QUERY_LOG_FILE_PATH = '.dashdraft/query-log.json';

export function createDefaultConfig(customerId: string): Config {
  const now = new Date().toISOString();
  return ConfigSchema.parse({
    customerId,
    createdAt: now,
    updatedAt: now,
    oauth: {
      clientId: `dd_client_${generateNanoid(16)}`,
      clientSecret: `dd_secret_${generateNanoid(32)}`,
      generatedAt: now,
    },
    preferences: {
      theme: 'system',
      mcpHandshakeConfirmed: false,
    },
    workspaces: [
      {
        id: 'default',
        name: 'Default Workspace',
        createdAt: now,
      },
    ],
  });
}

export async function readFolderConfig(
  dirHandle: FileSystemDirectoryHandle
): Promise<Config | null> {
  const rawText = await readTextFileFromDirectory(dirHandle, CONFIG_FILE_PATH);
  if (!rawText) return null;

  try {
    const json = JSON.parse(rawText);
    const parseResult = ConfigSchema.safeParse(json);
    if (parseResult.success) {
      return parseResult.data;
    }
  } catch {
    // Ignore JSON parse errors
  }
  return null;
}

export async function saveFolderConfig(
  dirHandle: FileSystemDirectoryHandle,
  config: Config
): Promise<boolean> {
  const updatedConfig: Config = {
    ...config,
    updatedAt: new Date().toISOString(),
  };
  const jsonText = JSON.stringify(updatedConfig, null, 2);
  return await writeTextFileToDirectory(dirHandle, CONFIG_FILE_PATH, jsonText);
}
