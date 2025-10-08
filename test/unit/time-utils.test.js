const {describe, it} = require('node:test');
const assert = require('node:assert/strict');

const {
  parseRelativeTime,
  parseDate,
  createTimeFilter,
  isDateInRange,
  formatTimeRange,
} = require('../../dist/lib/time-utils.js');

describe('time utilities', () => {
  it('parseRelativeTime subtracts the expected hours', () => {
    const before = Date.now();
    const result = parseRelativeTime('24h');
    const diffHours = (before - result.getTime()) / (1000 * 60 * 60);
    assert.ok(diffHours >= 23.9 && diffHours <= 24.1);
  });

  it('parseRelativeTime supports weeks and months', () => {
    const before = Date.now();
    const week = parseRelativeTime('2w');
    const month = parseRelativeTime('1m');
    const weekDiffDays = (before - week.getTime()) / (1000 * 60 * 60 * 24);
    const monthDiffDays = (before - month.getTime()) / (1000 * 60 * 60 * 24);
    assert.ok(weekDiffDays >= 14 && weekDiffDays <= 14.1);
    assert.ok(monthDiffDays >= 30 && monthDiffDays <= 30.1);
  });

  it('parseRelativeTime throws on invalid formats', () => {
    assert.throws(() => parseRelativeTime('yesterday'), /Invalid relative time/);
  });

  it('parseDate parses ISO strings', () => {
    const d = parseDate('2025-10-08T12:00:00Z');
    assert.equal(d.toISOString(), '2025-10-08T12:00:00.000Z');
  });

  it('createTimeFilter prioritises since', () => {
    const filter = createTimeFilter({since: '1d', from: '2025-10-01'});
    assert.ok(filter.from instanceof Date);
  });

  it('isDateInRange respects from/to bounds', () => {
    const now = new Date('2025-10-08T12:00:00Z');
    const earlier = new Date('2025-10-05T12:00:00Z');
    const later = new Date('2025-10-09T12:00:00Z');
    const filter = {from: earlier, to: later};
    assert.equal(isDateInRange(now, filter), true);
    assert.equal(isDateInRange(new Date('2025-10-04T12:00:00Z'), filter), false);
    assert.equal(isDateInRange(new Date('2025-10-10T12:00:00Z'), filter), false);
  });

  it('formatTimeRange returns labels for provided bounds', () => {
    const filter = {
      from: new Date('2025-10-01T00:00:00Z'),
      to: new Date('2025-10-08T00:00:00Z'),
    };
    const formatted = formatTimeRange(filter);
    assert.match(formatted, /from 2025-10-01T00:00:00.000Z/);
    assert.match(formatted, /to 2025-10-08T00:00:00.000Z/);
  });
});
