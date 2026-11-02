# Retail Inventory AI

A machine-learning-powered web application for retail demand forecasting and smart inventory optimization, built from the data pipeline and modeling logic demonstrated in `Project_1.ipynb`.

---

## 1. What is this?

**Retail Inventory AI** is an end-to-end supply chain intelligence system. It allows retail store managers and inventory analysts to:
1. **Acquire & Validate Data**: Download a deterministic, realistic synthetic retail dataset or upload their own CSV transactions.
2. **Train an ML Model**: Extract calendar features, 28-day historical sales lags, and rolling averages/standard deviations to train a Scikit-Learn `RandomForestRegressor`.
3. **Forecast Demand**: Predict next-day unit sales and 7-day cumulative demand for every store-product pair.
4. **Optimize Inventory**: Dynamically calculate statistical **Safety Stock**, **Reorder Points**, and **Target Inventory Levels** based on lead time (7 days), review period (7 days), and service factor (1.65).
5. **Interactive Dashboard**: Search, filter by store or stock status, visualize actual vs. predicted holdout demand, review urgent stockouts, and export an actionable replenishment CSV report.

---

## 2. Architecture

```text
                    VERCEL
                      │
                      ▼
              ┌───────────────┐
              │    Next.js    │
              │   Frontend    │
              │  (App Router) │
              └───────┬───────┘
                      │
                   REST API
                      │
                      ▼
              ┌───────────────┐
              │    FastAPI    │
              │ Python ML API │
              └───────┬───────┘
                      │
                      ▼
             pandas / sklearn
                      │
                      ▼
             Trained ML Model
```

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide icons, Recharts.
- **Backend**: Python 3.12, FastAPI, pandas, numpy, scikit-learn, joblib.
- **Independence**: The frontend is fully static/server-rendered and deployable to Vercel. The backend is an independent Python REST service that can run on any Python platform (Render, Railway, Fly.io, AWS, DigitalOcean, or bare-metal VPS).

---

## 3. Machine Learning Pipeline (Faithful to `Project_1.ipynb`)

1. **Schema Standardization & Cleaning**:
   - Column names stripped, lowercased, and underscored.
   - Required columns: `date`, `store_id`, `product_id`, `inventory_level`, `units_sold`.
   - Dates parsed with `dayfirst=True`, invalid dates dropped, missing numbers filled with median, missing objects filled with mode.
   - Deduplicated on `(date, store_id, product_id)`.
   - `units_sold` clipped to non-negative values.
2. **Feature Engineering**:
   - Calendar features: `day_of_week`, `month`, `day`.
   - Sales lags (sorted by store, product, date): `lag_1`, `lag_7`, `lag_14`, `lag_28`.
   - Rolling statistics (shifted by 1 day to strictly avoid lookahead leakage): `rolling_mean_7`, `rolling_mean_28`, `rolling_std_28`.
   - Categorical features: `store_id`, `product_id`, and `category` (if available).
3. **Model Training & Evaluation**:
   - Time-based holdout split on the latest 30 days (or 20% of dates).
   - `ColumnTransformer` with `OneHotEncoder(handle_unknown="ignore")` for categorical features and passthrough for numerical features.
   - `RandomForestRegressor(n_estimators=100, max_depth=15, min_samples_leaf=2, random_state=42, n_jobs=-1)`.
   - Evaluation metrics: **MAE**, **RMSE**, and **R² Score**.
4. **Demand Forecasting & Replenishment Logic**:
   - Next-day forecast using latest feature vector and recent sales.
   - `predicted_7_day_demand = round(predicted_demand * 7)`.
   - `safety_stock = 1.65 * demand_std * sqrt(7)`.
   - `reorder_point = average_daily_demand * 7 + safety_stock`.
   - `target_inventory = average_daily_demand * 14 + safety_stock`.
   - `recommended_order = max(0, ceil(target_inventory - current_stock))`.
   - `inventory_status = "Reorder Needed"` if `current_stock <= reorder_point` else `"Stock Sufficient"`.

---

## 4. Local Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+

### Step A: Start the FastAPI Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

The backend will start at `http://localhost:8000`. You can inspect interactive OpenAPI documentation at `http://localhost:8000/docs`.

### Step B: Start the Next.js Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## 5. Environment Configuration

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

In production (e.g., on Vercel), set `NEXT_PUBLIC_API_URL` in the Vercel project settings to your deployed FastAPI backend URL:
```env
NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com
```

---

## 6. End-to-End User Experience

1. **Visit Home (`/`)**:
   - Click **Download Sample Dataset** to get `retail_inventory_sample.csv` (labeled *Synthetic Demo Dataset*).
   - Or click **Upload Your Dataset** to navigate to `/train`.
2. **Train Model (`/train`)**:
   - Drag and drop `retail_inventory_sample.csv` (or use the one-click *"Load Demo Data Directly"* button).
   - Verify dynamic dataset statistics (row count, stores, products, date range, and 10-row preview).
   - Click **Train Demand Forecasting Model** to launch the Scikit-Learn training workflow.
   - Watch the live progress stages.
   - Inspect the real computed evaluation metrics: **MAE**, **RMSE**, and **R²**, alongside the **Actual vs. Predicted Demand** time-series chart.
3. **Explore Dashboard (`/dashboard`)**:
   - Review top KPI cards: Total Products, Products Requiring Reorder, Out-of-Stock Items, Total Recommended Units, and Average Predicted Demand.
   - Inspect visual charts: Inventory Status distribution and Top 10 products requiring stock.
   - Filter by store (e.g., `S001`, `S002`), filter by status (`Reorder Needed`, `Stock Sufficient`), and search by product or category.
   - Click **Download CSV Report** to export `optimized_retail_inventory_report.csv`.

---

## 7. Production Deployment Guide

### Deploying Frontend to Vercel
1. Push this repository to GitHub/GitLab.
2. In the Vercel dashboard, import the repository and set the **Root Directory** to `frontend`.
3. Add an Environment Variable:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: URL of your deployed Python backend (e.g., `https://retail-inventory-backend.onrender.com`)
4. Click **Deploy**.

### Deploying Backend to Python Hosting (Render / Railway / Fly.io / AWS)
1. Select a Python environment service (e.g., Render Web Service).
2. Set the **Root Directory** to `backend`.
3. Build command:
   ```bash
   pip install -r requirements.txt
   ```
4. Start command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
5. Ensure CORS is enabled (configured by default in `backend/app/main.py`).

---

## 8. Repository Structure

```text
guddo/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx           # Global layout & navigation bar
│   │   ├── page.tsx             # Home / Get Started & workflow
│   │   ├── train/page.tsx       # CSV upload, validation, training & metrics
│   │   └── dashboard/page.tsx   # KPIs, charts, filters & inventory table
│   ├── components/
│   │   ├── Navbar.tsx           # Top navigation with live backend status
│   │   ├── StatCard.tsx         # Reusable KPI card
│   │   ├── DatasetUpload.tsx    # Drag-and-drop CSV upload & sample loader
│   │   ├── TrainingStatus.tsx   # Real ML pipeline step progress indicator
│   │   ├── InventoryTable.tsx   # Search, store/status filters, sortable table
│   │   └── Charts.tsx           # Recharts: Actual vs Pred, Status, Top Orders
│   ├── lib/
│   │   └── api.ts               # Typed client calling FastAPI REST endpoints
│   ├── .env.example
│   ├── .env.local
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application & REST endpoints
│   │   ├── preprocessing.py     # Schema validation, cleaning & feature engineering
│   │   ├── model.py             # RandomForestRegressor & time-series split
│   │   ├── forecasting.py       # Demand prediction for next day & 7-day
│   │   ├── inventory.py         # Safety stock, reorder point & CSV export
│   │   ├── sample_data.py       # Deterministic synthetic dataset generator
│   │   └── schemas.py           # Pydantic schemas
│   ├── requirements.txt
│   └── README.md
│
├── Project_1.ipynb              # Original source notebook
└── README.md                    # Root project documentation
```
