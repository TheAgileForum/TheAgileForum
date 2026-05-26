import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Demo Restaurant Org",
    },
  });

  const passwordHash = await bcrypt.hash("password123", 10);

  const customer = await prisma.user.upsert({
    where: { email: "customer@demo.local" },
    update: { passwordHash },
    create: {
      email: "customer@demo.local",
      passwordHash,
    },
  });

  await prisma.tenantMembership.upsert({
    where: {
      userId_tenantId: { userId: customer.id, tenantId: tenant.id },
    },
    update: { role: Role.CUSTOMER },
    create: {
      userId: customer.id,
      tenantId: tenant.id,
      role: Role.CUSTOMER,
    },
  });

  const ops = await prisma.user.upsert({
    where: { email: "ops@demo.local" },
    update: { passwordHash },
    create: {
      email: "ops@demo.local",
      passwordHash,
    },
  });

  await prisma.tenantMembership.upsert({
    where: {
      userId_tenantId: { userId: ops.id, tenantId: tenant.id },
    },
    update: { role: Role.OPS_ADMIN },
    create: {
      userId: ops.id,
      tenantId: tenant.id,
      role: Role.OPS_ADMIN,
    },
  });

  console.log("Seed complete:", { tenantId: tenant.id });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
