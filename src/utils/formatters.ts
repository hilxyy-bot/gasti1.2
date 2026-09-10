import { Category, Expense, Currency, CategoryAlert, AlertSettings, CapitalSourceType, LanguageCode } from '../types';
import { getLocalizedCapitalSource } from './categoryLocalization';

export function getCapitalLabel(
  type: CapitalSourceType | string = 'capital',
  customLabel?: string,
  language: string = 'es'
): string {
  return getLocalizedCapitalSource(type, customLabel, (language as LanguageCode) || 'es');
}

/**
 * Safely parses any user input amount into a number, accurately supporting
 * Colombian Peso (COP), Chilean Peso (CLP), and all currencies whether written with:
 * - Commas for thousands: "50,000" or "1,500,000" -> 50000 or 1500000
 * - Periods for thousands: "50.000" or "1.500.000" -> 50000 or 1500000
 * - Spanish decimal commas: "12,50" -> 12.50
 * - English decimal periods: "12.50" -> 12.50
 * - Bank exports ending with zero decimals: "50,000.00" or "50000,00" -> 50000
 */
export function parseCurrencyInput(
  value: string | number | undefined | null,
  currencyCode: string = 'COP'
): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }

  const raw = String(value).trim();
  if (!raw) return 0;

  // Remove currency symbols, spaces, or stray letters, keeping digits, dots, commas, minus
  let clean = raw.replace(/[^0-9.,\-]/g, '').trim();
  if (!clean || clean === '-') return 0;

  const code = (currencyCode || '').toUpperCase();
  const isZeroDecimal = ['COP', 'CLP', 'JPY', 'KRW', 'PYG', 'VND'].includes(code);

  if (isZeroDecimal) {
    // In zero-decimal currencies (like Colombian Peso COP):
    // If it ends with .00 or ,00 (e.g. "50,000.00" or "50.000,00")
    clean = clean.replace(/[,.]00$/, '');
    clean = clean.replace(/[,.]0$/, '');

    // In Colombian Peso and other zero-decimal currencies, all dots and commas are thousands separators!
    const digitsOnly = clean.replace(/[,.]/g, '');
    const parsed = parseFloat(digitsOnly);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Currencies with decimals (USD, EUR, MXN, ARS, etc.):
  const hasComma = clean.includes(',');
  const hasDot = clean.includes('.');

  if (hasComma && hasDot) {
    const lastComma = clean.lastIndexOf(',');
    const lastDot = clean.lastIndexOf('.');
    if (lastDot > lastComma) {
      // 1,234.56 -> commas are thousands, dot is decimal
      clean = clean.replace(/,/g, '');
    } else {
      // 1.234,56 -> dots are thousands, comma is decimal
      clean = clean.replace(/\./g, '').replace(',', '.');
    }
  } else if (hasComma && !hasDot) {
    const commaCount = (clean.match(/,/g) || []).length;
    if (commaCount > 1) {
      // 1,000,000 -> thousands
      clean = clean.replace(/,/g, '');
    } else {
      // Single comma: e.g. "12,50" or "50,000" or "15,5"
      const parts = clean.split(',');
      if (parts[1] && parts[1].length === 3 && parseInt(parts[0], 10) >= 1) {
        clean = clean.replace(',', '');
      } else {
        clean = clean.replace(',', '.');
      }
    }
  } else if (hasDot && !hasComma) {
    const dotCount = (clean.match(/\./g) || []).length;
    if (dotCount > 1) {
      clean = clean.replace(/\./g, '');
    } else {
      const parts = clean.split('.');
      if (parts[1] && parts[1].length === 3 && parseInt(parts[0], 10) >= 10) {
        clean = clean.replace('.', '');
      }
    }
  }

  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Filter user typing to only permit numbers, commas, and dots
 */
export function sanitizeAmountInput(val: string): string {
  return val.replace(/[^0-9.,]/g, '');
}

export function formatCurrency(amount: number, currency?: Currency): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const curr = currency || { code: 'USD', symbol: '$', name: 'US Dollar', position: 'prefix' as const };
  const code = (curr.code || '').toUpperCase();
  const isZeroDecimal = ['COP', 'CLP', 'JPY', 'KRW', 'PYG', 'VND'].includes(code);

  // In zero-decimal currencies (like Colombian Peso COP), omit cents completely.
  // In other currencies, show 2 decimals only if there is a cent amount.
  const hasCents = Math.abs(safeAmount % 1) > 0.001;
  const fractionDigits = isZeroDecimal ? 0 : (hasCents ? 2 : 0);

  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  }).format(safeAmount);

  return curr.position === 'prefix'
    ? `${curr.symbol} ${formattedNumber}`
    : `${formattedNumber} ${curr.symbol}`;
}

export function formatCompactCurrency(amount: number, currency?: Currency): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const curr = currency || { code: 'USD', symbol: '$', name: 'US Dollar', position: 'prefix' as const };
  const formattedNumber = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(safeAmount);

  return curr.position === 'prefix'
    ? `${curr.symbol} ${formattedNumber}`
    : `${formattedNumber} ${curr.symbol}`;
}

export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

export function formatMonthName(yearMonth: string): string {
  if (!yearMonth) return '';
  try {
    const parts = yearMonth.split('-');
    if (parts.length >= 2) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const date = new Date(year, month, 1);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
      }
    }
    return yearMonth;
  } catch {
    return yearMonth;
  }
}

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const date = new Date(y, m, d);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
    const fallbackDate = new Date(dateStr);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function calculateCategoryBudget(income: number, percentage: number): number {
  return ((income || 0) * (percentage || 0)) / 100;
}

export function calculateCategoryAlerts(
  categories: Category[],
  expenses: Expense[],
  income: number,
  settings?: AlertSettings
): CategoryAlert[] {
  if (!Array.isArray(categories)) return [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeIncome = typeof income === 'number' && !isNaN(income) ? income : 0;
  const warningThresh = settings?.warningThreshold ?? 80;
  const dangerThresh = settings?.dangerThreshold ?? 100;

  return categories.map((category) => {
    if (!category) return null as any;
    const categoryExpenses = safeExpenses.filter((e) => e && e.categoryId === category.id);
    const spent = categoryExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const budget = calculateCategoryBudget(safeIncome, category.percentage || 0);
    const percentageSpent = budget > 0 ? (spent / budget) * 100 : spent > 0 ? 999 : 0;
    const percentageOfIncome = safeIncome > 0 ? (spent / safeIncome) * 100 : 0;
    const overAmount = Math.max(0, spent - budget);

    let level: CategoryAlert['level'] = 'safe';
    let message = '';

    if (percentageSpent > dangerThresh) {
      level = 'exceeded';
      message = `Exceeded budget by ${overAmount.toFixed(2)} (${percentageSpent.toFixed(0)}% used)!`;
    } else if (percentageSpent >= 100) {
      level = 'limit';
      message = `Reached 100% of maximum budget allocation!`;
    } else if (percentageSpent >= warningThresh) {
      level = 'warning';
      message = `Approaching limit: ${percentageSpent.toFixed(0)}% consumed (${(budget - spent).toFixed(2)} left)`;
    } else {
      level = 'safe';
      message = `On track: ${(100 - percentageSpent).toFixed(0)}% budget remaining`;
    }

    return {
      categoryId: category.id || '',
      categoryName: category.name || '',
      color: category.color || '#10b981',
      icon: category.icon || 'HelpCircle',
      level,
      spent,
      budget,
      percentageSpent,
      percentageOfIncome,
      overAmount,
      message,
    };
  }).filter(Boolean);
}

export function generateCSV(expenses: Expense[], categories: Category[], currency: Currency): string {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const headers = ['Date', 'Category', 'Merchant / Title', 'Amount', 'Currency', 'Payment Method', 'Notes', 'Tags'];
  
  const rows = expenses.map((e) => [
    e.date,
    `"${categoryMap.get(e.categoryId) || 'Uncategorized'}"`,
    `"${e.merchant.replace(/"/g, '""')}"`,
    e.amount.toFixed(2),
    currency.code,
    `"${e.paymentMethod || 'Other'}"`,
    `"${(e.note || '').replace(/"/g, '""')}"`,
    `"${(e.tags || []).join(', ')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
