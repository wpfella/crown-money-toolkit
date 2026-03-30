/**
 * Australian Stamp Duty Rates by State/Territory
 * Last updated: FY 2025-2026
 * Sources: State Revenue Offices
 *
 * Each state has:
 *   brackets: [{min, max, base, rate}] - marginal rate brackets
 *   firstHome: [{min, max, base, rate}] or concession rules
 *   foreignSurcharge: percentage surcharge
 */
const StampDutyData = {
  NSW: {
    name: 'New South Wales',
    brackets: [
      { min: 0,       max: 16000,   base: 0,     rate: 1.25 },
      { min: 16001,   max: 35000,   base: 200,   rate: 1.50 },
      { min: 35001,   max: 93000,   base: 485,   rate: 1.75 },
      { min: 93001,   max: 351000,  base: 1500,  rate: 3.50 },
      { min: 351001,  max: 1168000, base: 10530, rate: 4.50 },
      { min: 1168001, max: 3505000, base: 47295, rate: 5.50 },
      { min: 3505001, max: Infinity, base: 175808, rate: 7.00 }
    ],
    firstHomeConcession: {
      threshold: 800000,      // Full exemption up to this
      phaseOutMax: 1000000,   // Concession phases out
      newBuildOnly: false
    },
    foreignSurcharge: 8.0
  },

  VIC: {
    name: 'Victoria',
    brackets: [
      { min: 0,       max: 25000,   base: 0,     rate: 1.40 },
      { min: 25001,   max: 130000,  base: 350,   rate: 2.40 },
      { min: 130001,  max: 960000,  base: 2870,  rate: 6.00 },
      { min: 960001,  max: 2000000, base: 52600, rate: 5.50 },
      { min: 2000001, max: Infinity, base: 110000, rate: 6.50 }
    ],
    firstHomeConcession: {
      threshold: 600000,
      phaseOutMax: 750000,
      newBuildOnly: false
    },
    foreignSurcharge: 8.0
  },

  QLD: {
    name: 'Queensland',
    brackets: [
      { min: 0,       max: 5000,    base: 0,    rate: 0.00 },
      { min: 5001,    max: 75000,   base: 0,    rate: 1.50 },
      { min: 75001,   max: 540000,  base: 1050, rate: 3.50 },
      { min: 540001,  max: 1000000, base: 17325, rate: 4.50 },
      { min: 1000001, max: Infinity, base: 38025, rate: 5.75 }
    ],
    firstHomeConcession: {
      threshold: 550000,
      phaseOutMax: 550000,
      newBuildOnly: false,
      fullExemption: true
    },
    foreignSurcharge: 7.0
  },

  SA: {
    name: 'South Australia',
    brackets: [
      { min: 0,       max: 12000,   base: 0,    rate: 1.00 },
      { min: 12001,   max: 30000,   base: 120,  rate: 2.00 },
      { min: 30001,   max: 50000,   base: 480,  rate: 3.00 },
      { min: 50001,   max: 100000,  base: 1080, rate: 3.50 },
      { min: 100001,  max: 200000,  base: 2830, rate: 4.00 },
      { min: 200001,  max: 250000,  base: 6830, rate: 4.25 },
      { min: 250001,  max: 300000,  base: 8955, rate: 4.75 },
      { min: 300001,  max: 500000,  base: 11330, rate: 5.00 },
      { min: 500001,  max: Infinity, base: 21330, rate: 5.50 }
    ],
    firstHomeConcession: {
      threshold: 0, // No stamp duty concession for first home in SA (FHOG instead)
      phaseOutMax: 0,
      newBuildOnly: true
    },
    foreignSurcharge: 7.0
  },

  WA: {
    name: 'Western Australia',
    brackets: [
      { min: 0,       max: 120000,  base: 0,     rate: 1.90 },
      { min: 120001,  max: 150000,  base: 2280,  rate: 2.85 },
      { min: 150001,  max: 360000,  base: 3135,  rate: 3.80 },
      { min: 360001,  max: 725000,  base: 11115, rate: 4.75 },
      { min: 725001,  max: Infinity, base: 28453, rate: 5.15 }
    ],
    firstHomeConcession: {
      threshold: 530000,
      phaseOutMax: 400000,
      newBuildOnly: false
    },
    foreignSurcharge: 7.0
  },

  TAS: {
    name: 'Tasmania',
    brackets: [
      { min: 0,       max: 3000,    base: 50,   rate: 0.00 },
      { min: 3001,    max: 25000,   base: 50,   rate: 1.75 },
      { min: 25001,   max: 75000,   base: 435,  rate: 2.25 },
      { min: 75001,   max: 200000,  base: 1560, rate: 3.50 },
      { min: 200001,  max: 375000,  base: 5935, rate: 4.00 },
      { min: 375001,  max: 725000,  base: 12935, rate: 4.25 },
      { min: 725001,  max: Infinity, base: 27810, rate: 4.50 }
    ],
    firstHomeConcession: {
      threshold: 400000,
      phaseOutMax: 400000,
      newBuildOnly: false,
      discount: 50 // 50% discount
    },
    foreignSurcharge: 8.0
  },

  NT: {
    name: 'Northern Territory',
    brackets: [
      // NT uses a formula-based calculation: D = (0.06571441 x V^2) + 15 where V = value/1000
      // Simplified to brackets for calculator purposes
      { min: 0,       max: 525000,  base: 0,     rate: 4.95, formula: true },
      { min: 525001,  max: 3000000, base: 0,     rate: 5.45, formula: true },
      { min: 3000001, max: Infinity, base: 0,     rate: 5.75, formula: true }
    ],
    firstHomeConcession: {
      threshold: 650000,
      phaseOutMax: 650000,
      newBuildOnly: false,
      discount: 100 // Full stamp duty concession
    },
    foreignSurcharge: 0 // NT has no foreign surcharge
  },

  ACT: {
    name: 'Australian Capital Territory',
    brackets: [
      { min: 0,       max: 200000,  base: 0,     rate: 1.20 },
      { min: 200001,  max: 300000,  base: 2400,  rate: 2.20 },
      { min: 300001,  max: 500000,  base: 4600,  rate: 3.40 },
      { min: 500001,  max: 750000,  base: 11400, rate: 4.32 },
      { min: 750001,  max: 1000000, base: 22200, rate: 5.90 },
      { min: 1000001, max: 1455000, base: 36950, rate: 6.40 },
      { min: 1455001, max: Infinity, base: 66070, rate: 7.00 }
    ],
    firstHomeConcession: {
      threshold: 1000000,
      phaseOutMax: 1000000,
      newBuildOnly: false,
      fullExemption: true
    },
    foreignSurcharge: 0 // ACT has no foreign surcharge currently
  }
};

// Calculate stamp duty for a given state and property value
function calculateStampDuty(state, propertyValue, isFirstHome = false, isForeign = false) {
  const stateData = StampDutyData[state];
  if (!stateData) return { duty: 0, error: 'Invalid state' };

  let duty = 0;
  const brackets = stateData.brackets;

  if (state === 'NT') {
    // NT uses formula
    const v = propertyValue / 1000;
    duty = (0.06571441 * v * v) + 15;
    duty = Math.max(0, duty);
  } else {
    for (const bracket of brackets) {
      if (propertyValue >= bracket.min && propertyValue <= bracket.max) {
        duty = bracket.base + ((propertyValue - bracket.min + 1) * bracket.rate / 100);
        break;
      }
    }
  }

  let firstHomeDiscount = 0;
  if (isFirstHome && stateData.firstHomeConcession) {
    const fhc = stateData.firstHomeConcession;
    if (fhc.fullExemption && propertyValue <= fhc.threshold) {
      firstHomeDiscount = duty;
    } else if (fhc.discount && propertyValue <= fhc.threshold) {
      firstHomeDiscount = duty * (fhc.discount / 100);
    } else if (propertyValue <= fhc.threshold) {
      firstHomeDiscount = duty;
    } else if (propertyValue <= fhc.phaseOutMax && fhc.phaseOutMax > fhc.threshold) {
      const ratio = (fhc.phaseOutMax - propertyValue) / (fhc.phaseOutMax - fhc.threshold);
      firstHomeDiscount = duty * Math.max(0, ratio);
    }
  }

  let foreignSurcharge = 0;
  if (isForeign) {
    foreignSurcharge = propertyValue * (stateData.foreignSurcharge / 100);
  }

  return {
    duty: Math.round(duty * 100) / 100,
    firstHomeDiscount: Math.round(firstHomeDiscount * 100) / 100,
    netDuty: Math.round((duty - firstHomeDiscount + foreignSurcharge) * 100) / 100,
    foreignSurcharge: Math.round(foreignSurcharge * 100) / 100,
    state: stateData.name
  };
}
