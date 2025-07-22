export interface CashFlowData {
  weeks: Week[];
  categories: Category[];
}

export interface Week {
  id: string;
  weekNumber: number;
  dateRange: string;
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
  weeklyAmounts: Record<string, number>; // Mapa de weekId -> amount
}
