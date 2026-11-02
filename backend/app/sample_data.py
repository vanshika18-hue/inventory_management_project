import io
import pandas as pd
import numpy as np

def generate_sample_dataset() -> pd.DataFrame:
    """
    Generates a realistic synthetic retail inventory dataset.
    Compatible with Project_1.ipynb expected schema and ML feature requirements.
    Deterministic with seed=42.
    """
    np.random.seed(42)

    stores = ["S001", "S002", "S003", "S004", "S005"]
    store_regions = {
        "S001": "North",
        "S002": "South",
        "S003": "East",
        "S004": "West",
        "S005": "Central"
    }

    products = [
        ("P001", "Beverages", 3.50, 25),
        ("P002", "Beverages", 5.00, 20),
        ("P003", "Bakery", 2.80, 30),
        ("P004", "Bakery", 4.20, 15),
        ("P005", "Dairy", 4.50, 28),
        ("P006", "Dairy", 6.00, 18),
        ("P007", "Produce", 1.99, 40),
        ("P008", "Produce", 3.20, 22),
        ("P009", "Snacks", 2.50, 35),
        ("P010", "Snacks", 4.00, 20)
    ]

    dates = pd.date_range(start="2024-01-01", end="2024-04-30", freq="D")
    weathers = ["Sunny", "Cloudy", "Rainy", "Snowy"]

    records = []

    for store_id in stores:
        region = store_regions[store_id]
        store_mult = 0.85 + (stores.index(store_id) * 0.08)

        for prod_idx, (prod_id, category, base_price, base_sales) in enumerate(products):
            # Target inventory cycle
            current_inventory = int(np.random.randint(120, 250))

            for day_idx, current_date in enumerate(dates):
                day_of_week = current_date.dayofweek
                is_weekend = 1 if day_of_week in [5, 6] else 0
                is_promo = 1 if np.random.rand() < 0.12 else 0
                discount = 0.15 if is_promo else (0.05 if np.random.rand() < 0.08 else 0.0)
                price = round(base_price * (1 - discount), 2)
                weather = np.random.choice(weathers, p=[0.55, 0.25, 0.15, 0.05])

                # Calculate realistic sales
                sales_factor = store_mult
                if is_weekend:
                    sales_factor *= 1.35
                if is_promo:
                    sales_factor *= 1.45
                if weather == "Rainy":
                    sales_factor *= 0.90
                elif weather == "Snowy":
                    sales_factor *= 0.75

                noise = np.random.normal(0, 2.5)
                expected_sales = max(1, int(round(base_sales * sales_factor + noise)))
                
                # Sales deduction
                units_sold = min(current_inventory, expected_sales)
                current_inventory -= units_sold

                # Replenishment
                units_ordered = 0
                # On final few days, deliberately let some products remain low so dashboard has reorder alerts
                is_near_end = day_idx > len(dates) - 8
                reorder_threshold = 40 if not (is_near_end and prod_idx % 2 == 0) else 15

                if current_inventory < reorder_threshold:
                    if not (is_near_end and prod_idx % 2 == 0):
                        units_ordered = int(np.random.randint(140, 220))
                        current_inventory += units_ordered

                records.append({
                    "Date": current_date.strftime("%d-%m-%Y"),
                    "Store ID": store_id,
                    "Product ID": prod_id,
                    "Category": category,
                    "Region": region,
                    "Inventory Level": current_inventory,
                    "Units Sold": units_sold,
                    "Units Ordered": units_ordered,
                    "Price": price,
                    "Discount": discount,
                    "Weather Condition": weather,
                    "Holiday/Promotion": is_promo
                })

    df = pd.DataFrame(records)
    return df

def get_sample_csv_bytes() -> bytes:
    df = generate_sample_dataset()
    buffer = io.StringIO()
    df.to_csv(buffer, index=False)
    return buffer.getvalue().encode("utf-8")
