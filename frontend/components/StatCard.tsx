import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "warning" | "danger" | "success" | "primary";
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}: StatCardProps) {
  const variantStyles = {
    default: {
      cardBg: "bg-white",
      borderColor: "border-slate-200/90 hover:border-slate-300",
      topAccent: "before:bg-slate-300",
      iconBg: "bg-slate-100 text-slate-700",
      subtitleClass: "text-slate-500 bg-slate-50 border-slate-100",
    },
    primary: {
      cardBg: "bg-white",
      borderColor: "border-indigo-100 hover:border-indigo-200",
      topAccent: "before:bg-indigo-500",
      iconBg: "bg-indigo-50 text-indigo-600",
      subtitleClass: "text-indigo-700 bg-indigo-50/70 border-indigo-100/60",
    },
    warning: {
      cardBg: "bg-white",
      borderColor: "border-amber-200/80 hover:border-amber-300",
      topAccent: "before:bg-amber-500",
      iconBg: "bg-amber-50 text-amber-600",
      subtitleClass: "text-amber-800 bg-amber-50 border-amber-200/60",
    },
    danger: {
      cardBg: "bg-white",
      borderColor: "border-rose-200/80 hover:border-rose-300",
      topAccent: "before:bg-rose-500",
      iconBg: "bg-rose-50 text-rose-600",
      subtitleClass: "text-rose-800 bg-rose-50 border-rose-200/60",
    },
    success: {
      cardBg: "bg-white",
      borderColor: "border-emerald-200/80 hover:border-emerald-300",
      topAccent: "before:bg-emerald-500",
      iconBg: "bg-emerald-50 text-emerald-600",
      subtitleClass: "text-emerald-800 bg-emerald-50 border-emerald-200/60",
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${style.cardBg} ${style.borderColor}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
          {title}
        </span>
        <div className={`rounded-xl p-2.5 transition-transform duration-200 hover:scale-105 ${style.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
          {value}
        </span>
      </div>

      {subtitle && (
        <div className="mt-3">
          <span
            className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold border ${style.subtitleClass}`}
          >
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
}
