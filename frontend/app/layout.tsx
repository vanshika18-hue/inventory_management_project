import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Retail Inventory AI - Demand Forecasting & Inventory Optimization",
  description:
    "End-to-end Machine Learning web application for retail demand forecasting, safety stock calculation, and inventory optimization using Random Forest.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col text-slate-800 bg-slate-50 relative selection:bg-indigo-500 selection:text-white`}>
        {/* Subtle Ambient Background Gradients */}
        <div className="fixed inset-0 bg-ambient-pattern opacity-40 pointer-events-none -z-10" />
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-100/40 via-purple-50/20 to-transparent blur-3xl pointer-events-none -z-10" />

        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {children}
        </main>

        <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-xs py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="font-semibold text-slate-800">Retail Inventory AI</span>
              <span className="text-slate-300">•</span>
              <span>Scikit-Learn Random Forest Pipeline</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Time-Series Holdout Split</span>
              <span>•</span>
              <span>Safety Stock Optimization</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
