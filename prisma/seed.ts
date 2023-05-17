import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcrypt"
import { ENV } from "../src/env"

const prisma = new PrismaClient()

async function seed() {
  // Create admin
  const hashedPassword = await bcrypt.hash(ENV.admin_password, 10)
  await prisma.account.create({
    data: {
      name: "Default User",
      email: ENV.admin_email,
      password: hashedPassword,
    },
  })

  console.log("Seed completed successfully.")
}

seed()
  .catch((error) => {
    console.error("Error seeding the database:", error)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
