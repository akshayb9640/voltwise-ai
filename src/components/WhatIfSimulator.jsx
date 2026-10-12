import React, { useState } from 'react';
import { 
  SlidersHorizontal, CheckCircle2, TrendingDown, ArrowRight, Sun, 
  Sparkles, RefreshCw, Zap, Shield, RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateBill } from '../utils/tariffCalculator';

export function WhatIfSimulator({
  baselineUnits,
  baselineBill,
  tariff,
  appliances,
  onApplyScenario
}) {
  const currency = tariff.currencySymbol;

  // Simulation Sliders State
  const [acHoursReduction, setAcHoursReduction] = useState(1.5); // reduce AC by 1.5 hrs
  const [acSetpoint, setAcSetpoint] = useState(24); // 24°C
  const [cutGeyserMinutes, setCutGeyserMinutes] = useState(25); // reduce geyser run time by 25 mins
  const [shiftPeakLoads, setShiftPeakLoads] = useState(true); // shift washing away from 6-10 PM
  const [killPhantomLoad, setKillPhantomLoad] = useState(true); // kill vampire standby
  const [bldcFanUpgrade, setBldcFanUpgrade] = useState(false); // upgrade fans
  const [solarCapacityKw, setSolarCapacityKw] = useState(0); // 0 to 5 kW

  // Calculate simulated unit savings:
  // 1. AC hours reduction: 1.45 kW AC * acHoursReduction * 30 days
  const acHoursSavedKwh = Math.round((1.45 * acHoursReduction * 30) * 10) / 10;

  // 2. AC temperature setpoint: base is 22°C. Each +1°C saves 6% of remaining AC load (~180 kWh base)
  const tempDiff = Math.max(0, acSetpoint - 22);
  const acTempSavedKwh = Math.round((160 * (tempDiff * 0.06)) * 10) / 10;

  // 3. Geyser reduction: 2 kW geyser * (minutes / 60) * 30 days
  const geyserSavedKwh = Math.round((2.0 * (cutGeyserMinutes / 60) * 30) * 10) / 10;

  // 4. Phantom load kill: ~40W standby * 24 * 30
  const phantomSavedKwh = killPhantomLoad ? 28.8 : 0;

  // 5. BLDC fan upgrade: (65W - 28W) * 2 fans * 14h * 30 / 1000
  const bldcSavedKwh = bldcFanUpgrade ? 31.0 : 0;

  // 6. Solar generation: ~115 kWh per kW per month
  const solarGeneratedKwh = Math.round(solarCapacityKw * 115);

  const totalSimulatedReductionKwh = Math.round(
    (acHoursSavedKwh + acTempSavedKwh + geyserSavedKwh + phantomSavedKwh + bldcSavedKwh) * 10
  ) / 10;

  const simulatedGrossUnits = Math.max(20, baselineUnits - totalSimulatedReductionKwh);
  const simulatedNetUnits = Math.max(0, simulatedGrossUnits - solarGeneratedKwh);

  // Recalculate bill with tariff engine
  const simulatedBillResult = calculateBill(simulatedNetUnits, tariff);

  // Monetary monthly savings
  const monthlySavingsMoney = Math.max(0, baselineBill - simulatedBillResult.totalBill);
  const annualSavingsMoney = monthlySavingsMoney * 12;
  const pctSavings = baselineBill > 0 ? Math.round((monthlySavingsMoney / baselineBill) * 100) : 0;

  const handleApplyToLive = () => {
    onApplyScenario({
      acHoursReduction,
      acSetpoint,
      cutGeyserMinutes,
      shiftPeakLoads,
      killPhantomLoad,
      bldcFanUpgrade,
      solarCapacityKw
    });

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  const handleResetSliders = () => {
    setAcHoursReduction(0);
    setAcSetpoint(22);
    setCutGeyserMinutes(0);
    setShiftPeakLoads(false);
    setKillPhantomLoad(false);
    setBldcFanUpgrade(false);
    setSolarCapacityKw(0);
  };

  return (
    <div className="what-if-container">
      {/* What-If Introduction Banner */}
      <div className="what-if-header glass-panel">
        <div className="header-text-col">
          <div className="title-with-icon">
            <SlidersHorizontal className="text-cyan" size={20} />
            <h3 className="section-title">Smart What-If Energy Scenario Sandbox</h3>
          </div>
          <p className="section-desc">
            Simulate appliance lifestyle modifications, schedule shifts, and solar installations to preview exact bill impacts before making changes.
          </p>
        </div>
        <button className="btn-secondary" onClick={handleResetSliders}>
          <RotateCcw size={15} />
          <span>Reset Sliders</span>
        </button>
      </div>

      <div className="what-if-split-layout">
        {/* Sliders Control Panel */}
        <div className="simulation-controls-card glass-panel">
          <h4 className="card-subtitle text-cyan mb-4">Adjust Scenario Parameters</h4>

          {/* Slider 1: AC Runtime Reduction */}
          <div className="sim-slider-group">
            <div className="sim-slider-label-row">
              <span className="sim-label">Reduce AC Daily Runtime</span>
              <span className="sim-val font-mono text-cyan">-{acHoursReduction} hrs / day</span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              step="0.5"
              value={acHoursReduction}
              onChange={(e) => setAcHoursReduction(parseFloat(e.target.value))}
            />
            <div className="sim-subtext text-xs text-muted">
              Saves ~{acHoursSavedKwh} kWh/month on compressor load
            </div>
          </div>

          {/* Slider 2: AC Temperature Setpoint */}
          <div className="sim-slider-group">
            <div className="sim-slider-label-row">
              <span className="sim-label">AC Thermostat Setpoint</span>
              <span className="sim-val font-mono text-cyan">{acSetpoint}°C</span>
            </div>
            <input
              type="range"
              min="20"
              max="28"
              step="1"
              value={acSetpoint}
              onChange={(e) => setAcSetpoint(parseInt(e.target.value))}
            />
            <div className="sim-subtext text-xs text-muted">
              {tempDiff > 0 ? `+${tempDiff}°C above standard 22°C (saves ~${acTempSavedKwh} kWh/mo)` : 'Standard setpoint'}
            </div>
          </div>

          {/* Slider 3: Water Geyser Usage */}
          <div className="sim-slider-group">
            <div className="sim-slider-label-row">
              <span className="sim-label">Geyser Auto-Timer Cutoff</span>
              <span className="sim-val font-mono text-cyan">-{cutGeyserMinutes} mins / day</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={cutGeyserMinutes}
              onChange={(e) => setCutGeyserMinutes(parseInt(e.target.value))}
            />
            <div className="sim-subtext text-xs text-muted">
              Reduces water heater standby re-heat (saves ~{geyserSavedKwh} kWh/mo)
            </div>
          </div>

          {/* Slider 4: Rooftop Solar PV Simulation */}
          <div className="sim-slider-group">
            <div className="sim-slider-label-row">
              <span className="sim-label">Rooftop Solar PV Capacity</span>
              <span className="sim-val font-mono text-emerald">
                {solarCapacityKw > 0 ? `${solarCapacityKw} kW Grid-Tied` : 'None'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={solarCapacityKw}
              onChange={(e) => setSolarCapacityKw(parseFloat(e.target.value))}
            />
            <div className="sim-subtext text-xs text-muted">
              {solarCapacityKw > 0 ? `Generates ~${solarGeneratedKwh} units/month net offset` : 'Move slider to simulate solar generation'}
            </div>
          </div>

          {/* Toggle Options */}
          <div className="sim-toggles-list">
            <label className="sim-toggle-row">
              <input
                type="checkbox"
                checked={killPhantomLoad}
                onChange={(e) => setKillPhantomLoad(e.target.checked)}
              />
              <div className="toggle-text">
                <span className="toggle-title">Eliminate Standby Phantom Loads</span>
                <span className="toggle-desc text-muted">Auto-cutoff for TV, PC workstation, and chargers</span>
              </div>
              <span className="font-mono text-emerald text-xs">+28.8 kWh</span>
            </label>

            <label className="sim-toggle-row">
              <input
                type="checkbox"
                checked={bldcFanUpgrade}
                onChange={(e) => setBldcFanUpgrade(e.target.checked)}
              />
              <div className="toggle-text">
                <span className="toggle-title">Upgrade 2 Ceiling Fans to 5-Star BLDC</span>
                <span className="toggle-desc text-muted">Reduces fan draw from 65W to 28W</span>
              </div>
              <span className="font-mono text-emerald text-xs">+31.0 kWh</span>
            </label>

            <label className="sim-toggle-row">
              <input
                type="checkbox"
                checked={shiftPeakLoads}
                onChange={(e) => setShiftPeakLoads(e.target.checked)}
              />
              <div className="toggle-text">
                <span className="toggle-title">Shift High Loads Away from Peak Hours</span>
                <span className="toggle-desc text-muted">Run laundry & heavy loads outside 6 PM – 10 PM</span>
              </div>
              <span className="font-mono text-emerald text-xs">Peak Tariff Avoided</span>
            </label>
          </div>
        </div>

        {/* Live Before vs After Impact Comparison */}
        <div className="simulation-impact-card glass-panel card-highlight-emerald">
          <h4 className="card-subtitle text-emerald mb-4">Simulated Monthly Impact</h4>

          <div className="comparison-metric-cards">
            {/* Monthly Bill Comparison */}
            <div className="comp-block glass-panel">
              <span className="comp-label">Projected Monthly Bill</span>
              <div className="comp-values-row font-mono">
                <div className="val-before">
                  <span className="text-muted text-xs">Baseline: </span>
                  <span className="strike text-rose">{currency}{baselineBill.toLocaleString()}</span>
                </div>
                <ArrowRight size={18} className="text-emerald" />
                <div className="val-after">
                  <span className="text-muted text-xs">Simulated: </span>
                  <span className="text-emerald font-bold text-xl">{currency}{simulatedBillResult.totalBill.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Monthly Units Consumption Comparison */}
            <div className="comp-block glass-panel">
              <span className="comp-label">Monthly Units Consumed</span>
              <div className="comp-values-row font-mono">
                <div className="val-before">
                  <span className="text-muted text-xs">Baseline: </span>
                  <span className="strike text-muted">{baselineUnits} kWh</span>
                </div>
                <ArrowRight size={18} className="text-cyan" />
                <div className="val-after">
                  <span className="text-muted text-xs">Simulated: </span>
                  <span className="text-cyan font-bold text-xl">{simulatedNetUnits} kWh</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Savings Callout */}
          <div className="sim-savings-callout glass-panel">
            <div className="savings-badge-pill">
              <TrendingDown size={18} className="text-emerald" />
              <span className="text-emerald font-bold font-mono">-{pctSavings}% Bill Reduction</span>
            </div>
            <div className="savings-money-hero font-mono text-emerald">
              +{currency}{monthlySavingsMoney.toLocaleString()} <span className="text-sm font-sans">/ month</span>
            </div>
            <div className="annual-savings font-mono text-xs text-muted">
              Annualized Household Savings: <strong className="text-white font-mono">{currency}{annualSavingsMoney.toLocaleString()} / year</strong>
            </div>

            <div className="tier-shift-note text-xs">
              {simulatedBillResult.currentSlabName && (
                <span>
                  Simulated consumption places your bill in{' '}
                  <strong className="text-cyan">{simulatedBillResult.currentSlabName.split('(')[0]}</strong>{' '}
                  ({currency}{simulatedBillResult.marginalRate}/unit rate).
                </span>
              )}
            </div>
          </div>

          <div className="sim-commit-footer">
            <button className="btn-emerald w-full" onClick={handleApplyToLive}>
              <CheckCircle2 size={16} />
              <span>Apply Simulated Changes to System</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
