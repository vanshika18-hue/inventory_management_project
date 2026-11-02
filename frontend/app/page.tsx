import Link from "next/link";
import {
  Download,
  UploadCloud,
  Cpu,
  BarChart3,
  TrendingUp,
  PackageCheck,
  ShieldCheck,
  CalendarDays,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Layers,
  Store
} from "lucide-react";
import { getSampleDatasetDownloadUrl } from "@/lib/api";

export default function HomePage() {
  const sampleDownloadUrl = getSampleDatasetDownloadUrl();

  const workflowSteps = [
    {
      step: "01",
      title: "Upload Data",
      description:
        "Provide store-level daily retail transactions with sales, inventory levels, and dates.",
      icon: UploadCloud,
      color: "from-blue-500 to-indigo-600",
    },
    {
      step: "02",
      title: "Train Model",
      description:
        "Extract 28-day lags, rolling statistics, and train a Scikit-Learn Random Forest Regressor.",
      icon: Cpu,
      color: "from-indigo-500 to-purple-600",
    },
    {
      step: "03",
      title: "Forecast Demand",
      description:
        "Predict next-day demand and 7-day expected unit demand for every store-product pair.",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-600",
    },
    {
      step: "04",
      title: "Optimize Inventory",
      description:
        "Compute service-level safety stocks, reorder thresholds, and exact replenishment units.",
      icon: PackageCheck,
      color: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-12 lg:p-16 shadow-xs">
        {/* Subtle Decorative Glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-100/50 to-purple-100/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-blue-50/50 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          {/* Micro Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Retail Inventory AI • Supply Chain Intelligence</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
            Demand Forecasting &amp;{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
              Smart Inventory Optimization
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
            Train a machine learning model on your retail data and discover what inventory you need to reorder.
            Automate replenishment with predictive demand forecasts and risk-adjusted safety stock calculations.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <Link
              href="/train"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 hover:bg-indigo-700 active:scale-98 transition-all duration-150"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload Your Dataset</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href={sampleDownloadUrl}
              download="retail_inventory_sample.csv"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 active:scale-98 transition-all duration-150"
            >
              <Download className="h-4 w-4 text-indigo-600" />
              <span>Download Sample Dataset</span>
            </a>
          </div>

          {/* Synthetic Demo Label */}
          <div className="pt-3">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/70 p-4 text-xs shadow-2xs">
              <span className="font-bold px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 uppercase tracking-wider text-[10px] shrink-0 mt-0.5">
                Synthetic Demo Dataset
              </span>
              <p className="text-amber-800 leading-relaxed font-medium">
                The downloadable sample CSV is a realistic, deterministically generated dataset
                (5 stores, 10 products, 120 days of daily history) matching the exact schema required by the ML pipeline.
                Download this file and upload it into the application to test the complete workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Application Workflow */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            How The Machine Learning Workflow Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Four integrated stages running in Python to deliver actionable supply chain insights.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="group relative rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-extrabold text-indigo-600 font-mono tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      STEP {step.step}
                    </span>
                    <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700 transition-all duration-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Technical Highlights Section */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-xs space-y-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Architecture &amp; Algorithms</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Faithful Implementation of Machine Learning Methodology
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Directly translating the core analytics logic from the reference Jupyter Notebook into production services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-700">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <CalendarDays className="h-4 w-4 text-indigo-600" />
              <span>Lag &amp; Rolling Features</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Computes 1, 7, 14, and 28-day sales lags alongside 7 and 28-day rolling means and standard deviations,
              strictly shifted by 1 to prevent data leakage.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Cpu className="h-4 w-4 text-indigo-600" />
              <span>Scikit-Learn Pipeline</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standard ColumnTransformer with OneHotEncoder for Store, Product, and Category variables, feeding into a
              Random Forest Regressor (100 trees, max depth 15).
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span>Safety Stock &amp; Reorder Points</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Applies a 95% service factor (1.65) with 7-day lead times and review periods to generate optimal target inventory
              and exact recommended reorder quantities.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
