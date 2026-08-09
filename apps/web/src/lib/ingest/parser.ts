import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { cleanIngestRows, type CleanResult } from './cleaner';

export type InferredColumnType = 'text' | 'number' | 'boolean' | 'date';

export interface InferredColumn {
  name: string;
  inferredType: InferredColumnType;
  selectedType: InferredColumnType;
}

export interface IngestFileParsedData {
  fileName: string;
  tableName: string;
  sheetName?: string;
  columns: InferredColumn[];
  sampleRows: Record<string, unknown>[];
  allCleanedRows: Record<string, unknown>[];
  skippedBlankRowsCount: number;
}

export interface ExcelWorkbookSheetInfo {
  sheetName: string;
  rows: Record<string, unknown>[];
}

export function sanitizeSqlIdentifier(name: string): string {
  const nameWithoutExt = name.replace(/\.[^/.]+$/, '');
  const sanitized = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
  return sanitized || 'table_1';
}

export function inferColumnType(values: unknown[]): InferredColumnType {
  const nonNullValues = values.filter((val) => val !== null && val !== undefined && val !== '');
  if (nonNullValues.length === 0) return 'text';

  let isNumber = true;
  let isBoolean = true;

  for (const val of nonNullValues) {
    const str = String(val).trim().toLowerCase();

    if (isBoolean) {
      if (
        str !== 'true' &&
        str !== 'false' &&
        str !== '0' &&
        str !== '1' &&
        str !== 'yes' &&
        str !== 'no'
      ) {
        isBoolean = false;
      }
    }

    if (isNumber) {
      if (isNaN(Number(str))) {
        isNumber = false;
      }
    }

    if (!isNumber && !isBoolean) break;
  }

  if (isNumber) return 'number';
  if (isBoolean) return 'boolean';
  return 'text';
}

export async function parseCsvFile(file: File): Promise<IngestFileParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: false,
      dynamicTyping: false,
      complete: (results) => {
        const rawRows = results.data as Record<string, unknown>[];
        const cleanResult: CleanResult = cleanIngestRows(rawRows);

        const columnNames =
          results.meta.fields ||
          (cleanResult.cleanedRows[0] ? Object.keys(cleanResult.cleanedRows[0]) : []);

        const columns: InferredColumn[] = columnNames.map((colName) => {
          const sampleValues = cleanResult.cleanedRows.map((r) => r[colName]);
          const inferredType = inferColumnType(sampleValues);
          return {
            name: colName,
            inferredType,
            selectedType: inferredType,
          };
        });

        const defaultTableName = sanitizeSqlIdentifier(file.name.replace(/\.[^/.]+$/, ''));

        resolve({
          fileName: file.name,
          tableName: defaultTableName,
          columns,
          sampleRows: cleanResult.cleanedRows.slice(0, 10),
          allCleanedRows: cleanResult.cleanedRows,
          skippedBlankRowsCount: cleanResult.skippedBlankRowsCount,
        });
      },
      error: (err) => reject(err),
    });
  });
}

export async function parseExcelWorkbook(
  file: File
): Promise<{ fileName: string; sheets: ExcelWorkbookSheetInfo[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheets: ExcelWorkbookSheetInfo[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (worksheet) {
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });
      sheets.push({ sheetName, rows: rawRows });
    }
  }

  return { fileName: file.name, sheets };
}

export function processExcelSheet(
  fileName: string,
  sheetName: string,
  rawRows: Record<string, unknown>[]
): IngestFileParsedData {
  const cleanResult = cleanIngestRows(rawRows);
  const columnNames = cleanResult.cleanedRows[0] ? Object.keys(cleanResult.cleanedRows[0]) : [];

  const columns: InferredColumn[] = columnNames.map((colName) => {
    const sampleValues = cleanResult.cleanedRows.map((r) => r[colName]);
    const inferredType = inferColumnType(sampleValues);
    return {
      name: colName,
      inferredType,
      selectedType: inferredType,
    };
  });

  const defaultTableName = sanitizeSqlIdentifier(sheetName);

  return {
    fileName,
    tableName: defaultTableName,
    sheetName,
    columns,
    sampleRows: cleanResult.cleanedRows.slice(0, 10),
    allCleanedRows: cleanResult.cleanedRows,
    skippedBlankRowsCount: cleanResult.skippedBlankRowsCount,
  };
}
