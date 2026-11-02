"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  Area,
  ComposedChart
} from "recharts";
import { ActualVsPredictedPoint, StatusCount, InventoryItem } from "@/lib/api";

interface ActualVsPredictedChartProps {
  data: ActualVsPredictedPoint[];
}

export function ActualVsPredictedChart({ data }: ActualVsPredictedChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-400">
        No evaluation prediction points available.
      </div>
    );
  }

  return (
    <div className="w-full h-80 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 15, right: 20, left: -5, bottom: 25 }}>
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            dy={8}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.96)",
              backdropFilter: "blur(8px)",
              borderRadius: "1rem",
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
              fontSize: "12px",
              padding: "10px 14px",
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: "16px", fontSize: "12px", fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="actual"
            fill="url(#actualGradient)"
            stroke="none"
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual Demand (Units)"
            stroke="#4f46e5"
            strokeWidth={3}
            dot={{ r: 3.5, fill: "#4f46e5", strokeWidth: 1, stroke: "#ffffff" }}
            activeDot={{ r: 6, fill: "#4f46e5", stroke: "#ffffff", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            name="Predicted Demand (RF Model)"
            stroke="#f59e0b"
            strokeWidth={2.5}
            strokeDasharray="5 5"
            dot={{ r: 3, fill: "#f59e0b", strokeWidth: 1, stroke: "#ffffff" }}
            activeDot={{ r: 6, fill: "#f59e0b", stroke: "#ffffff", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

interface InventoryStatusChartProps {
  data: StatusCount[];
}

export function InventoryStatusChart({ data }: InventoryStatusChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-400">
        No status distribution data available.
      </div>
    );
  }

  const COLORS = {
    "Reorder Needed": "#ef4444",
    "Stock Sufficient": "#10b981",
  };

  return (
    <div className="w-full h-68 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 15, left: -10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#475569", fontWeight: 600 }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            dy={6}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.96)",
              backdropFilter: "blur(8px)",
              borderRadius: "1rem",
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              fontSize: "12px",
              padding: "8px 12px",
            }}
          />
          <Bar dataKey="count" name="Product Count" radius={[8, 8, 0, 0]} maxBarSize={64}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name as keyof typeof COLORS] || "#4f46e5"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TopReordersChartProps {
  items: InventoryItem[];
}

export function TopReordersChart({ items }: TopReordersChartProps) {
  const top10 = [...items]
    .sort((a, b) => b.recommended_order - a.recommended_order)
    .slice(0, 10)
    .map((item) => ({
      name: `${item.store_id} / ${item.product_id}`,
      recommended_order: item.recommended_order,
      category: item.category,
    }));

  if (top10.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-400">
        No reorder data available.
      </div>
    );
  }

  return (
    <div className="w-full h-68 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top10} margin={{ top: 15, right: 15, left: -10, bottom: 30 }}>
          <defs>
            <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "#475569", fontWeight: 500 }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            interval={0}
            angle={-30}
            textAnchor="end"
            dy={6}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.96)",
              backdropFilter: "blur(8px)",
              borderRadius: "1rem",
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              fontSize: "12px",
              padding: "8px 12px",
            }}
          />
          <Bar
            dataKey="recommended_order"
            name="Recommended Order Units"
            fill="url(#orderGradient)"
            radius={[8, 8, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
