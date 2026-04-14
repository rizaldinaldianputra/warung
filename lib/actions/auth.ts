"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function registerUser(formData: any) {
  const { name, email, password, phone, address, role = "customer" } = formData;

  if (!email || !password || !name) {
    return { error: "Missing required fields" };
  }

  try {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User with this email already exists" };
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role: role as Role,
      },
    });

    return { success: true, userId: user.id };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { error: error.message || "Failed to register user" };
  }
}
