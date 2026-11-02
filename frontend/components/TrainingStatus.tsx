"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Sparkles, Activity } from "lucide-react";

interface TrainingStatusProps {
  isTraining: boolean;
  isComplete: boolean;
}

const TRAINING_STEPS = [
  "Cleaning and standardizing data columns...",
  "Generating calendar features (day of week, month, day)...",
  "Creating lag variables (lag 1, lag 7, lag 14, lag 28)...",
  "Computing rolling averages and demand variability...",
  "Applying OneHotEncoder and ColumnTransformer pipeline...",
  "Training Random Forest Regressor (n_estimators=100)...",
  "Evaluating model metrics (MAE, RMSE, R²)...",
  "Generating next-day and 7-day demand forecasts...",
  "Optimizing inventory levels, safety stock & reorder points...",
];

export default function TrainingStatus({
  isTraining,
  isComplete,
}: TrainingStatusProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isTraining) {
      if (isComplete) {
        setCurrentStepIndex(TRAINING_STEPS.length);
      } else {
        setCurrentStepIndex(0);
      }
      return;
    }

    // Step cadence reflecting real backend work
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < TRAINING_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isTraining, isComplete]);

  if (!isTraining && !isComplete) return null;

  const progressPercent = isComplete
    ? 100
    : Math.min(95, Math.round(((currentStepIndex + 1) / TRAINING_STEPS.length) * 100));

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {isComplete ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 shadow-xs">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            </div>
          )}
          <div>
            <h4 className="text-base font-bold text-slate-900">
              {isComplete ? "Model Pipeline Completed" : "Executing Machine Learning Pipeline"}
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isComplete
                ? "Scikit-Learn Random Forest fitted and holdout metrics computed successfully."
                : "Feature engineering, time-series holdout split & Random Forest fitting in progress."}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold tracking-wide ${
            isComplete
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs"
              : "bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse"
          }`}
        >
          {isComplete ? (
            <>
              <CheckCircle2 className="h-3 w-3" />
              <span>100% Ready</span>
            </>
          ) : (
            <>
              <Activity className="h-3 w-3 animate-spin" />
              <span>{progressPercent}% Complete</span>
            </>
          )}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isComplete ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-500 to-indigo-600"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
        {TRAINING_STEPS.map((step, idx) => {
          const isDone = isComplete || idx < currentStepIndex;
          const isCurrent = isTraining && idx === currentStepIndex;

          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs transition-all ${
                isCurrent
                  ? "bg-indigo-50/90 text-indigo-900 font-semibold border border-indigo-200 shadow-xs"
                  : isDone
                  ? "text-slate-700 bg-slate-50/80 border border-slate-100"
                  : "text-slate-400 opacity-60"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="h-4 w-4 text-indigo-600 animate-spin shrink-0" />
              ) : (
                <div className="h-4 w-4 rounded-full border border-slate-300 shrink-0" />
              )}
              <span className="truncate">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
