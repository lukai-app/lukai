export interface Week {
  id: string;
  weekNumber: number;
  dateRange: string;
  startDate: Date;
  endDate: Date;
}

export interface Category {
  id: string;
  name: string;
  items: CategoryItem[];
}

export interface CategoryItem {
  id: string;
  name: string;
  amount: number;
  weeklyAmounts: Record<string, number>;
}

export interface CashFlowData {
  weeks: Week[];
  categories: Category[];
}
