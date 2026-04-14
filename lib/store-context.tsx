"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/types";
import { useAuth } from "./auth-context";
import { createOrder } from "./actions/orders";

interface CartItem extends Product {
  cartQuantity: number;
}

interface StoreContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: () => Promise<{ success: boolean; orderId?: string; error?: string }>;
  cartTotal: number;
  cartCount: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user } = useAuth();

  // Load cart from session storage once mounted
  useEffect(() => {
    const savedCart = sessionStorage.getItem("warung-cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Save cart whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      sessionStorage.setItem("warung-cart", JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prevCart: CartItem[]) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, cartQuantity: item.cartQuantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, cartQuantity: quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart: CartItem[]) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart: CartItem[]) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, cartQuantity: quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    sessionStorage.removeItem("warung-cart");
  };

  async function checkout() {
    if (!user || cart.length === 0) return { success: false, error: "Authentication required or cart empty" };

    try {
      const result = await createOrder(
        user.id,
        cartTotal,
        cart.map(item => ({
          id: item.id,
          price: item.price,
          cartQuantity: item.cartQuantity,
          isPreOrder: item.isPreOrder
        }))
      );

      if (result.success) {
        clearCart();
      }
      
      return result;
    } catch (err: any) {
      console.error("Checkout failed:", err);
      return { success: false, error: err.message };
    }
  }

  const cartTotal = cart.reduce(
    (total: number, item: CartItem) => total + item.price * item.cartQuantity,
    0
  );

  const cartCount = cart.reduce((count: number, item: CartItem) => count + item.cartQuantity, 0);

  return (
    <StoreContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        checkout,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
