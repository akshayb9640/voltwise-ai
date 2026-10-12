// AI Energy Optimization Advisor Engine

/**
 * Generates personalized, prioritized recommendations based on live state
 * @param {Array} appliances - User's active appliances
 * @param {object} billData - Current & projected bill calculation
 * @param {object} tariff - Tariff configuration
 * @param {boolean} solarEnabled - Whether solar simulation is turned on
 * @returns {Array} List of dynamic recommendations with quantified monetary impact
 */
export function generateRecommendations(appliances, billData, tariff, solarEnabled = false) {
  const recommendations = [];
  const marginalRate = billData.projectedBill?.marginalRate || 7.20;
  const currencySymbol = tariff.currencySymbol || '₹';

  // 1. Air Conditioning Optimization (Dead simple language)
  const acUnits = appliances.filter(a => a.category === 'Climate' && a.ratedWatts > 1000);
  if (acUnits.length > 0) {
    const acMonthlyKwh = acUnits.reduce((sum, a) => sum + ((a.ratedWatts * a.dutyCycle / 1000) * a.dailyHours * 30), 0);
    const potentialKwhSaved = Math.round(acMonthlyKwh * 0.16);
    const monetarySavings = Math.round(potentialKwhSaved * marginalRate);

    recommendations.push({
      id: 'rec_ac_temp',
      stepNumber: 1,
      simpleIcon: '❄️',
      title: 'Set AC Temperature to 24°C',
      whatToDo: 'Increase your AC thermostat from 20°C/22°C to 24°C.',
      whyItWorks: 'Your room stays comfortably cool, but your AC motor works 16% less hard.',
      monthlyKwhSavings: potentialKwhSaved,
      monthlyCostSavings: monetarySavings,
      badge: 'Quick 1-Click Fix',
      effort: 'Instant (No Cost)',
      actionLabel: 'Set AC to 24°C Now',
      actionKey: 'SET_AC_24'
    });
  }

  // 2. Stop Vampire Standby Power
  const totalStandbyWatts = appliances.reduce((sum, a) => sum + (a.standbyWatts || 0), 0);
  if (totalStandbyWatts > 20) {
    const phantomMonthlyKwh = Math.round((totalStandbyWatts * 24 * 30 / 1000));
    const phantomSavings = Math.round(phantomMonthlyKwh * marginalRate);

    recommendations.push({
      id: 'rec_phantom_cutoff',
      stepNumber: 2,
      simpleIcon: '🔌',
      title: 'Turn Off TV & PC Wall Switches at Night',
      whatToDo: 'Switch off wall sockets for TV, Gaming consoles, and PC setup when sleeping.',
      whyItWorks: 'Electronics silently drink power even when turned off on standby mode.',
      monthlyKwhSavings: phantomMonthlyKwh,
      monthlyCostSavings: phantomSavings,
      badge: 'Zero Effort',
      effort: 'Easy Routine',
      actionLabel: 'Enable Night Sleep Mode',
      actionKey: 'CUT_PHANTOM'
    });
  }

  // 3. Water Geyser Timer
  const geyser = appliances.find(a => a.name.toLowerCase().includes('geyser') || a.name.toLowerCase().includes('water heater'));
  if (geyser && geyser.dailyHours > 1.0) {
    const reducedHours = Math.max(0.7, geyser.dailyHours - 0.6);
    const kwhSaved = Math.round(((geyser.ratedWatts / 1000) * (geyser.dailyHours - reducedHours) * 30));
    const monetarySaved = Math.round(kwhSaved * marginalRate);

    recommendations.push({
      id: 'rec_geyser_timer',
      stepNumber: 3,
      simpleIcon: '🚿',
      title: 'Run Water Heater for 25 Mins Only',
      whatToDo: 'Turn off the water heater after 25 minutes instead of leaving it on for hours.',
      whyItWorks: 'Water stays boiling hot in the insulated tank without wasting power continuously re-heating.',
      monthlyKwhSavings: kwhSaved,
      monthlyCostSavings: monetarySaved,
      badge: 'Big Savings',
      effort: 'Simple Habit',
      actionLabel: 'Set 25-Min Auto Off',
      actionKey: 'OPTIMIZE_GEYSER'
    });
  }

  // 4. Peak Tariff Shift
  const peakLoadApps = appliances.filter(a => a.peakHours > 1 && a.ratedWatts > 500);
  if (peakLoadApps.length > 0) {
    const peakKwh = Math.round(peakLoadApps.reduce((sum, a) => sum + ((a.ratedWatts / 1000) * 1.5 * 30), 0));
    const peakSavings = Math.round(peakKwh * (marginalRate * 0.20));

    recommendations.push({
      id: 'rec_peak_shift',
      stepNumber: 4,
      simpleIcon: '⏰',
      title: 'Do Laundry Before 6 PM (Avoid Peak Hour Rates)',
      whatToDo: 'Run washing machines and heavy appliances during morning or afternoon.',
      whyItWorks: 'Electricity costs 20% more during evening peak hours (6:00 PM to 10:00 PM).',
      monthlyKwhSavings: peakKwh,
      monthlyCostSavings: peakSavings,
      badge: 'Time Saver',
      effort: 'Timing Change',
      actionLabel: 'Shift to Off-Peak',
      actionKey: 'SHIFT_PEAK'
    });
  }

  // 5. BLDC Fan Upgrade
  const fanApp = appliances.find(a => a.name.toLowerCase().includes('fan'));
  if (fanApp) {
    recommendations.push({
      id: 'rec_bldc_upgrade',
      stepNumber: 5,
      simpleIcon: '🌀',
      title: 'Switch Old Ceiling Fans to 5-Star BLDC Fans',
      whatToDo: 'Replace regular 75-Watt fans with modern 28-Watt BLDC motor fans.',
      whyItWorks: 'BLDC fans use less than half the power for the exact same breeze, saving money 24/7.',
      monthlyKwhSavings: 38,
      monthlyCostSavings: Math.round(38 * marginalRate),
      badge: 'Smart Upgrade',
      effort: 'One-Time Upgrade',
      actionLabel: 'Simulate 5-Star Fan Upgrade',
      actionKey: 'UPGRADE_BLDC'
    });
  }

  // 6. Rooftop Solar
  if (!solarEnabled) {
    recommendations.push({
      id: 'rec_solar_pv',
      stepNumber: 6,
      simpleIcon: '☀️',
      title: 'Install Rooftop Solar Panels',
      whatToDo: 'Add a small 2.5 kW solar system on your rooftop.',
      whyItWorks: 'Generates free electricity from the sun all day, slashing 80% off your electric bill.',
      monthlyKwhSavings: 280,
      monthlyCostSavings: Math.round(280 * marginalRate),
      badge: 'Maximum Impact',
      effort: 'Long-term Investment',
      actionLabel: 'Simulate Solar Savings',
      actionKey: 'ENABLE_SOLAR'
    });
  }

  return recommendations;
}

/**
 * Intelligent AI Assistant for answering user energy questions
 * @param {string} prompt - User question or query
 * @param {object} context - Current dashboard state
 * @returns {object} AI answer with markdown details and recommendation pills
 */
export function askAIEnergyAdvisor(prompt, context) {
  const query = prompt.toLowerCase();
  const currency = context.tariff.currencySymbol;
  const currentUnits = context.projectedBill?.projectedTotalUnits || 320;
  const currentCost = context.projectedBill?.projectedBill?.totalBill || 2800;
  const marginalRate = context.projectedBill?.projectedBill?.marginalRate || 7.20;

  if (query.includes('bill') && (query.includes('reduce') || query.includes('cut') || query.includes('lower') || query.includes('under') || query.includes('less'))) {
    return {
      title: 'AI Action Plan to Reduce Your Monthly Bill',
      response: `Based on your live profile, your projected bill is **${currency}${currentCost.toLocaleString()}** (${currentUnits} kWh). 

Here are the 3 fastest actions to cut your bill by up to **30% (approx. ${currency}${Math.round(currentCost * 0.28).toLocaleString()})**:

1. **Air Conditioner Calibration (+2°C)**: Raising your AC setpoint to 24°C saves ~16% AC energy, reducing monthly bill by ~${currency}${Math.round(48 * marginalRate)}.
2. **Eliminate Standby Phantom Loads**: Turn off master power to TV & desktop PCs at night. This eliminates ${context.appliances.reduce((s, a) => s + (a.standbyWatts || 0), 0)}W of continuous drain (saving ~${currency}220/mo).
3. **Shift Heavy Appliances Out of Peak Hours**: Avoid running geyser & washing machine between 6:00 PM – 10:00 PM.

> **Pro Tip**: If you keep total monthly units below **200 kWh**, you will avoid entering the higher tier slab (${currency}${marginalRate}/kWh), keeping your base rate at only ${currency}5.15!`,
      actionKey: 'SET_AC_24',
      actionText: 'Apply AI AC Optimization'
    };
  }

  if (query.includes('appliance') && (query.includes('most') || query.includes('highest') || query.includes('hog') || query.includes('consuming'))) {
    const highestApp = [...context.appliances].sort((a, b) => (b.ratedWatts * (b.dailyHours || 1)) - (a.ratedWatts * (a.dailyHours || 1)))[0];
    return {
      title: 'Highest Energy Consuming Appliance Analysis',
      response: `Your biggest power consumer is **${highestApp.name}**:
- **Rated Wattage**: ${highestApp.ratedWatts} Watts
- **Daily Usage**: ${highestApp.dailyHours} hours/day
- **Estimated Monthly Cost**: ~${currency}${Math.round((highestApp.ratedWatts * (highestApp.dutyCycle || 0.8) / 1000) * highestApp.dailyHours * 30 * marginalRate)}
- **Share of Total Bill**: Approx. ~38% of your overall monthly energy.

**Recommendation**: Enable Eco Mode or set temperature setpoint to 24°C to save up to 18% on this device alone without sacrificing comfort!`,
      actionKey: 'ADJUST_TOP_APPLIANCE',
      actionText: `Optimize ${highestApp.name}`
    };
  }

  if (query.includes('solar') || query.includes('rooftop') || query.includes('sun') || query.includes('pv')) {
    return {
      title: 'Rooftop Solar PV Feasibility & Savings Projection',
      response: `For your household's monthly requirement of ~**${currentUnits} kWh**:

- **Recommended Solar System**: **2.5 kW to 3.0 kW** On-Grid Net-Metered System
- **Rooftop Area Required**: ~220 - 260 sq. ft. of shadow-free rooftop
- **Expected Daily Generation**: 10 – 12 kWh/day (avg. 300+ kWh/month)
- **Estimated Monthly Bill Drop**: From **${currency}${currentCost}** down to **${currency}280 - ${currency}450** (Fixed charges only)
- **Net Annual Savings**: ~${currency}${Math.round((currentCost - 350) * 12).toLocaleString()} per year
- **Estimated Payback Period**: 3.2 to 3.8 years with government subsidy (PM Surya Ghar / Solar Tax credits).`,
      actionKey: 'ENABLE_SOLAR',
      actionText: 'Simulate Solar Net Metering Now'
    };
  }

  if (query.includes('vampire') || query.includes('phantom') || query.includes('standby') || query.includes('idle')) {
    const totalStandby = context.appliances.reduce((s, a) => s + (a.standbyWatts || 0), 0);
    return {
      title: 'Phantom / Vampire Power Audit',
      response: `Phantom power is electricity consumed by electronics when they are switched off but still plugged into the wall outlet.

In your home right now:
- **Total Standby Power**: **${totalStandby} Watts** continuous
- **Monthly Ghost Consumption**: **${Math.round(totalStandby * 24 * 30 / 1000)} kWh**
- **Annual Wasted Cost**: ~**${currency}${Math.round(totalStandby * 24 * 365 / 1000 * marginalRate).toLocaleString()}**

**Top Phantom Offenders in Your Home**:
1. Home Theatre & Gaming Setup (${context.appliances.find(a => a.id === 'app_9')?.standbyWatts || 28}W)
2. Home Office Workstation & Monitors (${context.appliances.find(a => a.id === 'app_10')?.standbyWatts || 16}W)
3. Living Room AC in Standby (${context.appliances.find(a => a.id === 'app_2')?.standbyWatts || 12}W)`,
      actionKey: 'CUT_PHANTOM',
      actionText: 'Cut Standby Phantom Load'
    };
  }

  if (query.includes('slab') || query.includes('tariff') || query.includes('rate') || query.includes('tier')) {
    return {
      title: 'DISCOM Slab & Tariff Tier Explanation',
      response: `Your electricity provider uses a progressive **telescopic slab structure**:
- **0 – 100 kWh**: Lowest subsidized lifeline rate (${currency}${context.tariff.slabs[0]?.rate}/unit)
- **101 – 200 kWh**: Standard residential tier (${currency}${context.tariff.slabs[1]?.rate}/unit)
- **201 – 400 kWh**: High consumption bracket (${currency}${context.tariff.slabs[2]?.rate}/unit)
- **> 400 kWh**: Penalty peak tier (${currency}${context.tariff.slabs[3]?.rate || 8.95}/unit)

You are currently tracking at **${currentUnits} kWh**, putting your marginal consumption in the **${context.projectedBill?.projectedBill?.currentSlabName || 'Higher'}** tier. Every unit you save now avoids the top rate!`,
      actionKey: null,
      actionText: null
    };
  }

  // Default intelligent energy response
  return {
    title: 'AI Energy Intelligence Assessment',
    response: `Your current home is running at an instantaneous demand of **${(context.liveKw || 2.4).toFixed(2)} kW**, with a projected month-end total of **${currentUnits} kWh** (${currency}${currentCost.toLocaleString()}).

**Key Smart Management Insights**:
- **Cooling Load**: Accounts for nearly half of total variable consumption. Shifting AC to 24°C saves up to 16%.
- **Vampire Power**: Idle devices are drawing continuous current that adds ~${currency}220 every month.
- **Slab Boundary**: You are currently in the higher bracket. Shifting 35 kWh lower will prevent marginal unit billing at higher tiers.`,
    actionKey: 'SET_AC_24',
    actionText: 'Optimize Climate & Cooling'
  };
}
