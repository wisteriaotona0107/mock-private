export interface BayesianParams {
  priorMean: number;
  priorWeight: number;
}

export const defaultBayesianParams: BayesianParams = {
  priorMean: 3.8,
  priorWeight: 10,
};

export function bayesianAverage(
  ratingSum: number,
  ratingCount: number,
  params: BayesianParams = defaultBayesianParams,
): number {
  if (ratingCount <= 0) {
    return params.priorMean;
  }
  const weightedSum = params.priorMean * params.priorWeight + ratingSum;
  const totalWeight = params.priorWeight + ratingCount;
  return Number((weightedSum / totalWeight).toFixed(2));
}
