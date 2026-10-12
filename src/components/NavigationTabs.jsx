import React from 'react';
import { 
  Zap, Clock, Tv, TrendingUp, Sparkles, SlidersHorizontal, FileText 
} from 'lucide-react';

export function NavigationTabs({ activeTab, setActiveTab, activeAppliancesCount, recsCount }) {
  const tabs = [
    {
      id: 'live_power',
      label: '⚡ Live Power Right Now',
      shortLabel: 'Live Power',
      icon: Zap,
      badge: 'Active'
    },
    {
      id: 'hourly_usage',
      label: '📊 24-Hour Usage Graph',
      shortLabel: '24h Graph',
      icon: Clock,
      badge: null
    },
    {
      id: 'devices',
      label: `🔌 My Devices & Appliances (${activeAppliancesCount})`,
      shortLabel: 'Devices',
      icon: Tv,
      badge: `${activeAppliancesCount} on`
    },
    {
      id: 'bill_prediction',
      label: '💰 Future Bill & Slabs',
      shortLabel: 'Bill Forecast',
      icon: TrendingUp,
      badge: 'Predictor'
    },
    {
      id: 'ai_savings',
      label: `💡 AI Savings Suggestions (${recsCount})`,
      shortLabel: 'AI Tips',
      icon: Sparkles,
      badge: 'Save ₹'
    },
    {
      id: 'what_if',
      label: '🎛️ What-If Simulator',
      shortLabel: 'Simulator',
      icon: SlidersHorizontal,
      badge: 'Sandbox'
    },
    {
      id: 'bill_statement',
      label: '🧾 Itemized Bill Statement',
      shortLabel: 'Statement',
      icon: FileText,
      badge: 'Official'
    }
  ];

  return (
    <nav className="nav-tabs-bar glass-panel">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            className={`nav-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
          >
            <Icon size={16} />
            <span className="tab-full-label">{tab.label}</span>
            <span className="tab-short-label">{tab.shortLabel}</span>
          </button>
        );
      })}
    </nav>
  );
}
