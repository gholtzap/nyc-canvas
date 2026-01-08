'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function registerUser(data: {
  email: string
  password: string
  name?: string
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) {
    return { error: "User already exists" }
  }

  if (data.password.length < 6) {
    return { error: "Password must be at least 6 characters" }
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)

  await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
    },
  })

  return { success: true }
}
