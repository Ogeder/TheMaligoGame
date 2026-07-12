export interface UserStats {
  totalShardsCollected: number; // flappy shards
  totalDebtRepaid: number; // accumulated debt paid off
  totalSavingsAmassed: number; // highest ever savings balance
  monthsWithLowStress: number; // consecutive or total months with stress < 30
  highestNetWorth: number; // highest net worth reached
  highestFlappyScore: number; // flappy high score
  totalSweepsCompleted: number; // automatic savings sweeps
  monthsCompletedNoLoss: number; // consecutive months played without losing a heart
  totalThriftyChoices: number; // smart low-cost decisions chosen
  chronoMirrorSimulations: number; // chrono mirror runs
  yearsFinished: number; // years completed (reached Year Summary)
  charactersPlayed: string[]; // unique character IDs played
  accumulatedCash: number; // highest ever wallet balance
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  milestoneNumber: number; // Number displayed on the badge (e.g., 5000, 10, 15000)
  target: number; // Value needed to unlock/complete the progress
  category: "wealth" | "savings" | "debt" | "stress" | "games" | "mastery";
  themeColor: string; // Tailwind bg/border colors
  iconEmoji: string; // Emoji representing the badge
  iconGradient: string; // Gradient class for the badge background
}

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: "coin_hoarder",
    title: "Coin Hoarder",
    description: "Accumulate R5,000 cash balance in your available wallet.",
    milestoneNumber: 5000,
    target: 5000,
    category: "wealth",
    themeColor: "amber",
    iconEmoji: "💰",
    iconGradient: "from-amber-400 to-yellow-500"
  },
  {
    id: "debt_annihilator",
    title: "Debt Buster",
    description: "Repay R10,000 of accumulated Debt Trap Curse obligations.",
    milestoneNumber: 10000,
    target: 10000,
    category: "debt",
    themeColor: "rose",
    iconEmoji: "🛡️",
    iconGradient: "from-rose-400 to-red-500"
  },
  {
    id: "compound_custodian",
    title: "Compound Custodian",
    description: "Amass R15,000 in compounding high-yield savings.",
    milestoneNumber: 15000,
    target: 15000,
    category: "savings",
    themeColor: "emerald",
    iconEmoji: "💎",
    iconGradient: "from-emerald-400 to-teal-500"
  },
  {
    id: "stress_shield",
    title: "Zen Master",
    description: "Maintain stress under 30% for 6 total months.",
    milestoneNumber: 6,
    target: 6,
    category: "stress",
    themeColor: "purple",
    iconEmoji: "🧘",
    iconGradient: "from-purple-400 to-indigo-500"
  },
  {
    id: "savannah_tycoon",
    title: "Savannah Tycoon",
    description: "Reach R30,000 in total Vault Net Worth.",
    milestoneNumber: 30000,
    target: 30000,
    category: "wealth",
    themeColor: "yellow",
    iconEmoji: "👑",
    iconGradient: "from-yellow-400 to-orange-500"
  },
  {
    id: "labyrinth_master",
    title: "Labyrinth Master",
    description: "Score 20 points in the Chrono-Flap Labyrinth mini-game.",
    milestoneNumber: 20,
    target: 20,
    category: "games",
    themeColor: "indigo",
    iconEmoji: "🕹️",
    iconGradient: "from-indigo-400 to-violet-500"
  },
  {
    id: "sweep_champion",
    title: "Sweep Champion",
    description: "Successfully trigger 8 automated savings payday sweeps.",
    milestoneNumber: 8,
    target: 8,
    category: "savings",
    themeColor: "teal",
    iconEmoji: "⚡",
    iconGradient: "from-cyan-400 to-teal-500"
  },
  {
    id: "flawless_finisher",
    title: "Flawless Finisher",
    description: "Complete 12 consecutive months without a single heart loss.",
    milestoneNumber: 12,
    target: 12,
    category: "mastery",
    themeColor: "orange",
    iconEmoji: "❤️",
    iconGradient: "from-orange-400 to-amber-500"
  },
  {
    id: "thrifty_maverick",
    title: "Thrifty Maverick",
    description: "Choose 10 budget-conscious thrifty option choices.",
    milestoneNumber: 10,
    target: 10,
    category: "savings",
    themeColor: "green",
    iconEmoji: "🥦",
    iconGradient: "from-green-400 to-emerald-500"
  },
  {
    id: "chrono_alchemist",
    title: "Chrono Alchemist",
    description: "Simulate 5 complete lifetimes in the Chrono-Mirror speedrunner.",
    milestoneNumber: 5,
    target: 5,
    category: "games",
    themeColor: "cyan",
    iconEmoji: "🕰️",
    iconGradient: "from-sky-400 to-blue-500"
  },
  {
    id: "legend",
    title: "Legend",
    description: "Complete the full 12-month year successfully.",
    milestoneNumber: 1,
    target: 1,
    category: "mastery",
    themeColor: "fuchsia",
    iconEmoji: "🏆",
    iconGradient: "from-fuchsia-400 to-purple-500"
  },
  {
    id: "league_mvp",
    title: "League MVP",
    description: "Play and master all 3 starting Meerkat characters.",
    milestoneNumber: 3,
    target: 3,
    category: "mastery",
    themeColor: "pink",
    iconEmoji: "🏅",
    iconGradient: "from-pink-400 to-rose-500"
  }
];

export const INITIAL_USER_STATS: UserStats = {
  totalShardsCollected: 0,
  totalDebtRepaid: 0,
  totalSavingsAmassed: 0,
  monthsWithLowStress: 0,
  highestNetWorth: 0,
  highestFlappyScore: 0,
  totalSweepsCompleted: 0,
  monthsCompletedNoLoss: 0,
  totalThriftyChoices: 0,
  chronoMirrorSimulations: 0,
  yearsFinished: 0,
  charactersPlayed: [],
  accumulatedCash: 0
};

export function getStatForAchievement(id: string, stats: UserStats): number {
  switch (id) {
    case "coin_hoarder":
      return stats.accumulatedCash;
    case "debt_annihilator":
      return stats.totalDebtRepaid;
    case "compound_custodian":
      return stats.totalSavingsAmassed;
    case "stress_shield":
      return stats.monthsWithLowStress;
    case "savannah_tycoon":
      return stats.highestNetWorth;
    case "labyrinth_master":
      return stats.highestFlappyScore;
    case "sweep_champion":
      return stats.totalSweepsCompleted;
    case "flawless_finisher":
      return stats.monthsCompletedNoLoss;
    case "thrifty_maverick":
      return stats.totalThriftyChoices;
    case "chrono_alchemist":
      return stats.chronoMirrorSimulations;
    case "legend":
      return stats.yearsFinished;
    case "league_mvp":
      return stats.charactersPlayed.length;
    default:
      return 0;
  }
}
