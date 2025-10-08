/**
 * @fileoverview Time filtering utilities for date range queries
 *
 * Features: Relative time parsing (7d, 24h), ISO date parsing, match filtering
 * Main APIs: parseRelativeTime(), filterMatchesByTime()
 * Constraints: Supports common relative formats and ISO 8601 dates
 * Patterns: Returns Date objects, handles timezone conversions
 */

export function parseRelativeTime(relative: string): Date {
  const now = new Date();
  const match = relative.match(/^(\d+)(h|d|w|m)$/);

  if (!match) {
    throw new Error(`Invalid relative time format: ${relative}. Use format like "24h", "7d", "2w", "3m"`);
  }

  const [, amountStr, unit] = match;
  const amount = parseInt(amountStr, 10);

  switch (unit) {
    case 'h': // hours
      return new Date(now.getTime() - amount * 60 * 60 * 1000);
    case 'd': // days
      return new Date(now.getTime() - amount * 24 * 60 * 60 * 1000);
    case 'w': // weeks
      return new Date(now.getTime() - amount * 7 * 24 * 60 * 60 * 1000);
    case 'm': // months (approximate, 30 days)
      return new Date(now.getTime() - amount * 30 * 24 * 60 * 60 * 1000);
    default:
      throw new Error(`Unknown time unit: ${unit}`);
  }
}

export function parseDate(dateStr: string): Date {
  // Try ISO format first
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  throw new Error(`Invalid date format: ${dateStr}. Use ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)`);
}

export type TimeFilter = {
  from?: Date;
  to?: Date;
};

export function createTimeFilter(options: {
  since?: string;
  from?: string;
  to?: string;
}): TimeFilter {
  const filter: TimeFilter = {};

  if (options.since) {
    filter.from = parseRelativeTime(options.since);
  } else if (options.from) {
    filter.from = parseDate(options.from);
  }

  if (options.to) {
    filter.to = parseDate(options.to);
  }

  return filter;
}

export function isDateInRange(date: Date, filter: TimeFilter): boolean {
  if (filter.from && date < filter.from) {
    return false;
  }

  if (filter.to && date > filter.to) {
    return false;
  }

  return true;
}

export function formatTimeRange(filter: TimeFilter): string {
  if (!filter.from && !filter.to) {
    return 'all time';
  }

  const parts: string[] = [];

  if (filter.from) {
    parts.push(`from ${filter.from.toISOString()}`);
  }

  if (filter.to) {
    parts.push(`to ${filter.to.toISOString()}`);
  }

  return parts.join(' ');
}
