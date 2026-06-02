import bcrypt from "bcrypt";

import { prisma } from "../../core/database/prisma";

const main = async () => {
  const passwordHash = await bcrypt.hash("Admin@12345", 10);

  const admin = await prisma.user.upsert({
    create: {
      email: "admin@management.local",
      name: "Admin",
      passwordHash,
      role: "ADMIN",
    },
    update: {},
    where: { email: "admin@management.local" },
  });

  const taskCount = await prisma.task.count({ where: { ownerId: admin.id } });

  if (!taskCount) {
    await prisma.task.createMany({
      data: [
        {
          ownerId: admin.id,
          priority: "HIGH",
          status: "TODO",
          title: "Review weekly priorities",
        },
        {
          ownerId: admin.id,
          priority: "MEDIUM",
          status: "IN_PROGRESS",
          title: "Prepare deployment checklist",
        },
      ],
    });
  }
};

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
