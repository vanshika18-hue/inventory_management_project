"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Cpu,
  BarChart3,
  Home,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { checkBackendHealth } from "@/lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    let mounted = true;
    checkBackendHealth()
      .then(() => {
        if (mounted) setBackendStatus("online");
      })
      .catch(() => {
        if (mounted) setBackendStatus("offline");
      });

    const interval = setInterval(() => {
      checkBackendHealth()
        .then(() => {
          if (mounted) setBackendStatus("online");
        })
        .catch(() => {
          if (mounted) setBackendStatus("offline");
        });
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Train Model", href: "/train", icon: Cpu },
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Product Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/25 transition-all duration-200 group-hover:scale-105 group-hover:shadow-indigo-500/40">
              <Boxes className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                  Retail Inventory AI
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                  ML
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Demand Forecasting &amp; Optimization
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-white text-indigo-600 shadow-xs border border-slate-200/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Backend Status Radar */}
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-200/80">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                backendStatus === "online"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200/70 shadow-xs"
                  : backendStatus === "offline"
                  ? "bg-rose-50 text-rose-800 border border-rose-200/70 shadow-xs"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              {backendStatus === "online" ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>FastAPI Online</span>
                </>
              ) : backendStatus === "offline" ? (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                  <span>API Disconnected</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-slate-300 animate-pulse"></span>
                  <span>Connecting...</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
