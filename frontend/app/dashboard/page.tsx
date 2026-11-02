"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Boxes,
  AlertTriangle,
  PackageCheck,
  TrendingUp,
  Cpu,
  Download,
  Loader2,
  RefreshCw,
  ShoppingBag,
  AlertCircle,
  Sparkles,
  ArrowRight
} from "lucide-react";
import StatCard from "@/components/StatCard";
import InventoryTable from "@/components/InventoryTable";
import { InventoryStatusChart, TopReordersChart } from "@/components/Charts";
import {
  fetchInventoryData,
  getInventoryExportUrl,
  InventoryResponse
} from "@/lib/api";

export default function DashboardPage() {
  const [data, setData] = useState<InventoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetchInventoryData()
      .then((res) => {
        setData(res);
      })
      .catch((err: any) => {
        setError(err.message || "Failed to load inventory data.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
        <div className="h-14 w-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 shadow-xs">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
        </div>
        <h3 className="text-base font-bold text-slate-900">
          Loading Inventory Insights...
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Retrieving demand forecasts and replenishment calculations from Python backend.
        </p>
      </div>
    );
  }

  // Empty State (No Model Available)
  if (error || !data) {
    return (
      <div className="mx-auto max-w-xl text-center py-16 px-4">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-12 shadow-xs space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
            <Cpu className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              No Model Available
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto font-medium">
              Upload a retail dataset and train the demand forecasting model first to view inventory insights.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/train"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 hover:bg-indigo-700 active:scale-98 transition-all w-full sm:w-auto"
            >
              <Cpu className="h-4 w-4" />
              <span>Train Demand Model</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all w-full sm:w-auto"
            >
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { kpis, items, stores, categories, statuses } = data;

  // Top 5 urgent reorder items
  const urgentReorders = [...items]
    .filter((it) => it.inventory_status === "Reorder Needed")
    .sort((a, b) => b.recommended_order - a.recommended_order)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inventory Optimization Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Machine-learning powered demand forecasts, safety stocks, and replenishment triggers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={loadData}
            title="Refresh inventory results"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all active:scale-98"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>

          <a
            href={getInventoryExportUrl()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs transition-all active:scale-98"
          >
            <Download className="h-3.5 w-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={kpis.total_products}
          subtitle="Monitored Store-Product Pairs"
          icon={Boxes}
          variant="default"
        />

        <StatCard
          title="Products Requiring Reorder"
          value={kpis.products_requiring_reorder}
          subtitle={`${kpis.out_of_stock_count} currently out of stock`}
          icon={AlertTriangle}
          variant={kpis.products_requiring_reorder > 0 ? "danger" : "success"}
        />

        <StatCard
          title="Total Recommended Units"
          value={kpis.total_recommended_units.toLocaleString()}
          subtitle="Optimal replenish quantity"
          icon={ShoppingBag}
          variant="primary"
        />

        <StatCard
          title="Average Predicted Demand"
          value={kpis.average_predicted_demand}
          subtitle="Next-day forecasted units/item"
          icon={TrendingUp}
          variant="default"
        />
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Status Overview */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Inventory Status Overview
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Distribution of items requiring replenishment vs sufficient stock.
              </p>
            </div>
          </div>
          <InventoryStatusChart data={kpis.status_distribution} />
        </div>

        {/* Top 10 Products Requiring Stock */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Top Products Requiring Stock
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Highest recommended order quantities by store-product pair.
              </p>
            </div>
          </div>
          <TopReordersChart items={items} />
        </div>
      </div>

      {/* Urgent Reorder Highlights Card */}
      {urgentReorders.length > 0 && (
        <div className="rounded-3xl border border-rose-200/90 bg-rose-50/40 p-5 sm:p-6 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <span>Urgent Stock Reorder Priorities (Top 5)</span>
            </div>
            <span className="text-xs font-semibold text-rose-700">Immediate action needed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {urgentReorders.map((it) => (
              <div
                key={`${it.store_id}-${it.product_id}`}
                className="rounded-2xl bg-white p-4 border border-rose-100 shadow-2xs space-y-1.5 transition-all hover:shadow-xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{it.product_id}</span>
                  <span className="text-slate-500 font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">{it.store_id}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate">{it.category}</div>
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">Stock: <strong className="text-slate-800">{it.current_stock}</strong></span>
                  <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                    +{it.recommended_order}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Inventory Table & Filters */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Full Inventory Optimization Records
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Filter, sort, search, and inspect calculated safety stocks and recommended orders.
          </p>
        </div>

        <InventoryTable
          items={items}
          stores={stores}
          categories={categories}
          statuses={statuses}
        />
      </section>
    </div>
  );
}
