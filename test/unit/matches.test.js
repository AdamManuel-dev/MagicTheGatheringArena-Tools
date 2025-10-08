const {describe, it} = require('node:test');
const assert = require('node:assert/strict');

const {parseMatches, aggregateCardsByMatch} = require('../../dist/lib/matches.js');

describe('match parsing', () => {
  const baseLog = [
    '[UnityCrossThreadLogger]2025-10-08 10:00:00 {"eventName":"MatchCreated","matchId":"match-1","opponentScreenName":"Mage#123"}',
    '[UnityCrossThreadLogger]2025-10-08 10:00:01 {"playerId":1}',
    '[UnityCrossThreadLogger]2025-10-08 10:00:10 {"greToClientEvent":{"greToClientMessages":[{"type":"GREMessageType_QueuedGameStateMessage","gameStateMessage":{"gameObjects":[{"ownerSeatId":2,"grpId":1001,"zoneId":4}]}}]}}',
    '[UnityCrossThreadLogger]2025-10-08 10:05:00 {"Event_MatchEnd":true}',
    '[UnityCrossThreadLogger]2025-10-09 09:00:00 {"eventName":"MatchCreated","matchId":"match-2"}',
    '[UnityCrossThreadLogger]2025-10-09 09:00:01 {"playerId":1}',
    '[UnityCrossThreadLogger]2025-10-09 09:00:05 {"greToClientEvent":{"greToClientMessages":[{"type":"GREMessageType_QueuedGameStateMessage","gameStateMessage":{"gameObjects":[{"ownerSeatId":2,"grpId":1001,"zoneId":2},{"ownerSeatId":2,"grpId":1002,"zoneId":2}]}}]}}',
    '[UnityCrossThreadLogger]2025-10-09 09:10:00 {"Event_MatchEnd":true}',
  ].join('\n');

  it('parseMatches captures opponent cards per match', () => {
    const matches = parseMatches(baseLog, {limit: 5});
    assert.equal(matches.length, 2);

    const first = matches[0];
    assert.equal(first.matchId, 'match-1');
    assert.equal(first.opponent, 'Mage#123');
    assert.equal(first.opponentCards.get(1001)?.firstSeen, 'cast');
    assert.equal(first.opponentCards.get(1001)?.seenCount, 1);

    const second = matches[1];
    assert.equal(second.opponentCards.get(1001)?.firstSeen, 'etb');
    assert.equal(second.opponentCards.get(1002)?.seenCount, 1);
  });

  it('aggregateCardsByMatch summarises totals across matches', () => {
    const matches = parseMatches(baseLog, {limit: 5});
    const aggregated = aggregateCardsByMatch(matches);
    const entry = aggregated.get(1001);
    assert.ok(entry);
    assert.equal(entry.matches.length, 2);
    assert.equal(entry.seenTotal, 2);
  });
});
