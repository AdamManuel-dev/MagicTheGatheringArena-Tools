/**
 * JSON formatter helper.
 */

export type JsonOptions = {
  pretty?: boolean;
  newline?: boolean;
};

export function toJson(value: unknown, options: JsonOptions = {}): string {
  const {pretty = true, newline = true} = options;
  const spacing = pretty ? 2 : 0;
  const payload = JSON.stringify(value, null, spacing);
  return newline ? `${payload}\n` : payload;
}
