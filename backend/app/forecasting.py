import pandas as pd
import numpy as np
from typing import List
from sklearn.pipeline import Pipeline

GROUP_COLS = ["store_id", "product_id"]
TARGET = "units_sold"

def generate_forecasts(
    df: pd.DataFrame,
    model: Pipeline,
    feature_columns: List[str]
) -> pd.DataFrame:
    """
    Generates demand forecasts for next day and 7 days matching Project_1.ipynb Cell 22 and 23.
    """
    # Get the latest record for each store-product combination (Cell 22)
    latest_data = (
        df.sort_values("date")
        .groupby(GROUP_COLS)
        .tail(1)
        .copy()
    )

    # Calculate historical demand statistics
    demand_stats = (
        df.groupby(GROUP_COLS)[TARGET]
        .agg(
            average_daily_demand="mean",
            demand_std="std"
        )
        .reset_index()
    )

    latest_data = latest_data.merge(
        demand_stats,
        on=GROUP_COLS,
        how="left"
    )

    latest_data["demand_std"] = latest_data["demand_std"].fillna(0)

    # Tomorrow's date (Cell 23)
    forecast_date = df["date"].max() + pd.Timedelta(days=1)

    forecast_input = latest_data.copy()

    forecast_input["day_of_week"] = forecast_date.dayofweek
    forecast_input["month"] = forecast_date.month
    forecast_input["day"] = forecast_date.day

    # Use recent sales history for lag_1
    forecast_input["lag_1"] = forecast_input["units_sold"]

    # In case any missing feature columns exist in forecast_input, fill them with defaults
    for col in feature_columns:
        if col not in forecast_input.columns:
            forecast_input[col] = 0

    X_future = forecast_input[feature_columns]

    # Predict next-day demand
    forecast_input["predicted_demand"] = np.maximum(
        model.predict(X_future),
        0
    )

    # 7-day demand
    forecast_input["predicted_7_day_demand"] = (
        forecast_input["predicted_demand"] * 7
    ).round(0)

    return forecast_input
