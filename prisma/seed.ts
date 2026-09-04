import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL as string);
const db = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("Cambiar123!", 10);

  const admin = await db.user.upsert({
    where: { email: "reinaldo.lopez@miliopay.com" },
    update: {},
    create: {
      name: "Reinaldo",
      lastName: "Lopez",
      email: "reinaldo.lopez@miliopay.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  const group = await db.group.upsert({
    where: { name: "General" },
    update: {},
    create: { name: "General", description: "Todos los colaboradores" },
  });

  await db.groupMember.upsert({
    where: { groupId_userId: { groupId: group.id, userId: admin.id } },
    update: {},
    create: { groupId: group.id, userId: admin.id },
  });

  console.log(`Admin listo: ${admin.email} (password temporal: Cambiar123!)`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await db.$disconnect();
    process.exit(1);
  });
