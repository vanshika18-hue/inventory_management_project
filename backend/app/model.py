import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

TARGET = "units_sold"

def train_demand_model(
    df_model: pd.DataFrame,
    feature_columns: List[str]
) -> Tuple[Pipeline, Dict[str, Any], pd.DataFrame]:
    """
    Trains RandomForestRegressor demand forecasting model using time-based split
    matching Project_1.ipynb Cell 17, 18, 19, 21.
    """
    unique_dates = sorted(df_model["date"].unique())

    if len(unique_dates) < 2:
        raise ValueError("Not enough distinct dates for time-based evaluation. At least 2 dates required.")

    # Use the last 30 days for testing (or 20% of dates)
    test_days = min(30, max(1, len(unique_dates) // 5))
    split_date = unique_dates[-test_days]

    train_df = df_model[df_model["date"] < split_date].copy()
    test_df = df_model[df_model["date"] >= split_date].copy()

    if len(train_df) == 0 or len(test_df) == 0:
        raise ValueError("Train/test split produced an empty set. Ensure adequate date ranges in dataset.")

    X_train = train_df[feature_columns]
    y_train = train_df[TARGET]

    X_test = test_df[feature_columns]
    y_test = test_df[TARGET]

    # Identify categorical and numerical columns (Cell 18)
    categorical_features = [
        col for col in ["store_id", "product_id", "category"]
        if col in feature_columns
    ]
    numerical_features = [
        col for col in feature_columns
        if col not in categorical_features
    ]

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(handle_unknown="ignore"),
                categorical_features
            ),
            (
                "numerical",
                "passthrough",
                numerical_features
            )
        ]
    )

    model = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "regressor",
                RandomForestRegressor(
                    n_estimators=100,
                    max_depth=15,
                    min_samples_leaf=2,
                    random_state=42,
                    n_jobs=-1
                )
            )
        ]
    )

    model.fit(X_train, y_train)

    # Predict test data (Cell 19)
    test_preds = model.predict(X_test)
    test_preds = np.maximum(test_preds, 0)

    # Evaluation metrics
    mae = float(mean_absolute_error(y_test, test_preds))
    rmse = float(np.sqrt(mean_squared_error(y_test, test_preds)))
    r2 = float(r2_score(y_test, test_preds))

    # Actual vs Predicted comparison (Cell 20, 21)
    comparison = test_df[["date", "store_id", "product_id", TARGET]].copy()
    comparison["predicted_sales"] = test_preds

    # Aggregate by date for clean time-series visualization in charts,
    # and also sample item points
    date_agg = comparison.groupby("date").agg({
        TARGET: "sum",
        "predicted_sales": "sum"
    }).reset_index()

    actual_vs_predicted_chart = []
    for _, row in date_agg.iterrows():
        actual_vs_predicted_chart.append({
            "date": row["date"].strftime("%Y-%m-%d"),
            "store_id": "All",
            "product_id": "All",
            "actual": round(float(row[TARGET]), 1),
            "predicted": round(float(row["predicted_sales"]), 1)
        })

    metrics = {
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "r2": round(r2, 4),
        "train_records": int(len(train_df)),
        "test_records": int(len(test_df)),
        "split_date": pd.to_datetime(split_date).strftime("%Y-%m-%d"),
        "actual_vs_predicted": actual_vs_predicted_chart
    }

    return model, metrics, comparison
