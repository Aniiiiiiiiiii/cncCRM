import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const variables: any = await prisma.$queryRawUnsafe(`SHOW VARIABLES LIKE 'datadir';`);
  console.log('MySQL datadir:', variables);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
