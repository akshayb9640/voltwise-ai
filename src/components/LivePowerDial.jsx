import React from 'react';
import { Gauge, Zap, Flame, Leaf, AlertCircle, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function LivePowerDial({ liveKw, maxKw = 4.5, sanctionedKw = 3.0, tariff, appliances = [] }) {
  // Normalize percentage for arc (0% to 100%)
  const percentage = Math.min(100, Math.max(0, (liveKw / maxKw) * 100));
  
  // Circumference calculation for SVG arc
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * (percentage / 100));

  const voltage = 230.4;
  const amps = ((liveKw * 1000) / voltage).toFixed(1);
  const co2PerHour = (liveKw * 0.82).toFixed(2);
  const hourlyCost = (liveKw * (tariff.slabs[1]?.rate || 5.15)).toFixed(2);

  const activeAppliances = appliances.filter(a => a.isOn);

  // Health status in plain language
  let statusColor = '#00F2FE';
  let statusText = 'Normal & Safe Household Demand';
  let statusBadge = 'badge-emerald';
  let statusIcon = CheckCircle2;
  let statusAdvice = 'Your electricity usage is well within your safe sanctioned limit.';

  if (liveKw > sanctionedKw * 0.85) {
    statusColor = '#EF4444';
    statusText = 'High Surge - Approaching Sanctioned Limit';
    statusBadge = 'badge-rose';
    statusIcon = AlertCircle;
    statusAdvice = 'Multiple heavy appliances are running at once. Consider turning off one heavy device to avoid grid penalty.';
  } else if (liveKw > sanctionedKw * 0.6) {
    statusColor = '#F59E0B';
    statusText = 'Moderate Peak Load Active';
    statusBadge = 'badge-amber';
    statusIcon = Zap;
    statusAdvice = 'High cooling or heating loads are currently drawing current.';
  }

  const StatusIconComp = statusIcon;

  return (
    <div className="live-power-tab-container">
      {/* Friendly Overview Banner */}
      <div className="simple-hero-card glass-panel">
        <div className="simple-hero-left">
          <span className={`badge ${statusBadge} mb-2`}>
            <StatusIconComp size={14} className="inline mr-1" />
            {statusText}
          </span>
          <h2 className="simple-hero-title">
            Your Home is Drawing <span className="text-cyan font-mono">{liveKw.toFixed(2)} kW</span> Right Now
          </h2>
          <p className="simple-hero-desc text-muted">
            {statusAdvice}
          </p>
        </div>

        <div className="simple-hero-cost glass-panel">
          <span className="cost-label text-muted text-xs">Estimated Running Cost</span>
          <div className="cost-val-row font-mono">
            <span className="cost-currency text-cyan font-bold">{tariff.currencySymbol}</span>
            <span className="cost-number text-cyan font-bold text-2xl">{hourlyCost}</span>
            <span className="cost-unit text-muted text-xs"> / hour</span>
          </div>
          <span className="text-xs text-muted">At current active load</span>
        </div>
      </div>

      {/* Main Dial and Diagnostics Grid */}
      <div className="live-power-main-grid">
        {/* SVG Circular Tachometer Dial */}
        <div className="dial-card-wrapper glass-panel">
          <div className="card-top-title">
            <div className="title-with-icon">
              <Gauge className="text-cyan" size={20} />
              <h3 className="section-title">Instantaneous Power Meter</h3>
            </div>
            <span className="badge badge-cyan">
              <span className="mini-pulse-dot"></span> Live Telemetry
            </span>
          </div>

          <div className="svg-dial-container">
            <svg className="dial-svg" viewBox="0 0 220 200">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="50%" stopColor="#00F2FE" />
                  <stop offset="80%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
                <filter id="dialGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Track Arc */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="14"
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeDashoffset="0"
                strokeLinecap="round"
                transform="rotate(150 110 110)"
              />

              {/* Active Colored Value Arc */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="14"
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(150 110 110)"
                filter="url(#dialGlow)"
                style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
              />

              {/* Inner Dial Ring */}
              <circle
                cx="110"
                cy="110"
                r="60"
                fill="rgba(10, 18, 36, 0.9)"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
              />
            </svg>

            {/* Central Overlay Data */}
            <div className="dial-center-overlay">
              <span className="dial-kw-num font-mono">{liveKw.toFixed(2)}</span>
              <span className="dial-kw-unit">KILOWATTS</span>
              <span className="dial-watts-sub font-mono">{(liveKw * 1000).toFixed(0)} Watts</span>
            </div>

            <div className="dial-scale-markers">
              <span className="marker-min font-mono">0 kW</span>
              <span className="marker-sanctioned font-mono">{sanctionedKw} kW Limit</span>
              <span className="marker-max font-mono">{maxKw} kW</span>
            </div>
          </div>
        </div>

        {/* Plain-English Electrical Diagnostics */}
        <div className="diagnostics-card-wrapper glass-panel">
          <div className="card-top-title">
            <div className="title-with-icon">
              <ShieldCheck className="text-cyan" size={20} />
              <h3 className="section-title">Grid Quality & Safety Health</h3>
            </div>
            <span className="badge badge-emerald">Grade A Normal</span>
          </div>

          <div className="telemetry-diagnostics-column">
            <div className="telemetry-pill glass-panel">
              <div className="diag-icon-wrap icon-cyan">
                <Zap size={16} />
              </div>
              <div className="diag-details">
                <span className="diag-label">Household Voltage</span>
                <span className="diag-value font-mono">230.4 <span className="unit">Volts AC (Stable)</span></span>
              </div>
            </div>

            <div className="telemetry-pill glass-panel">
              <div className="diag-icon-wrap icon-amber">
                <Flame size={16} />
              </div>
              <div className="diag-details">
                <span className="diag-label">Current Drawn</span>
                <span className="diag-value font-mono">{amps} <span className="unit">Amperes</span></span>
              </div>
            </div>

            <div className="telemetry-pill glass-panel">
              <div className="diag-icon-wrap icon-purple">
                <Gauge size={16} />
              </div>
              <div className="diag-details">
                <span className="diag-label">Grid Frequency & Power Factor</span>
                <span className="diag-value font-mono">50.0 Hz <span className="unit">/ 0.98 PF (Healthy)</span></span>
              </div>
            </div>

            <div className="telemetry-pill glass-panel">
              <div className="diag-icon-wrap icon-emerald">
                <Leaf size={16} />
              </div>
              <div className="diag-details">
                <span className="diag-label">Carbon Footprint Rate</span>
                <span className="diag-value font-mono">{co2PerHour} <span className="unit">kg CO₂ per hour</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Currently Active Devices List */}
      <div className="active-devices-summary glass-panel">
        <div className="card-top-title">
          <div className="title-with-icon">
            <Zap className="text-cyan" size={18} />
            <h3 className="section-title">Devices Drawing Power Right Now ({activeAppliances.length} Active)</h3>
          </div>
          <span className="text-xs text-muted">Turn off unused devices in the 'My Devices' tab to lower this number</span>
        </div>

        <div className="active-devices-pills-row">
          {activeAppliances.map(app => (
            <div key={app.id} className="active-app-badge glass-panel">
              <span className="status-dot"></span>
              <span className="app-name-pill font-bold">{app.name}</span>
              <span className="app-watts-pill font-mono text-cyan">
                {Math.round(app.ratedWatts * (app.dutyCycle || 1))} W
              </span>
            </div>
          ))}
          {activeAppliances.length === 0 && (
            <div className="text-muted text-sm">No major appliances are running. Baseload idle only.</div>
          )}
        </div>
      </div>
    </div>
  );
}
