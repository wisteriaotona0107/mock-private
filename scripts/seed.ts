import { prisma } from '@/lib/prisma';

async function main() {
  await prisma.tag.createMany({
    data: [
      { name: 'family' },
      { name: 'scan' },
      { name: 'portrait' }
    ],
    skipDuplicates: true
  });
  console.log('Seed data inserted');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
