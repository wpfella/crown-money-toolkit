/**
 * Australian Financial Constants
 * Last updated: FY 2025-2026
 */
const AU = {
  // Superannuation
  SUPER_GUARANTEE_RATE: 12.0, // % from 1 July 2025

  // Medicare
  MEDICARE_LEVY_RATE: 2.0, // %

  // Average property values by state (approximate, for reference)
  AVG_PROPERTY_PRICES: {
    NSW: 1100000,
    VIC: 800000,
    QLD: 750000,
    SA: 650000,
    WA: 620000,
    TAS: 560000,
    NT: 480000,
    ACT: 850000
  },

  // Average rental yields by state (% per annum)
  AVG_RENTAL_YIELDS: {
    NSW: 3.2,
    VIC: 3.5,
    QLD: 4.2,
    SA: 4.3,
    WA: 4.8,
    TAS: 4.5,
    NT: 5.8,
    ACT: 4.0
  },

  // Average council rates by state (per annum)
  AVG_COUNCIL_RATES: {
    NSW: 1800,
    VIC: 2000,
    QLD: 1900,
    SA: 1700,
    WA: 1800,
    TAS: 1500,
    NT: 2000,
    ACT: 2200
  },

  // Current benchmark rates
  RATES: {
    RBA_CASH_RATE: 4.10,
    AVG_VARIABLE_HOME_LOAN: 6.20,
    AVG_FIXED_2YR: 5.80,
    AVG_FIXED_3YR: 5.70,
    AVG_SAVINGS_ACCOUNT: 4.50,
    AVG_TERM_DEPOSIT_1YR: 4.60,
    CPI_ANNUAL: 3.6
  },

  // HELP/HECS repayment thresholds FY 2025-2026
  HECS_THRESHOLDS: [
    { min: 0,      max: 54435,  rate: 0 },
    { min: 54436,  max: 62850,  rate: 1.0 },
    { min: 62851,  max: 66620,  rate: 2.0 },
    { min: 66621,  max: 70618,  rate: 2.5 },
    { min: 70619,  max: 74855,  rate: 3.0 },
    { min: 74856,  max: 79346,  rate: 3.5 },
    { min: 79347,  max: 84107,  rate: 4.0 },
    { min: 84108,  max: 89154,  rate: 4.5 },
    { min: 89155,  max: 94503,  rate: 5.0 },
    { min: 94504,  max: 100174, rate: 5.5 },
    { min: 100175, max: 106185, rate: 6.0 },
    { min: 106186, max: 112556, rate: 6.5 },
    { min: 112557, max: 119309, rate: 7.0 },
    { min: 119310, max: 126467, rate: 7.5 },
    { min: 126468, max: 134056, rate: 8.0 },
    { min: 134057, max: 142100, rate: 8.5 },
    { min: 142101, max: 150626, rate: 9.0 },
    { min: 150627, max: 159663, rate: 9.5 },
    { min: 159664, max: Infinity, rate: 10.0 }
  ],

  // State/Territory names
  STATES: {
    NSW: 'New South Wales',
    VIC: 'Victoria',
    QLD: 'Queensland',
    SA: 'South Australia',
    WA: 'Western Australia',
    TAS: 'Tasmania',
    NT: 'Northern Territory',
    ACT: 'Australian Capital Territory'
  },

  // Lenders Mortgage Insurance approximate thresholds
  LMI_THRESHOLDS: [
    { lvr: 80, rate: 0 },
    { lvr: 85, rate: 0.75 },
    { lvr: 90, rate: 1.80 },
    { lvr: 95, rate: 3.50 }
  ]
};
