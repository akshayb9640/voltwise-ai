# VoltWise AI — Backend REST API Server

Standalone Python backend service implementing the computational and machine learning components of the **AI-Based Electricity Bill Prediction and Consumption Optimization System**.

---

## Architecture & REST Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| **`/`** | `GET` | Health check and API service metadata |
| **`/api/bill/calculate`** | `POST` | Computes itemized DISCOM bills via telescopic slab tier structures, fixed charges, and fuel surcharges |
| **`/api/ml/predict`** | `POST` | Generates 3-month seasonal regression electricity forecasts with Best-Case & Worst-Case confidence bounds |
| **`/api/simulator/what-if`** | `POST` | Simulates habit modifications (AC temperature, geyser timers, standby power cutoff, solar PV net-metering) |

---

## Getting Started

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run API Server
```bash
python main.py
```
Or with Uvicorn live reload:
```bash
uvicorn main:app --reload --port 8000
```

### 3. Interactive API Documentation (Swagger UI)
Once running, open your browser to:
- **Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
