import React from 'react';
import { FileText, Printer, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function BillStatementView({ tariff, projectedData, appliances }) {
  const { projectedBill, projectedTotalUnits, mtdUnits } = projectedData;
  const currency = tariff.currencySymbol;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bill-statement-tab-container">
      {/* Action Header */}
      <div className="statement-top-bar glass-panel no-print">
        <div className="statement-bar-left">
          <div className="title-with-icon">
            <FileText className="text-cyan" size={20} />
            <h3 className="section-title">Official Electricity Assessment & Energy Audit</h3>
          </div>
          <span className="text-muted text-xs">
            Itemized according to {tariff.name} regulatory tariff rules
          </span>
        </div>

        <button className="btn-primary" onClick={handlePrint}>
          <Printer size={16} />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Official Bill Card */}
      <div className="official-invoice-sheet glass-panel">
        <div className="invoice-header">
          <div className="invoice-brand">
            <div className="invoice-logo">
              <Zap className="text-cyan" size={26} />
            </div>
            <div>
              <h2 className="invoice-org-name">STATE POWER DISTRIBUTION UTILITY</h2>
              <span className="invoice-subtitle">Household Electricity Assessment & Energy Efficiency Statement</span>
            </div>
          </div>

          <div className="invoice-status-tag font-mono">
            <span className="badge badge-cyan">Billing Cycle: Active</span>
          </div>
        </div>

        {/* Consumer Meta Grid */}
        <div className="invoice-meta-grid">
          <div className="meta-cell">
            <span className="meta-label">Consumer Account No:</span>
            <span className="meta-val font-mono">DISCOM-IND-7840192</span>
          </div>
          <div className="meta-cell">
            <span className="meta-label">Billing Cycle & Due Date:</span>
            <span className="meta-val">Oct 01, 2026 – Oct 31, 2026 (Due: Nov 15, 2026)</span>
          </div>
          <div className="meta-cell">
            <span className="meta-label">Sanctioned Connected Load:</span>
            <span className="meta-val font-mono">{tariff.sanctionedLoadKw} kW (Single Phase Domestic)</span>
          </div>
          <div className="meta-cell">
            <span className="meta-label">Tariff Classification:</span>
            <span className="meta-val">{tariff.name}</span>
          </div>
        </div>

        {/* Meter Consumption Accounting */}
        <div className="invoice-table-section">
          <h4 className="invoice-section-title">Meter Consumption & Telescopic Slab Breakdown</h4>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Tariff Slab / Bracket</th>
                <th className="text-right">Units (kWh)</th>
                <th className="text-right">Unit Rate ({currency})</th>
                <th className="text-right">Amount ({currency})</th>
              </tr>
            </thead>
            <tbody>
              {projectedBill.slabBreakdown.map((slab, i) => (
                <tr key={i} className={slab.unitsInSlab > 0 ? '' : 'text-muted'}>
                  <td>{slab.label}</td>
                  <td className="text-right font-mono">{slab.unitsInSlab}</td>
                  <td className="text-right font-mono">{currency}{slab.rate.toFixed(2)}</td>
                  <td className="text-right font-mono font-bold">{currency}{slab.cost.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="subtotal-row">
                <td colSpan="3">Total Energy Charges (kWh Subtotal)</td>
                <td className="text-right font-mono font-bold text-cyan">
                  {currency}{projectedBill.energyCharges.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Regulatory Surcharges & Taxes */}
        <div className="invoice-charges-section">
          <div className="charges-line">
            <span>Fixed Capacity Charges ({tariff.sanctionedLoadKw} kW @ {currency}{tariff.fixedChargePerKw}/kW)</span>
            <span className="font-mono">{currency}{projectedBill.fixedCharges.toFixed(2)}</span>
          </div>
          <div className="charges-line">
            <span>Fuel Adjustment Surcharge (FAC) ({projectedTotalUnits} kWh @ {currency}{tariff.fuelAdjustmentChargePerKwh}/kWh)</span>
            <span className="font-mono">{currency}{projectedBill.fuelSurcharge.toFixed(2)}</span>
          </div>
          <div className="charges-line">
            <span>State Electricity Duty & Taxes ({tariff.electricityDutyPct}%)</span>
            <span className="font-mono">{currency}{projectedBill.electricityDuty.toFixed(2)}</span>
          </div>
          {projectedBill.solarOffsetUnits > 0 && (
            <div className="charges-line text-emerald">
              <span>☀️ Rooftop Solar Net Generation Rebate</span>
              <span className="font-mono">-{projectedBill.solarOffsetUnits} kWh</span>
            </div>
          )}

          <div className="invoice-total-line">
            <span className="total-title">ESTIMATED TOTAL AMOUNT PAYABLE:</span>
            <span className="total-amount font-mono text-cyan">
              {currency}{projectedBill.totalBill.toLocaleString()}
            </span>
          </div>
        </div>

        {/* AI Efficiency Audit Badge */}
        <div className="ai-audit-verdict glass-panel">
          <div className="verdict-icon">
            <ShieldCheck size={28} className="text-emerald" />
          </div>
          <div className="verdict-content">
            <div className="verdict-title-row">
              <span className="verdict-score font-mono text-emerald">AI Energy Audit Score: 82 / 100</span>
              <span className="badge badge-emerald">Efficiency Grade B+</span>
            </div>
            <p className="verdict-text text-muted text-xs">
              Your household consumption is in the top 35% efficiency bracket for your locality. Applying recommended AC 24°C calibration and vampire load cutoff will elevate your score to 94/100 (Grade A) and save ~{currency}680 next billing cycle.
            </p>
          </div>
        </div>

        <div className="invoice-footer text-muted text-xs font-mono">
          <span>Generated by VoltWise AI Certified Metering Suite • Automated Telemetry Run</span>
          <span>Due Date: Nov 15, 2026</span>
        </div>
      </div>
    </div>
  );
}
