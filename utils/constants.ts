import { StrategyType } from '../types';

export const MORTGAGE_LIMITS = {
  LOAN_AMOUNT: {
    MIN: 10000,
    MAX: 10000000,
  },
  INTEREST_RATE: {
    MIN: 0.1,
    MAX: 20,
    STEP: 0.25,
  },
  MONTHS_REMAINING: {
    MIN: 1,
    MAX: 600,
    STEP: 1,
  },
  MONTHLY_OVERPAYMENT: {
    MIN: 0,
    MAX: 100000,
  },
  ANNEX_COST: {
    MIN: 0,
    MAX: 10000,
  },
};

export const DEFAULTS = {
  LOAN_AMOUNT: 400000,
  INTEREST_RATE: 7.5,
  MONTHS_REMAINING: 300,
  MONTHLY_OVERPAYMENT: 1000,
  STRATEGY: StrategyType.SMART_SNOWBALL,
  INSURANCE: {
    MONTHLY_COST: 0,
    DURATION_MONTHS: 36,
  },
  ANNEX: {
    COST: 200,
    REQUIRED_FOR_SHORTENING: true,
  },
};

export const PRESETS = {
  MONTHS: [
    { label: '15 lat', value: 180 },
    { label: '20 lat', value: 240 },
    { label: '25 lat', value: 300 },
    { label: '30 lat', value: 360 },
  ],
  OVERPAYMENT: [
    { label: '50 zł', value: 50 },
    { label: '100 zł', value: 100 },
    { label: '200 zł', value: 200 },
    { label: '500 zł', value: 500 },
    { label: '1000 zł', value: 1000 },
    { label: '2000 zł', value: 2000 },
    { label: '5000 zł', value: 5000 },
  ],
};
