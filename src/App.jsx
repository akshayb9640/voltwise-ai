import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

import { TARIFF_PRESETS, INITIAL_APPLIANCES, HISTORICAL_MONTHS } from './data/defaultData';
import { calculateBill, projectMonthlyBill } from './utils/tariffCalculator';
import { generateMLPredictions, calculateApplianceBreakdown, detectAnomalies } from './utils/mlPredictor';
import { generateRecommendations } from './utils/aiAdvisor';

import { Header } from './components/Header';
import { TopMetrics } from './components/TopMetrics';
import { NavigationTabs } from './components/NavigationTabs';
import { LivePowerDial } from './components/LivePowerDial';
import { HourlyLoadChart } from './components/HourlyLoadChart';
import { ApplianceManager } from './components/ApplianceManager';
import { BillPredictorView } from './components/BillPredictorView';
import { AIAdvisorView } from './components/AIAdvisorView';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { BillStatementView } from './components/BillStatementView';

export default function App() {
  // 1. Core State
  const [tariffId, setTariffId] = useState('in_residential');
  const [currency, setCurrency] = useState('INR');
  const [appliances, setAppliances] = useState(INITIAL_APPLIANCES);
  const [activeTab, setActiveTab] = useState('live_power');
  const [isLiveSimulation, setIsLiveSimulation] = useState(false);
  const [microNoise, setMicroNoise] = useState(0);
  const [solarActive, setSolarActive] = useState(false);
  const [appliedActions, setAppliedActions] = useState({});
  const [budget, setBudget] = useState(3200);

  // Current Month Progress
  const dayOfMonth = 18;
  const daysInMonth = 30;
  const [mtdUnits, setMtdUnits] = useState(198.4);

  // Active Tariff with currency override if user toggles currency
  const tariff = useMemo(() => {
    const base = { ...TARIFF_PRESETS[tariffId] };
    if (currency === 'USD') {
      base.currency = 'USD';
      base.currencySymbol = '$';
    } else if (currency === 'EUR') {
      base.currency = 'EUR';
      base.currencySymbol = '€';
    } else {
      base.currency = 'INR';
      base.currencySymbol = '₹';
    }
    return base;
  }, [tariffId, currency]);

  // Adjust budget currency defaults
  useEffect(() => {
    if (currency === 'USD') setBudget(160);
    else if (currency === 'EUR') setBudget(140);
    else setBudget(3200);
  }, [currency]);

  // 2. Compute Active Power Draw (kW) - completely steady based on appliances
  const baseLiveWatts = useMemo(() => {
    return appliances.reduce((sum, a) => {
      if (a.isOn) {
        return sum + Math.round(a.ratedWatts * (a.dutyCycle || 1));
      } else {
        return sum + (a.standbyWatts || 0);
      }
    }, 0);
  }, [appliances]);

  const liveKw = Math.max(0.1, baseLiveWatts / 1000);

  // 3. Enriched Appliance Breakdown with costs & percentages
  const enrichedAppliances = useMemo(() => {
    return calculateApplianceBreakdown(appliances, tariff);
  }, [appliances, tariff]);

  // 4. Monthly Bill Projections (Slab Engine)
  const solarOffsetUnits = solarActive ? 280 : 0;
  const projectedData = useMemo(() => {
    return projectMonthlyBill(mtdUnits, dayOfMonth, daysInMonth, liveKw, tariff, solarOffsetUnits);
  }, [mtdUnits, dayOfMonth, daysInMonth, liveKw, tariff, solarOffsetUnits]);

  // 5. ML Predictive Model & Anomaly Detection
  const mlPredictions = useMemo(() => {
    return generateMLPredictions(
      HISTORICAL_MONTHS,
      projectedData.projectedTotalUnits,
      appliances,
      tariff
    );
  }, [projectedData.projectedTotalUnits, appliances, tariff]);

  const anomalies = useMemo(() => {
    return detectAnomalies(liveKw, projectedData.projectedTotalUnits, appliances, tariff);
  }, [liveKw, projectedData.projectedTotalUnits, appliances, tariff]);

  // 6. AI Recommendations Engine
  const recommendations = useMemo(() => {
    return generateRecommendations(appliances, projectedData, tariff, solarActive);
  }, [appliances, projectedData, tariff, solarActive]);

  const totalPossibleSavings = recommendations.reduce((sum, r) => sum + r.monthlyCostSavings, 0);

  // Handlers for Appliance Controls
  const handleToggleAppliance = (appId) => {
    setAppliances(prev =>
      prev.map(a => a.id === appId ? { ...a, isOn: !a.isOn } : a)
    );
  };

  const handleUpdateHours = (appId, newHours) => {
    setAppliances(prev =>
      prev.map(a => a.id === appId ? { ...a, dailyHours: newHours } : a)
    );
  };

  const handleUpdateAppliance = (appId, updates) => {
    setAppliances(prev =>
      prev.map(a => a.id === appId ? { ...a, ...updates } : a)
    );
  };

  const handleAddAppliance = (newApp) => {
    setAppliances(prev => [newApp, ...prev]);
  };

  // Handler for Applying AI Recommendations
  const handleApplyRecommendation = (actionKey) => {
    if (!actionKey) return;
    setAppliedActions(prev => ({ ...prev, [actionKey]: true }));

    if (actionKey === 'SET_AC_24') {
      setAppliances(prev =>
        prev.map(a => {
          if (a.category === 'Climate') {
            return {
              ...a,
              tempSetpoint: 24,
              dutyCycle: Math.max(0.55, (a.dutyCycle || 0.8) * 0.84),
              ecoMode: true
            };
          }
          return a;
        })
      );
      setMtdUnits(prev => Math.max(10, prev - 12));
    }

    if (actionKey === 'OPTIMIZE_GEYSER') {
      setAppliances(prev =>
        prev.map(a => {
          if (a.name.toLowerCase().includes('geyser') || a.name.toLowerCase().includes('water heater')) {
            return { ...a, dailyHours: 0.8, smartSchedule: true };
          }
          return a;
        })
      );
      setMtdUnits(prev => Math.max(10, prev - 8));
    }

    if (actionKey === 'CUT_PHANTOM') {
      setAppliances(prev =>
        prev.map(a => ({
          ...a,
          standbyWatts: a.standbyWatts > 10 ? 2 : a.standbyWatts,
          vampirePowerAlert: false
        }))
      );
      setMtdUnits(prev => Math.max(10, prev - 6));
    }

    if (actionKey === 'SHIFT_PEAK') {
      setAppliances(prev =>
        prev.map(a => {
          if (a.category === 'Utilities') {
            return { ...a, peakHours: 0, smartSchedule: true };
          }
          return a;
        })
      );
    }

    if (actionKey === 'UPGRADE_BLDC') {
      setAppliances(prev =>
        prev.map(a => {
          if (a.name.toLowerCase().includes('fan')) {
            return {
              ...a,
              name: 'Ceiling Fans (5x BLDC 28W Ultra-Efficient)',
              ratedWatts: 140,
              starRating: 5
            };
          }
          return a;
        })
      );
    }

    if (actionKey === 'ENABLE_SOLAR' || actionKey === 'TOGGLE_SOLAR') {
      setSolarActive(true);
    }
  };

  // Handler for What-If Scenario Commits
  const handleApplyScenario = (scenario) => {
    setAppliances(prev =>
      prev.map(a => {
        let updated = { ...a };
        if (a.category === 'Climate') {
          updated.dailyHours = Math.max(0, updated.dailyHours - scenario.acHoursReduction);
          updated.tempSetpoint = scenario.acSetpoint;
          updated.dutyCycle = Math.max(0.5, 0.70 - ((scenario.acSetpoint - 22) * 0.05));
        }
        if (a.name.toLowerCase().includes('geyser')) {
          updated.dailyHours = Math.max(0.5, updated.dailyHours - (scenario.cutGeyserMinutes / 60));
        }
        if (scenario.killPhantomLoad && updated.standbyWatts > 10) {
          updated.standbyWatts = 2;
        }
        if (scenario.bldcFanUpgrade && updated.name.toLowerCase().includes('fan')) {
          updated.ratedWatts = 140;
          updated.starRating = 5;
        }
        return updated;
      })
    );

    if (scenario.solarCapacityKw > 0) {
      setSolarActive(true);
    }
  };

  const handleResetData = () => {
    setAppliances(INITIAL_APPLIANCES);
    setMtdUnits(198.4);
    setAppliedActions({});
    setSolarActive(false);
  };

  return (
    <div className="app-wrapper">
      {/* 1. Header Bar */}
      <Header
        tariff={tariff}
        onSelectTariff={setTariffId}
        tariffPresets={TARIFF_PRESETS}
        currency={currency}
        onSelectCurrency={setCurrency}
        liveKw={liveKw}
        anomaliesCount={anomalies.length}
        onOpenReport={() => setActiveTab('bill_statement')}
        onResetData={handleResetData}
        isLiveSimulation={isLiveSimulation}
        setIsLiveSimulation={setIsLiveSimulation}
        budget={budget}
        projectedCost={projectedData.projectedBill.totalBill}
      />

      {/* 2. Top Summary KPI Bar (Clean & Compact) */}
      <TopMetrics
        liveKw={liveKw}
        mtdUnits={mtdUnits}
        dayOfMonth={dayOfMonth}
        daysInMonth={daysInMonth}
        projectedUnits={projectedData.projectedTotalUnits}
        projectedCost={projectedData.projectedBill.totalBill}
        mtdCost={projectedData.currentMtdBill.totalBill}
        potentialSavings={totalPossibleSavings}
        tariff={tariff}
        marginalRate={projectedData.projectedBill.marginalRate}
        currentSlabName={projectedData.projectedBill.currentSlabName}
        unitsToNextSlab={projectedData.projectedBill.unitsToNextSlab}
        onOpenOptimizer={() => setActiveTab('ai_savings')}
      />

      {/* 3. Navigation Tabs (7 Distinct Types of Data) */}
      <NavigationTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeAppliancesCount={appliances.filter(a => a.isOn).length}
        recsCount={recommendations.length}
      />

      {/* 4. Tab Content Views - Each Tab Has Its Own Dedicated Screen */}
      <main className="tab-main-content">
        {/* Tab 1: Live Power Draw Right Now */}
        {activeTab === 'live_power' && (
          <LivePowerDial
            liveKw={liveKw}
            maxKw={tariff.sanctionedLoadKw * 1.5}
            sanctionedKw={tariff.sanctionedLoadKw}
            tariff={tariff}
            appliances={enrichedAppliances}
          />
        )}

        {/* Tab 2: 24-Hour Daily Usage Graph */}
        {activeTab === 'hourly_usage' && (
          <HourlyLoadChart
            solarActive={solarActive}
            onToggleSolar={setSolarActive}
            tariff={tariff}
          />
        )}

        {/* Tab 3: My Devices & Appliances Inventory */}
        {activeTab === 'devices' && (
          <ApplianceManager
            appliances={enrichedAppliances}
            onToggleAppliance={handleToggleAppliance}
            onUpdateHours={handleUpdateHours}
            onUpdateAppliance={handleUpdateAppliance}
            onAddAppliance={handleAddAppliance}
            tariff={tariff}
          />
        )}

        {/* Tab 4: Bill Predictor, Telescopic Slabs & ML Seasonal Forecast */}
        {activeTab === 'bill_prediction' && (
          <BillPredictorView
            projectedData={projectedData}
            mlPredictions={mlPredictions}
            tariff={tariff}
            anomalies={anomalies}
            historicalMonths={HISTORICAL_MONTHS}
          />
        )}

        {/* Tab 5: AI Energy Savings Suggestions & Consultation Chat */}
        {activeTab === 'ai_savings' && (
          <AIAdvisorView
            recommendations={recommendations}
            onApplyRecommendation={handleApplyRecommendation}
            appliedActions={appliedActions}
            appliances={appliances}
            tariff={tariff}
            projectedData={projectedData}
            liveKw={liveKw}
            solarActive={solarActive}
            onToggleSolar={setSolarActive}
          />
        )}

        {/* Tab 6: Smart What-If Simulator Sandbox */}
        {activeTab === 'what_if' && (
          <WhatIfSimulator
            baselineUnits={projectedData.projectedTotalUnits}
            baselineBill={projectedData.projectedBill.totalBill}
            tariff={tariff}
            appliances={appliances}
            onApplyScenario={handleApplyScenario}
          />
        )}

        {/* Tab 7: Official Itemized Bill Statement */}
        {activeTab === 'bill_statement' && (
          <BillStatementView
            tariff={tariff}
            projectedData={projectedData}
            appliances={enrichedAppliances}
          />
        )}
      </main>
    </div>
  );
}
