export type TransactionType = 'expense' | 'income';

export type ExpenseCategory =
  | 'food'
  | 'shopping'
  | 'transport'
  | 'bills'
  | 'entertainment'
  | 'health'
  | 'housing'
  | 'education'
  | 'travel'
  | 'salary'
  | 'freelance'
  | 'investments'
  | 'other';

export type PaymentMethod =
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'upi'
  | 'other';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface Budget {
  category: ExpenseCategory;
  limit: number;
}

export interface CategoryInfo {
  id: ExpenseCategory;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  type: 'expense' | 'income' | 'both';
}

export const CATEGORIES: Record<ExpenseCategory, CategoryInfo> = {
  food: {
    id: 'food',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    type: 'expense',
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping',
    icon: 'ShoppingBag',
    color: '#EC4899',
    bgColor: '#FCE7F3',
    type: 'expense',
  },
  transport: {
    id: 'transport',
    name: 'Transportation',
    icon: 'Car',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    type: 'expense',
  },
  bills: {
    id: 'bills',
    name: 'Bills & Utilities',
    icon: 'Zap',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    type: 'expense',
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'Film',
    color: '#6366F1',
    bgColor: '#E0E7FF',
    type: 'expense',
  },
  health: {
    id: 'health',
    name: 'Health & Medical',
    icon: 'HeartPulse',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    type: 'expense',
  },
  housing: {
    id: 'housing',
    name: 'Housing & Rent',
    icon: 'Home',
    color: '#14B8A6',
    bgColor: '#CCFBF1',
    type: 'expense',
  },
  education: {
    id: 'education',
    name: 'Education',
    icon: 'GraduationCap',
    color: '#06B6D4',
    bgColor: '#CFFAFE',
    type: 'expense',
  },
  travel: {
    id: 'travel',
    name: 'Travel & Vacation',
    icon: 'Plane',
    color: '#F97316',
    bgColor: '#FFEDD5',
    type: 'expense',
  },
  salary: {
    id: 'salary',
    name: 'Salary',
    icon: 'Briefcase',
    color: '#10B981',
    bgColor: '#D1FAE5',
    type: 'income',
  },
  freelance: {
    id: 'freelance',
    name: 'Freelance & Side Gig',
    icon: 'Laptop',
    color: '#059669',
    bgColor: '#A7F3D0',
    type: 'income',
  },
  investments: {
    id: 'investments',
    name: 'Investments & Dividends',
    icon: 'TrendingUp',
    color: '#10B981',
    bgColor: '#D1FAE5',
    type: 'income',
  },
  other: {
    id: 'other',
    name: 'Other',
    icon: 'MoreHorizontal',
    color: '#64748B',
    bgColor: '#F1F5F9',
    type: 'both',
  },
};

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'credit_card', label: 'Credit Card', icon: 'CreditCard' },
  { id: 'debit_card', label: 'Debit Card', icon: 'CreditCard' },
  { id: 'upi', label: 'UPI / Digital', icon: 'Smartphone' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: 'Building' },
  { id: 'cash', label: 'Cash', icon: 'Banknote' },
  { id: 'other', label: 'Other', icon: 'HelpCircle' },
];
