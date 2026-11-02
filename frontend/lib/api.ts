// Base URL strictly from process.env.NEXT_PUBLIC_API_URL
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Safely sanitize trailing slash so `${API_URL}/endpoint` always produces a clean path
export const API_URL = RAW_API_URL.replace(/\/+$/, "");
export const API_BASE_URL = API_URL;

export interface DatasetSummary {
  rows: number;
  columns: string[];
  stores: number;
  products: number;
  start_date: string;
  end_date: string;
  preview: Record<string, any>[];
}

export interface ActualVsPredictedPoint {
  date: string;
  store_id: string;
  product_id: string;
  actual: number;
  predicted: number;
}

export interface EvaluationMetrics {
  mae: number;
  rmse: number;
  r2: number;
  train_records: number;
  test_records: number;
  split_date: string;
  actual_vs_predicted: ActualVsPredictedPoint[];
}

export interface InventoryItem {
  store_id: string;
  product_id: string;
  category: string;
  current_stock: number;
  predicted_demand: number;
  predicted_7_day_demand: number;
  safety_stock: number;
  reorder_point: number;
  target_inventory: number;
  recommended_order: number;
  inventory_status: "Reorder Needed" | "Stock Sufficient" | string;
}

export interface StatusCount {
  name: string;
  count: number;
}

export interface DashboardKPIs {
  total_products: number;
  products_requiring_reorder: number;
  out_of_stock_count: number;
  total_recommended_units: number;
  average_predicted_demand: number;
  status_distribution: StatusCount[];
}

export interface InventoryResponse {
  kpis: DashboardKPIs;
  items: InventoryItem[];
  stores: string[];
  categories: string[];
  statuses: string[];
}

export interface TrainResponse {
  success: boolean;
  message: string;
  metrics: EvaluationMetrics;
  kpis: DashboardKPIs;
}

export interface AppStatus {
  dataset_loaded: boolean;
  model_trained: boolean;
  dataset_summary: DatasetSummary | null;
  metrics: EvaluationMetrics | null;
}

export async function checkBackendHealth(): Promise<{ status: string; app: string }> {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) {
    throw new Error(`Backend unavailable (${res.status})`);
  }
  return res.json();
}

export function getSampleDatasetDownloadUrl(): string {
  return `${API_URL}/api/sample-dataset`;
}

export function getInventoryExportUrl(): string {
  return `${API_URL}/api/export`;
}

export async function uploadDataset(file: File): Promise<{ success: boolean; message: string; summary: DatasetSummary }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || "Failed to upload dataset.");
  }
  return data;
}

export async function trainModel(): Promise<TrainResponse> {
  const res = await fetch(`${API_URL}/api/train`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || "Failed to train model.");
  }
  return data;
}

export async function fetchAppStatus(): Promise<AppStatus> {
  const res = await fetch(`${API_URL}/api/status`);
  if (!res.ok) {
    throw new Error("Failed to fetch application status.");
  }
  return res.json();
}

export async function fetchEvaluationMetrics(): Promise<EvaluationMetrics> {
  const res = await fetch(`${API_URL}/api/metrics`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Failed to fetch evaluation metrics.");
  }
  return data;
}

export async function fetchInventoryData(): Promise<InventoryResponse> {
  const res = await fetch(`${API_URL}/api/inventory`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Failed to fetch inventory data.");
  }
  return data;
}
