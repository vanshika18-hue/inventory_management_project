import io
import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any, List

LEAD_TIME = 7
REVIEW_PERIOD = 7
SERVICE_FACTOR = 1.65

def optimize_inventory(forecast_df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Computes inventory optimization metrics matching Project_1.ipynb Cell 24-29.
    """
    df = forecast_df.copy()

    # Safety stock (Cell 24)
    df["safety_stock"] = (
        SERVICE_FACTOR
        * df["demand_std"]
        * np.sqrt(LEAD_TIME)
    )

    # Reorder point
    df["reorder_point"] = (
        df["average_daily_demand"] * LEAD_TIME
        + df["safety_stock"]
    )

    # Target inventory
    df["target_inventory"] = (
        df["average_daily_demand"] * (LEAD_TIME + REVIEW_PERIOD)
        + df["safety_stock"]
    )

    # Current inventory
    df["current_stock"] = df["inventory_level"]

    # Recommended order quantity
    df["recommended_order"] = np.maximum(
        0,
        np.ceil(df["target_inventory"] - df["current_stock"])
    )

    # Inventory status
    df["inventory_status"] = np.where(
        df["current_stock"] <= df["reorder_point"],
        "Reorder Needed",
        "Stock Sufficient"
    )

    # Round columns for clean numerical output
    round_cols = [
        "predicted_demand",
        "average_daily_demand",
        "safety_stock",
        "reorder_point",
        "target_inventory"
    ]
    for col in round_cols:
        if col in df.columns:
            df[col] = df[col].round(2)

    df["recommended_order"] = df["recommended_order"].astype(int)
    df["predicted_7_day_demand"] = df["predicted_7_day_demand"].astype(int)

    # Calculate Dashboard KPIs (Cell 29 & 31)
    total_products = len(df)
    products_to_reorder = int((df["inventory_status"] == "Reorder Needed").sum())
    out_of_stock = int((df["current_stock"] <= 0).sum())
    total_recommended = int(df["recommended_order"].sum())
    avg_predicted_demand = round(float(df["predicted_demand"].mean()), 2) if total_products > 0 else 0.0

    status_counts = df["inventory_status"].value_counts().to_dict()
    status_distribution = [
        {"name": "Reorder Needed", "count": int(status_counts.get("Reorder Needed", 0))},
        {"name": "Stock Sufficient", "count": int(status_counts.get("Stock Sufficient", 0))}
    ]

    kpis = {
        "total_products": total_products,
        "products_requiring_reorder": products_to_reorder,
        "out_of_stock_count": out_of_stock,
        "total_recommended_units": total_recommended,
        "average_predicted_demand": avg_predicted_demand,
        "status_distribution": status_distribution
    }

    return df, kpis

def generate_inventory_csv_export(inventory_df: pd.DataFrame) -> bytes:
    """
    Generates CSV export bytes matching Project_1.ipynb Cell 33 and prompt specification.
    """
    df = inventory_df.copy()

    # Identify present columns
    has_category = "category" in df.columns
    has_date = "date" in df.columns

    output_columns = []
    rename_dict = {}

    if has_date:
        df["date_str"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")
        output_columns.append("date_str")
        rename_dict["date_str"] = "Date"

    output_columns.extend(["store_id", "product_id"])
    rename_dict["store_id"] = "Store ID"
    rename_dict["product_id"] = "Product ID"

    if has_category:
        output_columns.append("category")
        rename_dict["category"] = "Category"

    output_columns.extend([
        "current_stock",
        "predicted_demand",
        "predicted_7_day_demand",
        "safety_stock",
        "reorder_point",
        "target_inventory",
        "recommended_order",
        "inventory_status"
    ])

    rename_dict.update({
        "current_stock": "Current Inventory",
        "predicted_demand": "Predicted Demand",
        "predicted_7_day_demand": "7-Day Demand",
        "safety_stock": "Safety Stock",
        "reorder_point": "Reorder Point",
        "target_inventory": "Target Inventory",
        "recommended_order": "Recommended Order",
        "inventory_status": "Status"
    })

    export_df = df[output_columns].rename(columns=rename_dict)

    buffer = io.StringIO()
    export_df.to_csv(buffer, index=False)
    return buffer.getvalue().encode("utf-8")
