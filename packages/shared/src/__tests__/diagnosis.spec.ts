import { computeDiagnosis } from '../algorithms/diagnosis';
import { DiagnosisRequest } from '../schemas/diagnosis';
import { RuleSetConfig } from '../schemas/rule-set';

describe('computeDiagnosis', () => {
  const config: RuleSetConfig = {
    axes: [
      { key: 'Sebum', weight: 1 },
      { key: 'Dryness', weight: 1 },
    ],
    questions: [
      { code: 'Q1', axis: 'Sebum', scale: 20 },
      { code: 'Q2', axis: 'Dryness', scale: 20 },
    ],
    labelMappings: [
      { key: 'Sebum', thresholds: { primary: 55, secondary: 45 } },
      { key: 'Dryness', thresholds: { primary: 55, secondary: 45 } },
    ],
    seasonModifiers: {
      'summer:Sebum': 10,
    },
    demographicModifiers: {
      'male:30': { Sebum: 5 },
    },
    referralRules: [{ questionCode: 'Q1', triggerValue: 5 }],
    weights: { fit: 0.4, ingredientSafety: 0.25, evidence: 0.15, review: 0.1, costPerformance: 0.1 },
  };

  it('applies season and demographic modifiers', () => {
    const request: DiagnosisRequest = {
      profile: { age: 32, sex: 'male', season: 'summer' },
      answers: [
        { questionCode: 'Q1', value: 5 },
        { questionCode: 'Q2', value: 2 },
      ],
    } as any;
    const result = computeDiagnosis({ answers: request.answers, profile: request.profile, ruleSetConfig: config });
    expect(result.scores.Sebum).toBeGreaterThan(result.scores.Dryness);
    expect(result.labels).toContain('Sebum');
  });

  it('triggers medical referral when threshold exceeded', () => {
    const request: DiagnosisRequest = {
      profile: { age: 32, sex: 'male', season: 'winter' },
      answers: [
        { questionCode: 'Q1', value: 5 },
        { questionCode: 'Q2', value: 1 },
      ],
    } as any;
    const result = computeDiagnosis({ answers: request.answers, profile: request.profile, ruleSetConfig: config });
    expect(result.medicalReferral).toBe(true);
  });
});
