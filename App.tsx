import React, { useState, useMemo, useEffect } from 'react';
import InputSection from './components/InputSection';
import ResultsDashboard from './components/ResultsDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { calculateMortgage } from './utils/financials';
import { InputState, StrategyType } from './types';

// Custom hook for debouncing logic
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

const App: React.FC = () => {
  const [inputs, setInputs] = useState<InputState>({
    loanAmount: 400000,
    interestRate: 7.5,
    monthsRemaining: 300,
    monthlyOverpayment: 1000,
    strategy: StrategyType.SMART_SNOWBALL,
    // Defaults for additional costs
    insuranceMonthlyCost: 0,
    insuranceDurationMonths: 36, // Default 3 years
    annexCost: 200, // Typical bank fee
    annexRequiredForShortening: true,
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

  const results = useMemo(() => calculateMortgage(inputs), [inputs]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-24 font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-sky-800 to-sky-900 rounded-xl shadow-lg shadow-sky-900/20 flex items-center justify-center text-white">
              <span className="material-symbols-rounded text-xl">account_balance</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight hidden sm:block">Kalkulator Nadpłat</h1>
              <h1 className="text-lg font-bold text-slate-900 leading-tight sm:hidden">Nadpłaty</h1>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider hidden sm:block">Symulacja Kredytu Hipotecznego</p>
            </div>
          </div>
          {isCalculating && (
             <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-full animate-pulse">
                <span className="material-symbols-rounded text-sm animate-spin">sync</span>
                Przeliczam...
             </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 transition-all">
            <InputSection inputs={inputs} setInputs={setInputs} />
            <div className="mt-6 text-center lg:text-left">
               <p className="text-xs text-slate-400">
                <span className="font-bold">Nota prawna:</span> Wyniki są symulacją matematyczną i mogą nieznacznie różnić się od wyliczeń banku ze względu na dni księgowania, lata przestępne czy zmienne stopy procentowe (WIBOR/WIRON).
               </p>
            </div>
          </div>

          {/* Right Column: Dashboard */}
          <div className="lg:col-span-8">
             <ResultsDashboard results={results} strategy={inputs.strategy} />
          </div>

        </div>
      </main>

      {/* Floating CTA - Mobile Only mostly, but nice to have accessible */}
      <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-40 pointer-events-none">
        <button 
          className="pointer-events-auto bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 px-6 rounded-full shadow-2xl shadow-slate-900/40 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 group backdrop-blur-sm"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span>Zmień parametry</span>
          <span className="material-symbols-rounded text-lg group-hover:-translate-y-0.5 transition-transform">arrow_upward</span>
        </button>
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default App;