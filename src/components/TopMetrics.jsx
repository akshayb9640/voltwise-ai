import React from 'react';
import { Activity, Calendar, TrendingUp, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';

export function TopMetrics({
  liveKw,
  mtdUnits,
  dayOfMonth,
  daysInMonth,
  projectedUnits,
  projectedCost,
  mtdCost,
  potentialSavings,
  tariff,
  marginalRate,
  currentSlabName,
  unitsToNextSlab,
  onOpenOptimizer
}) {
  const currency = tariff.currencySymbol;
  const loadPercentage = Math.round((liveKw / tariff.sanctionedLoadKw) * 100);

  return (
    <div className="compact-kpi-bar glass-panel">
      {/* 1. Live Instantaneous Demand */}
      <div className="kpi-mini-item">
        <div className="kpi-mini-icon icon-cyan">
          <Activity size={16} />
        </div>
        <div className="kpi-mini-content">
          <span className="kpi-mini-label text-muted">Power Right Now</span>
          <div className="kpi-mini-val font-mono">
            <span className="font-bold text-white text-base">{liveKw.toFixed(2)} kW</span>
            <span className="text-muted text-xs"> ({(liveKw * 1000).toFixed(0)} W)</span>
          </div>
        </div>
      </div>

      <div className="kpi-separator"></div>

      {/* 2. Month-to-Date Energy Usage */}
      <div className="kpi-mini-item">
        <div className="kpi-mini-icon icon-blue">
          <Calendar size={16} />
        </div>
        <div className="kpi-mini-content">
          <span className="kpi-mini-label text-muted">Used This Month</span>
          <div className="kpi-mini-val font-mono">
            <span className="font-bold text-white text-base">{mtdUnits.toFixed(1)} kWh</span>
            <span className="text-cyan text-xs"> ({currency}{mtdCost.toLocaleString()})</span>
          </div>
        </div>
      </div>

      <div className="kpi-separator"></div>

      {/* 3. Projected Month-End Bill */}
      <div className="kpi-mini-item">
        <div className="kpi-mini-icon icon-purple">
          <TrendingUp size={16} />
        </div>
        <div className="kpi-mini-content">
          <span className="kpi-mini-label text-muted">Expected End-of-Month Bill</span>
          <div className="kpi-mini-val font-mono">
            <span className="font-bold text-white text-base">{currency}{projectedCost.toLocaleString()}</span>
            <span className="text-muted text-xs"> ({projectedUnits} kWh)</span>
          </div>
        </div>
      </div>

      <div className="kpi-separator"></div>

      {/* 4. AI Optimization Quick CTA */}
      <div className="kpi-mini-item kpi-action-item">
        <div className="kpi-mini-icon icon-emerald">
          <Sparkles size={16} />
        </div>
        <div className="kpi-mini-content">
          <span className="kpi-mini-label text-emerald">Savings Identified</span>
          <div className="kpi-mini-val font-mono text-emerald">
            <span className="font-bold text-base">+{currency}{potentialSavings.toLocaleString()}</span>
            <span className="text-xs"> / mo</span>
          </div>
        </div>
        <button className="btn-emerald kpi-cta-btn" onClick={onOpenOptimizer} title="View AI tips to save money">
          <span>See Tips</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
