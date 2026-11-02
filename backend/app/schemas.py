from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DatasetSummary(BaseModel):
    rows: int
    columns: List[str]
    stores: int
    products: int
    start_date: str
    end_date: str
    preview: List[Dict[str, Any]]

class ActualVsPredictedPoint(BaseModel):
    date: str
    store_id: str
    product_id: str
    actual: float
    predicted: float

class EvaluationMetrics(BaseModel):
    mae: float
    rmse: float
    r2: float
    train_records: int
    test_records: int
    split_date: str
    actual_vs_predicted: List[ActualVsPredictedPoint]

class InventoryItem(BaseModel):
    store_id: str
    product_id: str
    category: Optional[str] = "General"
    current_stock: float
    predicted_demand: float
    predicted_7_day_demand: float
    safety_stock: float
    reorder_point: float
    target_inventory: float
    recommended_order: float
    inventory_status: str

class StatusCount(BaseModel):
    name: str
    count: int

class DashboardKPIs(BaseModel):
    total_products: int
    products_requiring_reorder: int
    out_of_stock_count: int
    total_recommended_units: int
    average_predicted_demand: float
    status_distribution: List[StatusCount]

class InventoryResponse(BaseModel):
    kpis: DashboardKPIs
    items: List[InventoryItem]
    stores: List[str]
    categories: List[str]
    statuses: List[str]

class TrainResponse(BaseModel):
    success: bool
    message: str
    metrics: EvaluationMetrics
    kpis: DashboardKPIs

class AppStatus(BaseModel):
    dataset_loaded: bool
    model_trained: bool
    dataset_summary: Optional[DatasetSummary] = None
    metrics: Optional[EvaluationMetrics] = None
