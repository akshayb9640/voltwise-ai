import React from 'react';
import { FileText, Printer, X, CheckCircle, Zap, ShieldCheck } from 'lucide-react';

export function BillAuditModal({ isOpen, onClose, tariff, projectedData, appliances }) {
  if (!isOpen) return null;

  const { projectedBill, projectedTotalUnits, mtdUnits } = projectedData;
  const currency = tariff.currencySymbol;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content invoice-modal glass-panel">
        <div className="invoice-header">
          <div className="invoice-brand">
            <div className="invoice-logo">
              <Zap className="text-cyan" size={24} />
            </div>
            <div>
              <h2 className="invoice-org-name">STATE POWER DISTRIBUTION CORPORATION</h2>
              <span className="invoice-subtitle">Official Electricity Assessment & AI Energy Audit Statement</span>
            </div>
          </div>

          <div className="invoice-actions no-print">
            <button className="btn-secondary" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print / Save PDF</span>
            </button>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Invoice Meta Grid */}
        <div className="invoice-meta-grid">
          <div className="meta-cell">
            <span className="meta-label">Consumer Account No:</span>
            <span className="meta-val font-mono">DISCOM-IND-7840192</span>
          </div>
          <div className="meta-cell">
            <span className="meta-label">Billing Cycle:</span>
            <span className="meta-val">Oct 01, 2026 – Oct 31, 2026</span>
          </div>
          <div className="meta-cell">
            <span className="meta-label">Sanctioned Connected Load:</span>
            <span className="meta-val font-mono">{tariff.sanctionedLoadKw} kW (Single Phase)</span>
          </div>
          <div className="meta-cell">
            <span className="meta-label">Tariff Code / Category:</span>
            <span className="meta-val">{tariff.name}</span>
          </div>
        </div>

        {/* Meter Consumption Accounting */}
        <div className="invoice-table-section">
          <h4 className="invoice-section-title">Meter Consumption & Telescopic Slab Breakdown</h4>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Tariff Slab / Description</th>
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

        {/* Regulatory Charges & Duties */}
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
              <span>Rooftop Solar PV Export Rebate</span>
              <span className="font-mono">-{projectedBill.solarOffsetUnits} kWh</span>
            </div>
          )}

          <div className="invoice-total-line">
            <span className="total-title">NET PAYABLE AMOUNT:</span>
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
              <span className="verdict-score font-mono text-emerald">AI Energy Score: 82 / 100</span>
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
