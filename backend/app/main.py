import io
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, UploadFile, File, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

from app.schemas import (
    DatasetSummary,
    EvaluationMetrics,
    InventoryResponse,
    TrainResponse,
    AppStatus,
    InventoryItem,
    DashboardKPIs,
    StatusCount
)
from app.sample_data import get_sample_csv_bytes, generate_sample_dataset
from app.preprocessing import validate_and_clean_data, engineer_features
from app.model import train_demand_model
from app.forecasting import generate_forecasts
from app.inventory import optimize_inventory, generate_inventory_csv_export

app = FastAPI(
    title="Retail Inventory AI API",
    description="Backend API for demand forecasting and inventory optimization based on Project_1.ipynb",
    version="1.0.0"
)

# Enable CORS for Next.js frontend (local dev and Vercel production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session state
class AppSessionState:
    def __init__(self):
        self.cleaned_df: Optional[pd.DataFrame] = None
        self.dataset_summary: Optional[Dict[str, Any]] = None
        self.model = None
        self.feature_columns: Optional[List[str]] = None
        self.metrics: Optional[Dict[str, Any]] = None
        self.inventory_df: Optional[pd.DataFrame] = None
        self.kpis: Optional[Dict[str, Any]] = None

    def reset_model(self):
        self.model = None
        self.feature_columns = None
        self.metrics = None
        self.inventory_df = None
        self.kpis = None

session_state = AppSessionState()

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "app": "Retail Inventory AI Backend",
        "dataset_loaded": session_state.cleaned_df is not None,
        "model_trained": session_state.model is not None
    }

@app.get("/api/sample-dataset")
def download_sample_dataset():
    """Generates and streams the synthetic sample retail inventory CSV."""
    try:
        csv_bytes = get_sample_csv_bytes()
        return Response(
            content=csv_bytes,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=retail_inventory_sample.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate sample dataset: {str(e)}")

@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Uploads and validates a CSV dataset according to Project_1.ipynb standards."""
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .csv file.")

    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        try:
            df = pd.read_csv(io.BytesIO(content))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Malformed CSV file: {str(e)}")

        # Validate and clean data
        cleaned_df, summary = validate_and_clean_data(df)

        # Store in session state
        session_state.cleaned_df = cleaned_df
        session_state.dataset_summary = summary
        session_state.reset_model()

        return {
            "success": True,
            "message": "Dataset uploaded and validated successfully.",
            "summary": summary
        }

    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data processing error: {str(e)}")

@app.post("/api/train", response_model=TrainResponse)
def train_model():
    """Trains the Random Forest model and calculates demand forecasts & inventory optimization."""
    if session_state.cleaned_df is None:
        raise HTTPException(status_code=400, detail="No dataset uploaded. Please upload a dataset first.")

    try:
        # Step 1: Feature Engineering (Project_1.ipynb Cell 15-16)
        df_model, feature_columns = engineer_features(session_state.cleaned_df)

        # Step 2: Model Training & Evaluation (Project_1.ipynb Cell 17-21)
        model, metrics, _ = train_demand_model(df_model, feature_columns)

        # Step 3: Forecasting (Project_1.ipynb Cell 22-23)
        forecast_df = generate_forecasts(session_state.cleaned_df, model, feature_columns)

        # Step 4: Inventory Optimization (Project_1.ipynb Cell 24-29)
        inventory_df, kpis = optimize_inventory(forecast_df)

        # Store state
        session_state.model = model
        session_state.feature_columns = feature_columns
        session_state.metrics = metrics
        session_state.inventory_df = inventory_df
        session_state.kpis = kpis

        return TrainResponse(
            success=True,
            message="Demand forecasting model trained and inventory optimized successfully.",
            metrics=EvaluationMetrics(**metrics),
            kpis=DashboardKPIs(**kpis)
        )

    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model training error: {str(e)}")

@app.get("/api/status", response_model=AppStatus)
def get_status():
    """Returns current dataset and model status."""
    summary = DatasetSummary(**session_state.dataset_summary) if session_state.dataset_summary else None
    metrics = EvaluationMetrics(**session_state.metrics) if session_state.metrics else None

    return AppStatus(
        dataset_loaded=session_state.cleaned_df is not None,
        model_trained=session_state.model is not None,
        dataset_summary=summary,
        metrics=metrics
    )

@app.get("/api/metrics", response_model=EvaluationMetrics)
def get_metrics():
    """Returns evaluation metrics from the trained model."""
    if session_state.metrics is None:
        raise HTTPException(status_code=400, detail="No model has been trained yet. Please train the model first.")
    return EvaluationMetrics(**session_state.metrics)

@app.get("/api/inventory", response_model=InventoryResponse)
def get_inventory():
    """Returns inventory items, KPIs, and filter metadata."""
    if session_state.inventory_df is None or session_state.kpis is None:
        raise HTTPException(status_code=400, detail="No inventory results available. Please train the model first.")

    df = session_state.inventory_df

    # Extract items
    has_category = "category" in df.columns
    items: List[InventoryItem] = []

    for _, row in df.iterrows():
        items.append(
            InventoryItem(
                store_id=str(row["store_id"]),
                product_id=str(row["product_id"]),
                category=str(row["category"]) if has_category and pd.notna(row.get("category")) else "General",
                current_stock=float(row["current_stock"]),
                predicted_demand=float(row["predicted_demand"]),
                predicted_7_day_demand=float(row["predicted_7_day_demand"]),
                safety_stock=float(row["safety_stock"]),
                reorder_point=float(row["reorder_point"]),
                target_inventory=float(row["target_inventory"]),
                recommended_order=float(row["recommended_order"]),
                inventory_status=str(row["inventory_status"])
            )
        )

    stores = sorted(list(df["store_id"].astype(str).unique()))
    categories = sorted(list(df["category"].astype(str).unique())) if has_category else ["General"]
    statuses = ["Reorder Needed", "Stock Sufficient"]

    return InventoryResponse(
        kpis=DashboardKPIs(**session_state.kpis),
        items=items,
        stores=stores,
        categories=categories,
        statuses=statuses
    )

@app.get("/api/export")
def export_inventory_report():
    """Downloads the optimized retail inventory report CSV."""
    if session_state.inventory_df is None:
        raise HTTPException(status_code=400, detail="No inventory results available to export. Train the model first.")

    try:
        csv_bytes = generate_inventory_csv_export(session_state.inventory_df)
        return Response(
            content=csv_bytes,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=optimized_retail_inventory_report.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")
