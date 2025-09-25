import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { DiagnosisRequest } from '../schemas/diagnosis';
import { RuleSetConfig as RuleSetConfigType } from '../schemas/rule-set';

dayjs.extend(utc);
dayjs.extend(timezone);

type AxisScoreMap = Record<string, number>;

type AnswerValue = string | number | Array<string | number>;

dayjs.tz.setDefault('Asia/Tokyo');

function inferSeason(date: Date): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = dayjs(date).tz().month() + 1;
  if ([3, 4, 5].includes(month)) return 'spring';
  if ([6, 7, 8].includes(month)) return 'summer';
  if ([9, 10, 11].includes(month)) return 'autumn';
  return 'winter';
}

function answerToScore(value: AnswerValue, reverse = false): number {
  const convertSingle = (v: string | number): number => {
    if (typeof v === 'number') {
      return v;
    }
    const lower = v.toLowerCase();
    if (['none', 'low', 'mild'].includes(lower)) return 1;
    if (['moderate', 'mid'].includes(lower)) return 3;
    if (['high', 'severe', 'very'].includes(lower)) return 5;
    const parsed = Number.parseFloat(v);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const base = Array.isArray(value)
    ? value.map((v) => convertSingle(v)).reduce((acc, cur) => acc + cur, 0) / Math.max(value.length, 1)
    : convertSingle(value);
  const normalized = Math.max(0, Math.min(5, base));
  return reverse ? 5 - normalized : normalized;
}

function applyModifier(score: number, modifier?: number): number {
  if (!modifier) return score;
  return Math.max(0, Math.min(100, score + modifier));
}

export interface DiagnosisComputationInput extends DiagnosisRequest {
  ruleSetConfig: RuleSetConfigType;
}

export interface DiagnosisComputationResult {
  scores: AxisScoreMap;
  labels: string[];
  secondary: string[];
  medicalReferral: boolean;
  season: string;
}

export function computeDiagnosis(input: DiagnosisComputationInput): DiagnosisComputationResult {
  const { answers, profile, ruleSetConfig } = input;
  const axes = ruleSetConfig.axes.map((axis) => axis.key);
  const axisScores: AxisScoreMap = Object.fromEntries(axes.map((axis) => [axis, 0]));
  const axisWeights = Object.fromEntries(ruleSetConfig.axes.map((axis) => [axis.key, axis.weight]));

  for (const mapping of ruleSetConfig.questions) {
    const answer = answers.find((a) => a.questionCode === mapping.code);
    if (!answer) continue;
    const rawScore = answerToScore(answer.value, mapping.reverse);
    const weighted = (rawScore / 5) * mapping.scale;
    axisScores[mapping.axis] = (axisScores[mapping.axis] ?? 0) + weighted;
  }

  const normalizedScores: AxisScoreMap = {};
  const maxScale = Math.max(...ruleSetConfig.questions.map((q) => q.scale), 1);
  for (const axis of axes) {
    const base = axisScores[axis] ?? 0;
    const weight = axisWeights[axis] ?? 1;
    const score = Math.min(100, (base / (maxScale * 5)) * 100 * weight);
    normalizedScores[axis] = Number(score.toFixed(2));
  }

  const season = profile.season ?? inferSeason(new Date());
  for (const axis of axes) {
    const modifierKey = `${season}:${axis}`;
    normalizedScores[axis] = applyModifier(normalizedScores[axis], ruleSetConfig.seasonModifiers[modifierKey]);
  }

  const demographicKey = `${profile.sex}:${Math.floor(profile.age / 10) * 10}`;
  const demographicModifiers = ruleSetConfig.demographicModifiers[demographicKey];
  if (demographicModifiers) {
    for (const [axis, modifier] of Object.entries(demographicModifiers)) {
      normalizedScores[axis] = applyModifier(normalizedScores[axis], modifier);
    }
  }

  const primaryLabels: string[] = [];
  const secondaryLabels: string[] = [];
  for (const mapping of ruleSetConfig.labelMappings) {
    const score = normalizedScores[mapping.key] ?? 0;
    if (score >= mapping.thresholds.primary) {
      primaryLabels.push(mapping.key);
    } else if (score >= mapping.thresholds.secondary) {
      secondaryLabels.push(mapping.key);
    }
  }

  const labels = primaryLabels.length > 0 ? primaryLabels : ['normal'];
  const medicalReferral = ruleSetConfig.referralRules.some((rule) => {
    const answer = answers.find((a) => a.questionCode === rule.questionCode);
    if (!answer) return false;
    const value = Array.isArray(answer.value) ? answer.value[0] : answer.value;
    if (typeof value === 'number' && typeof rule.triggerValue === 'number') {
      return value >= rule.triggerValue;
    }
    return String(value).toLowerCase() === String(rule.triggerValue).toLowerCase();
  });

  return {
    scores: normalizedScores,
    labels,
    secondary: secondaryLabels,
    medicalReferral,
    season,
  };
}
