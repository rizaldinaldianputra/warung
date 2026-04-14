"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  LogOut,
  Store,
  ShoppingBag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const adminItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: ShoppingCart, label: "All Orders", href: "/orders" },
  { icon: Users, label: "Customers list", href: "/customers" },
  { icon: Package, label: "Inventory", href: "/products" },
];

const customerItems = [
  { icon: Store, label: "Shop Products", href: "/shop" },
  { icon: ShoppingBag, label: "My Orders", href: "/my-orders" },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { profile, signOut, isLoading } = useAuth();

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isLoading || isAuthPage) return null;

  const isAdmin = profile?.role === "admin";
  const isCustomer = profile?.role === "customer";

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-100 bg-white transition-transform overflow-y-auto hidden md:block">
      <div className="flex flex-col h-full px-4 py-6">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="bg-navy p-2 rounded-xl text-white">
            <Store className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-navy to-navy-light bg-clip-text text-transparent">
            Niaga Pangan
          </span>
        </div>

        <nav className="flex-1 space-y-8">
          {(isCustomer || !profile) && (
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 px-3 mb-3">Customer Portal</p>
              <div className="space-y-1">
                {customerItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                        isActive
                          ? "bg-navy text-white shadow-md shadow-navy/20"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 transition-colors",
                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900"
                      )} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {isAdmin && (
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 px-3 mb-3">Admin Management</p>
              <div className="space-y-1">
                {adminItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                        isActive
                          ? "bg-navy/5 text-navy shadow-sm"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 transition-colors",
                        isActive ? "text-navy" : "text-slate-400 group-hover:text-slate-900"
                      )} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {profile && (
          <div className="pt-4 border-t border-slate-50 mt-auto">
            <button 
              onClick={() => signOut()}
              className="flex w-full items-center gap-3 px-3 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
