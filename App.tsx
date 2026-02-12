import React from 'react';
import InputSection from './components/InputSection';
import ResultsDashboard from './components/ResultsDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import { useDarkMode } from './hooks/useDarkMode';
import { useMortgageCalculator } from './hooks/useMortgageCalculator';

const App: React.FC = () => {
  const { theme, toggleTheme, isDark } = useDarkMode();
  const { inputs, setInputs, results, isCalculating, calculationError } = useMortgageCalculator();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-sky-100 selection:text-sky-900 dark:selection:bg-sky-900 dark:selection:text-sky-100 transition-colors duration-300">
      
      {/* Skip to main content link for keyboard users */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-sky-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
      >
        Przejdź do głównej treści
      </a>
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-50 transition-all duration-300" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-sky-800 to-sky-900 rounded-xl shadow-lg shadow-sky-900/20 flex items-center justify-center text-white" aria-hidden="true">
              <span className="material-symbols-rounded text-xl">account_balance</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight hidden sm:block">Kalkulator Nadpłat Kredytu Hipotecznego</h1>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight sm:hidden">Nadpłaty</h1>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:block" aria-label="Podtytuł aplikacji">Symulacja Kredytu Hipotecznego</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              aria-label={isDark ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'}
              title={isDark ? 'Tryb jasny' : 'Tryb ciemny'}
            >
              {isDark ? (
                <span className="material-symbols-rounded text-xl text-yellow-400">light_mode</span>
              ) : (
                <span className="material-symbols-rounded text-xl text-slate-700">dark_mode</span>
              )}
            </button>
            
            {isCalculating && (
               <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-3 py-1.5 rounded-full animate-pulse" role="status" aria-live="polite">
                  <span className="material-symbols-rounded text-sm animate-spin" aria-hidden="true">sync</span>
                  <span>Przeliczam...</span>
               </div>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full" role="main">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* Left Column: Inputs */}
          <section className="lg:col-span-4 lg:sticky lg:top-24 transition-all" aria-labelledby="input-section-heading">
            <h2 id="input-section-heading" className="sr-only">Parametry kredytu</h2>
            <InputSection inputs={inputs} setInputs={setInputs} />
            <div className="mt-6 text-center lg:text-left hidden lg:block" role="note" aria-label="Informacja prawna">
               <p className="text-xs text-slate-400">
                <span className="font-bold">Nota prawna:</span> Wyniki są symulacją matematyczną i mogą nieznacznie różnić się od wyliczeń banku.
               </p>
            </div>
          </section>

          {/* Right Column: Dashboard */}
          <section className="lg:col-span-8" aria-labelledby="results-section-heading">
             <h2 id="results-section-heading" className="sr-only">Wyniki symulacji</h2>
             <ResultsDashboard results={results} strategy={inputs.strategy} calculationError={calculationError} />
          </section>

        </div>
      </main>

      <Footer />

      {/* Floating CTA - Mobile Only mostly, but nice to have accessible */}
      <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-40 pointer-events-none lg:hidden" role="navigation" aria-label="Szybka nawigacja">
        <button 
          className="pointer-events-auto bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium py-3.5 px-6 rounded-full shadow-2xl shadow-slate-900/40 dark:shadow-slate-950/60 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 group backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-sky-500 focus:ring-offset-2"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Przewiń do góry strony i zmień parametry kredytu"
        >
          <span>Zmień parametry</span>
          <span className="material-symbols-rounded text-lg group-hover:-translate-y-0.5 transition-transform" aria-hidden="true">arrow_upward</span>
        </button>
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default App;