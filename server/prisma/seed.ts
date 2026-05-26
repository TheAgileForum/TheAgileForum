import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const roleDefinitions = [
    { key: "visitor", displayName: "Visitor" },
    { key: "learner", displayName: "Learner" },
    { key: "marketing_ops", displayName: "Marketing Ops" },
    { key: "support_ops", displayName: "Support Ops" },
    { key: "super_admin", displayName: "Super Admin" },
  ] as const;

  const permissions = [
    { key: "catalog.read", description: "Read catalog and offer metadata" },
    { key: "campaign.manage", description: "Manage campaigns and automation rules" },
    { key: "ai.policy.manage", description: "Manage AI policy and prompts" },
    { key: "orders.read", description: "Read orders and enrollment flows" },
    { key: "ops.alerts.read", description: "Read operational alerts and failures" },
  ] as const;

  for (const item of roleDefinitions) {
    await prisma.roleDefinition.upsert({
      where: { key: item.key },
      update: { displayName: item.displayName, isSystem: true },
      create: { key: item.key, displayName: item.displayName, isSystem: true },
    });
  }

  for (const item of permissions) {
    await prisma.permission.upsert({
      where: { key: item.key },
      update: { description: item.description },
      create: { key: item.key, description: item.description },
    });
  }

  const learnerRole = await prisma.roleDefinition.findUniqueOrThrow({
    where: { key: "learner" },
  });
  const catalogReadPerm = await prisma.permission.findUniqueOrThrow({
    where: { key: "catalog.read" },
  });
  await prisma.rolePermission.upsert({
    where: {
      roleDefinitionId_permissionId: {
        roleDefinitionId: learnerRole.id,
        permissionId: catalogReadPerm.id,
      },
    },
    update: {},
    create: {
      roleDefinitionId: learnerRole.id,
      permissionId: catalogReadPerm.id,
    },
  });

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

  await prisma.consentEvent.upsert({
    where: {
      userId_policyVersion_source: {
        userId: customer.id,
        policyVersion: "v1",
        source: "seed",
      },
    },
    update: {
      accepted: true,
      tenantId: tenant.id,
    },
    create: {
      userId: customer.id,
      tenantId: tenant.id,
      policyVersion: "v1",
      accepted: true,
      source: "seed",
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
