"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ArrowUpDown,
  Download,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  X
} from "lucide-react";
import { InventoryItem, getInventoryExportUrl } from "@/lib/api";

interface InventoryTableProps {
  items: InventoryItem[];
  stores: string[];
  categories: string[];
  statuses: string[];
}

export default function InventoryTable({
  items,
  stores,
  categories,
  statuses,
}: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState("All Stores");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState<keyof InventoryItem>("recommended_order");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.product_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.store_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStore =
        selectedStore === "All Stores" || item.store_id === selectedStore;

      const matchesStatus =
        selectedStatus === "All" || item.inventory_status === selectedStatus;

      return matchesSearch && matchesStore && matchesStatus;
    });
  }, [items, searchTerm, selectedStore, selectedStatus]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === "string") {
        return sortOrder === "asc"
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }

      return sortOrder === "asc"
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });
  }, [filteredItems, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [sortedItems, currentPage, pageSize]);

  const toggleSort = (column: keyof InventoryItem) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const handleDownload = () => {
    window.location.href = getInventoryExportUrl();
  };

  return (
    <div className="w-full space-y-4">
      {/* Controls & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search product, store ID, or category..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Store Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Store:</span>
            <select
              value={selectedStore}
              onChange={(e) => {
                setSelectedStore(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="All Stores">All Stores</option>
              {stores.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="All">All Statuses</option>
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Download CSV Report */}
        <button
          onClick={handleDownload}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-slate-800 active:scale-98 transition-all shrink-0"
        >
          <Download className="h-4 w-4 text-indigo-400" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th
                  onClick={() => toggleSort("store_id")}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Store</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("product_id")}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Product</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3.5">Category</th>
                <th
                  onClick={() => toggleSort("current_stock")}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/70 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Current Stock</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("predicted_demand")}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/70 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Pred Demand</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("predicted_7_day_demand")}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/70 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>7-Day Demand</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3.5 text-right">Safety Stock</th>
                <th
                  onClick={() => toggleSort("reorder_point")}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/70 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Reorder Point</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("recommended_order")}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-100/70 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-indigo-600 font-extrabold">Recommended Order</span>
                    <ArrowUpDown className="h-3 w-3 text-indigo-600" />
                  </div>
                </th>
                <th className="px-4 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-slate-400 font-medium">
                    No matching inventory records found.
                  </td>
                </tr>
              ) : (
                currentItems.map((item, idx) => {
                  const isReorder = item.inventory_status === "Reorder Needed";
                  const isOutOfStock = item.current_stock <= 0;

                  return (
                    <tr
                      key={`${item.store_id}-${item.product_id}-${idx}`}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-bold text-slate-900 font-mono text-xs">{item.store_id}</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800">{item.product_id}</td>
                      <td className="px-4 py-3.5 text-slate-500 font-medium">{item.category}</td>
                      <td className={`px-4 py-3.5 text-right font-medium tabular-nums ${isOutOfStock ? "text-rose-600 font-bold" : "text-slate-800"}`}>
                        {item.current_stock}
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-700 font-medium tabular-nums">{item.predicted_demand}</td>
                      <td className="px-4 py-3.5 text-right text-slate-700 font-medium tabular-nums">{item.predicted_7_day_demand}</td>
                      <td className="px-4 py-3.5 text-right text-slate-500 tabular-nums">{item.safety_stock}</td>
                      <td className="px-4 py-3.5 text-right text-slate-700 font-medium tabular-nums">{item.reorder_point}</td>
                      <td className="px-4 py-3.5 text-right">
                        {item.recommended_order > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 tabular-nums">
                            +{item.recommended_order}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${
                            isReorder
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {isReorder ? (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                              <span>Reorder Needed</span>
                            </>
                          ) : (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span>Stock Sufficient</span>
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Footer summary */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 text-xs text-slate-500 font-medium">
          <div>
            Showing{" "}
            <span className="font-bold text-slate-800">
              {filteredItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-slate-800">
              {Math.min(currentPage * pageSize, filteredItems.length)}
            </span>{" "}
            of <span className="font-bold text-slate-800">{filteredItems.length}</span> store-product records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs font-semibold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
