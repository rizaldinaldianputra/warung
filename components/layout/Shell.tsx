"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CustomerNavbar } from "./CustomerNavbar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, isLoading } = useAuth();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return <main className="min-h-screen bg-white">{children}</main>;
  }

  // Handle Loading state to prevent layout shift
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy border-t-transparent" />
      </div>
    );
  }

  const isAdmin = profile?.role === "admin";
  const isCustomer = profile?.role === "customer";

  return (
    <div className="flex min-h-screen">
      {/* Admin Layout: Sidebar + Topbar */}
      {isAdmin && (
        <>
          <Sidebar />
          <div className="flex flex-1 flex-col md:pl-64 transition-all duration-300">
            <Topbar />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </>
      )}

      {/* Customer Layout: Horizontal Topbar Only */}
      {isCustomer && (
        <div className="flex flex-1 flex-col">
          <CustomerNavbar />
          <main className="flex-1 p-4 pt-20 md:p-8 md:pt-24 max-w-7xl mx-auto w-full transition-all duration-300">
            {children}
          </main>
        </div>
      )}

      {/* Default/Fallback Layout if role is missing but logged in (unlikely) */}
      {!isAdmin && !isCustomer && (
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      )}
    </div>
  );
}
