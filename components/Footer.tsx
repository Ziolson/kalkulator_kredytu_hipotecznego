import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-12">
          
          {/* Left Column: Brand & Copyright */}
          <div className="flex flex-col gap-6 md:max-w-xs shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-sky-800 to-sky-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-900/20">
                <span className="material-symbols-rounded text-xl">account_balance</span>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Nadpłata Hipoteki</span>
            </div>
            
            <p className="text-xs text-slate-400 dark:text-slate-500">
              &copy; {currentYear} Nadpłata Hipoteki.<br />Wszelkie prawa zastrzeżone.
            </p>
          </div>

          {/* Right Column: Legal Disclaimer */}
          <div className="flex-1">
             <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-widest mb-3">Nota Prawna</h3>
             <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-justify md:text-left">
              Wyniki prezentowane w kalkulatorze mają charakter wyłącznie poglądowy i nie stanowią oferty w rozumieniu przepisów Kodeksu Cywilnego. 
              Przedstawione symulacje opierają się na założeniach matematycznych i mogą różnić się od rzeczywistych wyliczeń banku ze względu na indywidualne warunki umowy, 
              zmienne oprocentowanie (WIBOR/WIRON), lata przestępne czy moment księgowania wpłat. 
              Właściciel serwisu nie ponosi odpowiedzialności za decyzje finansowe podjęte na podstawie wyników kalkulatora. 
              Przed podjęciem jakichkolwiek decyzji dotyczących kredytu hipotecznego zalecamy bezpośredni kontakt z bankiem lub niezależnym doradcą finansowym.
            </p>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
