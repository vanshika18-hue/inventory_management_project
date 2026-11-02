import pandas as pd
import numpy as np
from typing import Tuple, List, Dict, Any

REQUIRED_COLUMNS = [
    "date",
    "store_id",
    "product_id",
    "inventory_level",
    "units_sold"
]

TARGET = "units_sold"
GROUP_COLS = ["store_id", "product_id"]

def standardize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Standardizes column names to lowercase, stripped, with underscores."""
    df = df.copy()
    df.columns = (
        df.columns.astype(str)
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
        .str.replace("/", "_")
        .str.replace("-", "_")
    )
    return df

def validate_and_clean_data(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Validates CSV columns according to Project_1.ipynb Cell 3, 4, 5, 6, 7, 14.
    Returns cleaned DataFrame and dataset summary.
    """
    if df.empty:
        raise ValueError("The uploaded CSV file is empty.")

    df = standardize_columns(df)

    # Check for missing required columns
    missing_columns = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_columns:
        raise ValueError(f"Required columns missing: {', '.join(missing_columns)}. Found columns: {', '.join(df.columns.tolist())}")

    # Convert date column
    df["date"] = pd.to_datetime(df["date"], dayfirst=True, errors="coerce")
    invalid_dates = df["date"].isnull().sum()
    df = df.dropna(subset=["date"]).copy()

    if df.empty:
        raise ValueError("No valid date values found in the 'date' column.")

    # Sort records by date
    df = df.sort_values("date").reset_index(drop=True)

    # Impute missing values (Cell 6)
    for col in df.select_dtypes(include=np.number).columns:
        median_val = df[col].median()
        df[col] = df[col].fillna(median_val if not pd.isna(median_val) else 0)

    for col in df.select_dtypes(include="object").columns:
        mode_series = df[col].mode()
        df[col] = df[col].fillna(mode_series[0] if not mode_series.empty else "Unknown")

    # Drop duplicates on (date, store_id, product_id)
    df = (
        df.sort_values("date")
        .drop_duplicates(subset=["date", "store_id", "product_id"], keep="last")
        .copy()
    )

    # Non-negative sales
    df[TARGET] = pd.to_numeric(df[TARGET], errors="coerce").fillna(0)
    df[TARGET] = df[TARGET].clip(lower=0)

    df["inventory_level"] = pd.to_numeric(df["inventory_level"], errors="coerce").fillna(0)
    df["store_id"] = df["store_id"].astype(str)
    df["product_id"] = df["product_id"].astype(str)
    if "category" in df.columns:
        df["category"] = df["category"].astype(str)

    # Generate summary stats
    min_date = df["date"].min().strftime("%Y-%m-%d")
    max_date = df["date"].max().strftime("%Y-%m-%d")
    stores_count = int(df["store_id"].nunique())
    products_count = int(df["product_id"].nunique())
    total_rows = len(df)

    # Prepare preview rows (convert timestamps to string)
    preview_df = df.head(10).copy()
    preview_df["date"] = preview_df["date"].dt.strftime("%Y-%m-%d")
    preview_records = preview_df.to_dict(orient="records")

    summary = {
        "rows": total_rows,
        "columns": df.columns.tolist(),
        "stores": stores_count,
        "products": products_count,
        "start_date": min_date,
        "end_date": max_date,
        "preview": preview_records
    }

    return df, summary

def engineer_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
    """
    Reproduces feature engineering from Project_1.ipynb Cell 15 and 16.
    Computes calendar features, lag_1, 7, 14, 28, and rolling averages/stds.
    """
    df = df.copy()

    # Calendar features
    df["day_of_week"] = df["date"].dt.dayofweek
    df["month"] = df["date"].dt.month
    df["day"] = df["date"].dt.day

    # Sort data before creating lag features
    df = df.sort_values(GROUP_COLS + ["date"]).reset_index(drop=True)

    # Previous sales lags
    df["lag_1"] = df.groupby(GROUP_COLS)[TARGET].shift(1)
    df["lag_7"] = df.groupby(GROUP_COLS)[TARGET].shift(7)
    df["lag_14"] = df.groupby(GROUP_COLS)[TARGET].shift(14)
    df["lag_28"] = df.groupby(GROUP_COLS)[TARGET].shift(28)

    # Rolling averages using only previous days (shift(1) to avoid leakage)
    df["rolling_mean_7"] = (
        df.groupby(GROUP_COLS)[TARGET]
        .transform(lambda x: x.shift(1).rolling(7).mean())
    )

    df["rolling_mean_28"] = (
        df.groupby(GROUP_COLS)[TARGET]
        .transform(lambda x: x.shift(1).rolling(28).mean())
    )

    # Rolling demand variability
    df["rolling_std_28"] = (
        df.groupby(GROUP_COLS)[TARGET]
        .transform(lambda x: x.shift(1).rolling(28).std())
    )

    feature_columns = [
        "store_id",
        "product_id",
        "day_of_week",
        "month",
        "day",
        "lag_1",
        "lag_7",
        "lag_14",
        "lag_28",
        "rolling_mean_7",
        "rolling_mean_28",
        "rolling_std_28"
    ]

    if "category" in df.columns:
        feature_columns.append("category")

    df_model = df.dropna(subset=feature_columns + [TARGET]).copy()

    if len(df_model) == 0:
        raise ValueError(
            "Insufficient historical records per store-product to compute 28-day lags and rolling features. "
            "Please ensure your dataset contains at least 29+ days of history per store and product."
        )

    return df_model, feature_columns
