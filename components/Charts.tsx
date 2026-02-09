import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
  Line
} from 'recharts';
import { CalculationResult, StrategyType } from '../types';

interface Props {
  results: CalculationResult;
  strategy: StrategyType;
}

// Helper to format currency
const formatPLN = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return value.toFixed(0);
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: any;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const formatMoney = (val: number) => 
        new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(val);

    return (
      <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl text-sm z-50 font-sans">
        <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2">{`Miesiąc ${label}`}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between gap-6 items-center">
             <span className="text-slate-500 text-xs font-semibold uppercase">Saldo Standard</span>
             <span className="font-mono font-medium text-slate-700">{formatMoney(data.balanceStandard)}</span>
          </div>
          <div className="flex justify-between gap-6 items-center">
             <span className="text-emerald-600 text-xs font-semibold uppercase">Saldo z Nadpłatą</span>
             <span className="font-mono font-bold text-emerald-700">{formatMoney(data.balanceStrategy)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const PaymentTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const formatMoney = (val: number) => 
          new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(val);
  
      const total = payload.reduce((acc, entry) => acc + (entry.value || 0), 0);

      return (
        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl text-xs z-50 font-sans">
          <p className="font-bold text-slate-800 mb-2">{`Miesiąc ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between gap-4 mb-1 items-center">
               <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-slate-500">{entry.name}:</span>
               </div>
               <span className="font-medium font-mono">{formatMoney(entry.value)}</span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between gap-4 items-center font-bold text-slate-800">
             <span>Łącznie:</span>
             <span>{formatMoney(total)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

const YearlyTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const formatMoney = (val: number) => 
        new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(val);

    return (
      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl text-xs z-50 font-sans">
        <p className="font-bold text-slate-800 mb-2">{`Rok ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between gap-4 mb-1 items-center">
             <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-slate-500">{entry.name}:</span>
             </div>
             <span className="font-medium font-mono">{formatMoney(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ComparisonTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const formatMoney = (val: number) => 
          new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(val);
  
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl text-xs z-50 font-sans">
          <p className="font-bold text-slate-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between gap-4 mb-1 items-center">
               <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-slate-500">{entry.name}:</span>
               </div>
               <span className="font-medium font-mono">{formatMoney(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

const BalanceChart: React.FC<Props> = ({ results }) => {
  const chartData = results.monthlyData.filter((_, i) => i % 6 === 0 || i === results.monthlyData.length - 1);

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorStrategy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="month" 
            tick={{fontSize: 11, fill: '#94a3b8'}} 
            tickFormatter={(val) => `R${Math.ceil(val / 12)}`}
            minTickGap={30}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis 
            tick={{fontSize: 11, fill: '#94a3b8'}} 
            tickFormatter={formatPLN}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
          <Legend iconType="circle" verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
          <Area 
            type="monotone" 
            dataKey="balanceStandard" 
            name="Bez zmian" 
            stroke="#94a3b8" 
            fillOpacity={1} 
            fill="url(#colorStandard)" 
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="balanceStrategy" 
            name="Z Nadpłatą" 
            stroke="#059669" 
            fillOpacity={1} 
            fill="url(#colorStrategy)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const PaymentBreakdownChart: React.FC<Props> = ({ results }) => {
    // Correct data preparation: Separate base principal from overpayment to avoid double counting
    const chartData = results.monthlyData
      .filter((d, i) => (i % 6 === 0 || i === results.monthlyData.length - 1) && d.paymentStrategy > 0)
      .map(d => ({
        ...d,
        // The 'principalStrategy' in data usually includes the overpayment. 
        // We subtract it to get the "required" principal part for visualization stacking.
        principalBase: Math.max(0, d.principalStrategy - d.overpaymentAmount)
      }));
  
    return (
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
                <linearGradient id="gradPrincipal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4}/>
                </linearGradient>
                <linearGradient id="gradInterest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.4}/>
                </linearGradient>
                <linearGradient id="gradOverpayment" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.4}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              tick={{fontSize: 11, fill: '#94a3b8'}} 
              tickFormatter={(val) => `R${Math.ceil(val / 12)}`}
              minTickGap={30}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              tick={{fontSize: 11, fill: '#94a3b8'}} 
              tickFormatter={formatPLN}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<PaymentTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
            <Legend iconType="circle" verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
            
            {/* Order of stacking: Interest (Bottom), Principal Base (Middle), Overpayment (Top) */}
            <Area type="monotone" dataKey="interestStrategy" name="Odsetki" stackId="1" stroke="#ef4444" fill="url(#gradInterest)" />
            <Area type="monotone" dataKey="principalBase" name="Kapitał" stackId="1" stroke="#3b82f6" fill="url(#gradPrincipal)" />
            <Area type="monotone" dataKey="overpaymentAmount" name="Nadpłata" stackId="1" stroke="#10b981" fill="url(#gradOverpayment)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

const YearlyStructureChart: React.FC<Props> = ({ results }) => {
    const yearlyData = React.useMemo(() => {
        const years: Record<number, { year: number, interest: number, principal: number, overpayment: number }> = {};
        
        results.monthlyData.forEach(m => {
            if (m.balanceStrategy > 0 || m.paymentStrategy > 0) {
                const year = Math.ceil(m.month / 12);
                if (!years[year]) {
                    years[year] = { year, interest: 0, principal: 0, overpayment: 0 };
                }
                years[year].interest += m.interestStrategy;
                years[year].principal += m.principalStrategy;
                years[year].overpayment += m.overpaymentAmount;
            }
        });
        return Object.values(years);
    }, [results]);

    return (
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} stackOffset="sign">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="year" 
                tick={{fontSize: 11, fill: '#94a3b8'}} 
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                tick={{fontSize: 11, fill: '#94a3b8'}} 
                tickFormatter={formatPLN}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<YearlyTooltip />} cursor={{fill: '#f8fafc'}} />
              <Legend iconType="circle" verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
              <Bar dataKey="principal" name="Kapitał" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
              <Bar dataKey="interest" name="Odsetki" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
              {/* Optional: Add overpayment visualization in bar chart if needed, but it's part of principal in logic usually, visual separation is nice */}
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
};

const CostComparisonChart: React.FC<Props> = ({ results }) => {
  const data = [
    {
      name: 'Standard',
      interest: results.totalInterestStandard,
      principal: results.totalPrincipalStandard, 
      extras: 0,
    },
    {
      name: 'Strategia',
      interest: results.totalInterestStrategy,
      principal: results.totalPrincipalStrategy,
      extras: results.totalAnnexCost,
    }
  ];

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={60}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} 
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis 
            tick={{fontSize: 11, fill: '#94a3b8'}} 
            tickFormatter={formatPLN}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ComparisonTooltip />} cursor={{fill: '#f8fafc'}} />
          <Legend iconType="circle" verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
          <Bar dataKey="principal" name="Kapitał" stackId="a" fill="#cbd5e1" />
          <Bar dataKey="interest" name="Odsetki" stackId="a" fill="#ef4444" />
          <Bar dataKey="extras" name="Koszty dodatkowe" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Export memoized versions to prevent unnecessary re-renders
const BalanceChartMemo = React.memo(BalanceChart);
const PaymentBreakdownChartMemo = React.memo(PaymentBreakdownChart);
const YearlyStructureChartMemo = React.memo(YearlyStructureChart);
const CostComparisonChartMemo = React.memo(CostComparisonChart);

export { 
  BalanceChartMemo as BalanceChart,
  PaymentBreakdownChartMemo as PaymentBreakdownChart,
  YearlyStructureChartMemo as YearlyStructureChart,
  CostComparisonChartMemo as CostComparisonChart
};