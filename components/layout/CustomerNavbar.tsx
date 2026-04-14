"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Store, 
  ShoppingBag, 
  ShoppingCart, 
  User, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/lib/store-context";
import { Button } from "@/components/ui/Button";

const customerItems = [
  { icon: Store, label: "Explore Shop", href: "/shop" },
  { icon: ShoppingBag, label: "My Orders", href: "/my-orders" },
];

export const CustomerNavbar = () => {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const { cartCount } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/shop" className="flex items-center gap-2 group">
            <div className="bg-navy p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform">
              <Store className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-navy tracking-tight">Niaga Pangan</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {customerItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-semibold transition-colors flex items-center gap-2",
                    isActive ? "text-navy" : "text-slate-500 hover:text-navy"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {isActive && <div className="absolute top-16 h-0.5 w-8 bg-navy rounded-full" />}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/cart" className="relative group">
              <div className="rounded-full p-2 text-slate-500 hover:bg-navy/5 hover:text-navy transition-all">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-navy text-[10px] font-bold text-white ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>

            <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden md:block" />

            {profile && (
              <div className="flex items-center gap-3 pl-2">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-xs font-bold text-navy truncate max-w-[100px]">{profile.name}</span>
                  <span className="text-[10px] text-slate-400">Customer</span>
                </div>
                <Button 
                  onClick={() => signOut()}
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full h-9 w-9 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-slate-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-2 animate-in slide-in-from-top-4 duration-300">
          {customerItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl text-sm font-semibold",
                pathname === item.href ? "bg-navy text-white text-navy" : "text-slate-600 active:bg-slate-50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <Button 
            onClick={() => signOut()}
            variant="ghost" 
            className="w-full justify-start text-red-500 p-3"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      )}
    </header>
  );
};
