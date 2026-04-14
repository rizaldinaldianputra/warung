"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/minio";

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    // Convert BigInt to Number for serialization if needed, 
    // but Prisma Client can handle this if we use types correctly.
    // Actually, Next.js can't serialize BigInt automatically.
    return products.map(p => ({
      ...p,
      price: Number(p.price)
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function createProduct(data: any) {
  try {
    const product = await prisma.product.create({
      data: {
        ...data,
        price: BigInt(data.price),
        stock: parseInt(data.stock),
        isPreOrder: !!data.isPreOrder,
        image: data.image || null
      },
    });
    revalidatePath("/products");
    revalidatePath("/shop");
    return { success: true, product };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { error: error.message };
  }
}

export async function uploadProductImage(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file uploaded");

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = await uploadFile(buffer, file.name, file.type);

    return { success: true, imageUrl };
  } catch (error: any) {
    console.error("Error uploading image:", error);
    return { success: false, error: error.message };
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        price: data.price !== undefined ? BigInt(data.price) : undefined,
        stock: data.stock !== undefined ? parseInt(data.stock) : undefined,
        isPreOrder: data.isPreOrder !== undefined ? !!data.isPreOrder : undefined,
        image: data.image === undefined ? undefined : (data.image || null)
      },
    });
    revalidatePath("/products");
    revalidatePath("/shop");
    return { success: true, product };
  } catch (error: any) {
    console.error("Error updating product:", error);
    return { error: error.message };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    revalidatePath("/products");
    revalidatePath("/shop");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return { error: error.message };
  }
}
