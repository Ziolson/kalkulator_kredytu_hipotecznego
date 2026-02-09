export enum StrategyType {
  SHORTEN_TERM = 'SHORTEN_TERM',
  LOWER_INSTALLMENT = 'LOWER_INSTALLMENT',
  SMART_SNOWBALL = 'SMART_SNOWBALL'
}

export interface InputState {
  loanAmount: number;
  interestRate: number;
  monthsRemaining: number;
  monthlyOverpayment: number;
  strategy: StrategyType;
  // Additional costs
  insuranceMonthlyCost: number;
  insuranceDurationMonths: number;
  annexCost: number;
  annexRequiredForShortening: boolean;
}

export interface MonthlyData {
  month: number;
  balanceStandard: number;
  balanceStrategy: number;
  interestStandard: number;
  interestStrategy: number;
  principalStandard: number;
  principalStrategy: number;
  paymentStandard: number; // Principal + Interest + Insurance (if applicable)
  paymentStrategy: number; // Principal + Interest + Insurance + Overpayment (if applicable)
  insuranceCost: number;
  overpaymentAmount: number; // The specific amount paid extra towards principal this month
  annexCost: number; // The specific amount paid for bank annex this month
}

export interface CalculationResult {
  monthlyData: MonthlyData[];
  totalInterestStandard: number;
  totalInterestStrategy: number;
  totalMonthsStandard: number;
  totalMonthsStrategy: number;
  totalCostStandard: number;
  totalCostStrategy: number;
  firstInstallmentStandard: number;
  totalAnnexCost: number;
  totalPrincipalStandard: number;
  totalPrincipalStrategy: number;
}