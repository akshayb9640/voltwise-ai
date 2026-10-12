// Tariff Calculator - Accurate DISCOM Slab-based Bill Calculation Engine

/**
 * Calculates itemized electricity charges for a given consumption in kWh
 * @param {number} totalUnits - Total electricity consumed in kWh
 * @param {object} tariff - Tariff configuration with slabs, fixed charges, taxes
 * @param {number} solarOffsetUnits - Units offset by solar PV generation (if any)
 * @returns {object} Detailed breakdown of charges
 */
export function calculateBill(totalUnits, tariff, solarOffsetUnits = 0) {
  const effectiveUnits = Math.max(0, totalUnits - solarOffsetUnits);
  let remainingUnits = effectiveUnits;
  let energyCharges = 0;
  const slabBreakdown = [];
  let currentSlabIndex = 0;

  for (let i = 0; i < tariff.slabs.length; i++) {
    const slab = tariff.slabs[i];
    const slabCapacity = slab.max === Infinity ? Infinity : slab.max - slab.min;
    
    if (remainingUnits > 0) {
      const unitsInThisSlab = Math.min(remainingUnits, slabCapacity);
      const slabCost = unitsInThisSlab * slab.rate;
      energyCharges += slabCost;
      remainingUnits -= unitsInThisSlab;
      currentSlabIndex = i;

      slabBreakdown.push({
        ...slab,
        unitsInSlab: Math.round(unitsInThisSlab * 10) / 10,
        cost: Math.round(slabCost * 100) / 100,
        isFilled: remainingUnits > 0 && slab.max !== Infinity,
        isActive: remainingUnits <= 0 || slab.max === Infinity
      });
    } else {
      slabBreakdown.push({
        ...slab,
        unitsInSlab: 0,
        cost: 0,
        isFilled: false,
        isActive: false
      });
    }
  }

  // Fixed monthly charges based on connected/sanctioned load in kW
  const fixedCharges = Math.round((tariff.sanctionedLoadKw * tariff.fixedChargePerKw) * 100) / 100;

  // Fuel Adjustment Charge (FAC / FPPCA)
  const fuelSurcharge = Math.round((effectiveUnits * tariff.fuelAdjustmentChargePerKwh) * 100) / 100;

  // Subtotal for tax calculation
  const subtotalBeforeTax = energyCharges + fixedCharges + fuelSurcharge;

  // Electricity Duty / State Tax
  const electricityDuty = Math.round((subtotalBeforeTax * (tariff.electricityDutyPct / 100)) * 100) / 100;

  // Total Bill
  const totalBill = Math.round((subtotalBeforeTax + electricityDuty) * 100) / 100;

  // Effective average cost per unit
  const avgCostPerUnit = effectiveUnits > 0 ? Math.round((totalBill / effectiveUnits) * 100) / 100 : 0;

  // Marginal unit cost (rate of the current active slab)
  const currentSlab = tariff.slabs[currentSlabIndex] || tariff.slabs[tariff.slabs.length - 1];
  const marginalRate = currentSlab.rate;

  // Distance to next slab breach
  const unitsToNextSlab = currentSlab.max === Infinity ? Infinity : Math.max(0, currentSlab.max - effectiveUnits);
  const nextSlabRate = tariff.slabs[currentSlabIndex + 1] ? tariff.slabs[currentSlabIndex + 1].rate : null;

  return {
    effectiveUnits: Math.round(effectiveUnits * 10) / 10,
    solarOffsetUnits: Math.round(solarOffsetUnits * 10) / 10,
    energyCharges: Math.round(energyCharges * 100) / 100,
    fixedCharges,
    fuelSurcharge,
    electricityDuty,
    totalBill,
    avgCostPerUnit,
    marginalRate,
    unitsToNextSlab: unitsToNextSlab === Infinity ? null : Math.round(unitsToNextSlab * 10) / 10,
    nextSlabRate,
    currentSlabIndex,
    currentSlabName: currentSlab.label,
    slabBreakdown
  };
}

/**
 * Projects monthly bill based on Month-To-Date (MTD) progress and daily run-rate
 * @param {number} mtdUnits - Units consumed so far this month
 * @param {number} dayOfMonth - Current day of month (e.g. 18)
 * @param {number} daysInMonth - Total days in month (usually 30)
 * @param {number} activeHourlyKw - Current live load draw in kW
 * @param {object} tariff - Tariff config
 * @returns {object} Projection results with forecast units & cost
 */
export function projectMonthlyBill(mtdUnits, dayOfMonth, daysInMonth, activeHourlyKw, tariff, solarOffset = 0) {
  const daysRemaining = Math.max(1, daysInMonth - dayOfMonth);
  
  // Historical run-rate based on past days this month
  const pastDailyAvgUnits = mtdUnits / Math.max(1, dayOfMonth);
  
  // Real-time active devices adjustment factor: if user turned on heavy appliances, run-rate shifts
  // Baseline typical daily load is ~10-12 kWh
  const liveLoadEquivalentDaily = (activeHourlyKw * 8.5); // normalized active daily hours
  const weightedDailyRunRate = (pastDailyAvgUnits * 0.70) + (liveLoadEquivalentDaily * 0.30);

  // Projected remaining consumption
  const projectedRemainingUnits = weightedDailyRunRate * daysRemaining;
  const projectedTotalUnits = Math.round((mtdUnits + projectedRemainingUnits) * 10) / 10;

  // Calculate bill for projected units
  const projectedBill = calculateBill(projectedTotalUnits, tariff, solarOffset);

  // Calculate bill for current MTD only
  const currentMtdBill = calculateBill(mtdUnits, tariff, solarOffset);

  return {
    mtdUnits,
    projectedTotalUnits,
    projectedRemainingUnits: Math.round(projectedRemainingUnits * 10) / 10,
    dailyAvgUnits: Math.round(pastDailyAvgUnits * 10) / 10,
    projectedDailyUnits: Math.round(weightedDailyRunRate * 10) / 10,
    daysRemaining,
    currentMtdBill,
    projectedBill
  };
}
