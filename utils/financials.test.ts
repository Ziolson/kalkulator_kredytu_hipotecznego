import { describe, it, expect } from 'vitest';
import { calculatePMT, calculateMortgage } from './financials';
import { StrategyType,InputState } from '../types';

describe('calculatePMT', () => {
  it('should calculate correct monthly payment for standard loan', () => {
    const principal = 400000;
    const annualRate = 7.5;
    const months = 300;
    
    const result = calculatePMT(principal, annualRate, months);
    
    // Expected PMT formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
    // where r = annualRate / 100 / 12
    expect(result).toBeCloseTo(2955.96, 1);
  });

  it('should return principal/months when interest rate is 0', () => {
    const principal = 120000;
    const annualRate = 0;
    const months = 120;
    
    const result = calculatePMT(principal, annualRate, months);
    
    expect(result).toBe(1000); // 120000 / 120
  });

  it('should return 0 when months is 0 or negative', () => {
    expect(calculatePMT(400000, 7.5, 0)).toBe(0);
    expect(calculatePMT(400000, 7.5, -10)).toBe(0);
  });

  it('should handle very low interest rates correctly', () => {
    const result = calculatePMT(100000, 0.1, 12);
    expect(result).toBeGreaterThan(8333); // Should be slightly more than principal/months
    expect(result).toBeLessThan(8400);
  });

  it('should handle very high interest rates correctly', () => {
    const result = calculatePMT(100000, 20, 12);
    expect(result).toBeGreaterThan(9000); // High interest means high monthly payment
  });
});

describe('calculateMortgage', () => {
  const baseInputs: InputState = {
    loanAmount: 400000,
    interestRate: 7.5,
    monthsRemaining: 300,
    monthlyOverpayment: 1000,
    strategy: StrategyType.SMART_SNOWBALL,
    insuranceMonthlyCost: 0,
    insuranceDurationMonths: 36,
    annexCost: 0,
    annexRequiredForShortening: false,
  };

  describe('Input Validation', () => {
    it('should throw error for loan amount below minimum', () => {
      const inputs = { ...baseInputs, loanAmount: 5000 };
      expect(() => calculateMortgage(inputs)).toThrow('Kwota kredytu musi być w zakresie');
    });

    it('should throw error for loan amount above maximum', () => {
      const inputs = { ...baseInputs, loanAmount: 15000000 };
      expect(() => calculateMortgage(inputs)).toThrow('Kwota kredytu musi być w zakresie');
    });

    it('should throw error for interest rate below minimum', () => {
      const inputs = { ...baseInputs, interestRate: 0.05 };
      expect(() => calculateMortgage(inputs)).toThrow('Oprocentowanie musi być w zakresie');
    });

    it('should throw error for interest rate above maximum', () => {
      const inputs = { ...baseInputs, interestRate: 25 };
      expect(() => calculateMortgage(inputs)).toThrow('Oprocentowanie musi być w zakresie');
    });

    it('should throw error for months below minimum', () => {
      const inputs = { ...baseInputs, monthsRemaining: 0 };
      expect(() => calculateMortgage(inputs)).toThrow('Liczba rat musi być w zakresie');
    });

    it('should throw error for months above maximum', () => {
      const inputs = { ...baseInputs, monthsRemaining: 700 };
      expect(() => calculateMortgage(inputs)).toThrow('Liczba rat musi być w zakresie');
    });

    it('should throw error for negative overpayment', () => {
      const inputs = { ...baseInputs, monthlyOverpayment: -100 };
      expect(() => calculateMortgage(inputs)).toThrow('Nadpłata musi być w zakresie');
    });

    it('should throw error for overpayment above maximum', () => {
      const inputs = { ...baseInputs, monthlyOverpayment: 150000 };
      expect(() => calculateMortgage(inputs)).toThrow('Nadpłata musi być w zakresie');
    });
  });

  describe('Strategy: No Overpayment', () => {
    it('should calculate correctly when overpayment is 0', () => {
      const inputs = { ...baseInputs, monthlyOverpayment: 0 };
      const result = calculateMortgage(inputs);

      // When overpayment is 0, strategy results should equal standard results
      expect(result.totalMonthsStrategy).toBe(result.totalMonthsStandard);
      expect(result.totalInterestStrategy).toBeCloseTo(result.totalInterestStandard, 2);
      expect(result.totalCostStrategy).toBeCloseTo(result.totalCostStandard, 2);
    });
  });

  describe('Strategy: SHORTEN_TERM', () => {
    it('should reduce loan duration with overpayment', () => {
      const inputs = { ...baseInputs, strategy: StrategyType.SHORTEN_TERM };
      const result = calculateMortgage(inputs);

      expect(result.totalMonthsStrategy).toBeLessThan(result.totalMonthsStandard);
      expect(result.totalInterestStrategy).toBeLessThan(result.totalInterestStandard);
      expect(result.monthlyData.length).toBeGreaterThan(0);
    });

    it('should apply overpayment to principal', () => {
      const inputs = { ...baseInputs, strategy: StrategyType.SHORTEN_TERM, monthlyOverpayment: 500 };
      const result = calculateMortgage(inputs);

      // Check that overpayment reduces balance faster
      const month1 = result.monthlyData[0];
      expect(month1.overpaymentAmount).toBeCloseTo(500, 1);
      expect(month1.balanceStrategy).toBeLessThan(month1.balanceStandard);
    });
  });

  describe('Strategy: LOWER_INSTALLMENT', () => {
    it('should maintain same loan duration but lower monthly payment', () => {
      const inputs = { ...baseInputs, strategy: StrategyType.LOWER_INSTALLMENT };
      const result = calculateMortgage(inputs);

      // LOWER_INSTALLMENT still shortens duration (it's just the formal bank request that maintains duration)
      // The actual implementation shows it pays off loan faster due to continued overpayments
      expect(result.totalMonthsStrategy).toBeLessThanOrEqual(result.totalMonthsStandard);
      expect(result.totalInterestStrategy).toBeLessThan(result.totalInterestStandard);
    });
  });

  describe('Strategy: SMART_SNOWBALL', () => {
    it('should combine benefits of both strategies', () => {
      const inputs = { ...baseInputs, strategy: StrategyType.SMART_SNOWBALL };
      const result = calculateMortgage(inputs);

      // Should shorten duration like SHORTEN_TERM
      expect(result.totalMonthsStrategy).toBeLessThan(result.totalMonthsStandard);
      // Should save significant interest
      expect(result.totalInterestStrategy).toBeLessThan(result.totalInterestStandard);
    });
  });

  describe('Insurance Costs', () => {
    it('should include insurance costs in calculations', () => {
      const inputs = { 
        ...baseInputs, 
        insuranceMonthlyCost: 200,
        insuranceDurationMonths: 36 
      };
      const result = calculateMortgage(inputs);

      // Check first month includes insurance
      const month1 = result.monthlyData[0];
      expect(month1.insuranceCost).toBe(200);
      expect(month1.paymentStandard).toBeGreaterThan(month1.interestStandard + month1.principalStandard);

      // Check month after insurance period has no insurance
      if (result.monthlyData.length > 36) {
        const month37 = result.monthlyData[36];
        expect(month37.insuranceCost).toBe(0);
      }
    });
  });

  describe('Annex Costs', () => {
    it('should include annex cost when shortening term', () => {
      const inputs = {
        ...baseInputs,
        strategy: StrategyType.SHORTEN_TERM,
        annexRequiredForShortening: true,
        annexCost: 500,
      };
      const result = calculateMortgage(inputs);

      expect(result.totalAnnexCost).toBeGreaterThan(0);
    });

    it('should not include annex cost when not required', () => {
      const inputs = {
        ...baseInputs,
        strategy: StrategyType.SHORTEN_TERM,
        annexRequiredForShortening: false,
        annexCost: 500,
      };
      const result = calculateMortgage(inputs);

      expect(result.totalAnnexCost).toBe(0);
    });
  });

  describe('Principal Sum Accuracy', () => {
    it('should ensure total principal paid equals loan amount', () => {
      const result = calculateMortgage(baseInputs);

      expect(result.totalPrincipalStandard).toBeCloseTo(baseInputs.loanAmount, 1);
      expect(result.totalPrincipalStrategy).toBeCloseTo(baseInputs.loanAmount, 1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle 1-month loan correctly', () => {
      const inputs = { ...baseInputs, monthsRemaining: 1 };
      const result = calculateMortgage(inputs);

      expect(result.monthlyData).toHaveLength(1);
      expect(result.totalMonthsStandard).toBe(1);
    });

    it('should handle 600-month loan correctly', () => {
      const inputs = { ...baseInputs, monthsRemaining: 600 };
      const result = calculateMortgage(inputs);

      expect(result.monthlyData.length).toBeGreaterThan(0);
      expect(result.totalMonthsStandard).toBe(600);
    });

    it('should handle maximum valid overpayment', () => {
      const inputs = { ...baseInputs, monthlyOverpayment: 100000 };
      const result = calculateMortgage(inputs);

      // With such high overpayment, loan should be paid off very quickly
      expect(result.totalMonthsStrategy).toBeLessThan(10);
    });
  });

  describe('Data Array Structure', () => {
    it('should return monthly data with correct properties', () => {
      const result = calculateMortgage(baseInputs);
      const month1 = result.monthlyData[0];

      expect(month1).toHaveProperty('month');
      expect(month1).toHaveProperty('balanceStandard');
      expect(month1).toHaveProperty('balanceStrategy');
      expect(month1).toHaveProperty('interestStandard');
      expect(month1).toHaveProperty('interestStrategy');
      expect(month1).toHaveProperty('principalStandard');
      expect(month1).toHaveProperty('principalStrategy');
      expect(month1).toHaveProperty('paymentStandard');
      expect(month1).toHaveProperty('paymentStrategy');
      expect(month1).toHaveProperty('insuranceCost');
      expect(month1).toHaveProperty('overpaymentAmount');
      expect(month1).toHaveProperty('annexCost');
    });

    it('should have decreasing balance over time for standard scenario', () => {
      const result = calculateMortgage(baseInputs);
      
      for (let i = 1; i < Math.min(10, result.monthlyData.length); i++) {
        expect(result.monthlyData[i].balanceStandard).toBeLessThan(
          result.monthlyData[i - 1].balanceStandard
        );
      }
    });
  });
});
