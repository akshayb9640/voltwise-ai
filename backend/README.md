# VoltWise AI — Backend REST API Server & Database Layer

Standalone Python backend service implementing multi-user account isolation, persistent SQL database storage, and computational/ML models for the **AI-Based Electricity Bill Prediction and Consumption Optimization System**.

---

## Database & Multi-Account Architecture

VoltWise AI features **complete per-user data isolation**:
- **Every user has their own separate account** (email, password hash, consumer/meter ID).
- **Appliances, DISCOM tariff plans, budgets, and habits are partitioned strictly by `userId`**.
- When User A adjusts appliance hours or turns off devices, User B's records remain untouched.

### Supported Databases:
1. **SQLite (Default / Zero-Config)**: 
   - Uses embedded `backend/voltwise.db`.
   - Requires zero external database server setup or installation.
2. **TiDB Cloud / MySQL (Plug & Play)**:
   - Wire-compatible with TiDB Serverless.
   - Set the following environment variables in your environment or `.env`:
     ```env
     TIDB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
     TIDB_PORT=4000
     TIDB_USER=<your-username>
     TIDB_PASSWORD=<your-password>
     TIDB_DATABASE=voltwise
     ```

---

## REST Endpoints

### 🔐 Authentication & Accounts
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| **`/api/auth/accounts`** | `GET` | Lists available accounts for quick switching |
| **`/api/auth/register`** | `POST` | Creates a new user with dedicated database partition |
| **`/api/auth/login`** | `POST` | Authenticates user credentials and loads isolated data |
| **`/api/user/{user_id}`** | `GET` | Fetches isolated profile and appliances for user |
| **`/api/user/{user_id}/profile`** | `PUT` | Updates user settings (tariff, budget, currency, solar) |
| **`/api/user/{user_id}/appliances`** | `PUT` | Saves/syncs isolated appliance inventory |

### ⚡ Calculations & Forecasts
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| **`/`** | `GET` | Health check and database status |
| **`/api/bill/calculate`** | `POST` | Computes itemized DISCOM bills via telescopic slab tier structures |
| **`/api/ml/predict`** | `POST` | Generates 3-month seasonal regression electricity forecasts |
| **`/api/simulator/what-if`** | `POST` | Simulates habit modifications (AC, geyser, phantom load, solar) |

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
