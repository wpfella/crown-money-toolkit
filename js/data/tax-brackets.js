/**
 * Australian Income Tax Brackets
 * FY 2025-2026 (Stage 3 tax cuts applied)
 * Source: ATO
 */
const TaxData = {
  // Individual income tax brackets FY 2025-2026
  brackets: [
    { min: 0,      max: 18200,   rate: 0,    base: 0 },
    { min: 18201,  max: 45000,   rate: 16,   base: 0 },
    { min: 45001,  max: 135000,  rate: 30,   base: 4288 },
    { min: 135001, max: 190000,  rate: 37,   base: 31288 },
    { min: 190001, max: Infinity, rate: 45,   base: 51638 }
  ],

  // Medicare Levy
  medicareLevy: {
    rate: 2.0, // %
    lowIncomeThreshold: {
      single: 26000,
      family: 43846,
      shadeInRange: 8125 // phases in over this range
    }
  },

  // Medicare Levy Surcharge
  medicareSurcharge: [
    { min: 0,      max: 93000,  single: 0, family: 0 },
    { min: 93001,  max: 108000, single: 1.0, family: 1.0 },
    { min: 108001, max: 144000, single: 1.25, family: 1.25 },
    { min: 144001, max: Infinity, single: 1.5, family: 1.5 }
  ],

  // Low Income Tax Offset (LITO)
  lito: {
    maxOffset: 700,
    fullThreshold: 37500,
    phaseOutStart: 45000,
    phaseOutEnd: 66667,
    phaseOutRate: 5 // cents per dollar over phaseOutStart
  },

  // Calculate income tax
  calculate(taxableIncome, options = {}) {
    const income = Math.max(0, taxableIncome);
    let tax = 0;

    // Base tax from brackets
    for (const bracket of this.brackets) {
      if (income >= bracket.min && income <= bracket.max) {
        tax = bracket.base + ((income - bracket.min + (bracket.min > 0 ? 1 : 0)) * bracket.rate / 100);
        break;
      }
    }

    // LITO
    let lito = 0;
    if (income <= this.lito.fullThreshold) {
      lito = this.lito.maxOffset;
    } else if (income <= this.lito.phaseOutEnd) {
      lito = this.lito.maxOffset - ((income - this.lito.phaseOutStart) * this.lito.phaseOutRate / 100);
      lito = Math.max(0, lito);
    }

    // Medicare Levy
    let medicare = 0;
    const mlThreshold = this.medicareLevy.lowIncomeThreshold.single;
    if (income > mlThreshold) {
      medicare = income * this.medicareLevy.rate / 100;
    } else if (income > mlThreshold - this.medicareLevy.lowIncomeThreshold.shadeInRange) {
      medicare = (income - (mlThreshold - this.medicareLevy.lowIncomeThreshold.shadeInRange)) * 0.1;
    }

    // HECS/HELP repayment
    let hecs = 0;
    if (options.hecsDebt && options.hecsDebt > 0) {
      for (const tier of AU.HECS_THRESHOLDS) {
        if (income >= tier.min && income <= tier.max) {
          hecs = income * tier.rate / 100;
          break;
        }
      }
      hecs = Math.min(hecs, options.hecsDebt);
    }

    const incomeTax = Math.max(0, tax - lito);
    const totalTax = incomeTax + medicare;

    return {
      grossIncome: income,
      incomeTax: Math.round(incomeTax * 100) / 100,
      lito: Math.round(lito * 100) / 100,
      medicareLevy: Math.round(medicare * 100) / 100,
      hecsRepayment: Math.round(hecs * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      totalDeductions: Math.round((totalTax + hecs) * 100) / 100,
      netIncome: Math.round((income - totalTax - hecs) * 100) / 100,
      effectiveRate: income > 0 ? Math.round((totalTax / income) * 10000) / 100 : 0,
      marginalRate: this.getMarginalRate(income),
      weeklyNet: Math.round((income - totalTax - hecs) / 52 * 100) / 100,
      fortnightlyNet: Math.round((income - totalTax - hecs) / 26 * 100) / 100,
      monthlyNet: Math.round((income - totalTax - hecs) / 12 * 100) / 100
    };
  },

  getMarginalRate(income) {
    for (const bracket of this.brackets) {
      if (income >= bracket.min && income <= bracket.max) {
        return bracket.rate;
      }
    }
    return 45;
  }
};
