"use client";

import React from "react";
import { User, Bell, Search, Menu, ShoppingCart } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getPendingOrdersCount } from "@/lib/actions/orders";
import { useState, useEffect } from "react";


export const Topbar = () => {
  const { cartCount } = useStore();
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Only fetch if admin (assuming based on Topbar usage in Admin Shell)
    const fetchCount = async () => {
      const count = await getPendingOrdersCount();
      setPendingCount(count);
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);


  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white/80 px-4 backdrop-blur-md md:px-8">
        {/* Notification Bell */}
        <Link href="/orders?status=PENDING">
          <button className="relative rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-navy transition-colors">
            <Bell className="h-5 w-5" />
            {pendingCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                {pendingCount}
              </span>
            )}
          </button>
        </Link>

        <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden md:block" />

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">Admin Warung</p>
            <p className="text-xs text-slate-500 leading-tight">Super Admin</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-600">
            <User className="h-5 w-5" />
        </div>
      </div>
    </header>
  );
};
