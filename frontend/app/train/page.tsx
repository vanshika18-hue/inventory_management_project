"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck,
  Calendar,
  Layers,
  Store,
  Box,
  Cpu,
  ArrowRight,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Table as TableIcon,
  Sparkles,
  Info
} from "lucide-react";
import DatasetUpload from "@/components/DatasetUpload";
import TrainingStatus from "@/components/TrainingStatus";
import StatCard from "@/components/StatCard";
import { ActualVsPredictedChart } from "@/components/Charts";
import {
  trainModel,
  fetchAppStatus,
  DatasetSummary,
  EvaluationMetrics
} from "@/lib/api";

export default function TrainPage() {
  const [datasetSummary, setDatasetSummary] = useState<DatasetSummary | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [trainError, setTrainError] = useState<string | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Check if backend already has loaded state on mount
  useEffect(() => {
    fetchAppStatus()
      .then((status) => {
        if (status.dataset_summary) {
          setDatasetSummary(status.dataset_summary);
        }
        if (status.model_trained && status.metrics) {
          setMetrics(status.metrics);
          setTrainingComplete(true);
        }
      })
      .catch((err) => {
        console.error("Status check failed:", err);
      })
      .finally(() => {
        setLoadingInitial(false);
      });
  }, []);

  const handleUploadSuccess = (summary: DatasetSummary) => {
    setDatasetSummary(summary);
    setTrainingComplete(false);
    setMetrics(null);
    setTrainError(null);
  };

  const handleStartTraining = async () => {
    setIsTraining(true);
    setTrainError(null);
    setTrainingComplete(false);

    try {
      const res = await trainModel();
      setMetrics(res.metrics);
      setTrainingComplete(true);
    } catch (err: any) {
      setTrainError(err.message || "Model training failed. Please verify your dataset.");
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Model Training &amp; Evaluation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Upload your retail transaction CSV, inspect the schema, train the Random Forest regressor, and examine real holdout performance.
        </p>
      </div>

      {/* Step 1: Upload Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-white text-xs font-extrabold shadow-2xs">
            1
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Upload &amp; Validate Dataset</h2>
        </div>

        <DatasetUpload
          onUploadSuccess={handleUploadSuccess}
          isProcessing={isTraining}
        />
      </section>

      {/* Dataset Summary Cards (Rendered dynamically when dataset is loaded) */}
      {datasetSummary && (
        <section className="space-y-6">
          <div className="rounded-3xl border border-emerald-200/90 bg-emerald-50/40 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2.5 text-emerald-900 font-bold mb-4 text-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>Dataset Validated &amp; Loaded Successfully</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              <div className="rounded-2xl bg-white p-4 border border-emerald-100 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Rows</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                  {datasetSummary.rows.toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 border border-emerald-100 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Columns</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                  {datasetSummary.columns.length}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 border border-emerald-100 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stores</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                  {datasetSummary.stores}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 border border-emerald-100 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Products</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                  {datasetSummary.products}
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white p-4 border border-emerald-100 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date Span</span>
                <p className="text-xs font-bold text-slate-900 mt-1.5 truncate">
                  {datasetSummary.start_date} <span className="text-indigo-500 font-extrabold">→</span> {datasetSummary.end_date}
                </p>
              </div>
            </div>
          </div>

          {/* Dataset Preview Table */}
          {datasetSummary.preview && datasetSummary.preview.length > 0 && (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <TableIcon className="h-4 w-4 text-indigo-600" />
                  <span>Dataset Preview (First 10 Rows)</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">Preprocessed records</span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      {datasetSummary.columns.slice(0, 8).map((col) => (
                        <th key={col} className="px-3.5 py-3 font-semibold">
                          {col.replace("_", " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {datasetSummary.preview.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        {datasetSummary.columns.slice(0, 8).map((col) => (
                          <td key={col} className="px-3.5 py-2.5 font-medium text-slate-700">
                            {String(row[col] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 2: Training Action */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-white text-xs font-extrabold shadow-2xs">
                2
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Train Demand Forecasting Model</h2>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Scikit-Learn Random Forest Pipeline
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl font-normal leading-relaxed">
                  Extracts calendar features, historical lags (1, 7, 14, 28) and rolling statistics (mean &amp; std).
                  Splits on time-series holdout, fits 100 decision trees, and produces demand predictions.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartTraining}
                disabled={isTraining}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 hover:bg-indigo-700 active:scale-98 transition-all shrink-0 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Cpu className="h-4 w-4" />
                <span>{isTraining ? "Training Pipeline..." : "Train Demand Forecasting Model"}</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Training Status Progress Steps */}
      <TrainingStatus isTraining={isTraining} isComplete={trainingComplete} />

      {/* Error Banner */}
      {trainError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs sm:text-sm text-rose-800 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block text-rose-900">Training Error</span>
            <p className="mt-0.5 text-rose-700">{trainError}</p>
          </div>
        </div>
      )}

      {/* Model Performance & Evaluation */}
      {metrics && (
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Model Performance &amp; Evaluation
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Evaluated on holdout test set from split date <span className="font-bold text-slate-700">{metrics.split_date}</span> ({metrics.test_records} test records, {metrics.train_records} training records).
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs shadow-emerald-600/20 hover:bg-emerald-700 active:scale-98 transition-all shrink-0"
            >
              <span>View Inventory Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Mean Absolute Error (MAE)"
              value={metrics.mae.toFixed(2)}
              subtitle="Average deviation in units sold"
              icon={TrendingUp}
              variant="primary"
            />
            <StatCard
              title="Root Mean Squared Error (RMSE)"
              value={metrics.rmse.toFixed(2)}
              subtitle="Square root of mean squared error"
              icon={TrendingUp}
              variant="default"
            />
            <StatCard
              title="Coefficient of Determination (R²)"
              value={metrics.r2.toFixed(4)}
              subtitle="Holdout variance explained"
              icon={BarChart3}
              variant="success"
            />
          </div>

          {/* Actual vs Predicted Chart */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Actual Demand vs Predicted Demand
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Holdout time-series sales comparison across the test window.
                </p>
              </div>
            </div>

            <ActualVsPredictedChart data={metrics.actual_vs_predicted} />
          </div>
        </section>
      )}
    </div>
  );
}
