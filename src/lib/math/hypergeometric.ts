/**
 * Hypergeometric probability utilities.
 */

export type HypergeometricInput = {
  populationSize: number; // N
  populationSuccesses: number; // K
  draws: number; // n
  successes: number; // k
};

function validateInput({populationSize, populationSuccesses, draws, successes}: HypergeometricInput): void {
  if (!Number.isInteger(populationSize) || populationSize < 0) {
    throw new RangeError('populationSize must be a non-negative integer');
  }
  if (!Number.isInteger(populationSuccesses) || populationSuccesses < 0 || populationSuccesses > populationSize) {
    throw new RangeError('populationSuccesses must be between 0 and populationSize');
  }
  if (!Number.isInteger(draws) || draws < 0 || draws > populationSize) {
    throw new RangeError('draws must be between 0 and populationSize');
  }
  if (!Number.isInteger(successes) || successes < 0) {
    throw new RangeError('successes must be a non-negative integer');
  }
  if (successes > populationSuccesses || successes > draws) {
    throw new RangeError('successes cannot exceed populationSuccesses or draws');
  }
}

function combination(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result = (result * (n - k + i)) / i;
  }
  return result;
}

export function hypergeometricProbability(input: HypergeometricInput): number {
  validateInput(input);
  const {populationSize: N, populationSuccesses: K, draws: n, successes: k} = input;
  const numerator = combination(K, k) * combination(N - K, n - k);
  const denominator = combination(N, n);
  return denominator === 0 ? 0 : numerator / denominator;
}

export function hypergeometricAtLeast({populationSize, populationSuccesses, draws, successes}: HypergeometricInput): number {
  validateInput({populationSize, populationSuccesses, draws, successes});
  let probability = 0;
  for (let x = successes; x <= Math.min(populationSuccesses, draws); x++) {
    probability += hypergeometricProbability({populationSize, populationSuccesses, draws, successes: x});
  }
  return probability;
}

export function expectedSuccesses({populationSize, populationSuccesses, draws}: Omit<HypergeometricInput, 'successes'>): number {
  if (populationSize === 0) return 0;
  return (draws * populationSuccesses) / populationSize;
}

export function cumulativeDistribution({populationSize, populationSuccesses, draws}: Omit<HypergeometricInput, 'successes'>): Array<{successes: number; probability: number}> {
  const maxSuccesses = Math.min(populationSuccesses, draws);
  const distribution: Array<{successes: number; probability: number}> = [];
  for (let k = 0; k <= maxSuccesses; k++) {
    distribution.push({successes: k, probability: hypergeometricProbability({populationSize, populationSuccesses, draws, successes: k})});
  }
  return distribution;
}
