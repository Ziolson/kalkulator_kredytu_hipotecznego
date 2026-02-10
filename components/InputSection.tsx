import React, { useState, useEffect } from 'react';
import { InputState, StrategyType } from '../types';

interface Props {
  inputs: InputState;
  setInputs: React.Dispatch<React.SetStateAction<InputState>>;
}

interface SmartInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number;
  onValueChange: (val: number) => void;
  label: string;
  min?: number;
  max?: number;
  onValidationError?: (error: string) => void;
}

// Refined Input Component with Floating Label and Validation
const SmartInput: React.FC<SmartInputProps> = ({ 
  value, 
  onValueChange, 
  className, 
  label, 
  min, 
  max, 
  onValidationError,
  ...props 
}) => {
  const [localValue, setLocalValue] = useState<string>(value.toString());
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const currentNumeric = localValue === '' ? 0 : Number(localValue);
    if (currentNumeric !== value) {
      setLocalValue(value.toString());
    }
  }, [value, localValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    
    if (val === '') {
      onValueChange(0);
      setError('');
      return;
    }
    
    const parsed = Number(val);
    
    if (isNaN(parsed)) {
      setError('Nieprawidłowa wartość');
      onValidationError?.('Nieprawidłowa wartość');
      return;
    }
    
    if (min !== undefined && parsed < min) {
      const errorMsg = `Minimalna wartość: ${min.toLocaleString('pl-PL')}`;
      setError(errorMsg);
      onValidationError?.(errorMsg);
      // Still update the value to allow typing
      onValueChange(parsed);
      return;
    }
    
    if (max !== undefined && parsed > max) {
      const errorMsg = `Maksymalna wartość: ${max.toLocaleString('pl-PL')}`;
      setError(errorMsg);
      onValidationError?.(errorMsg);
      // Still update the value to allow typing
      onValueChange(parsed);
      return;
    }
    
    setError('');
    onValueChange(parsed);
  };

  const hasError = error !== '';
  const borderColor = hasError 
    ? 'border-red-300 ring-4 ring-red-500/10' 
    : isFocused 
      ? 'border-sky-500 ring-4 ring-sky-500/10 dark:ring-sky-500/20 bg-white dark:bg-slate-900' 
      : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700';

  return (
    <div>
      <div className={`relative transition-all duration-200 rounded-xl border ${borderColor}`}>
          <input
              {...props}
              value={localValue}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="block px-4 pb-2.5 pt-6 w-full text-lg font-bold text-slate-900 dark:text-slate-100 bg-transparent rounded-xl appearance-none focus:outline-none focus:ring-0 peer"
              placeholder=" "
              aria-invalid={hasError}
              aria-describedby={hasError ? `${label}-error` : undefined}
          />
          <label className={`absolute text-sm font-semibold duration-200 transform -translate-y-3 scale-75 top-4 left-4 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-slate-500 dark:peer-placeholder-shown:text-slate-400 peer-focus:scale-75 peer-focus:-translate-y-3 ${hasError ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400 peer-focus:text-sky-600 dark:peer-focus:text-sky-400'}`}>
              {label}
          </label>
      </div>
      {hasError && (
        <p 
          id={`${label}-error`}
          className="text-xs text-red-600 mt-1.5 ml-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200"
          role="alert"
        >
          <span className="material-symbols-rounded text-sm">error</span>
          {error}
        </p>
      )}
    </div>
  );
};

const StepperControl: React.FC<{
  onDecrement: () => void;
  onIncrement: () => void;
  children: React.ReactNode;
}> = ({ onDecrement, onIncrement, children }) => {
  return (
    <div className="flex items-center gap-1">
      <button 
        onClick={onDecrement}
        className="w-10 h-[62px] flex items-center justify-center bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all active:scale-95"
      >
        <span className="material-symbols-rounded">remove</span>
      </button>
      
      <div className="flex-1">
        {children}
      </div>

      <button 
        onClick={onIncrement}
        className="w-10 h-[62px] flex items-center justify-center bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all active:scale-95"
      >
        <span className="material-symbols-rounded">add</span>
      </button>
    </div>
  );
};

// Component for Preset Chips
const PresetOptions: React.FC<{
  options: { label: string; value: number }[];
  onSelect: (val: number) => void;
  currentValue: number;
}> = ({ options, onSelect, currentValue }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2 px-1">
      {options.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onSelect(opt.value)}
          className={`text-[11px] px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 border
            ${currentValue === opt.value 
              ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-700' 
              : 'bg-transparent text-slate-400 dark:text-slate-500 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

const InputSection: React.FC<Props> = ({ inputs, setInputs }) => {

  const handleChange = (field: keyof InputState, value: number | string | boolean) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const incrementValue = (field: keyof InputState, amount: number) => {
    const current = inputs[field] as number;
    const newVal = Math.round((current + amount) * 100) / 100;
    handleChange(field, newVal);
  };

  const getStrategyDescription = (strategy: StrategyType) => {
    switch (strategy) {
      case StrategyType.SHORTEN_TERM:
        return {
          title: "Skrócenie okresu",
          shortDesc: "Największe oszczędności odsetkowe.",
          fullDesc: "Cała nadpłata przeznaczana jest na spłatę kapitału, co drastycznie skraca czas kredytowania. Twoja rata pozostaje bez zmian, ale szybciej uwalniasz się od długu. Matematycznie najbardziej opłacalna opcja.",
          badge: "Największy zysk",
          badgeColor: "bg-emerald-100 text-emerald-700"
        };
      case StrategyType.LOWER_INSTALLMENT:
        return {
          title: "Niższa rata",
          shortDesc: "Większe bezpieczeństwo budżetu.",
          fullDesc: "Bank przelicza kredyt na nowo, zmniejszając Twoją comiesięczną ratę. Okres spłaty pozostaje ten sam. Wybierz tę opcję, jeśli Twoim priorytetem jest odzyskanie płynności finansowej i obniżenie miesięcznych kosztów życia.",
          badge: "Płynność",
          badgeColor: "bg-blue-100 text-blue-700"
        };
      case StrategyType.SMART_SNOWBALL:
        return {
          title: "Strategia Hybrydowa",
          shortDesc: "Optymalne połączenie obu metod.",
          fullDesc: "Formalnie wnioskujesz o zmniejszenie raty (dla bezpieczeństwa), ale utrzymujesz wysokość swoich wpłat na dotychczasowym poziomie. Dzięki temu spłacasz kredyt ekspresowo, a w razie problemów finansowych Twoja obowiązkowa rata jest niższa.",
          badge: "Rekomendowane",
          badgeColor: "bg-purple-100 text-purple-700"
        };
      default:
        return { title: "", shortDesc: "", fullDesc: "", badge: "", badgeColor: "" };
    }
  };

  const monthsPresets = [
    { label: '15 lat', value: 180 },
    { label: '20 lat', value: 240 },
    { label: '25 lat', value: 300 },
    { label: '30 lat', value: 360 },
  ];

  const overpaymentPresets = [
    { label: '50 zł', value: 50 },
    { label: '100 zł', value: 100 },
    { label: '200 zł', value: 200 },
    { label: '500 zł', value: 500 },
    { label: '1000 zł', value: 1000 },
    { label: '2000 zł', value: 2000 },
    { label: '5000 zł', value: 5000 },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-slate-200/60 dark:shadow-slate-950/60 border border-slate-100 dark:border-slate-700 flex flex-col gap-8 h-full transition-colors duration-300">
      <div className="flex items-center gap-3 pb-2">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
           <span className="material-symbols-rounded">tune</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">Parametry</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Twoja sytuacja</p>
        </div>
      </div>

      <div className="space-y-5">
        <SmartInput
            type="number"
            value={inputs.loanAmount}
            onValueChange={(val) => handleChange('loanAmount', val)}
            label="Kwota Kredytu (PLN)"
            min={10000}
            max={10000000}
        />

        <StepperControl
            onDecrement={() => incrementValue('interestRate', -0.25)}
            onIncrement={() => incrementValue('interestRate', 0.25)}
        >
            <SmartInput
                type="number"
                step="0.01"
                value={inputs.interestRate}
                onValueChange={(val) => handleChange('interestRate', val)}
                label="Oprocentowanie (%)"
                min={0.1}
                max={20}
            />
        </StepperControl>

        <div>
            <StepperControl
                onDecrement={() => incrementValue('monthsRemaining', -1)}
                onIncrement={() => incrementValue('monthsRemaining', 1)}
            >
                <SmartInput
                    type="number"
                    value={inputs.monthsRemaining}
                    onValueChange={(val) => handleChange('monthsRemaining', val)}
                    label="Pozostało rat"
                    min={1}
                    max={600}
                />
            </StepperControl>
            <PresetOptions 
                options={monthsPresets} 
                currentValue={inputs.monthsRemaining} 
                onSelect={(val) => handleChange('monthsRemaining', val)} 
            />
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Strategy Selector */}
      <div>
        <label className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wide mb-3 block px-1">Strategia nadpłacania</label>
        <div className="flex flex-col gap-3">
          {[StrategyType.SHORTEN_TERM, StrategyType.LOWER_INSTALLMENT, StrategyType.SMART_SNOWBALL].map((strat) => {
             const isSelected = inputs.strategy === strat;
             const info = getStrategyDescription(strat);
             // Special check if we need to show extra content inside the card
             const showAnnexConfig = isSelected && strat === StrategyType.SHORTEN_TERM;

             return (
                <div
                    key={strat}
                    onClick={() => handleChange('strategy', strat)}
                    className={`relative rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden
                    ${isSelected 
                        ? 'bg-white dark:bg-slate-700 border-emerald-500 dark:border-emerald-400 ring-1 ring-emerald-500 dark:ring-emerald-400 shadow-lg scale-[1.02] z-10' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                >
                    {/* Header Part */}
                    <div className="p-4 flex items-start gap-4">
                        <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'text-emerald-500' : 'text-slate-300'}`}>
                            <span className="material-symbols-rounded text-2xl">{isSelected ? 'check_circle' : 'radio_button_unchecked'}</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-wrap justify-between items-center mb-0.5 gap-2">
                                <div className={`text-sm font-bold ${isSelected ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                                    {info.title}
                                </div>
                                {isSelected && (
                                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full tracking-tight shrink-0 ${info.badgeColor}`}>
                                        {info.badge}
                                    </span>
                                )}
                            </div>
                            <div className={`text-xs ${isSelected ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                {info.shortDesc}
                            </div>
                        </div>
                    </div>

                    {/* Expandable Education & Config Part */}
                    <div 
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${isSelected ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                        <div className="px-4 pb-4 pt-0 pl-[3.5rem]">
                            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 border-l-2 border-emerald-100 dark:border-emerald-800 pl-3">
                                {info.fullDesc}
                            </p>

                            {/* Integrated Annex Configuration */}
                            {showAnnexConfig && (
                                <div 
                                  className="mt-4 pt-4 border-t border-emerald-50"
                                  onClick={(e) => e.stopPropagation()} // Prevent triggering card selection when interacting with inputs
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-1.5 text-emerald-800">
                                            <span className="material-symbols-rounded text-base">gavel</span>
                                            <span className="text-xs font-bold uppercase tracking-wide">Koszt aneksu</span>
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer relative z-20">
                                            <input 
                                                type="checkbox" 
                                                checked={inputs.annexRequiredForShortening}
                                                onChange={(e) => handleChange('annexRequiredForShortening', e.target.checked)}
                                                className="w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500 cursor-pointer"
                                            />
                                            <span className="text-xs font-semibold text-emerald-700">Wymagany</span>
                                        </label>
                                    </div>
                                    
                                    {inputs.annexRequiredForShortening && (
                                          <div className="animate-in fade-in zoom-in-95 duration-200">
                                              <SmartInput
                                                  type="number"
                                                  value={inputs.annexCost}
                                                  onValueChange={(val) => handleChange('annexCost', val)}
                                                  label="Koszt (PLN)"
                                                  className="bg-white border-emerald-200 focus:ring-emerald-500/20 text-sm py-2"
                                                  min={0}
                                                  max={10000}
                                              />
                                              <p className="text-[10px] text-emerald-600/70 mt-1.5 ml-1">
                                                  Opłata za aneks przy skróceniu okresu.
                                              </p>
                                          </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
             );
          })}
        </div>
      </div>

      {/* Overpayment Amount */}
      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-1 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
        <SmartInput
            type="number"
            value={inputs.monthlyOverpayment}
            onValueChange={(val) => handleChange('monthlyOverpayment', val)}
            label="Miesięczna Nadpłata (PLN)"
            className="bg-white border-transparent focus:ring-emerald-500/20"
            min={0}
            max={100000}
        />
        <PresetOptions 
          options={overpaymentPresets} 
          currentValue={inputs.monthlyOverpayment} 
          onSelect={(val) => handleChange('monthlyOverpayment', val)} 
        />
      </div>

    </div>
  );
};

export default React.memo(InputSection);