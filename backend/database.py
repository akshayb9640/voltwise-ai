"""
VoltWise AI - Database Access & Multi-Account Isolation Layer
Supports embedded SQLite (default zero-config) and TiDB / MySQL Cloud via environment variables.
"""

import os
import json
import sqlite3
import hashlib
import binascii
from datetime import datetime
from typing import Dict, Any, List, Optional

# Database configuration
DB_DIR = os.path.dirname(os.path.abspath(__file__))
SQLITE_DB_PATH = os.path.join(DB_DIR, "voltwise.db")

# TiDB / MySQL environment configuration (if provided)
TIDB_HOST = os.getenv("TIDB_HOST")
TIDB_PORT = int(os.getenv("TIDB_PORT", "4000"))
TIDB_USER = os.getenv("TIDB_USER")
TIDB_PASSWORD = os.getenv("TIDB_PASSWORD")
TIDB_DATABASE = os.getenv("TIDB_DATABASE", "voltwise")

# Hash helper using PBKDF2 HMAC SHA-256
def hash_password(password: str, salt: Optional[str] = None) -> str:
    if not salt:
        salt = binascii.hexlify(os.urandom(16)).decode()
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"{salt}:{binascii.hexlify(key).decode()}"

def verify_password(stored_password: str, provided_password: str) -> bool:
    try:
        salt, key = stored_password.split(":")
        new_hash = hashlib.pbkdf2_hmac(
            'sha256',
            provided_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        )
        return binascii.hexlify(new_hash).decode() == key
    except Exception:
        return False

def get_db_connection():
    """Returns a connection to the SQLite database with row factory enabled."""
    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Initializes the database schema and creates default demo accounts if empty."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        full_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        consumer_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. User Profiles / Settings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_profiles (
        user_id TEXT PRIMARY KEY,
        tariff_id TEXT NOT NULL DEFAULT 'in_residential',
        currency TEXT NOT NULL DEFAULT 'INR',
        budget REAL NOT NULL DEFAULT 3200.0,
        mtd_units REAL NOT NULL DEFAULT 198.4,
        solar_active INTEGER NOT NULL DEFAULT 0,
        applied_actions TEXT NOT NULL DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 3. User Appliances Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_appliances (
        id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        rated_watts REAL NOT NULL,
        standby_watts REAL NOT NULL DEFAULT 0.0,
        daily_hours REAL NOT NULL DEFAULT 4.0,
        star_rating INTEGER NOT NULL DEFAULT 3,
        is_on INTEGER NOT NULL DEFAULT 1,
        peak_hours REAL NOT NULL DEFAULT 1.0,
        duty_cycle REAL NOT NULL DEFAULT 0.8,
        temp_setpoint INTEGER DEFAULT NULL,
        eco_mode INTEGER NOT NULL DEFAULT 0,
        smart_schedule INTEGER NOT NULL DEFAULT 0,
        location TEXT NOT NULL DEFAULT 'General',
        vampire_power_alert INTEGER NOT NULL DEFAULT 0,
        icon TEXT NOT NULL DEFAULT 'Zap',
        PRIMARY KEY (user_id, id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    conn.commit()

    # Seed Default Demo Accounts if empty
    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]

    if count == 0:
        _seed_demo_accounts(cursor)
        conn.commit()

    conn.close()

def _seed_demo_accounts(cursor):
    """Seed initial sample users so user data separation is immediately demonstrable."""
    users_data = [
        {
            "id": "usr_rajesh_01",
            "email": "rajesh@voltwise.ai",
            "username": "rajesh",
            "full_name": "Rajesh Sharma",
            "password": "password123",
            "consumer_id": "CONS-IN-482910",
            "profile": {
                "tariff_id": "in_residential",
                "currency": "INR",
                "budget": 3500.0,
                "mtd_units": 214.5,
                "solar_active": 0,
                "applied_actions": "{}"
            },
            "appliances": [
                {
                    "id": "app_1", "name": "Master Bed Inverter AC (1.5 Ton)", "category": "Climate",
                    "rated_watts": 1450, "standby_watts": 8, "daily_hours": 7.5, "star_rating": 4,
                    "is_on": 1, "peak_hours": 3.5, "duty_cycle": 0.70, "temp_setpoint": 22,
                    "eco_mode": 0, "smart_schedule": 1, "location": "Master Bedroom",
                    "vampire_power_alert": 1, "icon": "Wind"
                },
                {
                    "id": "app_2", "name": "Living Room Split AC (2.0 Ton)", "category": "Climate",
                    "rated_watts": 1950, "standby_watts": 12, "daily_hours": 3.0, "star_rating": 2,
                    "is_on": 0, "peak_hours": 2.0, "duty_cycle": 0.85, "temp_setpoint": 20,
                    "eco_mode": 0, "smart_schedule": 0, "location": "Living Area",
                    "vampire_power_alert": 1, "icon": "Wind"
                },
                {
                    "id": "app_3", "name": "Frost-Free Refrigerator (340L)", "category": "Kitchen",
                    "rated_watts": 180, "standby_watts": 4, "daily_hours": 24.0, "star_rating": 5,
                    "is_on": 1, "peak_hours": 4.0, "duty_cycle": 0.35, "temp_setpoint": None,
                    "eco_mode": 1, "smart_schedule": 0, "location": "Kitchen",
                    "vampire_power_alert": 0, "icon": "Refrigerator"
                },
                {
                    "id": "app_4", "name": "Instant Water Geyser (25L)", "category": "Heating",
                    "rated_watts": 2000, "standby_watts": 2, "daily_hours": 1.2, "star_rating": 3,
                    "is_on": 0, "peak_hours": 0.5, "duty_cycle": 0.90, "temp_setpoint": None,
                    "eco_mode": 0, "smart_schedule": 0, "location": "Bathrooms",
                    "vampire_power_alert": 0, "icon": "Flame"
                },
                {
                    "id": "app_5", "name": "Ceiling Fans (4x Induction)", "category": "Ventilation",
                    "rated_watts": 300, "standby_watts": 0, "daily_hours": 14.0, "star_rating": 2,
                    "is_on": 1, "peak_hours": 4.0, "duty_cycle": 1.0, "temp_setpoint": None,
                    "eco_mode": 0, "smart_schedule": 0, "location": "Whole House",
                    "vampire_power_alert": 0, "icon": "Fan"
                }
            ]
        },
        {
            "id": "usr_priya_02",
            "email": "priya@voltwise.ai",
            "username": "priya",
            "full_name": "Priya Patel (Solar Prosumer)",
            "password": "password123",
            "consumer_id": "CONS-IN-902184",
            "profile": {
                "tariff_id": "in_residential",
                "currency": "INR",
                "budget": 2000.0,
                "mtd_units": 145.0,
                "solar_active": 1,
                "applied_actions": json.dumps({"ENABLE_SOLAR": True, "SET_AC_24": True})
            },
            "appliances": [
                {
                    "id": "app_p1", "name": "Solar Heat-Pump AC (1.5 Ton 5-Star)", "category": "Climate",
                    "rated_watts": 1100, "standby_watts": 3, "daily_hours": 6.0, "star_rating": 5,
                    "is_on": 1, "peak_hours": 1.0, "duty_cycle": 0.55, "temp_setpoint": 24,
                    "eco_mode": 1, "smart_schedule": 1, "location": "Solar Villa",
                    "vampire_power_alert": 0, "icon": "Wind"
                },
                {
                    "id": "app_p2", "name": "Inverter Refrigerator (420L)", "category": "Kitchen",
                    "rated_watts": 140, "standby_watts": 2, "daily_hours": 24.0, "star_rating": 5,
                    "is_on": 1, "peak_hours": 4.0, "duty_cycle": 0.30, "temp_setpoint": None,
                    "eco_mode": 1, "smart_schedule": 1, "location": "Kitchen",
                    "vampire_power_alert": 0, "icon": "Refrigerator"
                },
                {
                    "id": "app_p3", "name": "BLDC Smart Ceiling Fans (5x 28W)", "category": "Ventilation",
                    "rated_watts": 140, "standby_watts": 1, "daily_hours": 12.0, "star_rating": 5,
                    "is_on": 1, "peak_hours": 2.0, "duty_cycle": 1.0, "temp_setpoint": None,
                    "eco_mode": 1, "smart_schedule": 0, "location": "All Rooms",
                    "vampire_power_alert": 0, "icon": "Fan"
                },
                {
                    "id": "app_p4", "name": "Electric Vehicle Home Charger (3.3 kW)", "category": "EV",
                    "rated_watts": 3300, "standby_watts": 5, "daily_hours": 2.5, "star_rating": 5,
                    "is_on": 0, "peak_hours": 0.0, "duty_cycle": 1.0, "temp_setpoint": None,
                    "eco_mode": 1, "smart_schedule": 1, "location": "Garage",
                    "vampire_power_alert": 0, "icon": "Zap"
                }
            ]
        }
    ]

    for u in users_data:
        pwd_hash = hash_password(u["password"])
        cursor.execute(
            "INSERT INTO users (id, email, username, full_name, password_hash, consumer_id) VALUES (?, ?, ?, ?, ?, ?)",
            (u["id"], u["email"], u["username"], u["full_name"], pwd_hash, u["consumer_id"])
        )

        p = u["profile"]
        cursor.execute(
            """INSERT INTO user_profiles (user_id, tariff_id, currency, budget, mtd_units, solar_active, applied_actions)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (u["id"], p["tariff_id"], p["currency"], p["budget"], p["mtd_units"], p["solar_active"], p["applied_actions"])
        )

        for a in u["appliances"]:
            cursor.execute(
                """INSERT INTO user_appliances 
                   (id, user_id, name, category, rated_watts, standby_watts, daily_hours, star_rating,
                    is_on, peak_hours, duty_cycle, temp_setpoint, eco_mode, smart_schedule, location,
                    vampire_power_alert, icon)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (a["id"], u["id"], a["name"], a["category"], a["rated_watts"], a["standby_watts"],
                 a["daily_hours"], a["star_rating"], a["is_on"], a["peak_hours"], a["duty_cycle"],
                 a["temp_setpoint"], a["eco_mode"], a["smart_schedule"], a["location"],
                 a["vampire_power_alert"], a["icon"])
            )

# --- High-Level User Operations ---

def create_user(email: str, username: str, full_name: str, password: str, consumer_id: str,
                tariff_id: str = "in_residential", currency: str = "INR", budget: float = 3200.0,
                default_appliances: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
    """Creates a new isolated user account and initializes default profile & appliances."""
    user_id = f"usr_{int(datetime.utcnow().timestamp())}_{os.urandom(3).hex()}"
    pwd_hash = hash_password(password)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (id, email, username, full_name, password_hash, consumer_id) VALUES (?, ?, ?, ?, ?, ?)",
            (user_id, email.lower().strip(), username.strip(), full_name.strip(), pwd_hash, consumer_id.strip())
        )

        cursor.execute(
            """INSERT INTO user_profiles (user_id, tariff_id, currency, budget, mtd_units, solar_active, applied_actions)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (user_id, tariff_id, currency, budget, 150.0, 0, "{}")
        )

        # Populate initial standard appliances for this user
        if default_appliances:
            for app in default_appliances:
                cursor.execute(
                    """INSERT INTO user_appliances 
                       (id, user_id, name, category, rated_watts, standby_watts, daily_hours, star_rating,
                        is_on, peak_hours, duty_cycle, temp_setpoint, eco_mode, smart_schedule, location,
                        vampire_power_alert, icon)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (app.get("id", f"app_{os.urandom(3).hex()}"), user_id, app.get("name", "Appliance"),
                     app.get("category", "General"), float(app.get("ratedWatts", 100)),
                     float(app.get("standbyWatts", 0)), float(app.get("dailyHours", 4)),
                     int(app.get("starRating", 3)), 1 if app.get("isOn", True) else 0,
                     float(app.get("peakHours", 1)), float(app.get("dutyCycle", 0.8)),
                     app.get("tempSetpoint"), 1 if app.get("ecoMode", False) else 0,
                     1 if app.get("smartSchedule", False) else 0, app.get("location", "Home"),
                     1 if app.get("vampirePowerAlert", False) else 0, app.get("icon", "Zap"))
                )

        conn.commit()
    finally:
        conn.close()

    return get_user_by_id(user_id)

def authenticate_user(identifier: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticates by email or consumer_id and returns user object if valid."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(consumer_id) = LOWER(?) OR LOWER(username) = LOWER(?)",
        (identifier.strip(), identifier.strip(), identifier.strip())
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    user_dict = dict(row)
    if verify_password(user_dict["password_hash"], password):
        return get_user_by_id(user_dict["id"])
    return None

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Returns complete user record including profile and isolated appliances."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, email, username, full_name, consumer_id, created_at FROM users WHERE id = ?", (user_id,))
    u_row = cursor.fetchone()
    if not u_row:
        conn.close()
        return None

    user = dict(u_row)

    cursor.execute("SELECT * FROM user_profiles WHERE user_id = ?", (user_id,))
    p_row = cursor.fetchone()
    if p_row:
        p_dict = dict(p_row)
        try:
            p_dict["applied_actions"] = json.loads(p_dict.get("applied_actions", "{}"))
        except Exception:
            p_dict["applied_actions"] = {}
        user["profile"] = p_dict
    else:
        user["profile"] = {}

    cursor.execute("SELECT * FROM user_appliances WHERE user_id = ?", (user_id,))
    app_rows = cursor.fetchall()
    conn.close()

    appliances = []
    for r in app_rows:
        d = dict(r)
        appliances.append({
            "id": d["id"],
            "name": d["name"],
            "category": d["category"],
            "ratedWatts": d["rated_watts"],
            "standbyWatts": d["standby_watts"],
            "dailyHours": d["daily_hours"],
            "starRating": d["star_rating"],
            "isOn": bool(d["is_on"]),
            "peakHours": d["peak_hours"],
            "dutyCycle": d["duty_cycle"],
            "tempSetpoint": d["temp_setpoint"],
            "ecoMode": bool(d["eco_mode"]),
            "smartSchedule": bool(d["smart_schedule"]),
            "location": d["location"],
            "vampirePowerAlert": bool(d["vampire_power_alert"]),
            "icon": d["icon"]
        })

    user["appliances"] = appliances
    return user

def list_all_users() -> List[Dict[str, Any]]:
    """List summary of all users for quick account switching & demonstration."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, username, full_name, consumer_id FROM users ORDER BY created_at ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_user_profile(user_id: str, updates: Dict[str, Any]) -> bool:
    """Updates user profile settings (tariff, budget, currency, solar, mtdUnits)."""
    conn = get_db_connection()
    cursor = conn.cursor()

    applied_actions_str = None
    if "appliedActions" in updates:
        applied_actions_str = json.dumps(updates["appliedActions"])

    cursor.execute("""
        UPDATE user_profiles
        SET tariff_id = COALESCE(?, tariff_id),
            currency = COALESCE(?, currency),
            budget = COALESCE(?, budget),
            mtd_units = COALESCE(?, mtd_units),
            solar_active = COALESCE(?, solar_active),
            applied_actions = COALESCE(?, applied_actions),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
    """, (
        updates.get("tariffId"),
        updates.get("currency"),
        updates.get("budget"),
        updates.get("mtdUnits"),
        1 if updates.get("solarActive") else 0 if "solarActive" in updates else None,
        applied_actions_str,
        user_id
    ))
    conn.commit()
    conn.close()
    return True

def sync_user_appliances(user_id: str, appliances: List[Dict[str, Any]]) -> bool:
    """Atomically replaces/syncs appliances for the specific user in the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM user_appliances WHERE user_id = ?", (user_id,))
        for a in appliances:
            cursor.execute(
                """INSERT INTO user_appliances 
                   (id, user_id, name, category, rated_watts, standby_watts, daily_hours, star_rating,
                    is_on, peak_hours, duty_cycle, temp_setpoint, eco_mode, smart_schedule, location,
                    vampire_power_alert, icon)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (a["id"], user_id, a["name"], a.get("category", "General"),
                 float(a.get("ratedWatts", 100)), float(a.get("standbyWatts", 0)),
                 float(a.get("dailyHours", 4)), int(a.get("starRating", 3)),
                 1 if a.get("isOn", True) else 0, float(a.get("peakHours", 1)),
                 float(a.get("dutyCycle", 0.8)), a.get("tempSetpoint"),
                 1 if a.get("ecoMode", False) else 0, 1 if a.get("smartSchedule", False) else 0,
                 a.get("location", "Home"), 1 if a.get("vampirePowerAlert", False) else 0,
                 a.get("icon", "Zap"))
            )
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
