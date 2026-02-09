import React, { useState, useMemo } from 'react';
import { CalculationResult, StrategyType } from '../types';
import { BalanceChart, CostComparisonChart, YearlyStructureChart, PaymentBreakdownChart } from './Charts';

interface Props {
  results: CalculationResult;
  strategy: StrategyType;
  calculationError?: string;
}

const ResultsDashboard: React.FC<Props> = ({ results, strategy, calculationError }) => {
  const [activeTab, setActiveTab] = useState<'charts' | 'table'>('charts');

  // Calculate real savings
  let totalMoneySaved = results.totalCostStandard - results.totalCostStrategy;
  
  // Guard against tiny floating point discrepancies when overpayment is 0
  if (Math.abs(totalMoneySaved) < 1) {
    totalMoneySaved = 0;
  }
  
  const monthsSaved = results.totalMonthsStandard - results.totalMonthsStrategy;
  const yearsSaved = Math.floor(monthsSaved / 12);
  const remainingMonthsSaved = monthsSaved % 12;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(val);

  const getFutureDate = (monthsToAdd: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthsToAdd);
    const month = date.toLocaleString('pl-PL', { month: 'long' });
    const year = date.getFullYear();
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  };

  const dateStandard = getFutureDate(results.totalMonthsStandard);
  const dateStrategy = getFutureDate(results.totalMonthsStrategy);

  // Helper for Polish pluralization (declension)
  const getPolishForm = (count: number, forms: [string, string, string]) => {
    if (count === 1) return forms[0]; // np. rok, miesiąc
    const rem10 = count % 10;
    const rem100 = count % 100;
    // 2, 3, 4 except 12, 13, 14
    if (rem10 >= 2 && rem10 <= 4 && !(rem100 >= 12 && rem100 <= 14)) return forms[1]; // np. lata, miesiące
    return forms[2]; // np. lat, miesięcy
  };

  const yearsString = yearsSaved > 0 
    ? `${yearsSaved} ${getPolishForm(yearsSaved, ['rok', 'lata', 'lat'])}` 
    : '';

  const monthsString = remainingMonthsSaved > 0 
    ? `${remainingMonthsSaved} ${getPolishForm(remainingMonthsSaved, ['miesiąc', 'miesiące', 'miesięcy'])}` 
    : '';

  const savedTimeText = [yearsString, monthsString].filter(Boolean).join(' i ');

  // Generate Yearly Data for Table
  const yearlySchedule = useMemo(() => {
      const years: Record<number, { year: number, balanceEnd: number, interestPaid: number, principalPaid: number, totalPaid: number }> = {};
      
      results.monthlyData.forEach(m => {
          if (m.month <= results.totalMonthsStrategy) {
            const year = Math.ceil(m.month / 12);
            if (!years[year]) {
                years[year] = { year, balanceEnd: 0, interestPaid: 0, principalPaid: 0, totalPaid: 0 };
            }
            years[year].interestPaid += m.interestStrategy;
            years[year].principalPaid += m.principalStrategy;
            years[year].totalPaid += m.paymentStrategy;
            years[year].balanceEnd = m.balanceStrategy; // Will effectively be the last month's balance
          }
      });
      return Object.values(years);
  }, [results]);

  // Show error message if validation failed
  if (calculationError) {
    return (
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-rounded text-4xl text-red-600">error</span>
          </div>
          <h3 className="text-lg font-bold text-red-900 mb-2">Nieprawidłowe dane</h3>
          <p className="text-red-700">{calculationError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* KPI Cards Section - Grid cols 8 allows for a 5/8 (62.5%) and 3/8 (37.5%) split */}
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
          {/* Main Savings Card */}
          <div className="md:col-span-5 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
                  <span className="material-symbols-rounded text-[140px]">savings</span>
              </div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                      <h2 className="text-emerald-100 font-medium text-xs uppercase tracking-wider mb-1">Twoje oszczędności</h2>
                      <div className="text-4xl lg:text-5xl font-bold tracking-tight mb-2">
                        {formatCurrency(totalMoneySaved)}
                      </div>
                      <p className="text-emerald-100/80 text-sm font-medium">Tyle zostanie w Twojej kieszeni dzięki nadpłatom.</p>
                  </div>
                  <div className="mt-6 flex items-center gap-2">
                      <span className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-1 text-xs font-semibold text-white border border-white/20">
                          Stopa zwrotu {results.totalCostStandard > 0 ? ((totalMoneySaved / results.totalCostStandard) * 100).toFixed(0) : 0}%
                      </span>
                      {results.totalAnnexCost > 0 && (
                        <span className="bg-emerald-800/30 backdrop-blur-md rounded-lg px-3 py-1 text-xs font-medium text-emerald-100 border border-emerald-500/20 flex items-center gap-1">
                            <span className="material-symbols-rounded text-[10px]">gavel</span>
                            Uwzględniono aneksy: {formatCurrency(results.totalAnnexCost)}
                        </span>
                      )}
                  </div>
              </div>
          </div>

          {/* Financial Freedom Card */}
          <div className="md:col-span-3 bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 flex flex-col justify-between relative overflow-hidden">
             {/* Decorative blob */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-3xl -mr-6 -mt-6 pointer-events-none opacity-50"></div>
             
             <div className="relative z-10">
                 {/* Header - Reduced margin and icon size */}
                 <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center shrink-0">
                         <span className="material-symbols-rounded text-xl">event_available</span>
                     </div>
                     <span className="text-slate-900 font-bold text-xs uppercase tracking-wider">
                        Wolność finansowa
                     </span>
                 </div>

                 {/* Dates - Reduced size slightly to prevent height blowup */}
                 <div>
                    <h3 className="text-slate-900 font-bold text-3xl leading-tight mb-0.5">
                        {dateStrategy}
                    </h3>
                    {monthsSaved > 0 && (
                        <p className="text-slate-400 font-medium text-sm line-through decoration-slate-300 decoration-2">
                            {dateStandard}
                        </p>
                    )}
                 </div>
             </div>

             {/* Footer - Reduced margin */}
             <div className="relative z-10 mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
                <span className={`material-symbols-rounded text-xl ${monthsSaved > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {monthsSaved > 0 ? 'history_toggle_off' : 'event'}
                </span>
                <span className={`font-bold text-sm whitespace-nowrap ${monthsSaved > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {monthsSaved > 0 ? `Szybciej o ${savedTimeText}` : 'Standardowy okres spłaty'}
                </span>
             </div>
          </div>
      </div>

      {/* Content Tabs */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-100">
              <button 
                onClick={() => setActiveTab('charts')}
                className={`flex-1 py-4 text-sm font-bold text-center transition-colors relative ${activeTab === 'charts' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              >
                  Wizualizacja
                  {activeTab === 'charts' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-500 rounded-t-full"></div>}
              </button>
              <button 
                onClick={() => setActiveTab('table')}
                className={`flex-1 py-4 text-sm font-bold text-center transition-colors relative ${activeTab === 'table' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              >
                  Harmonogram roczny
                  {activeTab === 'table' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-500 rounded-t-full"></div>}
              </button>
          </div>

          <div className="p-6 lg:p-8 min-h-[400px]">
            {activeTab === 'charts' ? (
                <div className="space-y-12 animate-in fade-in duration-300">
                     {/* Chart 1: Balance */}
                     <div>
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Saldo zadłużenia</h3>
                            <p className="text-sm text-slate-500">Jak szybko znika Twój dług w porównaniu do standardowej spłaty.</p>
                        </div>
                        <BalanceChart results={results} strategy={strategy} />
                     </div>

                    {/* Chart 2: Monthly Payment Composition */}
                     <div className="border-t border-slate-100 pt-10">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Składniki miesięcznej raty</h3>
                            <p className="text-sm text-slate-500">Zobacz jak nadpłata (zielony) zmniejsza udział odsetek (czerwony) w czasie.</p>
                        </div>
                        <PaymentBreakdownChart results={results} strategy={strategy} />
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 border-t border-slate-100 pt-10">
                        <div>
                             <h3 className="text-lg font-bold text-slate-800 mb-2">Struktura rat (Rocznie)</h3>
                             <p className="text-sm text-slate-500 mb-6">Suma płatności w podziale na kapitał i odsetki.</p>
                             <YearlyStructureChart results={results} strategy={strategy} />
                        </div>
                        <div>
                             <h3 className="text-lg font-bold text-slate-800 mb-2">Porównanie kosztów</h3>
                             <p className="text-sm text-slate-500 mb-6">Całkowita kwota do oddania bankowi.</p>
                             <CostComparisonChart results={results} strategy={strategy} />
                        </div>
                     </div>
                </div>
            ) : (
                <div className="animate-in fade-in duration-300">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-3 font-semibold rounded-tl-lg">Rok</th>
                                    <th className="px-4 py-3 font-semibold text-right">Wpłacono łącznie</th>
                                    <th className="px-4 py-3 font-semibold text-right text-red-500">Odsetki</th>
                                    <th className="px-4 py-3 font-semibold text-right text-blue-600">Kapitał</th>
                                    <th className="px-4 py-3 font-semibold text-right rounded-tr-lg">Saldo końcowe</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {yearlySchedule.map((row) => (
                                    <tr key={row.year} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-bold text-slate-700">{row.year}</td>
                                        <td className="px-4 py-3 text-right font-medium text-slate-600">{formatCurrency(row.totalPaid)}</td>
                                        <td className="px-4 py-3 text-right font-medium text-red-500">{formatCurrency(row.interestPaid)}</td>
                                        <td className="px-4 py-3 text-right font-medium text-blue-600">{formatCurrency(row.principalPaid)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-800">{formatCurrency(row.balanceEnd)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-50 border-t border-slate-200">
                                <tr>
                                    <td className="px-4 py-3 font-bold text-slate-800">SUMA</td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-800">{formatCurrency(results.totalCostStrategy)}</td>
                                    <td className="px-4 py-3 text-right font-bold text-red-600">{formatCurrency(results.totalInterestStrategy)}</td>
                                    <td className="px-4 py-3 text-right font-bold text-blue-700">{formatCurrency(results.totalPrincipalStrategy)}</td>
                                    <td className="px-4 py-3 text-right text-slate-400">-</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
          </div>
      </div>
      
       {/* Summary Footer */}
       <div className="text-center text-xs text-slate-400 pb-4">
            <p>Obliczenia mają charakter orientacyjny.</p>
       </div>
    </div>
  );
};

export default ResultsDashboard;