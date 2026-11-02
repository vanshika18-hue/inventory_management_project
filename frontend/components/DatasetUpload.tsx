"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  FileCheck2,
  Database
} from "lucide-react";
import { uploadDataset, getSampleDatasetDownloadUrl, DatasetSummary } from "@/lib/api";

interface DatasetUploadProps {
  onUploadSuccess: (summary: DatasetSummary) => void;
  isProcessing?: boolean;
}

export default function DatasetUpload({
  onUploadSuccess,
  isProcessing = false,
}: DatasetUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Invalid file format. Please upload a valid CSV file (.csv).");
      return;
    }

    setSelectedFile(file);
    setError(null);
    setSuccessMsg(null);
    setUploading(true);

    try {
      const res = await uploadDataset(file);
      setSuccessMsg(res.message);
      onUploadSuccess(res.summary);
    } catch (err: any) {
      setError(err.message || "Failed to upload and validate CSV file.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const loadSampleDatasetDirectly = async () => {
    setError(null);
    setSuccessMsg(null);
    setUploading(true);
    try {
      const sampleUrl = getSampleDatasetDownloadUrl();
      const res = await fetch(sampleUrl);
      if (!res.ok) throw new Error("Failed to fetch synthetic sample dataset.");
      const blob = await res.blob();
      const file = new File([blob], "retail_inventory_sample.csv", { type: "text/csv" });
      setSelectedFile(file);
      const uploadRes = await uploadDataset(file);
      setSuccessMsg("Synthetic demo dataset loaded and validated successfully!");
      onUploadSuccess(uploadRes.summary);
    } catch (err: any) {
      setError(err.message || "Failed to load sample dataset.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center transition-all duration-200 ${
          dragActive
            ? "border-indigo-500 bg-indigo-50/70 shadow-sm"
            : "border-slate-300/80 bg-white/90 hover:bg-slate-50/70 hover:border-slate-400"
        } ${uploading || isProcessing ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-50 to-indigo-100 text-indigo-600 mb-4 shadow-xs border border-indigo-200/50">
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          ) : (
            <UploadCloud className="h-8 w-8" />
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          Upload Retail CSV Dataset
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-md">
          Drag and drop your retail transaction CSV file here, or browse from your computer.
        </p>

        {/* Required columns pill badge */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 max-w-lg">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Required:</span>
          {["date", "store_id", "product_id", "inventory_level", "units_sold"].map((col) => (
            <span
              key={col}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200"
            >
              {col}
            </span>
          ))}
        </div>

        {/* Actions buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isProcessing}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-98 transition-all duration-150"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Select CSV File</span>
          </button>

          <button
            type="button"
            onClick={loadSampleDatasetDirectly}
            disabled={uploading || isProcessing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 active:scale-98 transition-all duration-150"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Load Demo Data Directly</span>
          </button>
        </div>

        {selectedFile && (
          <div className="mt-5 flex items-center gap-2.5 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-800 border border-slate-200">
            <FileCheck2 className="h-4 w-4 text-indigo-600" />
            <span>{selectedFile.name}</span>
            <span className="text-slate-400 font-normal">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs sm:text-sm text-rose-800 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block text-rose-900">Dataset Validation Error</span>
            <p className="mt-1 text-rose-700 whitespace-pre-wrap leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMsg && !error && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs sm:text-sm text-emerald-800 flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="font-semibold text-emerald-900">{successMsg}</span>
        </div>
      )}
    </div>
  );
}
