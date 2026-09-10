import React from 'react';
import { Plus, ArrowRight, CheckCircle2, AlertTriangle, AlertCircle, Edit2, Trash2, Tag, Layers } from 'lucide-react';
import { Category, Expense, Currency, CategoryAlert, FinanceMode } from '../types';
import { formatCurrency, calculateCategoryBudget } from '../utils/formatters';
import { CategoryIcon } from '../utils/iconMap';
import { CategoryColorPicker } from './CategoryColorPicker';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedCategoryName } from '../utils/categoryLocalization';

interface CategoryProgressListProps {
  categories: Category[];
  expenses: Expense[];
  income: number;
  currency: Currency;
  alerts: CategoryAlert[];
  financeMode?: FinanceMode;
  onOpenAddExpense: (categoryId?: string) => void;
  onFilterByCategory: (categoryId: string) => void;
  selectedCategoryFilter: string | null;
  onUpdateCategoryPercentage?: (categoryId: string, percentage: number) => void;
  onUpdateCategoryColor?: (categoryId: string, color: string) => void;
  onOpenAddCategory?: () => void;
  onEditCategory?: (category: Category) => void;
  onDeleteCategory?: (categoryId: string) => void;
}

export const CategoryProgressList: React.FC<CategoryProgressListProps> = ({
  categories,
  expenses,
  income,
  currency,
  alerts,
  financeMode = 'personal',
  onOpenAddExpense,
  onFilterByCategory,
  selectedCategoryFilter,
  onUpdateCategoryPercentage,
  onUpdateCategoryColor,
  onOpenAddCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const { t, language } = useLanguage();
  const alertMap = new Map<string, CategoryAlert>(alerts.map((a) => [a.categoryId, a]));
  const isBusiness = financeMode === 'business';
  const isEs = language === 'es';

  return (
    <div className="space-y-3">
      {/* Header with Title and + Crear Categoría Button */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
            {isBusiness
              ? (isEs ? 'Categorías del Negocio' : 'Business Categories')
              : (isEs ? 'División de Gastos' : t('trackers.title'))}
          </h2>
          <p className="text-xs text-zinc-400">
            {isBusiness
              ? (isEs ? 'Control de gastos y presupuesto asignado a cada categoría.' : 'Track expenses and allocated budget for each category.')
              : (isEs ? 'Crea tus categorías y asigna qué porcentaje de dinero va a cada una.' : t('trackers.subtitle'))}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedCategoryFilter && (
            <button
              onClick={() => onFilterByCategory('')}
              className={`text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer ${
                isBusiness
                  ? 'text-indigo-400 hover:text-indigo-300 bg-indigo-950/80 border-indigo-800/80'
                  : 'text-emerald-400 hover:text-emerald-300 bg-emerald-950/80 border-emerald-800/80'
              }`}
            >
              {t('trackers.clearFilter')}
            </button>
          )}

          {onOpenAddCategory && (
            <button
              type="button"
              onClick={onOpenAddCategory}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                isBusiness
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isEs ? '+ Crear Categoría' : '+ New Category'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Categories Grid - Compact cards */}
      {categories.length === 0 ? (
        <div className="text-center py-8 px-4 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/60">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2.5 shadow-inner border ${
              isBusiness
                ? 'bg-indigo-950/80 border-indigo-800/80 text-indigo-300'
                : 'bg-emerald-950/80 border-emerald-800/80 text-emerald-400'
            }`}
          >
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-200">
            {isEs ? 'Aún no tienes categorías creadas' : t('trackers.emptyTitle')}
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
            {isEs
              ? 'Empieza creando tus categorías desde cero (por ejemplo: Alimentación, Vivienda, Transporte, Ocio o Ahorro).'
              : t('trackers.emptySubtitle')}
          </p>
          {onOpenAddCategory && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onOpenAddCategory}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                  isBusiness
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isEs ? 'Crear mi primera categoría' : 'Create my first category'}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {categories.map((cat) => {
            const alert = alertMap.get(cat.id);
            const spent = alert ? alert.spent : 0;
            const budget = alert ? alert.budget : calculateCategoryBudget(income, cat.percentage);
            const percentSpent = budget > 0 ? (spent / budget) * 100 : 0;
            const remaining = Math.max(0, budget - spent);
            const isOver = spent > budget;
            const overAmount = isOver ? spent - budget : 0;
            const isSelected = selectedCategoryFilter === cat.id;

            let statusColor = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
            let statusText = `${(100 - percentSpent).toFixed(0)}% ${t('trackers.left')}`;
            let progressBarColor = 'bg-emerald-500';

            if (isOver) {
              statusColor = 'bg-rose-950/80 text-rose-400 border-rose-800/80';
              statusText = t('trackers.overBy', { amt: formatCurrency(overAmount, currency) });
              progressBarColor = 'bg-rose-500';
            } else if (percentSpent >= 100) {
              statusColor = 'bg-amber-950/80 text-amber-400 border-amber-800/80';
              statusText = t('trackers.limitReached');
              progressBarColor = 'bg-amber-500';
            } else if (percentSpent >= 80) {
              statusColor = 'bg-amber-950/80 text-amber-400 border-amber-800/80';
              statusText = `${percentSpent.toFixed(0)}% ${t('trackers.usedAlert')}`;
              progressBarColor = 'bg-amber-500';
            }

            return (
              <div
                key={cat.id}
                className={`bg-zinc-900/90 rounded-xl p-3 sm:p-3.5 border transition-all duration-200 hover:shadow-sm flex flex-col justify-between text-zinc-100 ${
                  isSelected
                    ? isBusiness
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-zinc-900'
                      : 'border-emerald-500 ring-2 ring-emerald-500/30 bg-zinc-900'
                    : isOver
                    ? 'border-rose-900/80 hover:border-rose-700'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  {/* Header row */}
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative">
                        {onUpdateCategoryColor ? (
                          <CategoryColorPicker
                            color={cat.color}
                            categoryName={getLocalizedCategoryName(cat, language)}
                            onChangeColor={(newColor) => onUpdateCategoryColor(cat.id, newColor)}
                          />
                        ) : (
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
                            style={{ backgroundColor: cat.color }}
                          >
                            <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                            {getLocalizedCategoryName(cat, language)}
                          </h4>
                          <CategoryIcon name={cat.icon} className="w-3 h-3 text-zinc-400" />
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                              isBusiness
                                ? 'text-indigo-300 bg-zinc-950 border-zinc-800'
                                : 'text-emerald-400 bg-zinc-950 border-zinc-800'
                            }`}
                          >
                            {cat.percentage}%
                          </span>
                          <span className="text-[10px] font-medium text-zinc-400">
                            = {formatCurrency(budget, currency)}
                          </span>
                          {onUpdateCategoryPercentage && (
                            <div className="inline-flex items-center ml-0.5 bg-zinc-950 rounded border border-zinc-800">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateCategoryPercentage(cat.id, Math.max(0, cat.percentage - 5));
                                }}
                                className="px-1 text-[9px] font-bold text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 cursor-pointer"
                                title="Reducir porcentaje 5%"
                              >
                                -5%
                              </button>
                              <span className="text-zinc-700 text-[9px]">|</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateCategoryPercentage(cat.id, Math.min(100, cat.percentage + 5));
                                }}
                                className="px-1 text-[9px] font-bold text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 cursor-pointer"
                                title="Aumentar porcentaje 5%"
                              >
                                +5%
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded border ${statusColor}`}>
                        {statusText}
                      </span>
                      {onEditCategory && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditCategory(cat);
                          }}
                          className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                          title={isEs ? 'Editar categoría' : 'Edit category'}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                      {onDeleteCategory && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCategory(cat.id);
                          }}
                          className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                          title={isEs ? 'Eliminar categoría' : 'Delete category'}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Spent vs Budget numbers */}
                  <div className="flex items-baseline justify-between mt-2 text-[11px]">
                    <div>
                      <span className="text-zinc-400">{t('trackers.spent')}: </span>
                      <span className="font-extrabold text-xs text-white">
                        {formatCurrency(spent, currency)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-400">{t('trackers.remaining')}: </span>
                      <span
                        className={`font-extrabold text-xs ${
                          isOver ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {isOver ? `-${formatCurrency(overAmount, currency)}` : formatCurrency(remaining, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-1.5 w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800/80">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${progressBarColor}`}
                      style={{ width: `${Math.min(100, percentSpent)}%` }}
                    />
                  </div>
                </div>

                {/* Action buttons footer */}
                <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                  <button
                    onClick={() => onFilterByCategory(isSelected ? '' : cat.id)}
                    className="font-bold text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer text-[11px]"
                  >
                    {isSelected ? t('trackers.showingInTable') : t('trackers.viewExpenses')}
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onOpenAddExpense(cat.id)}
                    className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer text-[11px] ${
                      isBusiness
                        ? 'text-indigo-300 hover:text-indigo-200 bg-indigo-950/80 hover:bg-indigo-900 border-indigo-800/80'
                        : 'text-emerald-400 hover:text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border-emerald-800/80'
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t('trackers.addExpense')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
