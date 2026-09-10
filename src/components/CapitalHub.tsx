import React, { useState } from 'react';
import {
  Coins,
  Plus,
  MinusCircle,
  History,
  Settings2,
  TrendingUp,
  Trash2,
  Calendar,
  Sparkles,
  ArrowRight,
  Wallet,
  Check,
  Building2,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CapitalAddition, Currency, FinanceMode, CapitalSourceType } from '../types';
import { formatCurrency, getCapitalLabel, parseCurrencyInput, sanitizeAmountInput } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface CapitalHubProps {
  baseCapital: number;
  totalCapital: number;
  totalSpent: number;
  currency: Currency;
  financeMode: FinanceMode;
  capitalType: CapitalSourceType;
  capitalCustomLabel: string;
  currentYearMonth: string;
  additions: CapitalAddition[];
  onOpenAddCapital: (tab?: 'add' | 'reduce' | 'base' | 'history') => void;
  onAddAddition: (addition: Omit<CapitalAddition, 'id' | 'createdAt'>) => void;
  onDeleteAddition: (id: string) => void;
  onNavigateView: (view: 'status' | 'quick-spend' | 'budget-percentages' | 'downloads') => void;
}

export const CapitalHub: React.FC<CapitalHubProps> = ({
  baseCapital,
  totalCapital,
  totalSpent,
  currency,
  financeMode,
  capitalType,
  capitalCustomLabel,
  currentYearMonth,
  additions,
  onOpenAddCapital,
  onAddAddition,
  onDeleteAddition,
  onNavigateView,
}) => {
  const { language } = useLanguage();
  const isEs = language === 'es';
  const isBusiness = financeMode === 'business';

  const capitalTitle = getCapitalLabel(capitalType, capitalCustomLabel, language);
  const remaining = totalCapital - totalSpent;
  const isOverBudget = remaining < 0;

  // Filter additions for the active month
  const monthAdditions = additions.filter((a) => a.date.startsWith(currentYearMonth));
  const additionsSum = monthAdditions.reduce((sum, a) => sum + a.amount, 0);

  // Quick form state
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDate = todayStr.startsWith(currentYearMonth) ? todayStr : `${currentYearMonth}-01`;
  const [quickAmount, setQuickAmount] = useState('');
  const [quickDesc, setQuickDesc] = useState('');
  const [quickDate, setQuickDate] = useState(defaultDate);
  const [quickSource, setQuickSource] = useState(isBusiness ? 'Venta Mostrador' : 'Ingreso Extra');
  const [quickSuccess, setQuickSuccess] = useState(false);

  const presets = isBusiness
    ? [
        { label: isEs ? 'Venta Tienda' : 'Store Sale', icon: '🛍️' },
        { label: isEs ? 'Venta Online' : 'Online Sale', icon: '🌐' },
        { label: isEs ? 'Factura Cobrada' : 'Invoice Paid', icon: '🧾' },
        { label: isEs ? 'Inyección Capital' : 'Capital Added', icon: '💼' },
      ]
    : [
        { label: isEs ? 'Sueldo Extra' : 'Extra Income', icon: '💼' },
        { label: isEs ? 'Venta Garage/Usado' : 'Item Sold', icon: '🏷️' },
        { label: isEs ? 'Reembolso' : 'Refund', icon: '💳' },
        { label: isEs ? 'Regalo / Apoyo' : 'Gift', icon: '🎁' },
      ];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseCurrencyInput(quickAmount, currency.code);
    if (isNaN(val) || val <= 0) return;

    onAddAddition({
      amount: val,
      description: quickDesc.trim() || quickSource,
      date: quickDate,
      categorySource: quickSource,
    });

    setQuickAmount('');
    setQuickDesc('');
    setQuickSuccess(true);
    setTimeout(() => setQuickSuccess(false), 2500);
  };

  return (
    <div id="capital-hub-section" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {isBusiness
                    ? isEs
                      ? 'Gestión de Capital y Ventas'
                      : 'Capital & Sales Management'
                    : isEs
                    ? 'Gestión de Capital e Ingresos'
                    : 'Capital & Income Management'}
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {capitalTitle}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                {isEs
                  ? 'Controla tu dinero base, registra entradas o ventas y observa cómo crece tu saldo en tiempo real.'
                  : 'Manage base capital, register sales or inflows, and watch your balance grow.'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <motion.button
              id="capital-hub-add-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onOpenAddCapital('add')}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isBusiness ? (isEs ? '+ Sumar Venta' : '+ Add Sale') : isEs ? '+ Sumar Ingreso' : '+ Add Income'}</span>
            </motion.button>

            <motion.button
              id="capital-hub-reduce-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onOpenAddCapital('reduce')}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 font-medium text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <MinusCircle className="w-4 h-4 text-rose-400" />
              <span>{isEs ? 'Reducir / Corregir' : 'Deduct / Fix'}</span>
            </motion.button>

            <motion.button
              id="capital-hub-settings-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onOpenAddCapital('base')}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-all cursor-pointer"
              title={isEs ? 'Ajustar Capital Base y Fuente' : 'Adjust Base Capital & Source'}
            >
              <Settings2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* 4 Financial Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Capital Base */}
        <div className="bg-zinc-950/80 border border-zinc-850 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              {isEs ? '1. Capital Base' : '1. Base Capital'}
            </span>
            <button
              onClick={() => onOpenAddCapital('base')}
              className="text-amber-400 hover:text-amber-300 text-[11px] font-bold underline cursor-pointer"
            >
              {isEs ? 'Ajustar' : 'Edit'}
            </button>
          </div>
          <div className="font-mono text-lg sm:text-2xl font-black text-white">
            {formatCurrency(baseCapital, currency)}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {isEs ? 'Monto inicial fijo de inicio de mes' : 'Initial fixed monthly budget'}
          </p>
        </div>

        {/* Card 2: Ventas / Entradas */}
        <div className="bg-zinc-950/80 border border-zinc-850 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              {isBusiness ? (isEs ? '2. Ventas Registradas' : '2. Sales Added') : isEs ? '2. Ingresos Extra' : '2. Extra Inflow'}
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">
              +{monthAdditions.length}
            </span>
          </div>
          <div className="font-mono text-lg sm:text-2xl font-black text-emerald-400">
            +{formatCurrency(additionsSum, currency)}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {isEs ? 'Sumado dinámicamente este mes' : 'Dynamically added this month'}
          </p>
        </div>

        {/* Card 3: Capital Total Disponible */}
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-300 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              {isEs ? '3. Capital Total' : '3. Total Capital'}
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <div className="font-mono text-lg sm:text-2xl font-black text-amber-300">
            {formatCurrency(totalCapital, currency)}
          </div>
          <p className="text-[11px] text-amber-400/80 mt-1">
            {isEs ? 'Base + Ventas / Entradas acumuladas' : 'Base + all registered inflows'}
          </p>
        </div>

        {/* Card 4: Restante Disponible */}
        <div
          className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between border ${
            isOverBudget
              ? 'bg-rose-950/20 border-rose-500/30'
              : 'bg-emerald-950/20 border-emerald-500/30'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span
              className={`font-semibold uppercase tracking-wider text-[10px] ${
                isOverBudget ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {isEs ? '4. Saldo Disponible' : '4. Net Available'}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              {isEs ? 'Tras gastos' : 'After spend'}
            </span>
          </div>
          <div
            className={`font-mono text-lg sm:text-2xl font-black ${
              isOverBudget ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {formatCurrency(remaining, currency)}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {isOverBudget
              ? isEs
                ? '⚠️ Has superado tu capital total'
                : '⚠️ Budget exceeded'
              : isEs
              ? 'Libre para gastar o repartir'
              : 'Free to spend or allocate'}
          </p>
        </div>
      </div>

      {/* Quick Inflow / Sale Entry Form right on page */}
      <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              {isBusiness
                ? isEs
                  ? 'Registrar Venta Rápida al Capital'
                  : 'Quick Add Sale to Capital'
                : isEs
                ? 'Registrar Entrada / Ingreso Rápido'
                : 'Quick Add Income'}
            </h3>
          </div>
          {quickSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              {isEs ? '¡Sumado al capital!' : 'Added to capital!'}
            </span>
          )}
        </div>

        {/* Source Presets */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setQuickSource(p.label)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                quickSource === p.label
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">
                {currency.symbol}
              </span>
              <input
                id="quick-capital-amount-input"
                type="text"
                inputMode="decimal"
                required
                value={quickAmount}
                onChange={(e) => setQuickAmount(sanitizeAmountInput(e.target.value))}
                placeholder={isEs ? 'Monto a sumar...' : 'Amount...'}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl pl-8 pr-3 py-2.5 text-sm font-mono text-white placeholder-zinc-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="sm:col-span-4">
            <input
              id="quick-capital-desc-input"
              type="text"
              value={quickDesc}
              onChange={(e) => setQuickDesc(e.target.value)}
              placeholder={isEs ? 'Detalle o cliente (opcional)...' : 'Note or customer (optional)...'}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all"
            />
          </div>

          <div className="sm:col-span-2">
            <input
              id="quick-capital-date-input"
              type="date"
              value={quickDate}
              onChange={(e) => setQuickDate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-2.5 py-2.5 text-xs font-mono text-zinc-300 outline-none transition-all"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              id="quick-capital-submit-btn"
              type="submit"
              className="w-full h-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isEs ? 'Sumar' : 'Add'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* History List of Additions for this Month */}
      <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              {isBusiness
                ? isEs
                  ? 'Ventas y Movimientos Registrados este Mes'
                  : 'Sales & Movements Logged this Month'
                : isEs
                ? 'Ingresos y Entradas Registradas este Mes'
                : 'Inflows Logged this Month'}
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {monthAdditions.length} {isEs ? 'movimientos' : 'entries'}
          </span>
        </div>

        {monthAdditions.length === 0 ? (
          <div className="text-center py-10 px-4 border border-dashed border-zinc-800 rounded-xl">
            <Coins className="w-10 h-10 text-zinc-600 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-zinc-300">
              {isEs
                ? 'No hay ventas o ingresos adicionales en este mes todavía'
                : 'No additional sales or inflows logged for this month yet'}
            </p>
            <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
              {isEs
                ? 'Tu presupuesto actual utiliza el Capital Base. Si tienes una venta o entrada de dinero extra, sumala arriba y el capital se incrementará de inmediato.'
                : 'Your budget currently relies on the Base Capital. Log extra inflows above to dynamically increment your budget.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {monthAdditions.map((addition) => (
              <div
                key={addition.id}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-zinc-850 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400 text-xs font-mono font-bold shrink-0">
                    +
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {addition.description || addition.categorySource || (isEs ? 'Ingreso' : 'Inflow')}
                      </span>
                      {addition.categorySource && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">
                          {addition.categorySource}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {addition.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-black text-emerald-400">
                    +{formatCurrency(addition.amount, currency)}
                  </span>
                  <button
                    onClick={() => onDeleteAddition(addition.id)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    title={isEs ? 'Eliminar movimiento' : 'Delete entry'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => onNavigateView('quick-spend')}
          className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900/80 text-left transition-all group cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-emerald-400">
              ⚡ {isEs ? '¿Quieres registrar un gasto?' : 'Want to log an expense?'}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {isEs ? 'Ir a la pestaña de Gastos' : 'Go to the Expenses tab'}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </button>

        <button
          onClick={() => onNavigateView('budget-percentages')}
          className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900/80 text-left transition-all group cursor-pointer flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-amber-400">
              🎛️ {isEs ? '¿Repartir capital en bolsitas?' : 'Allocate capital in percentages?'}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {isEs ? 'Ir a la pestaña de Porcentajes %' : 'Go to Budget Percentages %'}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
        </button>
      </div>
    </div>
  );
};
