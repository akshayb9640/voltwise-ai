import React, { useState } from 'react';
import { 
  TrendingUp, Calendar, Sparkles, HelpCircle, ArrowUpRight, ArrowDownRight, 
  Info, Zap, Sun, Snowflake, CheckCircle2 
} from 'lucide-react';

export function FutureTrajectoryGraph({ 
  historicalMonths, 
  projectedData, 
  mlPredictions, 
  tariff 
}) {
  const currency = tariff.currencySymbol;
  const [hoveredIndex, setHoveredIndex] = useState(5); // Default to current month (Oct)
  const [viewMode, setViewMode] = useState('cost'); // 'cost' or 'units'

  // Construct comprehensive timeline (Past + Current + Future)
  const timelineData = [
    {
      month: 'May 2026',
      shortMonth: 'May',
      type: 'past',
      units: 435,
      cost: 4085,
      optimizedCost: 4085,
      optimizedUnits: 435,
      slab: 'Slab 4 (>400)',
      season: 'Summer Peak',
      climateNote: 'Extreme summer heatwave. Dual air conditioners ran 11+ hours/day.',
      isCurrent: false
    },
    {
      month: 'Jun 2026',
      shortMonth: 'Jun',
      type: 'past',
      units: 472,
      cost: 4510,
      optimizedCost: 4510,
      optimizedUnits: 472,
      slab: 'Slab 4 (>400)',
      season: 'Summer Peak',
      climateNote: 'Highest annual peak. Maximum cooling demand and continuous compressor load.',
      isCurrent: false
    },
    {
      month: 'Jul 2026',
      shortMonth: 'Jul',
      type: 'past',
      units: 368,
      cost: 3370,
      optimizedCost: 3370,
      optimizedUnits: 368,
      slab: 'Slab 3 (201-400)',
      season: 'Monsoon',
      climateNote: 'Monsoon cooling reduced ambient temperatures. AC runtime dropped 35%.',
      isCurrent: false
    },
    {
      month: 'Aug 2026',
      shortMonth: 'Aug',
      type: 'past',
      units: 335,
      cost: 3020,
      optimizedCost: 3020,
      optimizedUnits: 335,
      slab: 'Slab 3 (201-400)',
      season: 'Monsoon',
      climateNote: 'Steady rainfall throughout the month. Mainly ceiling fans and refrigeration.',
      isCurrent: false
    },
    {
      month: 'Sep 2026',
      shortMonth: 'Sep',
      type: 'past',
      units: 308,
      cost: 2740,
      optimizedCost: 2740,
      optimizedUnits: 308,
      slab: 'Slab 3 (201-400)',
      season: 'Post-Monsoon',
      climateNote: 'Mild weather with moderate cooling requirements.',
      isCurrent: false
    },
    {
      month: 'Oct 2026 (Now)',
      shortMonth: 'Oct',
      type: 'current',
      units: Math.round(projectedData.projectedTotalUnits || 330),
      cost: Math.round(projectedData.projectedBill?.totalBill || 2840),
      optimizedCost: Math.round((projectedData.projectedBill?.totalBill || 2840) * 0.78),
      optimizedUnits: Math.round((projectedData.projectedTotalUnits || 330) * 0.80),
      slab: projectedData.projectedBill?.currentSlabName?.split('(')[0]?.trim() || 'Slab 3',
      season: 'Current Pace',
      climateNote: `Day 18 of 30. Your current run-rate maintains a projected consumption of ${projectedData.projectedTotalUnits} kWh.`,
      isCurrent: true
    },
    {
      month: 'Nov 2026',
      shortMonth: 'Nov',
      type: 'future',
      units: 302,
      cost: 2620,
      optimizedCost: 2120,
      optimizedUnits: 245,
      slab: 'Slab 3 (201-400)',
      season: 'Winter Transition',
      climateNote: 'AC cooling demand drops 65%. Water heaters begin morning usage. AI optimization saves 57 kWh.',
      isCurrent: false
    },
    {
      month: 'Dec 2026',
      shortMonth: 'Dec',
      type: 'future',
      units: 318,
      cost: 2780,
      optimizedCost: 2190,
      optimizedUnits: 252,
      slab: 'Slab 3 (201-400)',
      season: 'Winter Peak',
      climateNote: 'Cool 18°C. High geyser water heating & decorative lights. Maintaining current habits will reach ₹2,780.',
      isCurrent: false
    },
    {
      month: 'Jan 2027',
      shortMonth: 'Jan',
      type: 'future',
      units: 310,
      cost: 2690,
      optimizedCost: 2140,
      optimizedUnits: 248,
      slab: 'Slab 3 (201-400)',
      season: 'Winter',
      climateNote: 'Morning hot water baths dominate. AI timer on geyser prevents re-heat standby losses.',
      isCurrent: false
    },
    {
      month: 'Feb 2027',
      shortMonth: 'Feb',
      type: 'future',
      units: 335,
      cost: 2940,
      optimizedCost: 2280,
      optimizedUnits: 262,
      slab: 'Slab 3 (201-400)',
      season: 'Early Spring',
      climateNote: 'Warm afternoon transition begins. Maintaining unoptimized AC setpoint will cause bill spike.',
      isCurrent: false
    }
  ];

  // Chart Dimensions
  const svgWidth = 840;
  const svgHeight = 280;
  const paddingX = 55;
  const paddingY = 40;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  // Scales
  const maxValue = viewMode === 'cost' ? 5000 : 520;
  const minValue = viewMode === 'cost' ? 1000 : 150;

  const getX = (idx) => paddingX + (idx / (timelineData.length - 1)) * plotWidth;
  const getY = (val) => paddingY + plotHeight - ((val - minValue) / (maxValue - minValue)) * plotHeight;

  // Build SVG Paths
  const maintainingPoints = timelineData.map((d, i) => ({
    x: getX(i),
    y: getY(viewMode === 'cost' ? d.cost : d.units)
  }));

  const optimizedPoints = timelineData.map((d, i) => ({
    x: getX(i),
    y: getY(viewMode === 'cost' ? d.optimizedCost : d.optimizedUnits)
  }));

  // SVG Path Strings
  const maintainingPathString = maintainingPoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Future optimized line starting from current month (index 5)
  const futureOptimizedPoints = optimizedPoints.slice(5);
  const futureOptimizedPathString = futureOptimizedPoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  // Shaded area under future maintaining curve vs optimized curve
  const savingsAreaString = `
    M ${maintainingPoints[5].x} ${maintainingPoints[5].y}
    ${maintainingPoints.slice(5).map(p => `L ${p.x} ${p.y}`).join(' ')}
    ${futureOptimizedPoints.slice().reverse().map(p => `L ${p.x} ${p.y}`).join(' ')}
    Z
  `;

  const hoveredData = timelineData[hoveredIndex] || timelineData[5];
  const monthlySavingsPotential = hoveredData.type === 'future' || hoveredData.type === 'current'
    ? hoveredData.cost - hoveredData.optimizedCost
    : 0;

  return (
    <div className="trajectory-graph-card glass-panel">
      {/* Header and Controls */}
      <div className="card-top-title">
        <div className="title-with-icon">
          <TrendingUp className="text-cyan" size={20} />
          <div>
            <h3 className="section-title">Current Maintaining Rate vs. Future AI Forecast</h3>
            <p className="section-subtitle">
              Hover your cursor over any month on the graph below to inspect predicted bills, units, and seasonal impact
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="chart-mode-toggles">
          <button
            className={`btn-secondary tab-toggle-pill ${viewMode === 'cost' ? 'active-pill' : ''}`}
            onClick={() => setViewMode('cost')}
          >
            <span>Bill Amount ({currency})</span>
          </button>
          <button
            className={`btn-secondary tab-toggle-pill ${viewMode === 'units' ? 'active-pill' : ''}`}
            onClick={() => setViewMode('units')}
          >
            <span>Units (kWh)</span>
          </button>
        </div>
      </div>

      {/* Graph Legend */}
      <div className="trajectory-legend-row">
        <div className="legend-item">
          <span className="legend-line line-maintaining"></span>
          <span>Current Maintaining Pace (Unchanged Habits)</span>
        </div>
        <div className="legend-item">
          <span className="legend-line line-optimized"></span>
          <span>AI Optimized Savings Trajectory</span>
        </div>
        <div className="legend-item">
          <span className="legend-box bg-emerald-translucent"></span>
          <span>Identified Monthly Savings Area</span>
        </div>
      </div>

      {/* Interactive Month Selector Chips Bar */}
      <div className="month-chips-strip">
        {timelineData.map((d, i) => (
          <button
            key={i}
            type="button"
            className={`month-select-chip ${hoveredIndex === i ? 'chip-active' : ''} ${d.isCurrent ? 'chip-current' : ''}`}
            onMouseEnter={() => setHoveredIndex(i)}
            onClick={() => setHoveredIndex(i)}
          >
            <span className="chip-name font-mono">{d.shortMonth}</span>
            {d.isCurrent && <span className="chip-dot-now">● NOW</span>}
            {d.type === 'future' && <span className="chip-future-tag">AI</span>}
          </button>
        ))}
      </div>

      {/* Interactive SVG Chart Canvas */}
      <div className="svg-chart-wrapper">
        <svg 
          className="trajectory-svg" 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          onMouseLeave={() => setHoveredIndex(5)}
        >
          <defs>
            {/* Shaded Area Gradients */}
            <linearGradient id="savingsAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.03" />
            </linearGradient>

            <linearGradient id="maintainingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#00F2FE" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingY + plotHeight * pct;
            const val = Math.round(maxValue - pct * (maxValue - minValue));
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="rgba(148, 163, 184, 0.6)"
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                >
                  {viewMode === 'cost' ? `${currency}${val.toLocaleString()}` : `${val} kWh`}
                </text>
              </g>
            );
          })}

          {/* Shaded Savings Area */}
          <path d={savingsAreaString} fill="url(#savingsAreaGrad)" />

          {/* Main Trendline: Current Maintaining Rate */}
          <path
            d={maintainingPathString}
            fill="none"
            stroke="url(#maintainingGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* AI Optimized Path (Future Only) */}
          <path
            d={futureOptimizedPathString}
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeDasharray="6 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Vertical Cursor Crosshair on Hovered Month */}
          <line
            x1={getX(hoveredIndex)}
            y1={paddingY}
            x2={getX(hoveredIndex)}
            y2={paddingY + plotHeight}
            stroke="#00F2FE"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className="cursor-crosshair"
          />

          {/* Interactive Month Columns (Hover Targets & Node Circles) */}
          {timelineData.map((d, i) => {
            const x = getX(i);
            const yMain = getY(viewMode === 'cost' ? d.cost : d.units);
            const yOpt = getY(viewMode === 'cost' ? d.optimizedCost : d.optimizedUnits);
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={i}
                className="interactive-month-col"
                onMouseEnter={() => setHoveredIndex(i)}
                cursor="pointer"
              >
                {/* Invisible wide hover hit-zone */}
                <rect
                  x={x - plotWidth / (timelineData.length * 2)}
                  y={paddingY}
                  width={plotWidth / timelineData.length}
                  height={plotHeight + 35}
                  fill="transparent"
                />

                {/* Node on Maintaining Line */}
                <circle
                  cx={x}
                  cy={yMain}
                  r={isHovered ? 7 : (d.isCurrent ? 6 : 4.5)}
                  fill={d.isCurrent ? "#00F2FE" : (d.type === 'future' ? "#F59E0B" : "#38BDF8")}
                  stroke="#070B14"
                  strokeWidth="2.5"
                  style={{ transition: 'all 0.15s ease' }}
                />

                {/* Node on Optimized Line (Future) */}
                {d.type === 'future' && (
                  <circle
                    cx={x}
                    cy={yOpt}
                    r={isHovered ? 6 : 3.5}
                    fill="#10B981"
                    stroke="#070B14"
                    strokeWidth="2"
                    style={{ transition: 'all 0.15s ease' }}
                  />
                )}

                {/* X-Axis Month Label */}
                <text
                  x={x}
                  y={paddingY + plotHeight + 22}
                  textAnchor="middle"
                  fill={isHovered ? "#00F2FE" : (d.isCurrent ? "#FFFFFF" : "rgba(148, 163, 184, 0.75)")}
                  fontSize={isHovered ? "12" : "11"}
                  fontWeight={isHovered || d.isCurrent ? "700" : "500"}
                  fontFamily="var(--font-sans)"
                >
                  {d.shortMonth}
                </text>

                {/* Current Month Marker Pill */}
                {d.isCurrent && (
                  <text
                    x={x}
                    y={paddingY + plotHeight + 36}
                    textAnchor="middle"
                    fill="#00F2FE"
                    fontSize="9"
                    fontWeight="800"
                    letterSpacing="0.04em"
                  >
                    ● NOW
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* CURSOR DETAILS CARD - Updates Instantly as Cursor Moves Across Months */}
      <div className="cursor-details-card glass-panel">
        <div className="cursor-card-left">
          <div className="cursor-month-row">
            <span className="cursor-month-title font-mono font-bold text-white text-lg">
              {hoveredData.month}
            </span>
            <span className={`badge ${
              hoveredData.type === 'current' 
                ? 'badge-cyan' 
                : hoveredData.type === 'future' 
                ? 'badge-amber' 
                : 'badge-blue'
            }`}>
              {hoveredData.type === 'current' ? 'CURRENT PACING' : hoveredData.type === 'future' ? 'ML PREDICTION' : 'HISTORICAL METER READ'}
            </span>
            <span className="badge badge-cyan">{hoveredData.season}</span>
          </div>

          <p className="cursor-climate-text text-muted text-xs">
            {hoveredData.climateNote}
          </p>
        </div>

        <div className="cursor-card-right">
          {/* Maintaining Rate Value */}
          <div className="cursor-stat-pill glass-panel">
            <span className="stat-label text-muted text-xs">
              {hoveredData.type === 'past' ? 'Actual Bill Paid' : 'Current Maintaining Pace'}
            </span>
            <div className="stat-val font-mono">
              <span className="text-white font-bold text-xl">
                {currency}{hoveredData.cost.toLocaleString()}
              </span>
              <span className="text-muted text-xs ml-2">({hoveredData.units} kWh)</span>
            </div>
            <span className="text-xs text-muted">Slab: {hoveredData.slab}</span>
          </div>

          {/* AI Optimized Trajectory (if current or future) */}
          {(hoveredData.type === 'future' || hoveredData.type === 'current') && (
            <div className="cursor-stat-pill glass-panel card-highlight-emerald">
              <span className="stat-label text-emerald text-xs font-bold">
                <Sparkles size={12} className="inline mr-1" /> With AI Optimizations Applied
              </span>
              <div className="stat-val font-mono text-emerald">
                <span className="font-bold text-xl">{currency}{hoveredData.optimizedCost.toLocaleString()}</span>
                <span className="text-emerald text-xs ml-2">({hoveredData.optimizedUnits} kWh)</span>
              </div>
              <span className="text-xs text-emerald font-bold">
                Save +{currency}{monthlySavingsPotential.toLocaleString()} this month!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
