import { Category, Expense, Currency, BudgetPreset, AlertSettings, FinanceMode } from '../types';

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'COP', symbol: '$', name: 'Peso Colombiano (COP)', position: 'prefix' },
  { code: 'USD', symbol: '$', name: 'Dólar (USD)', position: 'prefix' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano (MXN)', position: 'prefix' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)', position: 'prefix' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino (ARS)', position: 'prefix' },
  { code: 'CLP', symbol: '$', name: 'Peso Chileno (CLP)', position: 'prefix' },
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano (PEN)', position: 'prefix' },
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileño (BRL)', position: 'prefix' },
  { code: 'GBP', symbol: '£', name: 'Libra Esterlina (GBP)', position: 'prefix' },
  { code: 'JPY', symbol: '¥', name: 'Yen Japonés (JPY)', position: 'prefix' },
  { code: 'CAD', symbol: '$', name: 'Dólar Canadiense (CAD)', position: 'prefix' },
  { code: 'AUD', symbol: '$', name: 'Dólar Australiano (AUD)', position: 'prefix' },
];

export const DEFAULT_PERSONAL_CATEGORIES: Category[] = [
  {
    id: 'cat-pers-food',
    name: 'Alimentación & Supermercado',
    percentage: 0,
    color: '#10b981',
    icon: 'Utensils',
    description: 'Comida, despensa, restaurantes y víveres',
    mode: 'personal',
  },
  {
    id: 'cat-pers-housing',
    name: 'Vivienda & Renta',
    percentage: 0,
    color: '#3b82f6',
    icon: 'Home',
    description: 'Alquiler, hipoteca, mantenimiento y hogar',
    mode: 'personal',
  },
  {
    id: 'cat-pers-utilities',
    name: 'Servicios & Facturas',
    percentage: 0,
    color: '#f59e0b',
    icon: 'Zap',
    description: 'Luz, agua, internet, gas y suscripciones',
    mode: 'personal',
  },
  {
    id: 'cat-pers-transport',
    name: 'Transporte & Movilidad',
    percentage: 0,
    color: '#06b6d4',
    icon: 'Car',
    description: 'Gasolina, transporte público y mantenimiento',
    mode: 'personal',
  },
  {
    id: 'cat-pers-leisure',
    name: 'Ocio & Gustos',
    percentage: 0,
    color: '#ec4899',
    icon: 'Film',
    description: 'Salidas, entretenimiento y gustos personales',
    mode: 'personal',
  },
  {
    id: 'cat-pers-savings',
    name: 'Ahorro & Metas',
    percentage: 0,
    color: '#8b5cf6',
    icon: 'PiggyBank',
    description: 'Fondo de emergencia, metas y ahorro futuro',
    mode: 'personal',
  },
];

export const DEFAULT_BUSINESS_CATEGORIES: Category[] = [
  {
    id: 'cat-biz-inventory',
    name: 'Proveedores & Mercancía',
    percentage: 0,
    color: '#3b82f6',
    icon: 'Package',
    description: 'Compras de inventario, productos e insumos',
    mode: 'business',
  },
  {
    id: 'cat-biz-team',
    name: 'Sueldos & Equipo',
    percentage: 0,
    color: '#6366f1',
    icon: 'Users',
    description: 'Pagos al equipo, colaboradores y nómina',
    mode: 'business',
  },
  {
    id: 'cat-biz-ops',
    name: 'Servicios & Oficina',
    percentage: 0,
    color: '#f59e0b',
    icon: 'Briefcase',
    description: 'Alquiler, luz, software, hosting y herramientas',
    mode: 'business',
  },
  {
    id: 'cat-biz-ads',
    name: 'Marketing & Publicidad',
    percentage: 0,
    color: '#ec4899',
    icon: 'Megaphone',
    description: 'Anuncios, publicidad, redes y ventas',
    mode: 'business',
  },
  {
    id: 'cat-biz-taxes',
    name: 'Impuestos',
    percentage: 0,
    color: '#ef4444',
    icon: 'Landmark',
    description: 'Reserva para pago de impuestos y trámites',
    mode: 'business',
  },
  {
    id: 'cat-biz-profit',
    name: 'Ganancias & Utilidad',
    percentage: 0,
    color: '#10b981',
    icon: 'Coins',
    description: 'Ganancia libre del negocio y retiros',
    mode: 'business',
  },
];

export const INITIAL_CATEGORIES: Category[] = [];

export const PERSONAL_BUDGET_PRESETS: BudgetPreset[] = [
  {
    id: '50-30-20',
    name: 'Regla 50/30/20 (Finanzas Clásicas)',
    description: '50% Necesidades (Vivienda/Comida), 30% Deseos & Ocio, 20% Ahorro',
    mode: 'personal',
    allocations: {
      'Alimentación & Supermercado': 25,
      'Vivienda & Renta': 25,
      'Servicios & Facturas': 10,
      'Transporte & Movilidad': 5,
      'Ocio & Gustos': 15,
      'Ahorro & Metas': 20,
    },
  },
  {
    id: 'gasti-classic',
    name: 'Gasti 6 Bolsitas (Equilibrado)',
    description: '25% Comida, 25% Vivienda, 15% Servicios, 10% Transporte, 10% Ocio, 15% Ahorro',
    mode: 'personal',
    allocations: {
      'Alimentación & Supermercado': 25,
      'Vivienda & Renta': 25,
      'Servicios & Facturas': 15,
      'Transporte & Movilidad': 10,
      'Ocio & Gustos': 10,
      'Ahorro & Metas': 15,
    },
  },
  {
    id: 'frugal-saver',
    name: 'Ahorro Fuerte (30% Ahorro)',
    description: 'Prioriza ahorrar e invertir al máximo',
    mode: 'personal',
    allocations: {
      'Alimentación & Supermercado': 20,
      'Vivienda & Renta': 25,
      'Servicios & Facturas': 10,
      'Transporte & Movilidad': 10,
      'Ocio & Gustos': 5,
      'Ahorro & Metas': 30,
    },
  },
  {
    id: '70-20-10',
    name: 'Método 70/20/10',
    description: '70% Gastos de vida, 20% Ahorro, 10% Gustos libres',
    mode: 'personal',
    allocations: {
      'Alimentación & Supermercado': 30,
      'Vivienda & Renta': 25,
      'Servicios & Facturas': 15,
      'Transporte & Movilidad': 10,
      'Ocio & Gustos': 10,
      'Ahorro & Metas': 10,
    },
  },
];

export const BUSINESS_BUDGET_PRESETS: BudgetPreset[] = [
  {
    id: 'biz-balanced',
    name: 'Reparto Negocio Equilibrado',
    description: '30% Mercancía/Proveedores, 25% Sueldos, 15% Operación, 10% Marketing, 10% Impuestos, 10% Ganancia',
    mode: 'business',
    allocations: {
      'Proveedores & Mercancía': 30,
      'Sueldos & Equipo': 25,
      'Servicios & Oficina': 15,
      'Marketing & Publicidad': 10,
      'Impuestos': 10,
      'Ganancias & Utilidad': 10,
    },
  },
  {
    id: 'biz-profit-first',
    name: 'Ganancia Primero (Profit First)',
    description: '20% Ganancias, 30% Sueldos, 25% Operación, 15% Impuestos, 10% Mercancía',
    mode: 'business',
    allocations: {
      'Ganancias & Utilidad': 20,
      'Sueldos & Equipo': 30,
      'Servicios & Oficina': 25,
      'Impuestos': 15,
      'Proveedores & Mercancía': 10,
    },
  },
];

export const BUDGET_PRESETS: BudgetPreset[] = [
  ...PERSONAL_BUDGET_PRESETS,
  ...BUSINESS_BUDGET_PRESETS,
];

export const INITIAL_ALERT_SETTINGS: AlertSettings = {
  warningThreshold: 80, // Alert at 80% of budget
  dangerThreshold: 100, // Alert at 100% of budget
  enableSound: false,
  enableBanner: true,
};

export const INITIAL_INCOME = 0; // Empty baseline for user input

export function getSampleExpenses(currentYearMonth: string): Expense[] {
  return [];
}


