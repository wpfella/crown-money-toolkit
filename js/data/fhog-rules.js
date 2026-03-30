/**
 * First Home Owner Grant (FHOG) Rules by State
 * Last updated: FY 2025-2026
 * Sources: State Revenue Offices
 */
const FHOGData = {
  NSW: {
    name: 'New South Wales',
    grantAmount: 10000,
    propertyValueCap: 600000, // new builds only
    newBuildOnly: true,
    eligibility: [
      'Must be an Australian citizen or permanent resident',
      'Must be 18 years or older',
      'Must not have previously owned property in Australia',
      'Must move in within 12 months and live there for at least 6 months',
      'Property value must not exceed $600,000',
      'Must be a new home (not previously occupied)'
    ],
    additionalSchemes: [
      { name: 'First Home Buyer Assistance Scheme', desc: 'Stamp duty exemption for properties up to $800,000; concession up to $1,000,000' },
      { name: 'Shared Equity Home Buyer Helper', desc: 'NSW Government contributes up to 40% of the purchase price for new homes' }
    ]
  },

  VIC: {
    name: 'Victoria',
    grantAmount: 10000,
    regionalBonus: 10000, // $20,000 total for regional VIC
    propertyValueCap: 750000,
    newBuildOnly: true,
    eligibility: [
      'Must be an Australian citizen or permanent resident',
      'Must be 18 years or older',
      'Must not have previously owned residential property in Australia',
      'Must live in the property for at least 12 months within the first year',
      'Property value must not exceed $750,000',
      'Must be a new home'
    ],
    additionalSchemes: [
      { name: 'First Home Buyer Duty Exemption', desc: 'Full exemption on properties up to $600,000; concession up to $750,000' },
      { name: 'Victorian Homebuyer Fund', desc: 'Shared equity scheme — government contributes up to 25% (40% for Aboriginal/Torres Strait Islanders)' }
    ]
  },

  QLD: {
    name: 'Queensland',
    grantAmount: 30000,
    propertyValueCap: 750000,
    newBuildOnly: true,
    eligibility: [
      'Must be an Australian citizen or permanent resident',
      'Must be 18 years or older',
      'Must not have previously received the grant or owned property used as a home',
      'Must move in within 1 year and live there for 6 continuous months',
      'Property value must not exceed $750,000',
      'Must be a new home'
    ],
    additionalSchemes: [
      { name: 'First Home Concession', desc: 'Transfer duty concession for homes up to $550,000 (home) or $400,000 (vacant land)' },
      { name: 'Regional FHOG Boost', desc: 'Additional boost may apply — check current QLD government website' }
    ]
  },

  SA: {
    name: 'South Australia',
    grantAmount: 15000,
    propertyValueCap: 650000,
    newBuildOnly: true,
    eligibility: [
      'Must be an Australian citizen or permanent resident',
      'Must be 18 years or older',
      'Must not have previously owned residential property in Australia',
      'Must occupy as principal place of residence for 6 continuous months within 12 months',
      'Property value must not exceed $650,000',
      'Must be a new home'
    ],
    additionalSchemes: [
      { name: 'No stamp duty on new homes', desc: 'No stamp duty for eligible first home buyers purchasing new homes up to $650,000 from Dec 2023' }
    ]
  },

  WA: {
    name: 'Western Australia',
    grantAmount: 10000,
    propertyValueCap: 750000,
    newBuildOnly: true,
    eligibility: [
      'Must be an Australian citizen or permanent resident',
      'Must be 18 years or older',
      'Must not have previously owned property in Australia after 1 July 2000',
      'Must occupy the property within 12 months of completion for at least 6 months',
      'Total value must not exceed $750,000 (property + land)',
      'Must be a new home or substantially renovated home'
    ],
    additionalSchemes: [
      { name: 'First Home Owner Rate of Duty', desc: 'Reduced stamp duty rate for first home buyers — properties up to $530,000' },
      { name: 'Keystart Home Loans', desc: 'Government-backed low-deposit home loans for eligible buyers' }
    ]
  },

  TAS: {
    name: 'Tasmania',
    grantAmount: 30000,
    propertyValueCap: Infinity, // No cap in TAS
    newBuildOnly: true,
    eligibility: [
      'Must be an Australian citizen or permanent resident',
      'Must be 18 years or older',
      'Must not have previously owned residential property in Australia',
      'Must occupy as principal residence for at least 6 months within 12 months',
      'No property value cap',
      'Must be a new home or build'
    ],
    additionalSchemes: [
      { name: '50% Stamp Duty Discount', desc: '50% stamp duty discount for first home buyers on properties up to $400,000' }
    ]
  },

  NT: {
    name: 'Northern Territory',
    grantAmount: 10000,
    buildBonus: 10000, // Additional $10,000 for building
    propertyValueCap: Infinity,
    newBuildOnly: false, // Can be existing homes
    eligibility: [
      'Must be an Australian citizen or permanent resident',
      'Must be 18 years or older',
      'Must not have previously owned residential property in Australia',
      'Must occupy as principal residence for at least 6 months',
      'No property value cap',
      'Can be a new or existing home'
    ],
    additionalSchemes: [
      { name: 'Territory Home Owner Discount', desc: 'Up to $18,601 stamp duty concession on principal place of residence' },
      { name: 'BuildBonus', desc: 'Additional $10,000 grant when building a new home' }
    ]
  },

  ACT: {
    name: 'Australian Capital Territory',
    grantAmount: 7000,
    propertyValueCap: 750000,
    newBuildOnly: true,
    eligibility: [
      'Must be an Australian citizen or permanent resident',
      'Must be 18 years or older',
      'Must not have previously owned residential property in Australia or received FHOG',
      'Must occupy for at least 1 year',
      'Property value must not exceed $750,000',
      'Must be a new or substantially renovated home'
    ],
    additionalSchemes: [
      { name: 'Home Buyer Concession Scheme', desc: 'Stamp duty concession for properties up to $1,000,000 — income thresholds apply' }
    ]
  }
};
