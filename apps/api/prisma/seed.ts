import { PrismaClient, UserRole } from '@prisma/client';
import { ruleSetConfigSchema } from '@scalp-care/shared';

const prisma = new PrismaClient();

async function main() {
  const ruleConfig = ruleSetConfigSchema.parse({
    axes: [
      { key: 'Sebum', weight: 1 },
      { key: 'Dryness', weight: 1 },
      { key: 'Sensitivity', weight: 1 },
      { key: 'DensityLoss', weight: 1 },
      { key: 'LifestyleStress', weight: 1 },
    ],
    questions: [
      { code: 'Q1', axis: 'Sebum', scale: 20 },
      { code: 'Q2', axis: 'Dryness', scale: 20 },
      { code: 'Q3', axis: 'Sensitivity', scale: 25 },
      { code: 'Q4', axis: 'DensityLoss', scale: 25 },
      { code: 'Q5', axis: 'LifestyleStress', scale: 15 },
      { code: 'Q6', axis: 'LifestyleStress', scale: 15 },
      { code: 'Q7', axis: 'Sensitivity', scale: 30 },
      { code: 'Q8', axis: 'Dryness', scale: 20 },
    ],
    labelMappings: [
      { key: 'Sebum', thresholds: { primary: 55, secondary: 45 } },
      { key: 'Dryness', thresholds: { primary: 55, secondary: 45 } },
      { key: 'Sensitivity', thresholds: { primary: 55, secondary: 45 } },
      { key: 'DensityLoss', thresholds: { primary: 55, secondary: 45 } },
      { key: 'LifestyleStress', thresholds: { primary: 55, secondary: 45 } },
    ],
    seasonModifiers: {
      'summer:Sebum': 8,
      'winter:Dryness': 10,
    },
    demographicModifiers: {
      'male:30': { Sebum: 5 },
      'female:50': { Dryness: 5 },
    },
    referralRules: [
      { questionCode: 'Q3', triggerValue: '強い' },
      { questionCode: 'Q7', triggerValue: '頻繁' },
    ],
    weights: {
      fit: 0.4,
      ingredientSafety: 0.25,
      evidence: 0.15,
      review: 0.1,
      costPerformance: 0.1,
    },
  });

  await prisma.ruleSet.upsert({
    where: { version: 'v1' },
    update: { config: ruleConfig, active: true },
    create: {
      version: 'v1',
      title: '初期ルールセット',
      config: ruleConfig,
      active: true,
    },
  });

  await prisma.diagnosisQuestion.deleteMany();
  await prisma.diagnosisQuestion.createMany({
    data: ruleConfig.questions.map((q, index) => ({
      code: q.code,
      text: `Question ${q.code}`,
      type: 'scale',
      order: index + 1,
      options: { min: 1, max: 5 },
      weight: 1,
    })),
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$YWRtaW4$y1q5AnbcW2CYwiVdc+GqzA', // placeholder hash
      role: UserRole.admin,
    },
  });

  await prisma.content.createMany({
    data: [
      {
        title: '春の皮脂コントロール術',
        slug: 'spring-care',
        body: '季節別ケアガイド',
        status: 'published',
        authorId: admin.id,
        summary: '春のケア',
        publishedAt: new Date(),
      },
      {
        title: '30代男性の薄毛予防',
        slug: 'thirties-care',
        body: '生活習慣と頭皮ケア',
        status: 'published',
        authorId: admin.id,
        summary: '30代ケア',
        publishedAt: new Date(),
      },
      {
        title: '50代女性のボリュームケア',
        slug: 'fifties-female',
        body: 'ホルモンバランス対策',
        status: 'published',
        authorId: admin.id,
        summary: '50代ケア',
        publishedAt: new Date(),
      },
    ],
  });

  const productData = [
    {
      name: 'クールリフレッシュシャンプー',
      slug: 'cool-refresh',
      category: 'shampoo',
      price: 2400,
      ingredientSafety: 72,
      reviewScore: 4.1,
      reviewCount: 120,
      costPerformance: 68,
      ingredients: { menthol: true, niacinamide: true, volumeMl: 350 },
    },
    {
      name: 'モイストバランサーエッセンス',
      slug: 'moist-essence',
      category: 'essence',
      price: 4200,
      ingredientSafety: 88,
      reviewScore: 4.5,
      reviewCount: 210,
      costPerformance: 62,
      ingredients: { biotin: true, panthenol: true, volumeMl: 120 },
    },
    {
      name: 'スカルプローションEX',
      slug: 'scalp-lotion-ex',
      category: 'tonic',
      price: 3600,
      ingredientSafety: 80,
      reviewScore: 4.2,
      reviewCount: 98,
      costPerformance: 70,
      ingredients: { minoxidil: true, caffeine: true, volumeMl: 150 },
    },
  ];

  for (const product of productData) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: {
        ...product,
        currency: 'JPY',
      },
    });
  }

  console.log('Database seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
