import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const email = process.env.INITIAL_ADMIN_EMAIL;
const password = process.env.INITIAL_ADMIN_PASSWORD;
const name = process.env.INITIAL_ADMIN_NAME || "Fahrduell Admin";

if (!email || !password) {
  console.error("INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD are required.");
  process.exit(1);
}

if (password.length < 8) {
  console.error("INITIAL_ADMIN_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);
const existing = await prisma.user.findUnique({ where: { email } });

const user = existing
  ? await prisma.user.update({
      where: { email },
      data: {
        name,
        passwordHash,
        role: "ADMIN"
      }
    })
  : await prisma.user.create({
      data: { email, name, passwordHash, role: "ADMIN" }
    });

console.log(`Admin user ready: ${user.email}`);
await prisma.$disconnect();
