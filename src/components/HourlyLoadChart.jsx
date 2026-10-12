import React, { useState } from 'react';
import { Clock, Sun, Zap, Info, AlertTriangle, Moon, Sunrise, Sunset } from 'lucide-react';
import { HOURLY_PROFILE_BASE } from '../data/defaultData';

export function HourlyLoadChart({ solarActive, onToggleSolar, tariff }) {
  const [hoveredHour, setHoveredHour] = useState(null);

  // Maximum scale for chart height
  const maxLoad = 3.6;

  return (
    <div className="hourly-tab-container">
      {/* Friendly Introduction Banner */}
      <div className="simple-hero-card glass-panel">
        <div className="simple-hero-left">
          <span className="badge badge-amber mb-2">
            <AlertTriangle size={14} className="inline mr-1" />
            Peak Tariff Window: 6:00 PM – 10:00 PM
          </span>
          <h2 className="simple-hero-title">
            Your 24-Hour Daily Electricity Load Pattern
          </h2>
          <p className="simple-hero-desc text-muted">
            Electricity consumption peaks in the evening when everyone is home and air conditioning, cooking, and entertainment systems are all active. Shifting heavy chores (like laundry) to morning or afternoon avoids grid peak surcharges.
          </p>
        </div>

        <div className="simple-hero-actions">
          <button
            className={`btn-primary ${solarActive ? 'btn-emerald' : ''}`}
            onClick={() => onToggleSolar(!solarActive)}
          >
            <Sun size={16} />
            <span>{solarActive ? 'Solar Net Offset: Active (2.5 kW)' : 'Simulate Rooftop Solar Impact'}</span>
          </button>
        </div>
      </div>

      {/* Main 24h Bar Chart Card */}
      <div className="hourly-chart-card glass-panel">
        <div className="card-top-title">
          <div className="title-with-icon">
            <Clock className="text-cyan" size={20} />
            <h3 className="section-title">Hourly Grid Draw (00:00 to 23:00)</h3>
          </div>

          <div className="chart-legend-row">
            <div className="legend-item">
              <span className="legend-box bg-cyan"></span>
              <span>Standard Rate Hours</span>
            </div>
            <div className="legend-item">
              <span className="legend-box bg-amber"></span>
              <span>Evening Peak Hours (+20% Cost)</span>
            </div>
            {solarActive && (
              <div className="legend-item">
                <span className="legend-box bg-emerald"></span>
                <span>☀️ Rooftop Solar Offsetting Grid</span>
              </div>
            )}
          </div>
        </div>

        {/* SVG Interactive Bar Chart */}
        <div className="chart-bars-container large-chart-bars">
          {HOURLY_PROFILE_BASE.map((item) => {
            let solarKwOffset = 0;
            if (solarActive && item.hour >= 8 && item.hour <= 16) {
              const peakHour = 12.5;
              const dist = Math.abs(item.hour - peakHour);
              solarKwOffset = Math.max(0, 2.2 * Math.exp(-(dist * dist) / 8));
            }

            const effectiveLoad = Math.max(0.15, item.loadKw - solarKwOffset);
            const heightPct = Math.min(100, (effectiveLoad / maxLoad) * 100);

            return (
              <div
                key={item.hour}
                className={`hour-bar-col ${item.isPeak ? 'is-peak-hour' : ''} ${hoveredHour?.hour === item.hour ? 'is-hovered' : ''}`}
                onMouseEnter={() => setHoveredHour({ ...item, effectiveLoad, solarKwOffset })}
                onMouseLeave={() => setHoveredHour(null)}
              >
                <div className="bar-track">
                  {solarActive && solarKwOffset > 0 && (
                    <div
                      className="solar-offset-bar"
                      style={{ height: `${Math.min(100, (solarKwOffset / maxLoad) * 100)}%` }}
                      title={`Solar generation: -${solarKwOffset.toFixed(2)} kW`}
                    ></div>
                  )}
                  <div
                    className={`bar-fill ${item.isPeak ? 'bar-peak' : 'bar-normal'}`}
                    style={{ height: `${heightPct}%` }}
                  ></div>
                </div>
                <span className="hour-label font-mono">
                  {item.time.replace(' ', '')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hover Information Box */}
        <div className="chart-hover-info glass-panel">
          {hoveredHour ? (
            <div className="hover-details-row">
              <div className="hover-time">
                <span className="font-mono text-cyan font-bold text-base">{hoveredHour.time}</span>
                {hoveredHour.isPeak ? (
                  <span className="badge badge-amber ml-2">⚡ Peak Surcharge Window (+20% Rate)</span>
                ) : (
                  <span className="badge badge-cyan ml-2">Standard Domestic Rate</span>
                )}
              </div>
              <div className="hover-stats">
                <span className="text-muted">Grid Demand: </span>
                <span className="font-mono text-white font-bold">{hoveredHour.effectiveLoad.toFixed(2)} kW</span>
                {hoveredHour.solarKwOffset > 0 && (
                  <span className="text-emerald ml-2 font-mono">
                    (☀️ -{hoveredHour.solarKwOffset.toFixed(2)} kW Free Solar Power)
                  </span>
                )}
                <span className="hover-notes text-muted ml-3">Appliance note: "{hoveredHour.notes}"</span>
              </div>
            </div>
          ) : (
            <div className="hover-placeholder text-muted text-xs">
              <Info size={15} className="inline mr-1 text-cyan" />
              <span>Hover your mouse over any hour bar above to inspect load details and appliance routines for that time.</span>
            </div>
          )}
        </div>
      </div>

      {/* 3 Clear Time-Of-Day Period Cards */}
      <div className="tod-periods-grid">
        <div className="tod-period-card glass-panel">
          <div className="tod-header">
            <Moon className="text-blue" size={20} />
            <h4 className="tod-title">Off-Peak Night (11 PM – 6 AM)</h4>
          </div>
          <p className="tod-desc text-muted text-xs">
            Minimum household baseload (refrigerator cycling, ceiling fans). Lowest carbon intensity and cheapest grid power.
          </p>
          <div className="tod-metric font-mono text-cyan">
            Average 0.42 kW
          </div>
        </div>

        <div className="tod-period-card glass-panel">
          <div className="tod-header">
            <Sunrise className="text-emerald" size={20} />
            <h4 className="tod-title">Solar & Morning (7 AM – 4 PM)</h4>
          </div>
          <p className="tod-desc text-muted text-xs">
            Breakfast cooking, geysers, and daytime appliances. Ideal window for running washing machines and charging EVs.
          </p>
          <div className="tod-metric font-mono text-emerald">
            Average 1.35 kW
          </div>
        </div>

        <div className="tod-period-card glass-panel card-highlight-amber">
          <div className="tod-header">
            <Sunset className="text-amber" size={20} />
            <h4 className="tod-title">Evening Peak (6 PM – 10 PM)</h4>
          </div>
          <p className="tod-desc text-muted text-xs">
            Lighting, cooking, televisions, and air conditioning coincide. Avoid running non-essential heavy appliances here.
          </p>
          <div className="tod-metric font-mono text-amber">
            Peak 3.20 kW
          </div>
        </div>
      </div>
    </div>
  );
}
