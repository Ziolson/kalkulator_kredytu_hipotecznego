import { CalculationResult, InputState, MonthlyData, StrategyType } from '../types';

export const calculatePMT = (principal: number, annualRate: number, months: number): number => {
  if (months <= 0) return 0;
  if (annualRate === 0) return principal / months;
  const monthlyRate = annualRate / 100 / 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
};

// Helper for currency rounding to 2 decimal places to avoid floating point errors
const round = (val: number) => Math.round(val * 100) / 100;

export const calculateMortgage = (inputs: InputState): CalculationResult => {
  const { 
    loanAmount, 
    interestRate, 
    monthsRemaining, 
    monthlyOverpayment, 
    strategy,
    insuranceMonthlyCost,
    insuranceDurationMonths,
    annexCost,
    annexRequiredForShortening
  } = inputs;

  // Guard clauses: Validate inputs before calculations
  if (loanAmount < 10000 || loanAmount > 10000000) {
    throw new Error('Kwota kredytu musi być w zakresie 10 000 - 10 000 000 PLN');
  }
  if (interestRate < 0.1 || interestRate > 20) {
    throw new Error('Oprocentowanie musi być w zakresie 0.1% - 20%');
  }
  if (monthsRemaining < 1 || monthsRemaining > 600) {
    throw new Error('Liczba rat musi być w zakresie 1 - 600 miesięcy');
  }
  if (monthlyOverpayment < 0 || monthlyOverpayment > 100000) {
    throw new Error('Nadpłata musi być w zakresie 0 - 100 000 PLN');
  }
  if (annexCost < 0 || annexCost > 10000) {
    throw new Error('Koszt aneksu musi być w zakresie 0 - 10 000 PLN');
  }

  const monthlyRate = interestRate / 100 / 12;
  const standardPMT = calculatePMT(loanAmount, interestRate, monthsRemaining);
  
  let balanceStandard = loanAmount;
  let balanceStrategy = loanAmount;
  
  const data: MonthlyData[] = [];
  
  let totalInterestStandard = 0;
  let totalInterestStrategy = 0;
  
  // Track accumulated principal precisely to ensure it sums to LoanAmount exactly
  let accumulatedPrincipalStandard = 0;
  let accumulatedPrincipalStrategy = 0;
  
  let runningCostStandard = 0;
  let runningCostStrategy = 0;
  let totalAnnexCost = 0;

  const maxMonths = monthsRemaining + 120; // safety buffer
  const smartFixedPayment = standardPMT + monthlyOverpayment;

  for (let m = 1; m <= maxMonths; m++) {
    // Round balances at start of iteration to avoid epsilon errors (e.g. 0.0000000001)
    // If balance is less than 1 grosz (0.01), treat as 0
    const currentBalanceStandard = balanceStandard < 0.01 ? 0 : balanceStandard;
    const currentBalanceStrategy = balanceStrategy < 0.01 ? 0 : balanceStrategy;

    // Break loop ONLY if both loans are fully paid off
    if (currentBalanceStandard === 0 && currentBalanceStrategy === 0) {
      break;
    }

    const currentInsurance = (m <= insuranceDurationMonths) ? insuranceMonthlyCost : 0;
    const isLastMonth = m === monthsRemaining;

    // --- Standard Path ---
    let interestStd = 0;
    let principalStd = 0;
    let paymentStd = 0;

    if (currentBalanceStandard > 0) {
      interestStd = round(currentBalanceStandard * monthlyRate);
      
      // Determine if this is the final payment
      // Check if balance + interest is close to or less than standard payment
      if (isLastMonth || (currentBalanceStandard + interestStd) <= (standardPMT + 0.1)) {
          // Final Payment: Pay exactly what's left
          principalStd = round(currentBalanceStandard);
          paymentStd = principalStd + interestStd;
          accumulatedPrincipalStandard = loanAmount; // Force complete payoff state
          balanceStandard = 0;
      } else {
          paymentStd = standardPMT;
          principalStd = round(paymentStd - interestStd);
          
          // Safety clamp for principal
          if (accumulatedPrincipalStandard + principalStd > loanAmount) {
             principalStd = round(loanAmount - accumulatedPrincipalStandard);
             accumulatedPrincipalStandard = loanAmount;
             balanceStandard = 0;
          } else {
             accumulatedPrincipalStandard += principalStd;
             balanceStandard = round(loanAmount - accumulatedPrincipalStandard);
          }
      }
      
      totalInterestStandard += interestStd;
      runningCostStandard += (paymentStd + currentInsurance);
    } else {
      // Standard path finished
      balanceStandard = 0;
      paymentStd = 0;
      interestStd = 0;
      principalStd = 0;
    }

    // --- Strategy Path ---
    let interestStrat = 0;
    let principalStrat = 0;
    let paymentStrat = 0;
    let currentAnnexCost = 0;
    let currentOverpaymentAmount = 0;

    if (currentBalanceStrategy > 0) {
      if (monthlyOverpayment === 0) {
        // Zero overpayment: match standard exactly logic-wise
        // We use standardPMT here to avoid floating-point drift caused by recalculating PMT every month
        interestStrat = round(currentBalanceStrategy * monthlyRate);
        paymentStrat = standardPMT;
        
        // Check final payment condition
        // CRITICAL FIX: Added isLastMonth check to ensure strategy path closes exactly when standard path does if no overpayment
        if (isLastMonth || (currentBalanceStrategy + interestStrat) <= (paymentStrat + 0.1)) {
            principalStrat = round(currentBalanceStrategy);
            paymentStrat = principalStrat + interestStrat;
            balanceStrategy = 0;
            accumulatedPrincipalStrategy = loanAmount;
        } else {
            principalStrat = round(paymentStrat - interestStrat);
             if (accumulatedPrincipalStrategy + principalStrat > loanAmount) {
                principalStrat = round(loanAmount - accumulatedPrincipalStrategy);
                accumulatedPrincipalStrategy = loanAmount;
                balanceStrategy = 0;
            } else {
                accumulatedPrincipalStrategy += principalStrat;
                balanceStrategy = round(loanAmount - accumulatedPrincipalStrategy);
            }
        }
        
        currentAnnexCost = 0;
        currentOverpaymentAmount = 0;

        totalInterestStrategy += interestStrat;
        runningCostStrategy += (paymentStrat + currentInsurance);

      } else {
        // Active Overpayment Strategy
        interestStrat = round(currentBalanceStrategy * monthlyRate);
        
        let targetPayment = 0;
        let requiredInstallment = 0;

        // 1. Determine Target Payment and Costs
        if (strategy === StrategyType.SHORTEN_TERM) {
          requiredInstallment = standardPMT;
          targetPayment = standardPMT + monthlyOverpayment;
          
          // Annex Cost Logic:
          if (annexRequiredForShortening && monthlyOverpayment > 0) {
              currentAnnexCost = annexCost;
          }
        
        } else if (strategy === StrategyType.LOWER_INSTALLMENT) {
          const remainingMonths = Math.max(1, monthsRemaining - m + 1);
          const requiredPMT = calculatePMT(currentBalanceStrategy, interestRate, remainingMonths);
          requiredInstallment = requiredPMT;
          targetPayment = requiredPMT + monthlyOverpayment;

        } else if (strategy === StrategyType.SMART_SNOWBALL) {
          const remainingMonths = Math.max(1, monthsRemaining - m + 1);
          const requiredPMT = calculatePMT(currentBalanceStrategy, interestRate, remainingMonths);
          requiredInstallment = requiredPMT;
          targetPayment = smartFixedPayment;
        }

        // 2. Calculate Principal
        // Check if this payment clears the debt
        const totalPendingDebt = currentBalanceStrategy + interestStrat;
        
        if (totalPendingDebt <= (targetPayment + 1.0)) { // 1.0 buffer for rounding diffs
            // Final Payment Strategy
            principalStrat = round(currentBalanceStrategy);
            paymentStrat = principalStrat + interestStrat;
            
            // Calculate strictly how much was "extra" vs required
            // In final month, required might be less than installment if debt is tiny
            currentOverpaymentAmount = Math.max(0, paymentStrat - (requiredInstallment < paymentStrat ? requiredInstallment : paymentStrat));
            
            accumulatedPrincipalStrategy = loanAmount; 
            balanceStrategy = 0;
        } else {
            // Normal month Strategy
            // Principal = Total Payment - Interest
            principalStrat = round(targetPayment - interestStrat);
            if (principalStrat < 0) principalStrat = 0;
            
            // Safety clamp
            if (accumulatedPrincipalStrategy + principalStrat > loanAmount) {
                principalStrat = round(loanAmount - accumulatedPrincipalStrategy);
                accumulatedPrincipalStrategy = loanAmount;
                balanceStrategy = 0;
            } else {
                accumulatedPrincipalStrategy += principalStrat;
                balanceStrategy = round(loanAmount - accumulatedPrincipalStrategy);
            }

            paymentStrat = principalStrat + interestStrat;
            
            // Overpayment is amount above required installment's principal part
            // Or simply Total Paid - Required Payment
            currentOverpaymentAmount = Math.max(0, paymentStrat - requiredInstallment);
        }

        totalInterestStrategy += interestStrat;
        totalAnnexCost += currentAnnexCost;
        runningCostStrategy += (paymentStrat + currentInsurance + currentAnnexCost);
      }

    } else {
      // Explicitly zero out if strategy is paid off
      balanceStrategy = 0;
      paymentStrat = 0;
      interestStrat = 0;
      principalStrat = 0;
      currentAnnexCost = 0;
      currentOverpaymentAmount = 0;
    }

    data.push({
      month: m,
      balanceStandard: Math.max(0, balanceStandard),
      balanceStrategy: Math.max(0, balanceStrategy),
      interestStandard: interestStd,
      interestStrategy: interestStrat,
      principalStandard: principalStd,
      principalStrategy: principalStrat,
      paymentStandard: paymentStd + currentInsurance,
      paymentStrategy: paymentStrat + currentInsurance + currentAnnexCost,
      insuranceCost: currentInsurance,
      overpaymentAmount: currentOverpaymentAmount,
      annexCost: currentAnnexCost
    });
  }

  // Calculate totals
  const totalMonthsStandard = data.filter(d => d.paymentStandard > 0.01).length;
  // Use filter > 0.01 to avoid counting "ghost" rows if any slipped through (though logic above should prevent it)
  const totalMonthsStrategy = data.filter(d => d.balanceStrategy > 0 || d.principalStrategy > 0).length;

  return {
    monthlyData: data,
    totalInterestStandard: round(totalInterestStandard),
    totalInterestStrategy: round(totalInterestStrategy),
    totalMonthsStandard,
    totalMonthsStrategy,
    totalCostStandard: round(runningCostStandard),
    totalCostStrategy: round(runningCostStrategy),
    firstInstallmentStandard: round(standardPMT + (insuranceDurationMonths > 0 ? insuranceMonthlyCost : 0)),
    totalAnnexCost: round(totalAnnexCost),
    totalPrincipalStandard: round(accumulatedPrincipalStandard), 
    totalPrincipalStrategy: round(accumulatedPrincipalStrategy)
  };
};