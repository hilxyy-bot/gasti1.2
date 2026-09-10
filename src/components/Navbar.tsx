import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Activity,
  Sliders,
  Download,
  Building2,
  User,
  Calendar,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Currency, FinanceMode } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { AppLogo } from './AppLogo';
import { UserProfileMenu } from './UserProfileMenu';

export type ViewMode =
  | 'status'
  | 'quick-spend'
  | 'capital'
  | 'budget-percentages'
  | 'downloads';

interface NavbarProps {
  currentYearMonth: string;
  onChangeMonth: (yearMonth: string) => void;
  currency: Currency;
  onChangeCurrency: (currency: Currency) => void;
  financeMode: FinanceMode;
  onChangeFinanceMode: (mode: FinanceMode) => void;
  onOpenAddExpense: () => void;
  onOpenAddCapital?: (initialTab?: 'add' | 'reduce' | 'base' | 'history') => void;
  onOpenBudgetManager: () => void;
  onOpenAlertSettings: () => void;
  onOpenKidGuide?: () => void;
  onResetData: () => void;
  onExportData: () => void;
  onDownloadHtml?: () => void;
  alertCount: number;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentYearMonth,
  onChangeMonth,
  currency,
  financeMode,
  onChangeFinanceMode,
  onOpenAddExpense,
  onOpenAlertSettings,
  onDownloadHtml,
  alertCount,
  viewMode,
  onChangeViewMode,
}) => {
  const { language, t, formatMonth, formatShortMonth } = useLanguage();
  const isBusiness = financeMode === 'business';
  const isEs = language === 'es';

  const handlePrevMonth = () => {
    const [year, month] = currentYearMonth.split('-');
    let y = parseInt(year, 10);
    let m = parseInt(month, 10) - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    onChangeMonth(`${y}-${m.toString().padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = currentYearMonth.split('-');
    let y = parseInt(year, 10);
    let m = parseInt(month, 10) + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    onChangeMonth(`${y}-${m.toString().padStart(2, '0')}`);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    onChangeMonth(`${y}-${m}`);
  };

  return (
    <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Balanced Top Bar */}
        <div className="relative flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Left: Brand, Desktop Month Navigator, & Mode Pill */}
          <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4 shrink-0">
            <div
              onClick={() => onChangeViewMode('status')}
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0"
            >
              <motion.div
                whileHover={{ scale: 1.06 }}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shadow-md flex-shrink-0 ${
                  isBusiness ? 'shadow-indigo-950' : 'shadow-emerald-950'
                }`}
              >
                <AppLogo className="w-8 h-8 sm:w-9 sm:h-9" />
              </motion.div>
              <h1
                className={`text-base sm:text-lg font-black text-white tracking-tight transition-colors ${
                  isBusiness ? 'group-hover:text-indigo-400' : 'group-hover:text-emerald-400'
                }`}
              >
                {t('app.title')}
              </h1>
            </div>

            {/* Desktop Month Navigator - ON THE LEFT SIDE ON COMPUTER */}
            <div className="hidden md:flex items-center bg-zinc-900/90 hover:bg-zinc-900 p-0.5 sm:p-1 rounded-xl border border-zinc-800 shadow-sm shrink-0">
              <motion.button
                id="prev-month-btn-desktop"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrevMonth}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer shrink-0"
                title={t('nav.prevMonth')}
                aria-label={t('nav.prevMonth')}
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </motion.button>

              <motion.button
                id="current-month-btn-desktop"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCurrentMonth}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-bold text-zinc-100 transition-colors whitespace-nowrap cursor-pointer capitalize ${
                  isBusiness ? 'hover:text-indigo-400' : 'hover:text-emerald-400'
                }`}
                title={isEs ? 'Haz clic para volver al mes actual' : 'Click to return to current month'}
              >
                <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>{formatMonth(currentYearMonth)}</span>
              </motion.button>

              <motion.button
                id="next-month-btn-desktop"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNextMonth}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer shrink-0"
                title={t('nav.nextMonth')}
                aria-label={t('nav.nextMonth')}
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </motion.button>
            </div>

            {/* Mode Pill (Desktop and Tablet) */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => onChangeFinanceMode(isBusiness ? 'personal' : 'business')}
              className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                isBusiness
                  ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700/80 hover:bg-indigo-900/80'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/80'
              }`}
              title={isEs ? 'Alternar Modo Personal / Negocio' : 'Toggle Personal / Business Mode'}
            >
              {isBusiness ? (
                <>
                  <Building2 className="w-3 h-3 text-indigo-400" />
                  <span>{t('mode.businessShort')}</span>
                </>
              ) : (
                <>
                  <User className="w-3 h-3 text-emerald-400" />
                  <span>{t('mode.personalShort')}</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Mobile Month Navigator (< md: screens) */}
          <div className="md:hidden flex items-center justify-center shrink-0">
            <div className="flex items-center bg-zinc-900/90 p-0.5 rounded-xl border border-zinc-800 shadow-sm">
              <motion.button
                id="prev-month-btn-mobile"
                whileTap={{ scale: 0.9 }}
                onClick={handlePrevMonth}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer shrink-0"
                title={t('nav.prevMonth')}
                aria-label={t('nav.prevMonth')}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </motion.button>

              <motion.button
                id="current-month-btn-mobile"
                whileTap={{ scale: 0.98 }}
                onClick={handleCurrentMonth}
                className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 text-xs font-bold text-zinc-100 whitespace-nowrap cursor-pointer capitalize"
                title={isEs ? 'Haz clic para volver al mes actual' : 'Click to return to current month'}
              >
                <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                <span>{formatShortMonth(currentYearMonth)}</span>
              </motion.button>

              <motion.button
                id="next-month-btn-mobile"
                whileTap={{ scale: 0.9 }}
                onClick={handleNextMonth}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer shrink-0"
                title={t('nav.nextMonth')}
                aria-label={t('nav.nextMonth')}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>

          {/* Right Actions: + Gasto, Settings & User Profile (comfortably tucked inward on mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pr-2 sm:pr-0">
            {/* Add Expense Primary Button */}
            <motion.button
              id="add-expense-nav-btn"
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenAddExpense}
              className={`inline-flex items-center justify-center gap-1 h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-sm transition-all cursor-pointer shrink-0 ${
                isBusiness
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/60'
              }`}
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">
                {isBusiness ? t('nav.invoiceSpend') : t('nav.addExpense')}
              </span>
              <span className="sm:hidden font-bold">
                {isEs ? 'Gasto' : 'Add'}
              </span>
            </motion.button>

            {/* Configuración (Settings) Button - visible on md+ since it's already in the tabs */}
            <motion.button
              id="settings-nav-btn"
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenAlertSettings}
              className="relative hidden md:inline-flex items-center gap-1.5 h-9 px-2.5 rounded-xl text-xs font-bold bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shrink-0"
              title={isEs ? 'Configuración' : 'Settings'}
            >
              <Settings className="w-3.5 h-3.5 text-zinc-400" />
              <span>{isEs ? 'Ajustes' : 'Settings'}</span>
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-1 py-0.2 rounded border border-zinc-800">
                {currency.code}
              </span>
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-zinc-950 animate-pulse" />
              )}
            </motion.button>

            {/* User Profile & Account Menu - tucked inward on mobile */}
            <div className="mr-1.5 sm:mr-0 shrink-0">
              <UserProfileMenu
                financeMode={financeMode}
                onChangeFinanceMode={onChangeFinanceMode}
              />
            </div>
          </div>
        </div>

        {/* Clean, Balanced Secondary Tab Bar */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 py-2 sm:py-2.5 gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap">
            {/* 1. Mi Presupuesto (Dashboard + Gastos unificados) */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChangeViewMode('status')}
              className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                viewMode === 'status' || viewMode === 'quick-spend'
                  ? isBusiness
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950 ring-1 ring-indigo-400/30'
                    : 'bg-emerald-600 text-white shadow-md shadow-emerald-950 ring-1 ring-emerald-400/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{isEs ? '📊 Presupuesto' : '📊 My Budget'}</span>
            </motion.button>

            {/* 2. Bolsitas en % */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChangeViewMode('budget-percentages')}
              className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                viewMode === 'budget-percentages'
                  ? isBusiness
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950 ring-1 ring-indigo-400/30'
                    : 'bg-emerald-600 text-white shadow-md shadow-emerald-950 ring-1 ring-emerald-400/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{isEs ? '🎯 Bolsitas en %' : '🎯 Split %'}</span>
            </motion.button>

            {/* 3. Configuración (Direct access tab) */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenAlertSettings}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all shrink-0 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{isEs ? '⚙️ Ajustes' : '⚙️ Settings'}</span>
              <span className="text-[10px] font-mono text-zinc-500">({currency.code})</span>
            </motion.button>

            {/* 4. Descargar App (.html) */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (onDownloadHtml) {
                  onDownloadHtml();
                } else {
                  onChangeViewMode('downloads');
                }
              }}
              className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                viewMode === 'downloads'
                  ? isBusiness
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950 ring-1 ring-indigo-400/30'
                    : 'bg-emerald-600 text-white shadow-md shadow-emerald-950 ring-1 ring-emerald-400/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{isEs ? '📥 Descargar' : '📥 Download'}</span>
            </motion.button>

            {/* Mobile Mode Switcher Pill (inside tabs row on small phones) */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => onChangeFinanceMode(isBusiness ? 'personal' : 'business')}
              className={`sm:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                isBusiness
                  ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700/80'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
              }`}
              title={isEs ? 'Alternar Modo Personal / Negocio' : 'Toggle Mode'}
            >
              {isBusiness ? (
                <>
                  <Building2 className="w-3 h-3 text-indigo-400" />
                  <span>{t('mode.businessShort')}</span>
                </>
              ) : (
                <>
                  <User className="w-3 h-3 text-emerald-400" />
                  <span>{t('mode.personalShort')}</span>
                </>
              )}
            </motion.button>
          </div>

          <div className="hidden lg:flex items-center text-[11px] font-medium text-zinc-400 bg-zinc-900/80 px-3 py-1 rounded-lg border border-zinc-800 shrink-0">
            <span>
              {isEs
                ? '💡 Gasti: Controla gastos y presupuestos al instante.'
                : '💡 Gasti: Track expenses and budgets instantly.'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
