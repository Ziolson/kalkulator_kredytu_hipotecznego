# Kalkulator Nadpłat Kredytu Hipotecznego

Aplikacja do symulacji nadpłat kredytu hipotecznego i obliczania oszczędności odsetkowych.

## Funkcjonalności

- Symulacja wpływu nadpłat na długość kredytu i koszty odsetkowe
- Wykresy przedstawiające:
  - Podział rat na kapitał i odsetki
  - Porównanie oszczędności przy różnych strategiach nadpłat
  - Wizualizacja ścieżki spłaty
- Konfiguracja parametrów:
  - Kwota kredytu i oprocentowanie
  - Okres spłaty
  - Wysokość i częstotliwość nadpłat
- Dashboard z wynikami obliczeń

## Technologie

- React + TypeScript
- Vite
- Recharts
- CSS Modules

## Wymagania

- Node.js w wersji 16 lub nowszej
- npm lub yarn

## Instalacja

```bash
# Sklonuj repozytorium
git clone <url-repozytorium>
cd kalkulator_kredytu_hipotecznego

# Zainstaluj zależności
npm install

# Uruchom serwer deweloperski
npm run dev

# Zbuduj wersję produkcyjną
npm run build
```

## Struktura projektu

```
kalkulator_kredytu_hipotecznego/
├── components/           # Komponenty React
│   ├── Charts.tsx       # Komponenty wykresów
│   ├── InputSection.tsx # Formularz parametrów kredytu
│   └── ResultsDashboard.tsx # Dashboard wyników
├── utils/               # Funkcje pomocnicze
│   └── financials.ts    # Obliczenia finansowe
├── App.tsx              # Główny komponent aplikacji
├── index.tsx            # Entry point
├── types.ts             # Definicje typów TypeScript
├── index.html           # Szablon HTML
├── vite.config.ts       # Konfiguracja Vite
├── tsconfig.json        # Konfiguracja TypeScript
└── package.json         # Zależności projektu
```

## Użycie

1. Wprowadź parametry kredytu (kwota, oprocentowanie, okres)
2. Ustaw kwotę nadpłaty miesięcznej
3. Aplikacja wyświetli:
   - Oszczędności na odsetkach
   - Skrócenie okresu spłaty
   - Wykresy spłaty

## Rozwój

Logika obliczeń znajduje się w `utils/financials.ts`.

## Licencja

MIT
