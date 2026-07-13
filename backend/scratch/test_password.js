const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'superadmin@codenclicks.com' },
  });

  if (!user) {
    console.log('❌ User not found in database.');
    return;
  }

  console.log('👤 User found:', user.email);
  console.log('🔑 Stored hash:', user.password);

  const plainPassword = 'An1meParadise@2026';
  const matches = await bcrypt.compare(plainPassword, user.password);

  if (matches) {
    console.log('✅ Password matches stored hash successfully!');
  } else {
    console.log('❌ Password DOES NOT match stored hash!');
  }
}

main()
  .catch((err) => console.error(err))
  .finally(() => prisma.$disconnect());
