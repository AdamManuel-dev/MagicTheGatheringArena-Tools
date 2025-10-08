const {describe, it} = require('node:test');
const assert = require('node:assert/strict');

const formatters = require('../../dist/lib/formatters');

const {toCsv, toJson, toTable, toMarkdownTable} = formatters;

describe('formatters', () => {
  it('toJson pretty prints with newline by default', () => {
    const payload = {foo: 'bar'};
    const result = toJson(payload);
    assert.equal(result, '{\n  "foo": "bar"\n}\n');
  });

  it('toCsv outputs headers and rows', () => {
    const rows = [
      {arena_id: 123, quantity: 4},
      {arena_id: 456, quantity: 1},
    ];
    const csv = toCsv(rows, {columns: [
      {key: 'arena_id', header: 'arena_id'},
      {key: 'quantity', header: 'quantity'},
    ]});
    const lines = csv.trim().split('\n');
    assert.equal(lines[0], 'arena_id,quantity');
    assert.equal(lines[1], '123,4');
    assert.equal(lines[2], '456,1');
  });

  it('toTable renders fixed-width columns', () => {
    const rows = [
      {name: 'Lightning Bolt', qty: 4},
      {name: 'Thoughtseize', qty: 2},
    ];
    const table = toTable(rows, {
      columns: [
        {key: 'name', header: 'Name'},
        {key: 'qty', header: 'Qty', align: 'right'},
      ],
    });
    const lines = table.split('\n');
    assert.ok(lines[0].includes('Name'));
    assert.ok(lines[0].includes('Qty'));
    assert.ok(lines[2].includes('Lightning Bolt'));
  });

  it('toMarkdownTable produces markdown format', () => {
    const rows = [
      {name: 'Card', qty: 3},
    ];
    const markdown = toMarkdownTable(rows, [
      {key: 'name', header: 'Name'},
      {key: 'qty', header: 'Qty'},
    ]);
    const lines = markdown.split('\n');
    assert.equal(lines[0], '| Name | Qty |');
    assert.equal(lines[2], '| Card | 3 |');
  });
});
