import React from "react";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types";

interface BadgeProps {
  status: OrderStatus | string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "PENDING",
    className: "bg-amber-50 text-amber-600 border-amber-100",
  },
  CHECKING: {
    label: "CHECKING",
    className: "bg-slate-50 text-slate-600 border-slate-100",
  },
  READY: {
    label: "READY",
    className: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  DELIVERED: {
    label: "DELIVERED",
    className: "bg-navy/5 text-navy border-navy/10",
  },
};

export const Badge = ({ status, className }: BadgeProps) => {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-slate-50 text-slate-600 border-slate-100",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};
