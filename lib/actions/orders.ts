"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

export async function getOrders(filter?: string) {
  try {
    const orders = await prisma.order.findMany({
      where: filter && filter !== "ALL" ? { status: filter as OrderStatus } : {},
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return orders.map(o => ({
      ...o,
      total_amount: Number(o.totalAmount),
      customer: o.user // mapping for UI compatibility
    }));
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function getMyOrders(userId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return orders.map(o => ({
      ...o,
      total_amount: Number(o.totalAmount)
    }));
  } catch (error) {
    console.error("Error fetching my orders:", error);
    return [];
  }
}

export async function getOrderById(id: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) return null;

    return {
      ...order,
      total_amount: Number(order.totalAmount),
      items: order.orderItems.map(item => ({
        ...item,
        unit_price: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })),
      customer: order.user
    };
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    return null;
  }
}


export async function createOrder(userId: string, totalAmount: number, items: any[]) {
  try {
    const hasPreOrderItems = items.some(item => item.isPreOrder);
    
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount: BigInt(totalAmount),
          status: hasPreOrderItems ? OrderStatus.PREORDER : OrderStatus.PENDING,
        },
      });

      // 2. Create Order Items
      const orderItems = items.map((item) => ({
        orderId: newOrder.id,
        productId: item.id,
        quantity: item.cartQuantity,
        unitPrice: BigInt(item.price),
        subtotal: BigInt(item.price * item.cartQuantity),
      }));

      await tx.orderItem.createMany({
        data: orderItems,
      });

      // 3. Update Stocks
      // We decrement stock even for pre-orders to track "reserved" items (negative stock = backorder)
      for (const item of items) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.cartQuantity
            }
          }
        });
      }

      return newOrder;
    });

    revalidatePath("/orders");
    revalidatePath("/my-orders");
    revalidatePath("/");
    
    return { success: true, orderId: order.id, error: undefined };
  } catch (error: any) {
    console.error("Error creating order:", error);
    return { success: false, orderId: undefined, error: error.message };
  }
}

export async function getDashboardStats() {
  try {
    const [ordersCount, productsCount, customersCount, revenueData] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count({ where: { role: "customer" } }),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        }
      })
    ]);

    return {
      ordersCount,
      productsCount,
      customersCount,
      totalRevenue: Number(revenueData._sum.totalAmount || 0)
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { ordersCount: 0, productsCount: 0, customersCount: 0, totalRevenue: 0 };
  }
}
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/my-orders");
    
    return { success: true, order };
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return { success: false, error: error.message };
  }
}
export async function getPendingOrdersCount() {
  try {
    const count = await prisma.order.count({
      where: { status: OrderStatus.PENDING }
    });
    return count;
  } catch (error) {
    console.error("Error fetching pending orders count:", error);
    return 0;
  }
}
export async function getTopSellingProducts(limit: number = 5) {
  try {
    const topSelling = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: "desc"
        }
      },
      take: limit
    });

    const products = await prisma.product.findMany({
      where: {
        id: { in: topSelling.map(item => item.productId) }
      }
    });

    return topSelling.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        name: product?.name || "Unknown Product",
        sales: item._sum.quantity || 0,
        stock: product?.stock || 0,
        unit: product?.unit || "unit"
      };
    });
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    return [];
  }
}
