const {describe, it} = require('node:test');
const assert = require('node:assert/strict');

const math = require('../../dist/lib/math');

const {
  hypergeometricProbability,
  hypergeometricAtLeast,
  expectedSuccesses,
  cumulativeDistribution,
} = math;

describe('hypergeometric utilities', () => {
  it('computes exact probability for simple scenario', () => {
    // 4 successes in deck of 60, drawing 7, probability of exactly one copy.
    const prob = hypergeometricProbability({populationSize: 60, populationSuccesses: 4, draws: 7, successes: 1});
    assert.ok(Math.abs(prob - 0.33628) < 0.0001, `unexpected probability ${prob}`);
  });

  it('computes probability of hitting at least one success', () => {
    const prob = hypergeometricAtLeast({populationSize: 53, populationSuccesses: 3, draws: 3, successes: 1});
    assert.ok(prob > 0.15 && prob < 0.2, `probability ${prob} outside expected range`);
  });

  it('computes expected successes', () => {
    const expected = expectedSuccesses({populationSize: 53, populationSuccesses: 24, draws: 1});
    assert.equal(expected, 24 / 53);
  });

  it('produces cumulative distribution', () => {
    const dist = cumulativeDistribution({populationSize: 10, populationSuccesses: 3, draws: 2});
    assert.equal(dist.length, 3); // successes 0..2
    const sum = dist.reduce((total, entry) => total + entry.probability, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9);
  });
});
