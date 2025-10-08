/**
 * Convert structured data into CSV string output.
 */

export type CsvColumn<T extends Record<string, unknown>> = {
  key: keyof T | string;
  header?: string;
  formatter?: (value: unknown, row: T) => string;
};

export type CsvOptions<T extends Record<string, unknown>> = {
  columns?: Array<CsvColumn<T>>;
  includeHeader?: boolean;
  lineTerminator?: string;
};

const escapeValue = (value: unknown): string => {
  if (value == null) return '';
  const str = String(value);
  if (/[,"\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export function toCsv<T extends Record<string, unknown>>(rows: Array<T>, options: CsvOptions<T> = {}): string {
  const {columns, includeHeader = true, lineTerminator = '\n'} = options;
  if (rows.length === 0) return includeHeader && columns ? `${columns.map((c) => c.header ?? String(c.key)).join(',')}${lineTerminator}` : '';

  const resolvedColumns: Array<CsvColumn<T>> = columns ??
    Object.keys(rows[0]).map((key) => ({key})) as Array<CsvColumn<T>>;

  const header = includeHeader
    ? `${resolvedColumns.map((column) => escapeValue(column.header ?? String(column.key))).join(',')}${lineTerminator}`
    : '';

  const body = rows
    .map((row) =>
      resolvedColumns
        .map((column) => {
          const value = column.key in row ? (row as Record<string, unknown>)[column.key as string] : undefined;
          const formatted = column.formatter ? column.formatter(value, row) : value;
          return escapeValue(formatted);
        })
        .join(','),
    )
    .join(lineTerminator);

  return header + body + lineTerminator;
}
