import type { CountryTaxRules, Currency } from '@/types'

export const TAX_RULES: Record<string, CountryTaxRules> = {
  IN: {
    selfEmploymentRate: 0,
    brackets: [
      { max: 300000,   rate: 0    },
      { max: 600000,   rate: 0.05 },
      { max: 900000,   rate: 0.10 },
      { max: 1200000,  rate: 0.15 },
      { max: 1500000,  rate: 0.20 },
      { max: Infinity, rate: 0.30 },
    ],
    currency: 'INR',
    quarterlyPayments: true,
    quarterDates: ['06-15', '09-15', '12-15', '03-15'],
  },
  US: {
    selfEmploymentRate: 0.1413,  // 15.3% SE tax, 50% is deductible
    brackets: [
      { max: 11600,    rate: 0.10 },
      { max: 47150,    rate: 0.12 },
      { max: 100525,   rate: 0.22 },
      { max: 191950,   rate: 0.24 },
      { max: 243725,   rate: 0.32 },
      { max: 609350,   rate: 0.35 },
      { max: Infinity, rate: 0.37 },
    ],
    currency: 'USD',
    quarterlyPayments: true,
    quarterDates: ['04-15', '06-17', '09-16', '01-15'],
  },
  GB: {
    selfEmploymentRate: 0,
    brackets: [
      { max: 12570,    rate: 0    },
      { max: 50270,    rate: 0.20 },
      { max: 125140,   rate: 0.40 },
      { max: Infinity, rate: 0.45 },
    ],
    currency: 'GBP',
    quarterlyPayments: false,
  },
  DE: {
    selfEmploymentRate: 0,
    brackets: [
      { max: 11604,    rate: 0    },
      { max: 17005,    rate: 0.14 },
      { max: 66760,    rate: 0.24 },
      { max: 277825,   rate: 0.42 },
      { max: Infinity, rate: 0.45 },
    ],
    currency: 'EUR',
    quarterlyPayments: true,
    quarterDates: ['03-10', '06-10', '09-10', '12-10'],
  },
  PT: {
    selfEmploymentRate: 0,
    brackets: [
      { max: 7703,     rate: 0.1325 },
      { max: 11623,    rate: 0.18   },
      { max: 16472,    rate: 0.23   },
      { max: 21321,    rate: 0.26   },
      { max: 27146,    rate: 0.3275 },
      { max: 39791,    rate: 0.37   },
      { max: 51997,    rate: 0.435  },
      { max: 81199,    rate: 0.45   },
      { max: Infinity, rate: 0.48   },
    ],
    currency: 'EUR',
    quarterlyPayments: false,
  },
  AU: {
    selfEmploymentRate: 0,
    brackets: [
      { max: 18200,    rate: 0    },
      { max: 45000,    rate: 0.19 },
      { max: 120000,   rate: 0.325},
      { max: 180000,   rate: 0.37 },
      { max: Infinity, rate: 0.45 },
    ],
    currency: 'AUD',
    quarterlyPayments: false,
  },
  CA: {
    selfEmploymentRate: 0.0990,
    brackets: [
      { max: 55867,    rate: 0.15  },
      { max: 111733,   rate: 0.205 },
      { max: 154906,   rate: 0.26  },
      { max: 220000,   rate: 0.29  },
      { max: Infinity, rate: 0.33  },
    ],
    currency: 'CAD',
    quarterlyPayments: false,
  },
  NL: {
    selfEmploymentRate: 0,
    brackets: [
      { max: 73031,    rate: 0.3693 },
      { max: Infinity, rate: 0.495  },
    ],
    currency: 'EUR',
    quarterlyPayments: false,
  },
  SG: {
    selfEmploymentRate: 0,
    brackets: [
      { max: 20000,    rate: 0    },
      { max: 30000,    rate: 0.02 },
      { max: 40000,    rate: 0.035},
      { max: 80000,    rate: 0.07 },
      { max: 120000,   rate: 0.115},
      { max: 160000,   rate: 0.15 },
      { max: 200000,   rate: 0.18 },
      { max: 320000,   rate: 0.19 },
      { max: 500000,   rate: 0.195},
      { max: 1000000,  rate: 0.20 },
      { max: Infinity, rate: 0.22 },
    ],
    currency: 'SGD',
    quarterlyPayments: false,
  },
}

export const SUPPORTED_COUNTRIES = Object.keys(TAX_RULES)

export const COUNTRY_NAMES: Record<string, string> = {
  IN: '🇮🇳 India',
  US: '🇺🇸 United States',
  GB: '🇬🇧 United Kingdom',
  DE: '🇩🇪 Germany',
  PT: '🇵🇹 Portugal',
  AU: '🇦🇺 Australia',
  CA: '🇨🇦 Canada',
  NL: '🇳🇱 Netherlands',
  SG: '🇸🇬 Singapore',
}

export const CURRENCY_FOR_COUNTRY: Record<string, Currency> = {
  IN: 'INR', US: 'USD', GB: 'GBP',
  DE: 'EUR', PT: 'EUR', AU: 'AUD',
  CA: 'CAD', NL: 'EUR', SG: 'SGD',
}
