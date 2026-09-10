import React, { useState } from 'react';
import {
  X,
  Settings,
  Coins,
  Globe,
  Briefcase,
  User,
  Building2,
  Bell,
  Database,
  Download,
  Upload,
  RotateCcw,
  Check,
  Sparkles,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertSettings, Currency, FinanceMode } from '../types';
import { SUPPORTED_CURRENCIES } from '../data/initialData';
import { useLanguage } from '../context/LanguageContext';
import { useLockBodyScroll } from '../utils/useLockBodyScroll';
import { formatCurrency } from '../utils/formatters';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  onChangeCurrency: (currency: Currency) => void;
  financeMode: FinanceMode;
  onChangeFinanceMode: (mode: FinanceMode) => void;
  settings: AlertSettings;
  onUpdateSettings: (settings: AlertSettings) => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onImportJSON: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResetToDefaults: () => void;
  onOpenKidGuide?: () => void;
}

type SettingsTab = 'currency' | 'language' | 'mode' | 'alerts' | 'data';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currency,
  onChangeCurrency,
  financeMode,
  onChangeFinanceMode,
  settings,
  onUpdateSettings,
  onExportCSV,
  onExportJSON,
  onImportJSON,
  onResetToDefaults,
  onOpenKidGuide,
}) => {
  const { language, setLanguage, t, supportedLanguages } = useLanguage();
  useLockBodyScroll(isOpen);

  const [activeTab, setActiveTab] = useState<SettingsTab>('currency');
  const [currencySearch, setCurrencySearch] = useState('');

  if (!isOpen) return null;

  const isEs = language === 'es';
  const isBusiness = financeMode === 'business';

  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.symbol.includes(currencySearch)
  );

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 360 }}
        className="bg-zinc-950 rounded-t-3xl sm:rounded-2xl max-w-2xl w-full shadow-2xl border border-zinc-800 relative max-h-[90dvh] sm:max-h-[85vh] flex flex-col text-zinc-100 overflow-hidden"
      >
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 bg-zinc-700/80 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner ${
                isBusiness
                  ? 'bg-indigo-950/80 text-indigo-400 border-indigo-800/60'
                  : 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
              }`}
            >
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                {isEs ? 'Configuración' : 'Settings'}
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium">
                {isEs ? 'Moneda, idioma, modo de finanzas y respaldos' : 'Currency, language, finance mode & data'}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center px-3 sm:px-6 border-b border-zinc-800/80 bg-zinc-900/50 overflow-x-auto scrollbar-none gap-1 py-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('currency')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'currency'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>{isEs ? 'Moneda' : 'Currency'}</span>
            <span className="text-[10px] opacity-80 font-mono">({currency.code})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('language')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'language'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isEs ? 'Idioma' : 'Language'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mode')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'mode'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{isEs ? 'Modo' : 'Mode'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{isEs ? 'Alertas' : 'Alerts'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'data'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isEs ? 'Datos & Copia' : 'Data & Backup'}</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 space-y-4">
          {/* TAB 1: CURRENCY */}
          {activeTab === 'currency' && (
            <div className="space-y-4">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block">
                    {isEs ? 'Moneda Actual Activa' : 'Current Active Currency'}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-black text-emerald-400">{currency.symbol}</span>
                    <span className="text-base font-black text-white">{currency.name}</span>
                    <span className="text-xs font-mono font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md">
                      {currency.code}
                    </span>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="bg-zinc-950 border border-zinc-800 px-3.5 py-2 rounded-xl text-right w-full sm:w-auto">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    {isEs ? 'Vista previa formateada' : 'Formatted Preview'}
                  </span>
                  <span className="text-sm sm:text-base font-black text-emerald-400">
                    {formatCurrency(1500000, currency)}
                  </span>
                </div>
              </div>

              {/* Currency Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={currencySearch}
                  onChange={(e) => setCurrencySearch(e.target.value)}
                  placeholder={isEs ? 'Buscar moneda (COP, USD, Euro, Peso...)' : 'Search currency (COP, USD, EUR...)'}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm font-medium text-white focus:outline-none focus:border-emerald-500 placeholder-zinc-500"
                />
              </div>

              {/* Currencies Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {filteredCurrencies.map((c) => {
                  const isSelected = c.code === currency.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => onChangeCurrency(c)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/70 border-emerald-500/80 shadow-md shadow-emerald-950 ring-1 ring-emerald-500'
                          : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-base ${
                            isSelected
                              ? 'bg-emerald-500 text-zinc-950'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {c.symbol}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-white">{c.name}</span>
                            <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                              {c.code}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-500 block mt-0.5">
                            {formatCurrency(c.code === 'COP' || c.code === 'CLP' || c.code === 'JPY' ? 100000 : 100, c)}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: LANGUAGE */}
          {activeTab === 'language' && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400 font-medium">
                {isEs
                  ? 'Selecciona el idioma principal de la aplicación:'
                  : 'Select the primary language of the application:'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {supportedLanguages.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setLanguage(lang.code)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/70 border-emerald-500/80 shadow-md shadow-emerald-950 ring-1 ring-emerald-500'
                          : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl select-none">{lang.flag}</span>
                        <div>
                          <span className="text-sm font-black text-white block">{lang.nativeName}</span>
                          <span className="text-xs text-zinc-400">{lang.name}</span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: FINANCE MODE */}
          {activeTab === 'mode' && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400 font-medium">
                {isEs
                  ? 'Elige cómo quieres organizar tus finanzas y categorías:'
                  : 'Choose how you want to organize your finances and categories:'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Personal Mode */}
                <button
                  type="button"
                  onClick={() => onChangeFinanceMode('personal')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    !isBusiness
                      ? 'bg-emerald-950/50 border-emerald-500/80 shadow-lg shadow-emerald-950 ring-1 ring-emerald-500'
                      : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-850'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <User className="w-5 h-5" />
                    </div>
                    {!isBusiness && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500 text-zinc-950">
                        {isEs ? 'Activo' : 'Active'}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-white">
                      {isEs ? '👤 Modo Personal' : '👤 Personal Mode'}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {isEs
                        ? 'Ideal para tu hogar, familia o gastos personales (50/30/20, Comida, Vivienda, Ocio, Ahorro e Inversiones).'
                        : 'For individuals and families (Needs, Wants, Savings, Housing, Food, Fun).'}
                    </p>
                  </div>
                </button>

                {/* Business Mode */}
                <button
                  type="button"
                  onClick={() => onChangeFinanceMode('business')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isBusiness
                      ? 'bg-indigo-950/50 border-indigo-500/80 shadow-lg shadow-indigo-950 ring-1 ring-indigo-500'
                      : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-850'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                      <Building2 className="w-5 h-5" />
                    </div>
                    {isBusiness && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-500 text-zinc-950">
                        {isEs ? 'Activo' : 'Active'}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-white">
                      {isEs ? '🏢 Modo Negocio' : '🏢 Business Mode'}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {isEs
                        ? 'Para emprendimientos y empresas: Caja Chica, Inventario (COGS), Gastos de Operación (OPEX), Nómina, Impuestos y Ganancia Real.'
                        : 'For businesses & commerce: Profit First, COGS, OPEX, Payroll, Taxes & Net Profit.'}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: ALERTS */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400 font-medium">
                {isEs
                  ? 'Configura los porcentajes automáticos para recibir avisos visuales en tus categorías:'
                  : 'Configure automated thresholds for visual alerts in categories:'}
              </div>

              {/* Warning Threshold Slider */}
              <div className="bg-zinc-900/90 rounded-xl p-3.5 border border-amber-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-300">
                    {t('modal.warningThreshold')}
                  </span>
                  <span className="text-sm font-extrabold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800/60">
                    {settings.warningThreshold}%
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  {t('modal.warningDesc')}
                </p>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={settings.warningThreshold}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, warningThreshold: parseInt(e.target.value, 10) })
                  }
                  className="w-full h-2 bg-zinc-800 rounded-lg cursor-pointer accent-amber-500"
                />
              </div>

              {/* Danger Threshold Slider */}
              <div className="bg-zinc-900/90 rounded-xl p-3.5 border border-rose-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-rose-300">
                    {t('modal.dangerThreshold')}
                  </span>
                  <span className="text-sm font-extrabold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-800/60">
                    {settings.dangerThreshold}%
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  {t('modal.dangerDesc')}
                </p>
                <input
                  type="range"
                  min="90"
                  max="120"
                  step="5"
                  value={settings.dangerThreshold}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, dangerThreshold: parseInt(e.target.value, 10) })
                  }
                  className="w-full h-2 bg-zinc-800 rounded-lg cursor-pointer accent-rose-500"
                />
              </div>
            </div>
          )}

          {/* TAB 5: DATA & BACKUP */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400 font-medium">
                {isEs
                  ? 'Guarda copias de seguridad de tus finanzas o descarga tus registros:'
                  : 'Backup your financial data or export your records:'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onExportCSV}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>{t('modal.exportCSV')}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onExportJSON}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>{t('modal.backupJSON')}</span>
                </motion.button>
              </div>

              {/* Dedicated Zero Start Card */}
              <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isEs ? 'Empezar desde $0 todas las cuentas' : 'Start all accounts from $0'}</span>
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                    {isEs
                      ? 'Limpia el presupuesto actual a 0 y borra los gastos de prueba para empezar tu control desde cero.'
                      : 'Resets budget to $0 and clears expenses to start completely fresh.'}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (window.confirm(isEs ? '¿Seguro que deseas poner todas las cuentas en 0 y borrar los gastos?' : 'Reset all accounts to $0 and clear expenses?')) {
                      onResetToDefaults();
                      onClose();
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-xs font-extrabold transition-colors cursor-pointer shrink-0 text-center"
                >
                  {isEs ? 'Reiniciar a $0' : 'Reset to $0'}
                </motion.button>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-zinc-800/80">
                <label className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span>{t('modal.restoreBackup')}</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={onImportJSON}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Kid Guide helper link */}
              {onOpenKidGuide && (
                <div className="pt-3 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenKidGuide();
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{isEs ? 'Ver Guía Interactiva Paso a Paso' : 'Open Step-by-Step Interactive Guide'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-zinc-800/80 bg-zinc-950 shrink-0">
          <div className="text-[11px] text-zinc-500">
            {currency.code} • {language.toUpperCase()} • {isBusiness ? 'Negocio' : 'Personal'}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className={`px-5 py-2 text-xs sm:text-sm font-bold text-white rounded-xl transition-colors cursor-pointer ${
              isBusiness ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {isEs ? 'Guardar y Cerrar' : 'Save & Close'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
