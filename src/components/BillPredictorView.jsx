import React from 'react';
import { 
  TrendingUp, BarChart3, Calendar, AlertCircle, ArrowUpRight, ArrowDownRight, 
  HelpCircle, ShieldAlert, CheckCircle2, ChevronRight, Calculator
} from 'lucide-react';
import { FutureTrajectoryGraph } from './FutureTrajectoryGraph';

export function BillPredictorView({
  projectedData,
  mlPredictions,
  tariff,
  anomalies,
  historicalMonths
}) {
  const currency = tariff.currencySymbol;
  const { currentMtdBill, projectedBill, mtdUnits, projectedTotalUnits, daysRemaining } = projectedData;

  return (
    <div className="bill-predictor-container">
      {/* Active Anomalies & Alerts Banner (Page 2 Flowchart: ANALYZE FOR ANOMALIES -> WARN IF ABNORMAL) */}
      {anomalies.length > 0 && (
        <div className="anomalies-section">
          {anomalies.map(anom => (
            <div
              key={anom.id}
              className={`anomaly-banner glass-panel ${anom.level === 'critical' ? 'banner-critical' : anom.level === 'warning' ? 'banner-warning' : 'banner-info'}`}
            >
              <div className="anomaly-icon-col">
                <ShieldAlert size={22} />
              </div>
              <div className="anomaly-content">
                <div className="anomaly-title-row">
                  <h4 className="anomaly-title">{anom.title}</h4>
                  <span className="anomaly-source-tag font-mono">{anom.source}</span>
                </div>
                <p className="anomaly-message">{anom.message}</p>
                <div className="anomaly-rec-box">
                  <span className="rec-badge">AI Action:</span>
                  <span className="rec-text">{anom.recommendation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid: Telescopic Slabs Progress & Itemized Bill Calculation Engine */}
      <div className="predictor-split-grid">
        {/* Telescopic Slab Breakdown */}
        <div className="slabs-card glass-panel">
          <div className="card-top-title">
            <div className="title-with-icon">
              <BarChart3 className="text-cyan" size={18} />
              <h3 className="section-title">Telescopic Tariff Slabs & Marginal Cost</h3>
            </div>
            <span className="badge badge-cyan">{tariff.region}</span>
          </div>

          <p className="section-desc">
            Your electricity provider bills power in stepped slabs. Consuming more pushes additional units into higher, more expensive tiers.
          </p>

          <div className="slabs-list">
            {projectedBill.slabBreakdown.map((slab, i) => {
              const maxLabel = slab.max === Infinity ? '∞' : `${slab.max} kWh`;
              const rangeCapacity = slab.max === Infinity ? 200 : (slab.max - slab.min);
              const fillPct = Math.min(100, Math.round((slab.unitsInSlab / rangeCapacity) * 100));

              return (
                <div
                  key={i}
                  className={`slab-row-card ${slab.isActive ? 'slab-is-active' : ''} ${slab.isFilled ? 'slab-is-filled' : ''}`}
                >
                  <div className="slab-info-row">
                    <div className="slab-name-col">
                      <span className="slab-tier-tag font-mono">Slab {i + 1}</span>
                      <span className="slab-tier-label">{slab.label}</span>
                    </div>
                    <div className="slab-rate-col font-mono">
                      <span className="rate-value text-cyan font-bold">{currency}{slab.rate.toFixed(2)}</span>
                      <span className="rate-unit text-muted"> / kWh</span>
                    </div>
                  </div>

                  <div className="slab-progress-bar-track">
                    <div
                      className={`slab-progress-bar-fill ${i === 3 ? 'fill-rose' : i === 2 ? 'fill-amber' : 'fill-cyan'}`}
                      style={{ width: `${fillPct}%` }}
                    ></div>
                  </div>

                  <div className="slab-metrics-row font-mono text-xs">
                    <span className="text-muted">
                      Units in slab: <strong className="text-white">{slab.unitsInSlab} kWh</strong>
                    </span>
                    <span className="text-muted">
                      Subtotal: <strong className="text-cyan">{currency}{slab.cost.toLocaleString()}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slab Breach Advice */}
          {projectedBill.unitsToNextSlab && (
            <div className="slab-breach-alert glass-panel">
              <AlertCircle size={16} className="text-amber" />
              <div className="alert-copy">
                <strong>Threshold Warning:</strong> You have only{' '}
                <span className="text-amber font-mono font-bold">{projectedBill.unitsToNextSlab} kWh</span>{' '}
                remaining before your consumption enters Slab {projectedBill.currentSlabIndex + 2} at{' '}
                <span className="text-white font-mono font-bold">{currency}{projectedBill.nextSlabRate}/kWh</span>.
              </div>
            </div>
          )}
        </div>

        {/* Itemized Bill Generation Engine */}
        <div className="itemized-bill-card glass-panel">
          <div className="card-top-title">
            <div className="title-with-icon">
              <Calculator className="text-cyan" size={18} />
              <h3 className="section-title">Itemized Bill Calculation Engine</h3>
            </div>
            <span className="badge badge-emerald">Verified DISCOM Rules</span>
          </div>

          <div className="bill-comparison-pills">
            <div className="bill-pill mtd-pill">
              <span className="pill-title">Month-To-Date Incurred</span>
              <span className="pill-amount font-mono text-cyan">
                {currency}{currentMtdBill.totalBill.toLocaleString()}
              </span>
              <span className="pill-sub text-muted font-mono">{mtdUnits} kWh used</span>
            </div>

            <div className="bill-pill projected-pill">
              <span className="pill-title">Projected End-of-Month</span>
              <span className="pill-amount font-mono text-white font-bold">
                {currency}{projectedBill.totalBill.toLocaleString()}
              </span>
              <span className="pill-sub text-cyan font-mono">{projectedTotalUnits} kWh projected</span>
            </div>
          </div>

          <div className="itemized-breakdown-table">
            <div className="breakdown-row">
              <span className="item-label">Energy Charges (Slab Total)</span>
              <span className="item-value font-mono text-white">{currency}{projectedBill.energyCharges.toFixed(2)}</span>
            </div>

            <div className="breakdown-row">
              <span className="item-label">
                Fixed Demand Charges ({tariff.sanctionedLoadKw} kW @ {currency}{tariff.fixedChargePerKw}/kW)
              </span>
              <span className="item-value font-mono text-white">{currency}{projectedBill.fixedCharges.toFixed(2)}</span>
            </div>

            <div className="breakdown-row">
              <span className="item-label">
                Fuel Adjustment Surcharge ({currency}{tariff.fuelAdjustmentChargePerKwh}/kWh)
              </span>
              <span className="item-value font-mono text-white">{currency}{projectedBill.fuelSurcharge.toFixed(2)}</span>
            </div>

            <div className="breakdown-row">
              <span className="item-label">
                Electricity Duty / State Tax ({tariff.electricityDutyPct}%)
              </span>
              <span className="item-value font-mono text-white">{currency}{projectedBill.electricityDuty.toFixed(2)}</span>
            </div>

            {projectedBill.solarOffsetUnits > 0 && (
              <div className="breakdown-row text-emerald">
                <span className="item-label">☀️ Rooftop Solar Generation Rebate</span>
                <span className="item-value font-mono">-{projectedBill.solarOffsetUnits} kWh</span>
              </div>
            )}

            <div className="breakdown-divider"></div>

            <div className="breakdown-row total-row">
              <span className="item-label-total">Estimated Total Payable</span>
              <span className="item-value-total font-mono text-cyan">
                {currency}{projectedBill.totalBill.toLocaleString()}
              </span>
            </div>

            <div className="breakdown-meta-row font-mono text-xs text-muted">
              <span>Avg. Effective Rate: {currency}{projectedBill.avgCostPerUnit} / kWh</span>
              <span>Current Marginal Rate: {currency}{projectedBill.marginalRate} / kWh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Current Maintaining vs Future Forecast Trajectory Graph */}
      <FutureTrajectoryGraph
        historicalMonths={historicalMonths}
        projectedData={projectedData}
        mlPredictions={mlPredictions}
        tariff={tariff}
      />

      {/* Machine Learning 3-Month Future Bill Prediction */}
      <div className="ml-forecast-card glass-panel">
        <div className="card-top-title">
          <div className="title-with-icon">
            <TrendingUp className="text-cyan" size={18} />
            <div>
              <h3 className="section-title">Machine Learning 3-Month Bill Forecast & Seasonal Trends</h3>
              <p className="section-subtitle">
                Trained on 6 months historical DISCOM meter readings + seasonal climate coefficients + appliance inventory
              </p>
            </div>
          </div>
          <span className="badge badge-emerald">ARIMA + Seasonal Decomposition</span>
        </div>

        <div className="ml-predictions-grid">
          {mlPredictions.map((pred, i) => (
            <div key={i} className="forecast-month-card glass-panel">
              <div className="forecast-card-top">
                <div className="forecast-date">
                  <Calendar size={15} className="text-cyan mr-1 inline" />
                  <span className="month-name font-mono font-bold text-white">{pred.month}</span>
                </div>
                <span className="badge badge-cyan">{pred.season}</span>
              </div>

              <div className="forecast-temp-desc text-xs text-muted">
                {pred.tempDescription}
              </div>

              <div className="forecast-main-metric">
                <span className="forecast-units font-mono font-bold">{pred.predictedUnits}</span>
                <span className="forecast-units-label">kWh</span>
                <div className="forecast-bill-cost font-mono text-cyan">
                  {currency}{pred.expectedBill.toLocaleString()}
                </div>
              </div>

              {/* Confidence bounds */}
              <div className="confidence-bounds-box">
                <div className="bound-row">
                  <span className="bound-label text-emerald">
                    <ArrowDownRight size={13} className="inline mr-1" /> Best-Case (AI Applied):
                  </span>
                  <span className="bound-val font-mono text-emerald">
                    {currency}{pred.bestCaseBill.toLocaleString()} ({pred.bestCaseUnits} kWh)
                  </span>
                </div>
                <div className="bound-row">
                  <span className="bound-label text-rose">
                    <ArrowUpRight size={13} className="inline mr-1" /> Worst-Case (Uncontrolled):
                  </span>
                  <span className="bound-val font-mono text-rose">
                    {currency}{pred.worstCaseBill.toLocaleString()} ({pred.worstCaseUnits} kWh)
                  </span>
                </div>
              </div>

              <div className="forecast-card-footer font-mono text-xs">
                <span className="text-emerald">
                  Save up to {currency}{pred.potentialSavings.toLocaleString()}
                </span>
                <span className="text-muted">Target Slab: {pred.activeSlab.split('(')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
