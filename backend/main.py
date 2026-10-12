"""
VoltWise AI - Dedicated Backend REST API Server
AI-Based Electricity Bill Prediction and Consumption Optimization System
"""

import math
from typing import List, Optional, Dict, Any

try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False

if FASTAPI_AVAILABLE:
    app = FastAPI(
        title="VoltWise AI - Energy Management & Bill Prediction API",
        description="REST API for Telescopic Tariff Billing, Seasonal ML Forecasting, and AI Energy Optimization",
        version="2.0.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --- Pydantic Data Models ---
    class SlabModel(BaseModel):
        min: float
        max: float
        rate: float
        label: str

    class TariffModel(BaseModel):
        sanctionedLoadKw: float = 3.0
        fixedChargePerKw: float = 110.0
        electricityDutyPct: float = 6.0
        fuelAdjustmentChargePerKwh: float = 0.38
        slabs: List[SlabModel]

    class CalculateBillRequest(BaseModel):
        totalUnits: float
        tariff: TariffModel
        solarOffsetUnits: float = 0.0

    class ApplianceItem(BaseModel):
        id: str
        name: str
        category: str
        ratedWatts: float
        standbyWatts: float = 0.0
        dailyHours: float = 4.0
        dutyCycle: float = 0.8
        isOn: bool = True
        peakHours: float = 1.0

    class PredictRequest(BaseModel):
        projectedMonthlyUnits: float
        tariff: TariffModel
        appliances: List[ApplianceItem]

    class WhatIfRequest(BaseModel):
        baselineUnits: float
        baselineBill: float
        tariff: TariffModel
        acHoursReduction: float = 1.5
        acSetpoint: int = 24
        cutGeyserMinutes: int = 25
        killPhantomLoad: bool = True
        bldcFanUpgrade: bool = False
        solarCapacityKw: float = 0.0

    # --- Calculation Helper Functions ---
    def compute_itemized_bill(total_units: float, tariff: TariffModel, solar_offset: float = 0.0):
        effective_units = max(0.0, total_units - solar_offset)
        remaining = effective_units
        energy_charges = 0.0
        slab_breakdown = []
        current_slab_index = 0

        for i, slab in enumerate(tariff.slabs):
            capacity = float('inf') if math.isinf(slab.max) else (slab.max - slab.min)
            if remaining > 0:
                units_in_slab = min(remaining, capacity)
                cost = units_in_slab * slab.rate
                energy_charges += cost
                remaining -= units_in_slab
                current_slab_index = i
                slab_breakdown.append({
                    "slab": slab.label,
                    "unitsInSlab": round(units_in_slab, 1),
                    "rate": slab.rate,
                    "cost": round(cost, 2),
                    "isActive": True
                })
            else:
                slab_breakdown.append({
                    "slab": slab.label,
                    "unitsInSlab": 0.0,
                    "rate": slab.rate,
                    "cost": 0.0,
                    "isActive": False
                })

        fixed_charges = round(tariff.sanctionedLoadKw * tariff.fixedChargePerKw, 2)
        fuel_surcharge = round(effective_units * tariff.fuelAdjustmentChargePerKwh, 2)
        subtotal = energy_charges + fixed_charges + fuel_surcharge
        electricity_duty = round(subtotal * (tariff.electricityDutyPct / 100.0), 2)
        total_bill = round(subtotal + electricity_duty, 2)
        marginal_rate = tariff.slabs[current_slab_index].rate

        return {
            "effectiveUnits": round(effective_units, 1),
            "solarOffsetUnits": round(solar_offset, 1),
            "energyCharges": round(energy_charges, 2),
            "fixedCharges": fixed_charges,
            "fuelSurcharge": fuel_surcharge,
            "electricityDuty": electricity_duty,
            "totalBill": total_bill,
            "marginalRate": marginal_rate,
            "slabBreakdown": slab_breakdown
        }

    # --- API Endpoints ---
    @app.get("/")
    def root():
        return {
            "system": "VoltWise AI - Backend API Gateway",
            "version": "2.0.0",
            "status": "online",
            "endpoints": [
                "/api/bill/calculate",
                "/api/ml/predict",
                "/api/ai/recommendations",
                "/api/simulator/what-if"
            ]
        }

    @app.post("/api/bill/calculate")
    def calculate_bill_endpoint(req: CalculateBillRequest):
        """Calculates telescopic slab bill, fixed charges, and taxes"""
        return compute_itemized_bill(req.totalUnits, req.tariff, req.solarOffsetUnits)

    @app.post("/api/ml/predict")
    def ml_predict_endpoint(req: PredictRequest):
        """Generates 3-month seasonal regression forecast with confidence intervals"""
        months_config = [
            {"month": "Nov 2026", "season": "Winter Transition", "factor": 0.88, "note": "AC usage drops, morning water heater usage begins"},
            {"month": "Dec 2026", "season": "Winter Peak", "factor": 0.94, "note": "Cool ambient temperatures, heavy geyser heating"},
            {"month": "Jan 2027", "season": "Winter Moderate", "factor": 0.91, "note": "High water heating, minimal cooling demand"}
        ]

        predictions = []
        for item in months_config:
            pred_units = round(req.projectedMonthlyUnits * item["factor"])
            best_units = round(pred_units * 0.84)
            worst_units = round(pred_units * 1.14)

            expected_bill = compute_itemized_bill(pred_units, req.tariff)
            best_bill = compute_itemized_bill(best_units, req.tariff)
            worst_bill = compute_itemized_bill(worst_units, req.tariff)

            predictions.append({
                "month": item["month"],
                "season": item["season"],
                "climateNote": item["note"],
                "predictedUnits": pred_units,
                "expectedBill": expected_bill["totalBill"],
                "bestCaseBill": best_bill["totalBill"],
                "worstCaseBill": worst_bill["totalBill"],
                "potentialSavings": max(0, round(worst_bill["totalBill"] - best_bill["totalBill"], 2))
            })

        return {"predictions": predictions}

    @app.post("/api/simulator/what-if")
    def what_if_endpoint(req: WhatIfRequest):
        """Simulates savings from lifestyle shifts, temperature adjustments, and solar PV"""
        ac_saved = round(1.45 * req.acHoursReduction * 30.0, 1)
        temp_saved = round(160.0 * max(0, req.acSetpoint - 22) * 0.06, 1)
        geyser_saved = round(2.0 * (req.cutGeyserMinutes / 60.0) * 30.0, 1)
        phantom_saved = 28.8 if req.killPhantomLoad else 0.0
        bldc_saved = 31.0 if req.bldcFanUpgrade else 0.0
        solar_gen = round(req.solarCapacityKw * 115.0)

        total_saved_units = round(ac_saved + temp_saved + geyser_saved + phantom_saved + bldc_saved, 1)
        simulated_net_units = max(0.0, req.baselineUnits - total_saved_units - solar_gen)

        sim_bill = compute_itemized_bill(simulated_net_units, req.tariff)
        monthly_money_saved = max(0.0, round(req.baselineBill - sim_bill["totalBill"], 2))

        return {
            "baselineBill": req.baselineBill,
            "simulatedBill": sim_bill["totalBill"],
            "monthlyMoneySaved": monthly_money_saved,
            "annualMoneySaved": round(monthly_money_saved * 12.0, 2),
            "simulatedNetUnits": simulated_net_units,
            "totalSavedUnits": total_saved_units
        }

if __name__ == "__main__":
    import sys
    if FASTAPI_AVAILABLE:
        import uvicorn
        print("Starting VoltWise AI Backend API Server on http://127.0.0.1:8000 ...")
        uvicorn.run(app, host="127.0.0.1", port=8000)
    else:
        print("FastAPI is not yet installed. Please run: pip install fastapi uvicorn")
