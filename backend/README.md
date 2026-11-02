# Retail Inventory AI - Backend API

FastAPI Python backend for retail demand forecasting and inventory optimization, implementing the machine learning pipeline from `Project_1.ipynb`.

## Features
- **Deterministic Sample Dataset Generator**: Generates realistic synthetic retail data with 5 stores, 10 products, and 120 days.
- **Strict Data Validation & Cleaning**: Validates required schema, handles missing values via median/mode imputation, parses dates, and clips sales to non-negative values.
- **Feature Engineering**: Calculates calendar features (day of week, month, day), time lags (lag 1, 7, 14, 28), and rolling metrics (7-day and 28-day rolling mean and standard deviation) without data leakage.
- **Scikit-Learn Pipeline**: ColumnTransformer with OneHotEncoder for categorical features + RandomForestRegressor.
- **Dynamic Model Evaluation**: Real-time evaluation calculating MAE, RMSE, and R² score on time-split test holdout data.
- **Inventory Optimization**: Exact calculations for safety stock (lead time 7, service factor 1.65), reorder point, target inventory (review period 7), and recommended order quantity.
- **CSV Export**: Direct download of `optimized_retail_inventory_report.csv`.

## Setup & Running Locally

1. Create and activate a Python virtual environment:
```bash
python -m venv venv

# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the development server:
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive API docs are accessible at `http://localhost:8000/docs`.

## Endpoints
- `GET /health` - Health check & current status
- `GET /api/sample-dataset` - Download synthetic demo dataset
- `POST /api/upload` - Upload and validate CSV dataset
- `POST /api/train` - Train Random Forest model & compute forecasts & inventory
- `GET /api/status` - Current dataset and model status
- `GET /api/metrics` - Evaluation metrics (MAE, RMSE, R²) and Actual vs Predicted points
- `GET /api/inventory` - Inventory items, KPIs, and store/category filters
- `GET /api/export` - Download optimized inventory report CSV
