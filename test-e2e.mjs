import { prisma } from './src/database/client';
import { randomUUID } from 'crypto';
async function main() {
  // Create mock user
  const user = await prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      name: 'Test User'
    }
  });

  // Create session
  const sessionToken = randomUUID();
  await prisma.session.create({
    data: {
      token: sessionToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
    }
  });
  
  // Output session token
  console.log(`SESSION_TOKEN=${sessionToken}`);
  console.log(`USER_ID=${user.id}`);
}
main().finally(() => prisma.$disconnect());
