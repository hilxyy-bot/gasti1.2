import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Calendar, CheckCircle2, AlertTriangle, TrendingDown } from 'lucide-react';
import { Category, Expense, Currency, FinanceMode, CapitalSourceType } from '../types';
import { formatCurrency, getCapitalLabel } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface MonthlyStatusBarProps {
  currentYearMonth: string;
  income: number;
  totalSpent: number;
  categories: Category[];
  expenses: Expense[];
  currency: Currency;
  financeMode?: FinanceMode;
  onOpenAddExpense?: () => void;
  onOpenBudgetManager?: () => void;
  capitalType?: CapitalSourceType;
  capitalCustomLabel?: string;
}

export const MonthlyStatusBar: React.FC<MonthlyStatusBarProps> = ({
  currentYearMonth,
  income,
  totalSpent,
  currency,
  capitalType = 'capital',
  capitalCustomLabel = '',
}) => {
  const { language, formatMonth } = useLanguage();
  const isEs = language === 'es';
  const capitalTitle = getCapitalLabel(capitalType, capitalCustomLabel, language);

  // Calculate day progress in month
  const { totalDaysInMonth, currentDayNumber, monthProgressPercent } = useMemo(() => {
    const [yearStr, monthStr] = currentYearMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const isRealCurrent = today.getFullYear() === year && today.getMonth() + 1 === month;

    const dayNumber = isRealCurrent ? today.getDate() : 1;
    const progressPct = isRealCurrent
      ? Math.min(100, Math.max(0, Math.round((dayNumber / daysInMonth) * 100)))
      : 50;

    return {
      totalDaysInMonth: daysInMonth,
      currentDayNumber: dayNumber,
      monthProgressPercent: progressPct,
    };
  }, [currentYearMonth]);

  const spentPercent = income > 0 ? Math.round((totalSpent / income) * 100) : 0;
  const remainingCash = Math.max(0, income - totalSpent);
  const isOver = totalSpent > income;

  // Status badge config
  const statusInfo = useMemo(() => {
    if (income <= 0) {
      return {
        text: isEs ? 'Presupuesto en $0' : 'Budget at $0',
        badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
        barColor: 'bg-zinc-600',
        icon: Calendar,
      };
    }
    if (isOver) {
      return {
        text: isEs ? 'Presupuesto excedido' : 'Over budget',
        badgeColor: 'bg-rose-950/80 text-rose-300 border-rose-800',
        barColor: 'bg-rose-500',
        icon: AlertTriangle,
      };
    }
    if (spentPercent > 85) {
      return {
        text: isEs ? 'Cerca del límite' : 'Near limit',
        badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-800',
        barColor: 'bg-amber-500',
        icon: TrendingDown,
      };
    }
    return {
      text: isEs ? 'En buen camino' : 'On track',
      badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
      barColor: 'bg-emerald-500',
      icon: CheckCircle2,
    };
  }, [income, isOver, spentPercent, isEs]);

  const StatusIcon = statusInfo.icon;

  return (
    <div className="bg-zinc-900/90 rounded-xl p-3 sm:p-3.5 border border-zinc-800 shadow-sm">
      {/* Header: Month and Simple Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-emerald-950/70 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0">
            <Calendar className="w-3 h-3" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-white truncate capitalize">
              {formatMonth(currentYearMonth)}
            </h3>
            <p className="text-[10px] text-zinc-400 truncate">
              {isEs
                ? `Día ${currentDayNumber} de ${totalDaysInMonth} (${monthProgressPercent}% del mes)`
                : `Day ${currentDayNumber} of ${totalDaysInMonth} (${monthProgressPercent}% of month)`}
            </p>
          </div>
        </div>

        {/* Compact Status Pill */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${statusInfo.badgeColor}`}
        >
          <StatusIcon className="w-3 h-3" />
          <span>{statusInfo.text}</span>
        </div>
      </div>

      {/* Progress Bar with Month Reference Indicator */}
      <div className="space-y-1">
        <div className="relative h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
          {/* Spent Progress */}
          <motion.div
            className={`h-full rounded-full ${statusInfo.barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, spentPercent)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Labels below the bar */}
        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium">
          <span>
            {isEs ? 'Gastado:' : 'Spent:'}{' '}
            <strong className="text-zinc-200">{formatCurrency(totalSpent, currency)}</strong>{' '}
            <span className="text-zinc-500">({spentPercent}%)</span>
          </span>
          <span>
            {isEs ? 'Disponible:' : 'Remaining:'}{' '}
            <strong className={isOver ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
              {formatCurrency(remainingCash, currency)}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
