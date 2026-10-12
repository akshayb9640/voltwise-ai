# VoltWise AI — AI-Based Electricity Bill Prediction & Smart Energy Optimizer

VoltWise AI is an intelligent electricity management and bill optimization platform designed to make household energy simple, transparent, and actionable.

Built in accordance with the project abstract and system architecture flow:
- **Accurate Tariff-based Billing Engine** (Telescopic slabs, fixed charges, fuel surcharges, taxes)
- **Live Electrical Telemetry** (Real-time kW demand, power factor, line voltage, carbon footprint)
- **Device-Level Breakdown & Live Controls** (Individual watts, daily hours sliders, vampire standby power alerts, BEE star ratings)
- **Machine Learning 3-Month Bill Forecast** (ARIMA & seasonal decomposition models)
- **AI Energy Advisor & Intelligent Chat Assistant** (Quantified kWh and monetary savings with 1-click optimization)
- **Smart What-If Simulation Sandbox** (Interactive lifestyle sliders with instant before/after bill comparison)
- **Official Bill Audit & Assessment Invoicing** (Printable/downloadable DISCOM statement)

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (verified on Node.js v24)
- **npm**

### 2. Installation
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## Key Modules

- [`src/data/defaultData.js`](file:///d:/Project-TT/src/data/defaultData.js): Regional tariffs, default appliances, 6-month historical billing records, 24-hour load profiles.
- [`src/utils/tariffCalculator.js`](file:///d:/Project-TT/src/utils/tariffCalculator.js): Multi-tier telescopic slab calculation engine, fixed charges, fuel adjustment charges, and monthly run-rate projections.
- [`src/utils/mlPredictor.js`](file:///d:/Project-TT/src/utils/mlPredictor.js): Seasonal regression forecaster, confidence intervals, appliance footprint attribution, and anomaly detection.
- [`src/utils/aiAdvisor.js`](file:///d:/Project-TT/src/utils/aiAdvisor.js): Personalized energy recommendations and conversational AI assistant engine.
- [`src/components/LivePowerDial.jsx`](file:///d:/Project-TT/src/components/LivePowerDial.jsx): SVG circular tachometer power gauge.
- [`src/components/HourlyLoadChart.jsx`](file:///d:/Project-TT/src/components/HourlyLoadChart.jsx): 24-Hour time-of-day load curve with peak hours and solar net-metering overlay.
- [`src/components/ApplianceManager.jsx`](file:///d:/Project-TT/src/components/ApplianceManager.jsx): Interactive appliance cards with live ON/OFF switches, runtime sliders, and custom device addition.
- [`src/components/BillPredictorView.jsx`](file:///d:/Project-TT/src/components/BillPredictorView.jsx): Telescopic slab visualization, itemized charges, and 3-month ML forecast cards.
- [`src/components/AIAdvisorView.jsx`](file:///d:/Project-TT/src/components/AIAdvisorView.jsx): Actionable savings cards with 1-click apply and live interactive chat.
- [`src/components/WhatIfSimulator.jsx`](file:///d:/Project-TT/src/components/WhatIfSimulator.jsx): Scenario sandbox sliders and real-time before/after impact analysis.
- [`src/components/BillAuditModal.jsx`](file:///d:/Project-TT/src/components/BillAuditModal.jsx): Official DISCOM statement invoice with print/PDF styling.
