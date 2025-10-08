/**
 * Minimal table formatter for fixed-width CLI output.
 */

export type TableColumn<T extends Record<string, unknown>> = {
  key: keyof T | string;
  header?: string;
  align?: 'left' | 'right';
  formatter?: (value: unknown, row: T) => string;
};

export type TableOptions<T extends Record<string, unknown>> = {
  columns: Array<TableColumn<T>>;
  divider?: string;
};

const pad = (value: string, width: number, align: 'left' | 'right'): string => {
  if (value.length >= width) return value;
  const padding = ' '.repeat(width - value.length);
  return align === 'right' ? padding + value : value + padding;
};

const formatValue = (value: unknown): string => {
  if (value == null) return '';
  return String(value);
};

export function toTable<T extends Record<string, unknown>>(rows: Array<T>, options: TableOptions<T>): string {
  const {columns, divider = '  '} = options;
  const widths = columns.map((column) => {
    const header = column.header ?? String(column.key);
    const rowWidths = rows.map((row) => {
      const raw = column.key in row ? (row as Record<string, unknown>)[column.key as string] : undefined;
      const formatted = column.formatter ? column.formatter(raw, row) : formatValue(raw);
      return formatted.length;
    });
    return Math.max(header.length, ...rowWidths, 0);
  });

  const renderRow = (values: Array<string>) =>
    values
      .map((value, index) => pad(value, widths[index], columns[index].align ?? 'left'))
      .join(divider);

  const headerRow = columns.map((column) => column.header ?? String(column.key));
  const bodyRows = rows.map((row) =>
    columns.map((column) => {
      const raw = column.key in row ? (row as Record<string, unknown>)[column.key as string] : undefined;
      const formatted = column.formatter ? column.formatter(raw, row) : formatValue(raw);
      return formatted;
    }),
  );

  const lines = [renderRow(headerRow), renderRow(widths.map((width) => '-'.repeat(width)))];
  for (const values of bodyRows) lines.push(renderRow(values));
  return lines.join('\n');
}
