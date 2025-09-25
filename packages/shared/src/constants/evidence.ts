export const EVIDENCE_LEVELS: Record<string, number> = {
  minoxidil: 90,
  finasteride: 85,
  ketoconazole: 70,
  caffeine: 60,
  sawPalmetto: 55,
};

export const INGREDIENT_SYNERGY: Record<string, string[]> = {
  minoxidil: ['niacinamide', 'biotin'],
  ketoconazole: ['pyrithioneZinc'],
};
