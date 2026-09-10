import React, { useState, useEffect } from 'react';
import {
  Wallet,
  PieChart as PieChartIcon,
  TrendingDown,
  Sparkles,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Coins,
  Calendar,
  Plus,
  MinusCircle,
} from 'lucide-react';
import { Currency, CapitalSourceType } from '../types';
import { formatCurrency, getCapitalLabel, parseCurrencyInput, sanitizeAmountInput } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedCapitalSource } from '../utils/categoryLocalization';
import { motion } from 'motion/react';

interface OverviewCardsProps {
  income: number;
  onUpdateIncome: (newIncome: number) => void;
  baseCapital?: number;
  additionsTotal?: number;
  additionsCount?: number;
  onOpenAddCapital?: (initialTab?: 'add' | 'reduce' | 'base' | 'history') => void;
  totalAllocatedPercentage: number;
  totalAllocatedAmount: number;
  totalSpent: number;
  currency: Currency;
  currentYearMonth: string;
  financeMode?: 'personal' | 'business';
  onOpenBudgetManager: () => void;
  capitalType?: CapitalSourceType;
  capitalCustomLabel?: string;
  onUpdateCapitalSource?: (type: CapitalSourceType, customLabel?: string) => void;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  income,
  onUpdateIncome,
  baseCapital,
  additionsTotal = 0,
  additionsCount = 0,
  onOpenAddCapital,
  totalAllocatedPercentage,
  totalAllocatedAmount,
  totalSpent,
  currency,
  currentYearMonth,
  financeMode = 'personal',
  onOpenBudgetManager,
  capitalType = 'capital',
  capitalCustomLabel = '',
  onUpdateCapitalSource,
}) => {
  const { t, language } = useLanguage();
  const isBusiness = financeMode === 'business';
  const isEs = language === 'es';
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [tempIncome, setTempIncome] = useState(income.toString());
  const [selectedType, setSelectedType] = useState<CapitalSourceType>(capitalType);
  const [tempCustomLabel, setTempCustomLabel] = useState(capitalCustomLabel);

  useEffect(() => {
    setSelectedType(capitalType);
  }, [capitalType]);

  useEffect(() => {
    setTempCustomLabel(capitalCustomLabel);
  }, [capitalCustomLabel]);

  const handleSaveIncome = () => {
    const parsed = parseCurrencyInput(tempIncome, currency.code);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateIncome(parsed);
      if (onUpdateCapitalSource) {
        onUpdateCapitalSource(selectedType, selectedType === 'custom' ? tempCustomLabel : undefined);
      }
      setIsEditingIncome(false);
    }
  };

  const handleCancelIncome = () => {
    setTempIncome(income.toString());
    setSelectedType(capitalType);
    setTempCustomLabel(capitalCustomLabel);
    setIsEditingIncome(false);
  };

  const capitalTitle = getCapitalLabel(capitalType, capitalCustomLabel, language);

  const remainingIncome = Math.max(0, income - totalSpent);
  const isNetOverbudget = totalSpent > income;
  const netOverAmount = isNetOverbudget ? totalSpent - income : 0;
  const percentageSpentOfIncome = income > 0 ? (totalSpent / income) * 100 : 0;
  const unallocatedAmount = Math.max(0, income - totalAllocatedAmount);

  const [year, month] = currentYearMonth.split('-');
  const daysInMonth = new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate();
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === parseInt(year, 10) && today.getMonth() + 1 === parseInt(month, 10);
  const currentDay = isCurrentMonth ? today.getDate() : 1;
  const daysLeft = Math.max(1, daysInMonth - currentDay + 1);
  const dailyAllowance = remainingIncome > 0 ? remainingIncome / daysLeft : 0;

  const capitalTypesList: { id: CapitalSourceType; label: string; icon: string }[] = [
    { id: 'capital', label: getLocalizedCapitalSource('capital', undefined, language), icon: '🏦' },
    { id: 'salary', label: getLocalizedCapitalSource('salary', undefined, language), icon: '💵' },
    { id: 'investment', label: getLocalizedCapitalSource('investment', undefined, language), icon: '📈' },
    { id: 'project', label: getLocalizedCapitalSource('project', undefined, language), icon: '🚀' },
    { id: 'extra', label: getLocalizedCapitalSource('extra', undefined, language), icon: '🎁' },
    { id: 'custom', label: getLocalizedCapitalSource('custom', isEs ? 'Otro' : 'Custom', language), icon: '✏️' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      {/* Card 1: Presupuesto / Capital a Repartir */}
      <div className="bg-zinc-900/90 rounded-xl p-3 sm:p-3.5 border border-zinc-800 shadow-sm relative overflow-hidden flex flex-col justify-between text-zinc-100">
        <div>
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider truncate">
                {capitalTitle}
              </span>
              <span className="text-[10px] px-1 py-0.2 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 rounded">
                {capitalType === 'salary' ? '💵' : capitalType === 'investment' ? '📈' : capitalType === 'project' ? '🚀' : '🏦'}
              </span>
            </div>
            <div className="w-6 h-6 rounded-lg bg-emerald-950/80 text-emerald-400 flex items-center justify-center border border-emerald-800/60 shrink-0">
              <Coins className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-2">
            {isEditingIncome ? (
              <div className="space-y-2 mt-1">
                <div className="grid grid-cols-3 gap-1">
                  {capitalTypesList.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedType(item.id)}
                      className={`px-1 py-0.5 text-[10px] font-bold rounded border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                        selectedType === item.id
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-zinc-400">{currency.symbol}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={tempIncome}
                    onChange={(e) => setTempIncome(sanitizeAmountInput(e.target.value))}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveIncome()}
                    className="w-full text-base font-extrabold text-white bg-zinc-950 border border-emerald-500 rounded-lg px-2 py-1 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveIncome}
                    className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer shrink-0"
                    title={t('overview.save')}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleCancelIncome}
                    className="p-1 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-pointer shrink-0"
                    title={t('overview.cancel')}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-baseline justify-between gap-1 group">
                <div className="min-w-0 flex-1">
                  <span className="text-xl sm:text-2xl font-black text-white tracking-tight block truncate">
                    {formatCurrency(income, currency)}
                  </span>
                  {additionsTotal !== 0 ? (
                    <div className="flex items-center gap-1 text-[10px] mt-0.5 text-zinc-400 truncate">
                      <span>Base: {formatCurrency(baseCapital ?? (income - additionsTotal), currency)}</span>
                      <span className={additionsTotal > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {additionsTotal > 0 ? `+${formatCurrency(additionsTotal, currency)}` : formatCurrency(additionsTotal, currency)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-zinc-400 font-medium block truncate">
                      {isEs ? 'Monto para tus categorías' : 'Amount for categories'}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (onOpenAddCapital) {
                      onOpenAddCapital('base');
                    } else {
                      setTempIncome(income.toString());
                      setSelectedType(capitalType);
                      setTempCustomLabel(capitalCustomLabel);
                      setIsEditingIncome(true);
                    }
                  }}
                  className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all border border-zinc-700 cursor-pointer shrink-0"
                  title={isEs ? 'Ajustar Monto' : 'Adjust Amount'}
                >
                  <Edit2 className="w-2.5 h-2.5 text-emerald-400" />
                  <span>{isEs ? 'Ajustar' : 'Edit'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-1 text-[11px]">
          {onOpenAddCapital ? (
            <div className="flex items-center gap-1">
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => onOpenAddCapital('add')}
                className="px-2 py-0.5 rounded-lg font-bold text-[11px] flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-3 h-3" />
                <span>{isBusiness ? '+ Venta' : '+ Ingreso'}</span>
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => onOpenAddCapital('reduce')}
                className="px-1.5 py-0.5 rounded-lg font-bold text-[11px] text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 transition-all cursor-pointer"
                title={isEs ? 'Restar capital' : 'Deduct'}
              >
                <MinusCircle className="w-3 h-3" />
              </motion.button>
            </div>
          ) : (
            <span className="text-zinc-500 text-[10px]">100% control</span>
          )}

          <button
            onClick={() => {
              if (onOpenAddCapital) onOpenAddCapital('base');
            }}
            className="text-zinc-400 hover:text-white cursor-pointer text-[10px] underline"
          >
            {isEs ? 'Cambiar Base' : 'Set Base'}
          </button>
        </div>
      </div>

      {/* Card 2: Presupuesto Repartido en % */}
      <div className="bg-zinc-900/90 rounded-xl p-3 sm:p-3.5 border border-zinc-800 shadow-sm relative overflow-hidden flex flex-col justify-between text-zinc-100">
        <div>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider truncate">
              {isEs ? 'Presupuesto Repartido' : t('overview.allocatedBudget')}
            </span>
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 ${
                totalAllocatedPercentage > 100
                  ? 'bg-rose-950/80 text-rose-400 border-rose-800/60'
                  : totalAllocatedPercentage === 100
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                  : 'bg-blue-950/80 text-blue-400 border-blue-800/60'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {totalAllocatedPercentage.toFixed(0)}%
            </span>
            <span className="text-xs font-semibold text-zinc-300 truncate">
              {formatCurrency(totalAllocatedAmount, currency)}
            </span>
          </div>

          <div className="mt-1.5 w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                totalAllocatedPercentage > 100
                  ? 'bg-rose-500'
                  : totalAllocatedPercentage === 100
                  ? 'bg-emerald-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, totalAllocatedPercentage)}%` }}
            />
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
          {totalAllocatedPercentage > 100 ? (
            <span className="text-rose-400 font-semibold flex items-center gap-1 text-[10px]">
              <AlertTriangle className="w-3 h-3" /> +{(totalAllocatedPercentage - 100).toFixed(0)}% excedido
            </span>
          ) : totalAllocatedPercentage === 100 ? (
            <span className="text-emerald-400 font-semibold text-[10px]">✓ 100% Repartido</span>
          ) : (
            <span className="text-blue-400 font-medium text-[10px] truncate">
              {formatCurrency(unallocatedAmount, currency)} libre ({100 - totalAllocatedPercentage}%)
            </span>
          )}
          <button
            onClick={onOpenBudgetManager}
            className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer text-[10px] shrink-0 ml-1"
          >
            {t('overview.adjustPercent')}
          </button>
        </div>
      </div>

      {/* Card 3: Total Gastado */}
      <div className="bg-zinc-900/90 rounded-xl p-3 sm:p-3.5 border border-zinc-800 shadow-sm relative overflow-hidden flex flex-col justify-between text-zinc-100">
        <div>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider truncate">
              {isEs ? 'Total Gastado' : t('overview.totalSpending')}
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-950/80 text-amber-400 flex items-center justify-center border border-amber-800/60 shrink-0">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
              {formatCurrency(totalSpent, currency)}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
              {percentageSpentOfIncome.toFixed(0)}% del total
            </span>
          </div>

          <div className="mt-1.5 w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                percentageSpentOfIncome > 100
                  ? 'bg-rose-500'
                  : percentageSpentOfIncome >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, percentageSpentOfIncome)}%` }}
            />
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
          <span>{isEs ? 'En tiempo real' : 'Real-time'}</span>
          <span className="font-semibold text-zinc-200">
            {formatCurrency(Math.max(0, totalAllocatedAmount - totalSpent), currency)} restante
          </span>
        </div>
      </div>

      {/* Card 4: Dinero Disponible / Restante */}
      <div className="bg-zinc-900/90 rounded-xl p-3 sm:p-3.5 border border-zinc-800 shadow-sm relative overflow-hidden flex flex-col justify-between text-zinc-100">
        <div>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider truncate">
              {isNetOverbudget ? (isEs ? 'Déficit' : 'Deficit') : (isEs ? 'Dinero Disponible' : t('overview.remainingCash'))}
            </span>
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 ${
                isNetOverbudget
                  ? 'bg-rose-950/80 text-rose-400 border-rose-800/60'
                  : 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-2">
            <span
              className={`text-xl sm:text-2xl font-black tracking-tight block truncate ${
                isNetOverbudget ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {isNetOverbudget
                ? `-${formatCurrency(netOverAmount, currency)}`
                : formatCurrency(remainingIncome, currency)}
            </span>
          </div>

          <p className="text-[10px] text-zinc-400 mt-1 truncate">
            {isNetOverbudget
              ? (isEs ? 'Has superado tu capital total' : 'Over total income')
              : `${formatCurrency(dailyAllowance, currency)}/día (${daysLeft} días)`}
          </p>
        </div>

        <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-zinc-500" /> Día {currentDay}/{daysInMonth}
          </span>
          <span className={`font-semibold ${isNetOverbudget ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isNetOverbudget ? (isEs ? 'Reducir gastos' : 'Over') : (isEs ? 'Flujo positivo' : 'Positive')}
          </span>
        </div>
      </div>
    </div>
  );
};
