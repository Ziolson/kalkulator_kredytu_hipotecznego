import React, { useState, useMemo, useEffect } from 'react';
import { InputState, CalculationResult } from '../types';
import { calculateMortgage } from '../utils/financials';
import { DEFAULTS } from '../utils/constants';

// Internal hook for debouncing logic
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface UseMortgageCalculatorReturn {
  inputs: InputState;
  setInputs: React.Dispatch<React.SetStateAction<InputState>>;
  results: CalculationResult;
  isCalculating: boolean;
  calculationError: string;
}

const EMPTY_RESULT: CalculationResult = {
  monthlyData: [],
  totalInterestStandard: 0,
  totalInterestStrategy: 0,
  totalMonthsStandard: 0,
  totalMonthsStrategy: 0,
  totalCostStandard: 0,
  totalCostStrategy: 0,
  firstInstallmentStandard: 0,
  totalAnnexCost: 0,
  totalPrincipalStandard: 0,
  totalPrincipalStrategy: 0,
};

export const useMortgageCalculator = (): UseMortgageCalculatorReturn => {
  const [inputs, setInputs] = useState<InputState>({
    loanAmount: DEFAULTS.LOAN_AMOUNT,
    interestRate: DEFAULTS.INTEREST_RATE,
    monthsRemaining: DEFAULTS.MONTHS_REMAINING,
    monthlyOverpayment: DEFAULTS.MONTHLY_OVERPAYMENT,
    strategy: DEFAULTS.STRATEGY,
    insuranceMonthlyCost: DEFAULTS.INSURANCE.MONTHLY_COST,
    insuranceDurationMonths: DEFAULTS.INSURANCE.DURATION_MONTHS,
    annexCost: DEFAULTS.ANNEX.COST,
    annexRequiredForShortening: DEFAULTS.ANNEX.REQUIRED_FOR_SHORTENING,
  });

  // Debounce the heavy calculation input to prevent chart jank while typing
  const calculatedInputs = useDebounce(inputs, 400);
  const [isCalculating, setIsCalculating] = useState(false);

  // Detect when inputs differ from calculated inputs to show loading state
  useEffect(() => {
    if (inputs !== calculatedInputs) {
      setIsCalculating(true);
    } else {
      setIsCalculating(false);
    }
  }, [inputs, calculatedInputs]);

  // Combined calculation and error handling to avoid double execution
  const { results, error: calculationError } = useMemo(() => {
    try {
      const data = calculateMortgage(calculatedInputs);
      return { results: data, error: '' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Błąd obliczeń';
      return { results: EMPTY_RESULT, error: message };
    }
  }, [calculatedInputs]);

  return {
    inputs,
    setInputs,
    results,
    isCalculating,
    calculationError 
  };
};
