import React from 'react';
import { Zap, ShieldAlert, FileText, RefreshCw, UserCheck, Database, ChevronDown } from 'lucide-react';

export function Header({
  tariff,
  onSelectTariff,
  tariffPresets,
  currency,
  onSelectCurrency,
  liveKw,
  anomaliesCount,
  onOpenReport,
  onResetData,
  isLiveSimulation,
  setIsLiveSimulation,
  budget,
  projectedCost,
  currentUser,
  onOpenAuthModal
}) {
  const isOverBudget = projectedCost > budget;
  const budgetPct = Math.min(100, Math.round((projectedCost / budget) * 100));
  const userInitial = currentUser?.fullName?.charAt(0) || 'U';

  return (
    <header className="header-container glass-panel">
      <div className="header-left">
        <div className="brand-logo-wrap">
          <div className="brand-logo-icon">
            <Zap className="brand-zap-icon" />
          </div>
          <div className="brand-titles">
            <div className="brand-title-row">
              <span className="brand-name">VoltWise</span>
              <span className="brand-badge-ai">AI 2.0</span>
            </div>
            <span className="brand-subtitle">Smart Energy Management & Prediction</span>
          </div>
        </div>

        <div className="status-pill-group">
          <div className="live-status-pill">
            <span className="status-dot animate-live-dot"></span>
            <span className="status-text">METER ACTIVE • 230V / 50Hz</span>
          </div>

          {/* Database & Account Status Pill */}
          <div 
            className="db-status-pill cursor-pointer"
            onClick={onOpenAuthModal}
            title="Click to view database partition or switch account"
          >
            <Database size={13} className="text-cyan animate-pulse" />
            <span className="font-mono text-xs text-cyan">DB ISOLATED</span>
          </div>

          {anomaliesCount > 0 && (
            <div className="anomaly-pill">
              <ShieldAlert size={14} className="text-amber" />
              <span>{anomaliesCount} AI Notice{anomaliesCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      <div className="header-right">
        {/* User Account / Profile Dropdown Trigger */}
        <div 
          className="header-user-badge cursor-pointer"
          onClick={onOpenAuthModal}
          title="Click to switch account or manage database profile"
        >
          <div 
            className="user-badge-avatar"
            style={{ backgroundColor: currentUser?.avatarColor || '#00F2FE' }}
          >
            {userInitial}
          </div>
          <div className="user-badge-info">
            <div className="user-badge-name-row">
              <span className="user-badge-name">{currentUser?.fullName || 'Guest User'}</span>
              <ChevronDown size={13} className="text-muted" />
            </div>
            <span className="user-badge-consumer font-mono">
              {currentUser?.consumerId || 'CONS-UNREGISTERED'}
            </span>
          </div>
        </div>

        {/* Budget Progress Meter */}
        <div className="header-budget-widget">
          <div className="budget-label-row">
            <span className="budget-title">Monthly Budget</span>
            <span className={`budget-val font-mono ${isOverBudget ? 'text-rose' : 'text-cyan'}`}>
              {tariff.currencySymbol}{projectedCost.toLocaleString()} / {tariff.currencySymbol}{budget.toLocaleString()}
            </span>
          </div>
          <div className="budget-bar-track">
            <div
              className={`budget-bar-fill ${isOverBudget ? 'bg-rose' : budgetPct > 80 ? 'bg-amber' : 'bg-cyan'}`}
              style={{ width: `${budgetPct}%` }}
            ></div>
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="control-select-wrap">
          <label className="control-label">Currency</label>
          <select
            className="header-select"
            value={currency}
            onChange={(e) => onSelectCurrency(e.target.value)}
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
          </select>
        </div>

        {/* Tariff Presets */}
        <div className="control-select-wrap">
          <label className="control-label">DISCOM Tariff</label>
          <select
            className="header-select tariff-select"
            value={tariff.id}
            onChange={(e) => onSelectTariff(e.target.value)}
          >
            {Object.values(tariffPresets).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Live Simulation Pulse Toggle */}
        <button
          className={`btn-secondary simulation-toggle ${isLiveSimulation ? 'active-sim' : ''}`}
          onClick={() => setIsLiveSimulation(!isLiveSimulation)}
          title={isLiveSimulation ? 'Live Telemetry Fluctuations Active' : 'Live Telemetry Paused'}
        >
          <RefreshCw size={15} className={isLiveSimulation ? 'spin-slow' : ''} />
          <span>{isLiveSimulation ? 'Live Pulse' : 'Paused'}</span>
        </button>

        {/* Official Bill Invoice Report */}
        <button className="btn-secondary" onClick={onOpenReport} title="View itemized audit bill">
          <FileText size={16} />
          <span>Bill Audit</span>
        </button>
      </div>
    </header>
  );
}
