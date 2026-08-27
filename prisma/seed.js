const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  { name: 'Food & Dining', icon: '🍽️', color: '#EF4444' },
  { name: 'Entertainment', icon: '🎬', color: '#8B5CF6' },
  { name: 'House Rent', icon: '🏠', color: '#3B82F6' },
  { name: 'Transportation', icon: '🚗', color: '#F59E0B' },
  { name: 'Utilities', icon: '💡', color: '#10B981' },
  { name: 'Healthcare', icon: '🏥', color: '#EC4899' },
  { name: 'Shopping', icon: '🛒', color: '#6366F1' },
  { name: 'Education', icon: '📚', color: '#14B8A6' },
  { name: 'Other Expenses', icon: '📦', color: '#6B7280' },
];

async function main() {
  console.log('Seeding categories...');
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: categories.indexOf(category) + 1 },
      update: { name: category.name, icon: category.icon, color: category.color },
      create: { name: category.name, icon: category.icon, color: category.color },
    });
  }
  console.log(`Seeded ${categories.length} categories.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
