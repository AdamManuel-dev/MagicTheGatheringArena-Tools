const {describe, it} = require('node:test');
const assert = require('node:assert/strict');

const {LogsTool, buildOddsRows} = require('../../dist/lib/logs/tool');

describe('LogsTool', () => {
  const sampleLog = `
[UnityCrossThreadLogger]2025-10-08T01:00:00Z {"event":"matchStart","matchId":"match-123"}
[UnityCrossThreadLogger]2025-10-08T01:00:02Z {"event":"library","matchId":"match-123","cards":[{"grpId":69172,"quantity":4},{"grpId":123,"quantity":20}]}
[UnityCrossThreadLogger]2025-10-08T01:00:05Z {"event":"draw","matchId":"match-123","ownerSeatId":1,"grpId":69172}
[UnityCrossThreadLogger]2025-10-08T01:00:06Z {"event":"draw","matchId":"match-123","ownerSeatId":1,"grpId":123}
`;

  it('parses custom draw events', () => {
    const tool = new LogsTool({playerSeatId: 1});
    const events = tool.parseLogText(sampleLog);
    const draws = tool.filterDraws(events);
    assert.equal(draws.length, 2);
    assert.equal(draws[0].grpId, 69172);
  });

  it('builds odds rows', () => {
    const rows = buildOddsRows({
      groups: [
        {label: 'Lightning Bolt', remaining: 3},
        {label: 'Lands', remaining: 22},
      ],
      librarySize: 52,
    });
    assert.equal(rows.length, 2);
    assert.ok(rows[0].nextDrawProbability > 0);
    assert.ok(rows[1].withinThreeProbability > rows[0].withinThreeProbability);
  });
});
