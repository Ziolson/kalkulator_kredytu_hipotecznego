# Kalkulator Nadpłat Kredytu Hipotecznego

Aplikacja typu Progressive Web App (PWA) służąca do symulacji nadpłat kredytu hipotecznego, dostępna pod adresem [nadplatahipoteki.pl](https://nadplatahipoteki.pl).

## Funkcjonalności

### Symulacje Finansowe

- Obliczanie wpływu nadpłat na całkowity koszt kredytu.
- Porównanie strategii spłaty: skrócenie okresu kredytowania vs. obniżenie raty miesięcznej.
- Generowanie harmonogramu spłaty z uwzględnieniem nadpłat.

### Progressive Web App (PWA)

- Aplikacja jest instalowalna na urządzeniach desktopowych i mobilnych.
- Obsługa trybu offline przy użyciu Service Workera i strategii cache'owania.
- Zgodność ze standardem PWA (manifest, ikony, service worker).

### Wizualizacja Danych

- Wykresy liniowe i słupkowe prezentujące strukturę spłaty kapitału i odsetek.
- Porównawcza wizualizacja kosztów całkowitych dla różnych scenariuszy.

## Stack Technologiczny

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **PWA**: vite-plugin-pwa, Workbox
- **Styling**: TailwindCSS
- **Wykresy**: Recharts

## Instalacja i Uruchomienie

Wymagane środowisko Node.js (v16+).

```bash
# Instalacja zależności
npm install

# Uruchomienie serwera deweloperskiego
npm run dev

# Budowanie wersji produkcyjnej
npm run build

# Podgląd wersji produkcyjnej (testowanie PWA)
npm run preview
```

## Struktura Projektu

- `src/components/` - Komponenty interfejsu użytkownika.
- `src/hooks/` - Logika biznesowa i stan aplikacji (Custom Hooks).
- `src/utils/` - Funkcje pomocnicze i algorytmy finansowe.
- `public/` - Zasoby statyczne, manifest PWA, ikony.
- `dist/` - Katalog wyjściowy procesu budowania.

## Licencja

MIT
