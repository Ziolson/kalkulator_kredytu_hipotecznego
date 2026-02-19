// Singleton formatter instance for PLN currency
const plnFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  maximumFractionDigits: 0,
});

/**
 * Formats a number as PLN currency (e.g., "1 234 zł").
 * Uses a cached Intl.NumberFormat instance for performance.
 */
export const formatCurrency = (value: number): string => {
  return plnFormatter.format(value);
};
