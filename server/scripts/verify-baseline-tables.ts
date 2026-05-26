import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const counts = {
    users: await prisma.user.count(),
    tenants: await prisma.tenant.count(),
    tenant_memberships: await prisma.tenantMembership.count(),
    role_definitions: await prisma.roleDefinition.count(),
    permissions: await prisma.permission.count(),
    events: await prisma.eventLog.count(),
    jobs: await prisma.jobRun.count(),
  };

  console.log("Supabase baseline table counts:");
  console.log(JSON.stringify(counts, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
