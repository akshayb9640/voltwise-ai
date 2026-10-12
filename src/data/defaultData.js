// VoltWise AI - Default System State & Energy Data

export const TARIFF_PRESETS = {
  'in_residential': {
    id: 'in_residential',
    name: 'State Domestic Tariff (Tiered Slabs)',
    region: 'India / Regional State DISCOM',
    currency: 'INR',
    currencySymbol: '₹',
    sanctionedLoadKw: 3.0,
    fixedChargePerKw: 110, // ₹110 per kW / month
    electricityDutyPct: 6.0, // 6% tax on energy charges
    fuelAdjustmentChargePerKwh: 0.38, // FAC ₹0.38 / kWh
    slabs: [
      { min: 0, max: 100, rate: 3.35, label: '0 - 100 kWh (Lifeline)' },
      { min: 101, max: 200, rate: 5.15, label: '101 - 200 kWh (Standard)' },
      { min: 201, max: 400, rate: 7.20, label: '201 - 400 kWh (Higher)' },
      { min: 401, max: Infinity, rate: 8.95, label: '> 400 kWh (Peak Tier)' }
    ],
    peakHoursRateMultiplier: 1.20, // 20% surcharge during 18:00 - 22:00
    offPeakRateMultiplier: 0.85 // 15% rebate during 23:00 - 06:00
  },
  'us_residential': {
    id: 'us_residential',
    name: 'US Residential Tiered Electric',
    region: 'North America Standard',
    currency: 'USD',
    currencySymbol: '$',
    sanctionedLoadKw: 10.0,
    fixedChargePerKw: 1.5,
    electricityDutyPct: 4.5,
    fuelAdjustmentChargePerKwh: 0.012,
    slabs: [
      { min: 0, max: 500, rate: 0.13, label: '0 - 500 kWh (Base Tier)' },
      { min: 501, max: 1000, rate: 0.17, label: '501 - 1000 kWh (Tier 2)' },
      { min: 1001, max: Infinity, rate: 0.22, label: '> 1000 kWh (Tier 3)' }
    ],
    peakHoursRateMultiplier: 1.25,
    offPeakRateMultiplier: 0.80
  },
  'eu_dynamic': {
    id: 'eu_dynamic',
    name: 'EU Domestic Eco Tariff',
    region: 'European Union Standard',
    currency: 'EUR',
    currencySymbol: '€',
    sanctionedLoadKw: 6.0,
    fixedChargePerKw: 2.2,
    electricityDutyPct: 8.0,
    fuelAdjustmentChargePerKwh: 0.02,
    slabs: [
      { min: 0, max: 150, rate: 0.22, label: '0 - 150 kWh (Eco Band)' },
      { min: 151, max: 350, rate: 0.31, label: '151 - 350 kWh (Normal)' },
      { min: 351, max: Infinity, rate: 0.39, label: '> 350 kWh (High Demand)' }
    ],
    peakHoursRateMultiplier: 1.30,
    offPeakRateMultiplier: 0.75
  }
};

export const INITIAL_APPLIANCES = [
  {
    id: 'app_1',
    name: 'Master Bed Inverter AC (1.5 Ton)',
    category: 'Climate',
    ratedWatts: 1450,
    standbyWatts: 8,
    dailyHours: 7.5,
    starRating: 4,
    isOn: true,
    peakHours: 3.5, // hours used during 6PM-10PM peak
    dutyCycle: 0.70, // inverter modulates down once room cools
    tempSetpoint: 22, // Celsius
    ecoMode: false,
    smartSchedule: true,
    location: 'Master Bedroom',
    vampirePowerAlert: true,
    icon: 'Wind'
  },
  {
    id: 'app_2',
    name: 'Living Room Split AC (2.0 Ton)',
    category: 'Climate',
    ratedWatts: 1950,
    standbyWatts: 12,
    dailyHours: 3.5,
    starRating: 2,
    isOn: false,
    peakHours: 2.5,
    dutyCycle: 0.85,
    tempSetpoint: 20,
    ecoMode: false,
    smartSchedule: false,
    location: 'Living Area',
    vampirePowerAlert: true,
    icon: 'Wind'
  },
  {
    id: 'app_3',
    name: 'Frost-Free Refrigerator (340L)',
    category: 'Kitchen',
    ratedWatts: 210,
    standbyWatts: 35,
    dailyHours: 24.0,
    starRating: 3,
    isOn: true,
    peakHours: 4.0,
    dutyCycle: 0.42, // runs compressor 42% of 24h
    tempSetpoint: 3,
    ecoMode: true,
    smartSchedule: false,
    location: 'Kitchen',
    vampirePowerAlert: false,
    icon: 'Refrigerator'
  },
  {
    id: 'app_4',
    name: 'Storage Geyser / Water Heater (25L)',
    category: 'Utilities',
    ratedWatts: 2000,
    standbyWatts: 4,
    dailyHours: 1.8,
    starRating: 3,
    isOn: false,
    peakHours: 0.5,
    dutyCycle: 0.90,
    tempSetpoint: 65,
    ecoMode: false,
    smartSchedule: true,
    location: 'Main Bathroom',
    vampirePowerAlert: false,
    icon: 'Flame'
  },
  {
    id: 'app_5',
    name: 'Front-Load Washing Machine (8kg)',
    category: 'Utilities',
    ratedWatts: 900,
    standbyWatts: 5,
    dailyHours: 1.2,
    starRating: 5,
    isOn: false,
    peakHours: 0.0,
    dutyCycle: 0.65,
    tempSetpoint: 40,
    ecoMode: true,
    smartSchedule: true,
    location: 'Utility Balcony',
    vampirePowerAlert: false,
    icon: 'Disc'
  },
  {
    id: 'app_6',
    name: 'Induction Cooktop & Microwave',
    category: 'Kitchen',
    ratedWatts: 1600,
    standbyWatts: 6,
    dailyHours: 2.0,
    starRating: 4,
    isOn: true,
    peakHours: 1.2,
    dutyCycle: 0.75,
    tempSetpoint: null,
    ecoMode: false,
    smartSchedule: false,
    location: 'Kitchen Counter',
    vampirePowerAlert: false,
    icon: 'Utensils'
  },
  {
    id: 'app_7',
    name: 'Ceiling Fans (3 BLDC + 2 Conventional)',
    category: 'Climate',
    ratedWatts: 214, // 3x28W + 2x65W
    standbyWatts: 0,
    dailyHours: 14.0,
    starRating: 3,
    isOn: true,
    peakHours: 4.0,
    dutyCycle: 1.0,
    tempSetpoint: null,
    ecoMode: false,
    smartSchedule: false,
    location: 'All Rooms',
    vampirePowerAlert: false,
    icon: 'Fan'
  },
  {
    id: 'app_8',
    name: 'LED Home Lighting Network (18 Fixtures)',
    category: 'Lighting',
    ratedWatts: 180,
    standbyWatts: 0,
    dailyHours: 6.5,
    starRating: 5,
    isOn: true,
    peakHours: 4.0,
    dutyCycle: 1.0,
    tempSetpoint: null,
    ecoMode: true,
    smartSchedule: true,
    location: 'Whole Home',
    vampirePowerAlert: false,
    icon: 'Lightbulb'
  },
  {
    id: 'app_9',
    name: 'Home Theatre & Gaming Setup (TV+PS5)',
    category: 'Entertainment',
    ratedWatts: 290,
    standbyWatts: 28, // High standby phantom drain!
    dailyHours: 4.0,
    starRating: 3,
    isOn: true,
    peakHours: 3.0,
    dutyCycle: 0.95,
    tempSetpoint: null,
    ecoMode: false,
    smartSchedule: false,
    location: 'Living Room',
    vampirePowerAlert: true,
    icon: 'Tv'
  },
  {
    id: 'app_10',
    name: 'Home Office Workstation (PC + Mon + WiFi)',
    category: 'Electronics',
    ratedWatts: 250,
    standbyWatts: 16,
    dailyHours: 8.5,
    starRating: 4,
    isOn: true,
    peakHours: 1.5,
    dutyCycle: 0.80,
    tempSetpoint: null,
    ecoMode: true,
    smartSchedule: false,
    location: 'Study Room',
    vampirePowerAlert: true,
    icon: 'Monitor'
  }
];

export const HISTORICAL_MONTHS = [
  { month: 'May (Summer Peak)', year: 2026, unitsKwh: 435, bill: 4085, avgTemp: '37°C', notes: 'Severe heatwave, dual AC usage' },
  { month: 'Jun (Summer Peak)', year: 2026, unitsKwh: 472, bill: 4510, avgTemp: '38°C', notes: 'High AC load & cooling demand' },
  { month: 'Jul (Monsoon)', year: 2026, unitsKwh: 368, bill: 3370, avgTemp: '31°C', notes: 'Rainfall moderated temperatures' },
  { month: 'Aug (Monsoon)', year: 2026, unitsKwh: 335, bill: 3020, avgTemp: '29°C', notes: 'Consistent rainfall, fans only' },
  { month: 'Sep (Post-Monsoon)', year: 2026, unitsKwh: 308, bill: 2740, avgTemp: '30°C', notes: 'Mild cooling, optimal usage' },
  { month: 'Oct (Current MTD - Day 18)', year: 2026, unitsKwh: 198, bill: 1720, avgTemp: '28°C', notes: 'Tracking at 330 kWh projected' }
];

export const HOURLY_PROFILE_BASE = [
  { hour: 0, time: '12 AM', loadKw: 0.45, isPeak: false, notes: 'Night baseload + Fridge + Fans' },
  { hour: 1, time: '01 AM', loadKw: 0.42, isPeak: false, notes: 'Baseload' },
  { hour: 2, time: '02 AM', loadKw: 0.40, isPeak: false, notes: 'Baseload' },
  { hour: 3, time: '03 AM', loadKw: 0.38, isPeak: false, notes: 'Baseload minimum' },
  { hour: 4, time: '04 AM', loadKw: 0.40, isPeak: false, notes: 'Early dawn' },
  { hour: 5, time: '05 AM', loadKw: 0.55, isPeak: false, notes: 'Early routine' },
  { hour: 6, time: '06 AM', loadKw: 1.85, isPeak: false, notes: 'Geyser & kitchen prep' },
  { hour: 7, time: '07 AM', loadKw: 2.40, isPeak: false, notes: 'Water heater, induction breakfast' },
  { hour: 8, time: '08 AM', loadKw: 1.60, isPeak: false, notes: 'Washing machine & prep' },
  { hour: 9, time: '09 AM', loadKw: 0.95, isPeak: false, notes: 'Workstation startup' },
  { hour: 10, time: '10 AM', loadKw: 0.85, isPeak: false, notes: 'Solar offset available' },
  { hour: 11, time: '11 AM', loadKw: 0.90, isPeak: false, notes: 'Solar offset available' },
  { hour: 12, time: '12 PM', loadKw: 1.35, isPeak: false, notes: 'Lunch prep / Afternoon AC start' },
  { hour: 13, time: '01 PM', loadKw: 1.75, isPeak: false, notes: 'Afternoon heat peak, AC cycling' },
  { hour: 14, time: '02 PM', loadKw: 1.80, isPeak: false, notes: 'Afternoon AC' },
  { hour: 15, time: '03 PM', loadKw: 1.45, isPeak: false, notes: 'Afternoon cooling' },
  { hour: 16, time: '04 PM', loadKw: 0.85, isPeak: false, notes: 'Moderate usage' },
  { hour: 17, time: '05 PM', loadKw: 1.10, isPeak: false, notes: 'Family return, lighting' },
  { hour: 18, time: '06 PM', loadKw: 2.65, isPeak: true, notes: '⚡ DISCOM Peak Hour Start - Lighting & TV' },
  { hour: 19, time: '07 PM', loadKw: 2.95, isPeak: true, notes: '⚡ Peak Hour - Cooking, Entertainment, Lighting' },
  { hour: 20, time: '08 PM', loadKw: 3.20, isPeak: true, notes: '⚡ Daily Peak - Dinner cooking, AC on, Full load' },
  { hour: 21, time: '09 PM', loadKw: 2.85, isPeak: true, notes: '⚡ Peak Hour - Bed prep & cooling' },
  { hour: 22, time: '10 PM', loadKw: 2.10, isPeak: false, notes: 'Peak ends, night transition' },
  { hour: 23, time: '11 PM', loadKw: 1.45, isPeak: false, notes: 'Night AC inverter mode' }
];

export const SMART_ENERGY_RULES = [
  {
    id: 'rule_ac_temp',
    title: 'Optimal AC Setpoint (+2°C rule)',
    impactKwh: 48,
    estimatedMonthlySavings: 410,
    difficulty: 'Instant (1-Click)',
    category: 'Climate',
    description: 'Increasing your AC set-point from 22°C to 24°C reduces compressor workload by 6% per degree without compromising comfort (Bureau of Energy Efficiency standard).',
    actionType: 'ADJUST_AC_TEMP',
    badge: 'High Impact'
  },
  {
    id: 'rule_peak_shift',
    title: 'Peak Load Shifting (6 PM – 10 PM)',
    impactKwh: 36,
    estimatedMonthlySavings: 335,
    difficulty: 'Easy (Schedule)',
    category: 'Automation',
    description: 'Avoid running high-wattage water geysers and heavy laundry washing during the 18:00 - 22:00 grid surcharge window.',
    actionType: 'SHIFT_SCHEDULE',
    badge: 'Tariff Saver'
  },
  {
    id: 'rule_phantom_power',
    title: 'Eliminate Phantom / Vampire Standby Drains',
    impactKwh: 26,
    estimatedMonthlySavings: 220,
    difficulty: 'Easy (1-Click)',
    category: 'Standby',
    description: 'Your Entertainment Center and Office PC draw 44W 24/7 in standby idle mode. Turn on Smart Eco Standby Cutoff when inactive.',
    actionType: 'CUT_PHANTOM',
    badge: 'Quick Win'
  },
  {
    id: 'rule_bldc_upgrade',
    title: 'Upgrade 2 Conventional Ceiling Fans to BLDC',
    impactKwh: 32,
    estimatedMonthlySavings: 280,
    difficulty: 'Hardware Upgrade',
    category: 'Appliance',
    description: 'Replacing two 70W induction motor fans with 28W 5-star BLDC fans saves over 60% energy. Estimated hardware payback period: 7.2 months.',
    actionType: 'UPGRADE_FAN',
    badge: 'Long-term ROI'
  },
  {
    id: 'rule_solar_pv',
    title: 'Rooftop Solar PV Net-Metering Simulation',
    impactKwh: 280,
    estimatedMonthlySavings: 2250,
    difficulty: 'Investment',
    category: 'Solar',
    description: 'A 2.5 kW rooftop solar PV installation generates ~10-12 units/day in your region, offsetting 80%+ of daytime grid consumption and exporting surplus.',
    actionType: 'TOGGLE_SOLAR',
    badge: 'Maximum Savings'
  }
];
