import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './App.css';

import { TARIFF_PRESETS, INITIAL_APPLIANCES, HISTORICAL_MONTHS } from './data/defaultData';
import { calculateBill, projectMonthlyBill } from './utils/tariffCalculator';
import { generateMLPredictions, calculateApplianceBreakdown, detectAnomalies } from './utils/mlPredictor';
import { generateRecommendations } from './utils/aiAdvisor';
import { dbService } from './services/apiService';

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
import { AuthModal } from './components/AuthModal';
import { Database, UserCheck, Check, Sparkles } from 'lucide-react';

export default function App() {
  // 1. Account & Database State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [dbNotice, setDbNotice] = useState('');

  // 2. Core User Configuration State (Partitioned per User)
  const [tariffId, setTariffId] = useState('in_residential');
  const [currency, setCurrency] = useState('INR');
  const [appliances, setAppliances] = useState(INITIAL_APPLIANCES);
  const [activeTab, setActiveTab] = useState('live_power');
  const [isLiveSimulation, setIsLiveSimulation] = useState(false);
  const [solarActive, setSolarActive] = useState(false);
  const [appliedActions, setAppliedActions] = useState({});
  const [budget, setBudget] = useState(3200);

  // Current Month Progress
  const dayOfMonth = 18;
  const daysInMonth = 30;
  const [mtdUnits, setMtdUnits] = useState(198.4);

  // Show transient database sync notice
  const showDbNotice = useCallback((text) => {
    setDbNotice(text);
    setTimeout(() => {
      setDbNotice('');
    }, 2800);
  }, []);

  // Initialize and load the active user's isolated data from database
  useEffect(() => {
    async function loadActiveUserData() {
      try {
        const user = await dbService.getCurrentUser();
        if (user) {
          const userData = await dbService.loadUserData(user.id);
          setCurrentUser(userData.user);
          if (userData.profile) {
            if (userData.profile.tariffId) setTariffId(userData.profile.tariffId);
            if (userData.profile.currency) setCurrency(userData.profile.currency);
            if (userData.profile.budget) setBudget(userData.profile.budget);
            if (userData.profile.mtdUnits) setMtdUnits(userData.profile.mtdUnits);
            setSolarActive(Boolean(userData.profile.solarActive));
            if (userData.profile.appliedActions) setAppliedActions(userData.profile.appliedActions);
          }
          if (userData.appliances && userData.appliances.length > 0) {
            setAppliances(userData.appliances);
          }
        }
      } catch (err) {
        console.error('Error loading user database partition:', err);
      }
    }
    loadActiveUserData();
  }, []);

  // Handler when user switches account or registers a new account
  const handleAccountSwitched = (fullData) => {
    setCurrentUser(fullData.user);
    if (fullData.profile) {
      if (fullData.profile.tariffId) setTariffId(fullData.profile.tariffId);
      if (fullData.profile.currency) setCurrency(fullData.profile.currency);
      if (fullData.profile.budget) setBudget(fullData.profile.budget);
      if (fullData.profile.mtdUnits) setMtdUnits(userDataFix(fullData.profile.mtdUnits));
      setSolarActive(Boolean(fullData.profile.solarActive));
      if (fullData.profile.appliedActions) setAppliedActions(fullData.profile.appliedActions);
    }
    if (fullData.appliances && fullData.appliances.length > 0) {
      setAppliances(fullData.appliances);
    }
    showDbNotice(`Loaded database record for ${fullData.user.fullName}`);
  };

  const userDataFix = (val) => (typeof val === 'number' ? val : 198.4);

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

  // Sync profile changes to user's database record
  const handleSelectTariff = (newTariffId) => {
    setTariffId(newTariffId);
    if (currentUser?.id) {
      dbService.saveUserProfile(currentUser.id, { tariffId: newTariffId });
      showDbNotice('DISCOM tariff updated in database');
    }
  };

  const handleSelectCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    let newBudget = budget;
    if (newCurrency === 'USD') newBudget = 160;
    else if (newCurrency === 'EUR') newBudget = 140;
    else newBudget = 3200;
    setBudget(newBudget);

    if (currentUser?.id) {
      dbService.saveUserProfile(currentUser.id, { currency: newCurrency, budget: newBudget });
      showDbNotice('Currency updated in database');
    }
  };

  const handleToggleSolar = (newVal) => {
    setSolarActive(newVal);
    if (currentUser?.id) {
      dbService.saveUserProfile(currentUser.id, { solarActive: newVal });
      showDbNotice(`Solar net-metering ${newVal ? 'enabled' : 'disabled'} in database`);
    }
  };

  // 2. Compute Active Power Draw (kW)
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

  // Database-Synced Appliance Handlers
  const persistAppliances = (newAppliances, noticeText = 'Database updated') => {
    setAppliances(newAppliances);
    if (currentUser?.id) {
      dbService.saveUserAppliances(currentUser.id, newAppliances);
      showDbNotice(noticeText);
    }
  };

  const handleToggleAppliance = (appId) => {
    const updated = appliances.map(a => a.id === appId ? { ...a, isOn: !a.isOn } : a);
    persistAppliances(updated, 'Appliance power state saved');
  };

  const handleUpdateHours = (appId, newHours) => {
    const updated = appliances.map(a => a.id === appId ? { ...a, dailyHours: newHours } : a);
    persistAppliances(updated, 'Operating hours saved to database');
  };

  const handleUpdateAppliance = (appId, updates) => {
    const updated = appliances.map(a => a.id === appId ? { ...a, ...updates } : a);
    persistAppliances(updated, 'Appliance parameters saved to database');
  };

  const handleAddAppliance = (newApp) => {
    const updated = [newApp, ...appliances];
    persistAppliances(updated, `Added "${newApp.name}" to your database`);
  };

  // Handler for Applying AI Recommendations
  const handleApplyRecommendation = (actionKey) => {
    if (!actionKey) return;
    const newActions = { ...appliedActions, [actionKey]: true };
    setAppliedActions(newActions);

    let updatedAppliances = [...appliances];
    let newMtd = mtdUnits;

    if (actionKey === 'SET_AC_24') {
      updatedAppliances = updatedAppliances.map(a => {
        if (a.category === 'Climate') {
          return {
            ...a,
            tempSetpoint: 24,
            dutyCycle: Math.max(0.55, (a.dutyCycle || 0.8) * 0.84),
            ecoMode: true
          };
        }
        return a;
      });
      newMtd = Math.max(10, newMtd - 12);
      setMtdUnits(newMtd);
    }

    if (actionKey === 'OPTIMIZE_GEYSER') {
      updatedAppliances = updatedAppliances.map(a => {
        if (a.name.toLowerCase().includes('geyser') || a.name.toLowerCase().includes('water heater')) {
          return { ...a, dailyHours: 0.8, smartSchedule: true };
        }
        return a;
      });
      newMtd = Math.max(10, newMtd - 8);
      setMtdUnits(newMtd);
    }

    if (actionKey === 'CUT_PHANTOM') {
      updatedAppliances = updatedAppliances.map(a => ({
        ...a,
        standbyWatts: a.standbyWatts > 10 ? 2 : a.standbyWatts,
        vampirePowerAlert: false
      }));
      newMtd = Math.max(10, newMtd - 6);
      setMtdUnits(newMtd);
    }

    if (actionKey === 'SHIFT_PEAK') {
      updatedAppliances = updatedAppliances.map(a => {
        if (a.category === 'Utilities') {
          return { ...a, peakHours: 0, smartSchedule: true };
        }
        return a;
      });
    }

    if (actionKey === 'UPGRADE_BLDC') {
      updatedAppliances = updatedAppliances.map(a => {
        if (a.name.toLowerCase().includes('fan')) {
          return {
            ...a,
            name: 'Ceiling Fans (5x BLDC 28W Ultra-Efficient)',
            ratedWatts: 140,
            starRating: 5
          };
        }
        return a;
      });
    }

    if (actionKey === 'ENABLE_SOLAR' || actionKey === 'TOGGLE_SOLAR') {
      handleToggleSolar(true);
    }

    persistAppliances(updatedAppliances, `AI recommendation applied & saved`);
    if (currentUser?.id) {
      dbService.saveUserProfile(currentUser.id, {
        appliedActions: newActions,
        mtdUnits: newMtd
      });
    }
  };

  // Handler for What-If Scenario Commits
  const handleApplyScenario = (scenario) => {
    const updated = appliances.map(a => {
      let item = { ...a };
      if (a.category === 'Climate') {
        item.dailyHours = Math.max(0, item.dailyHours - scenario.acHoursReduction);
        item.tempSetpoint = scenario.acSetpoint;
        item.dutyCycle = Math.max(0.5, 0.70 - ((scenario.acSetpoint - 22) * 0.05));
      }
      if (a.name.toLowerCase().includes('geyser')) {
        item.dailyHours = Math.max(0.5, item.dailyHours - (scenario.cutGeyserMinutes / 60));
      }
      if (scenario.killPhantomLoad && item.standbyWatts > 10) {
        item.standbyWatts = 2;
      }
      if (scenario.bldcFanUpgrade && item.name.toLowerCase().includes('fan')) {
        item.ratedWatts = 140;
        item.starRating = 5;
      }
      return item;
    });

    if (scenario.solarCapacityKw > 0) {
      handleToggleSolar(true);
    }

    persistAppliances(updated, 'Custom scenario committed to your database');
  };

  const handleResetData = async () => {
    if (currentUser?.id) {
      const reset = await dbService.resetUserData(currentUser.id);
      setAppliances(reset.appliances);
      setMtdUnits(reset.profile.mtdUnits);
      setAppliedActions({});
      setSolarActive(reset.profile.solarActive);
      showDbNotice(`Reset data for ${currentUser.fullName} to default baseline`);
    }
  };

  return (
    <div className="app-wrapper">
      {/* 1. Header Bar with User Account & Database Integration */}
      <Header
        tariff={tariff}
        onSelectTariff={handleSelectTariff}
        tariffPresets={TARIFF_PRESETS}
        currency={currency}
        onSelectCurrency={handleSelectCurrency}
        liveKw={liveKw}
        anomaliesCount={anomalies.length}
        onOpenReport={() => setActiveTab('bill_statement')}
        onResetData={handleResetData}
        isLiveSimulation={isLiveSimulation}
        setIsLiveSimulation={setIsLiveSimulation}
        budget={budget}
        projectedCost={projectedData.projectedBill.totalBill}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* User Account Notification & Database Sync Bar */}
      <div className="account-context-strip glass-panel">
        <div className="account-context-left">
          <div 
            className="user-strip-avatar"
            style={{ backgroundColor: currentUser?.avatarColor || '#00F2FE' }}
          >
            {currentUser?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="account-strip-details">
            <span className="account-strip-name">
              Logged in as: <strong>{currentUser?.fullName || 'Guest User'}</strong>
            </span>
            <span className="account-strip-meta font-mono">
              Account ID: {currentUser?.consumerId || 'CONS-DEMO'} • Tariff: {tariff.name}
            </span>
          </div>
        </div>

        <div className="account-context-right">
          {dbNotice && (
            <div className="db-save-toast animate-fade-in">
              <Check size={14} className="text-emerald" />
              <span>{dbNotice}</span>
            </div>
          )}
          <button 
            className="btn-secondary btn-sm"
            onClick={() => setIsAuthModalOpen(true)}
          >
            <UserCheck size={14} />
            <span>Switch Account / Add User</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Bar */}
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

      {/* 3. Navigation Tabs */}
      <NavigationTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeAppliancesCount={appliances.filter(a => a.isOn).length}
        recsCount={recommendations.length}
      />

      {/* 4. Tab Content Views */}
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
            onToggleSolar={handleToggleSolar}
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
            onToggleSolar={handleToggleSolar}
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

      {/* 5. User Account & Database Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAccountSwitched={handleAccountSwitched}
        dbService={dbService}
      />
    </div>
  );
}
