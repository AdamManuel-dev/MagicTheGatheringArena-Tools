/**
 * Markdown formatting helpers.
 */

export type MarkdownTableColumn<T extends Record<string, unknown>> = {
  key: keyof T | string;
  header?: string;
  formatter?: (value: unknown, row: T) => string;
};

export function toMarkdownTable<T extends Record<string, unknown>>(
  rows: Array<T>,
  columns: Array<MarkdownTableColumn<T>>,
): string {
  if (columns.length === 0) return '';
  const headers = columns.map((column) => column.header ?? String(column.key));
  const alignRow = columns.map(() => '---');
  const body = rows.map((row) =>
    columns
      .map((column) => {
        const raw = column.key in row ? (row as Record<string, unknown>)[column.key as string] : undefined;
        const formatted = column.formatter ? column.formatter(raw, row) : raw;
        return String(formatted ?? '');
      })
      .join(' | '),
  );
  return ['| ' + headers.join(' | ') + ' |', '| ' + alignRow.join(' | ') + ' |', ...body.map((line) => `| ${line} |`)].join('\n');
}

export function toMarkdownList(items: Array<string>): string {
  return items.map((item) => `- ${item}`).join('\n');
}
