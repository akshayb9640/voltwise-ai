import React, { useState } from 'react';
import { 
  Wind, Refrigerator, Flame, Disc, Utensils, Fan, Lightbulb, Tv, Monitor, Zap,
  Plus, Power, AlertCircle, Sparkles, Filter, CheckCircle2, ChevronRight, X
} from 'lucide-react';

const ICON_MAP = {
  Wind,
  Refrigerator,
  Flame,
  Disc,
  Utensils,
  Fan,
  Lightbulb,
  Tv,
  Monitor,
  Zap
};

export function ApplianceManager({
  appliances,
  onToggleAppliance,
  onUpdateHours,
  onUpdateAppliance,
  onAddAppliance,
  tariff
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAppForm, setNewAppForm] = useState({
    name: '',
    category: 'Climate',
    ratedWatts: 1200,
    dailyHours: 4,
    starRating: 4,
    standbyWatts: 5,
    location: 'Living Room'
  });

  const categories = ['All', 'Climate', 'Kitchen', 'Utilities', 'Entertainment', 'Lighting', 'Electronics'];

  const filteredAppliances = appliances.filter(a => {
    if (selectedCategory === 'All') return true;
    return a.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const totalActiveWatts = appliances
    .filter(a => a.isOn)
    .reduce((sum, a) => sum + Math.round(a.ratedWatts * (a.dutyCycle || 1)), 0);

  const totalStandbyWatts = appliances
    .reduce((sum, a) => sum + (a.standbyWatts || 0), 0);

  const handleCreateAppliance = (e) => {
    e.preventDefault();
    if (!newAppForm.name.trim()) return;

    const newApp = {
      id: `app_custom_${Date.now()}`,
      name: newAppForm.name,
      category: newAppForm.category,
      ratedWatts: Number(newAppForm.ratedWatts),
      standbyWatts: Number(newAppForm.standbyWatts),
      dailyHours: Number(newAppForm.dailyHours),
      starRating: Number(newAppForm.starRating),
      isOn: true,
      peakHours: 1.0,
      dutyCycle: 0.85,
      tempSetpoint: newAppForm.category === 'Climate' ? 24 : null,
      ecoMode: false,
      smartSchedule: false,
      location: newAppForm.location || 'Home',
      vampirePowerAlert: Number(newAppForm.standbyWatts) > 10,
      icon: newAppForm.category === 'Climate' ? 'Wind' : 'Zap'
    };

    onAddAppliance(newApp);
    setIsAddModalOpen(false);
    setNewAppForm({
      name: '',
      category: 'Climate',
      ratedWatts: 1200,
      dailyHours: 4,
      starRating: 4,
      standbyWatts: 5,
      location: 'Living Room'
    });
  };

  return (
    <div className="appliances-container">
      {/* Category Pills & Actions Header */}
      <div className="appliances-header-bar glass-panel">
        <div className="category-chips-list">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="appliances-actions">
          <div className="active-summary-stats font-mono">
            <span className="text-cyan font-bold">{appliances.filter(a => a.isOn).length} Active</span>
            <span className="text-muted"> | </span>
            <span className="text-white font-bold">{totalActiveWatts.toLocaleString()} W Live</span>
            <span className="text-muted"> | </span>
            <span className="text-amber">{totalStandbyWatts}W Standby</span>
          </div>

          <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} />
            <span>Add Appliance</span>
          </button>
        </div>
      </div>

      {/* Appliances Grid */}
      <div className="appliances-grid">
        {filteredAppliances.map(app => {
          const IconComp = ICON_MAP[app.icon] || Zap;
          const livePower = app.isOn ? Math.round(app.ratedWatts * (app.dutyCycle || 1)) : (app.standbyWatts || 0);

          return (
            <div
              key={app.id}
              className={`appliance-card glass-panel ${app.isOn ? 'app-card-active' : 'app-card-off'}`}
            >
              <div className="app-card-top">
                <div className="app-icon-wrap">
                  <IconComp size={20} className={app.isOn ? 'text-cyan' : 'text-muted'} />
                </div>
                <div className="app-name-meta">
                  <h4 className="app-title">{app.name}</h4>
                  <div className="app-meta-tags">
                    <span className="location-tag">{app.location}</span>
                    <span className="star-rating" title={`${app.starRating} Star BEE rating`}>
                      {'★'.repeat(app.starRating)}{'☆'.repeat(5 - app.starRating)}
                    </span>
                  </div>
                </div>

                {/* ON / OFF Switch */}
                <label className="switch" title={app.isOn ? 'Click to turn OFF' : 'Click to turn ON'}>
                  <input
                    type="checkbox"
                    checked={app.isOn}
                    onChange={() => onToggleAppliance(app.id)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {/* Live wattage badge */}
              <div className="app-live-draw-row">
                <div className="draw-info">
                  <span className="draw-label">{app.isOn ? 'Running Draw' : 'Standby Drain'}</span>
                  <div className="draw-val-wrap font-mono">
                    <span className={`draw-val ${app.isOn ? 'text-cyan font-bold' : 'text-muted'}`}>
                      {livePower}
                    </span>
                    <span className="draw-unit">Watts</span>
                  </div>
                </div>

                <div className="app-month-impact">
                  <span className="month-impact-label">Monthly Impact</span>
                  <span className="month-cost font-mono">
                    {tariff.currencySymbol}{app.monthlyCost?.toLocaleString() || 0}
                    <span className="text-muted text-xs"> ({app.totalMonthlyKwh || 0} kWh)</span>
                  </span>
                </div>
              </div>

              {/* Daily Hours Slider */}
              <div className="app-slider-section">
                <div className="slider-header-row">
                  <span className="slider-label">Daily Runtime</span>
                  <span className="slider-hours font-mono text-cyan">{app.dailyHours} hrs / day</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="0.5"
                  value={app.dailyHours}
                  onChange={(e) => onUpdateHours(app.id, parseFloat(e.target.value))}
                />
              </div>

              {/* Climate Thermostat or Vampire Badges */}
              <div className="app-card-footer">
                {app.category === 'Climate' && app.tempSetpoint && (
                  <div className="temp-control-pill">
                    <span className="text-xs text-muted">Setpoint:</span>
                    <button
                      className="temp-btn"
                      onClick={() => onUpdateAppliance(app.id, { tempSetpoint: Math.max(18, app.tempSetpoint - 1) })}
                      title="Lower temperature (more power)"
                    >-</button>
                    <span className="font-mono text-cyan font-bold">{app.tempSetpoint}°C</span>
                    <button
                      className="temp-btn"
                      onClick={() => onUpdateAppliance(app.id, { tempSetpoint: Math.min(28, app.tempSetpoint + 1) })}
                      title="Raise temperature (saves 6%/°C)"
                    >+</button>
                  </div>
                )}

                {app.vampirePowerAlert && app.standbyWatts > 10 && (
                  <span className="badge badge-amber" title={`${app.standbyWatts}W idle ghost draw`}>
                    <AlertCircle size={12} /> Vampire {app.standbyWatts}W
                  </span>
                )}

                {app.ecoMode && (
                  <span className="badge badge-emerald">
                    <Sparkles size={11} /> Eco Active
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to Add Custom Appliance */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3 className="modal-title">Add Appliance to Energy Monitor</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAppliance} className="modal-form">
              <div className="form-group">
                <label className="form-label">Appliance Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g., Dishwasher, EV Charger, Room Heater"
                  value={newAppForm.name}
                  onChange={(e) => setNewAppForm({ ...newAppForm, name: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-input"
                    value={newAppForm.category}
                    onChange={(e) => setNewAppForm({ ...newAppForm, category: e.target.value })}
                  >
                    <option value="Climate">Climate Control</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Lighting">Lighting</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Rated Wattage (W)</label>
                  <input
                    type="number"
                    required
                    min="10"
                    max="10000"
                    className="form-input font-mono"
                    value={newAppForm.ratedWatts}
                    onChange={(e) => setNewAppForm({ ...newAppForm, ratedWatts: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Daily Usage (Hours)</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    className="form-input font-mono"
                    value={newAppForm.dailyHours}
                    onChange={(e) => setNewAppForm({ ...newAppForm, dailyHours: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">BEE Star Rating (1-5)</label>
                  <select
                    className="form-input"
                    value={newAppForm.starRating}
                    onChange={(e) => setNewAppForm({ ...newAppForm, starRating: e.target.value })}
                  >
                    <option value="5">5 Star (Ultra High Efficiency)</option>
                    <option value="4">4 Star (High Efficiency)</option>
                    <option value="3">3 Star (Standard)</option>
                    <option value="2">2 Star (Moderate)</option>
                    <option value="1">1 Star (Legacy Inefficient)</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Standby Drain (Watts)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-input font-mono"
                    value={newAppForm.standbyWatts}
                    onChange={(e) => setNewAppForm({ ...newAppForm, standbyWatts: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Room / Location</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Kitchen, Guest Bedroom"
                    value={newAppForm.location}
                    onChange={(e) => setNewAppForm({ ...newAppForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Plus size={16} />
                  <span>Add to Inventory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
