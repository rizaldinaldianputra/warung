"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
  try {
    const customers = await prisma.user.findMany({
      where: { role: "customer" },
      orderBy: { createdAt: "desc" },
    });
    return customers.map(c => ({
      ...c,
      id: c.id,
      name: c.name || "Unnamed",
      email: c.email || "",
      phone: c.phone || "",
      address: c.address || "",
      createdAt: c.createdAt.toISOString()
    }));
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}

export async function createCustomer(data: any) {
  try {
    const customer = await prisma.user.create({
      data: {
        ...data,
        role: "customer",
        // Default password if not provided
        password: data.password || "$2a$10$pD6yGZ5k8jE8j8j8j8j8j8j8j8j8j8j8j8j8j8j8j8j8j8j8j8j8" // dummy hash
      },
    });
    revalidatePath("/customers");
    return { success: true, customer };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "Email already exists" };
    }
    return { error: error.message };
  }
}

export async function updateCustomer(id: string, data: any) {
  try {
    const customer = await prisma.user.update({
      where: { id },
      data,
    });
    revalidatePath("/customers");
    return { success: true, customer };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteCustomer(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath("/customers");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
