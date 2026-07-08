export enum CharacterType {
  STUDENT = "STUDENT",
  YOUNG_PROFESSIONAL = "YOUNG_PROFESSIONAL",
  ENTREPRENEUR = "ENTREPRENEUR"
}

export interface Character {
  id: string;
  type: CharacterType;
  name: string;
  role: string;
  avatar: string;
  description: string;
  startingBalance: number;
  startingSavings: number;
  startingDebt: number;
  baseIncome: number;
  baseRent: number;
  baseGroceries: number;
  baseBills: number;
  goals: string[];
  perk?: string;
  jetpackColor?: string;
  avatarColor?: string;
}

export interface DecisionOption {
  text: string;
  description: string;
  balanceChange: number;
  savingsChange: number;
  debtChange: number;
  stressChange: number; // -100 to 100 percentage points
  longTermBenefit?: string; // description of long term compounding effect
}

export interface FinancialEvent {
  id: string;
  title: string;
  description: string;
  category: "income" | "rent" | "grocery" | "social" | "emergency" | "investment" | "luxury";
  icon: string;
  options: DecisionOption[];
}

export interface MonthState {
  monthIndex: number; // 0 (January) to 11 (December)
  name: string;
  events: FinancialEvent[];
}

export interface MonthRecord {
  monthName: string;
  income: number;
  expenses: number;
  saved: number;
  endBalance: number;
  endSavings: number;
  endDebt: number;
  stress: number;
  choicesMade: {
    eventTitle: string;
    choiceText: string;
    financialImpact: string;
  }[];
}

export interface GameState {
  character: Character | null;
  currentMonthIndex: number; // 0 to 11
  currentEventIndex: number; // progress through current month's events
  balance: number;
  savings: number;
  debt: number;
  stress: number; // 0 (zen) to 100 (bankrupt/crisis)
  lives: number; // 0 to 3 hearts
  netWorthHistory: number[]; // track end-of-month net worths
  history: MonthRecord[];
  gamePhase: "WELCOME" | "PLAYING" | "MONTH_REVIEW" | "YEAR_SUMMARY" | "GAME_OVER";
  isAILoading: boolean;
  aiFeedback: string | null;
}
