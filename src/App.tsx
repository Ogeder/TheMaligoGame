import React, { useState } from "react";
import { Character, GameState, DecisionOption } from "./types";
import { getScenariosForMonth, MONTHS } from "./data/scenarios";
import WelcomeScreen from "./components/WelcomeScreen";
import Dashboard from "./components/Dashboard";
import GameBoard from "./components/GameBoard";
import MonthlyReview from "./components/MonthlyReview";
import YearSummary from "./components/YearSummary";
import LifeSpeedrunner from "./components/LifeSpeedrunner";
import GameOverScreen from "./components/GameOverScreen";
import FlappyLabyrinth from "./components/FlappyLabyrinth";
import BounceGame from "./components/BounceGame";
import StackHighGame from "./components/StackHighGame";
import TapMaliGame from "./components/TapMaliGame";
import DealSlicerGame from "./components/DealSlicerGame";
import { Compass, Coins, Sparkles, TrendingUp, AlertTriangle, Heart, RefreshCw, Star, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserStats, Achievement, ACHIEVEMENTS_LIST, getStatForAchievement, INITIAL_USER_STATS } from "./data/achievements";
import AchievementsPanel from "./components/AchievementsPanel";

const INITIAL_STATE: GameState = {
  character: null,
  currentMonthIndex: 0,
  currentEventIndex: 0,
  balance: 0,
  savings: 0,
  debt: 0,
  stress: 0,
  lives: 3,
  netWorthHistory: [],
  history: [],
  gamePhase: "WELCOME",
  isAILoading: false,
  aiFeedback: null
};

export default function App() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [currentChoices, setCurrentChoices] = useState<any[]>([]);
  const [monthStartBalance, setMonthStartBalance] = useState<number>(0);
  const [monthStartSavings, setMonthStartSavings] = useState<number>(0);
  const [monthStartDebt, setMonthStartDebt] = useState<number>(0);

  // Rescue and reward state flags
  const [rescueMessage, setRescueMessage] = useState<{ title: string; desc: string } | null>(null);
  const [earnedLifeMessage, setEarnedLifeMessage] = useState<string | null>(null);
  const [showSpeedrunner, setShowSpeedrunner] = useState<boolean>(false);
  const [showFlappyGame, setShowFlappyGame] = useState<boolean>(false);
  const [showBounceGame, setShowBounceGame] = useState<boolean>(false);
  const [showStackGame, setShowStackGame] = useState<boolean>(false);
  const [showTapMaliGame, setShowTapMaliGame] = useState<boolean>(false);
  const [showDealSlicerGame, setShowDealSlicerGame] = useState<boolean>(false);

  const [unlockedGameType, setUnlockedGameType] = useState<"BOUNCE" | "STACK" | "TAP_MALI" | "SLICER" | null>(null);
  const [hasBounceGameUnlocked, setHasBounceGameUnlocked] = useState<boolean>(false);
  const [bounceUnlockMessage, setBounceUnlockMessage] = useState<string | null>(null);
  const [unlockedGamesList, setUnlockedGamesList] = useState<string[]>(["BOUNCE"]);

  const unlockMilestoneGame = (gameId: string, message: string) => {
    setUnlockedGamesList(prev => {
      if (!prev.includes(gameId)) {
        setBounceUnlockMessage(message);
        return [...prev, gameId];
      }
      return prev;
    });
  };

  // Compound calculations records
  const [interestEarned, setInterestEarned] = useState<number>(0);
  const [interestAccrued, setInterestAccrued] = useState<number>(0);

  // Achievements Persistent State
  const [userStats, setUserStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem("maligo_user_stats");
      if (saved) {
        return { ...INITIAL_USER_STATS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error("Failed to load user stats:", e);
    }
    return INITIAL_USER_STATS;
  });

  const [newlyUnlockedIds, setNewlyUnlockedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("maligo_new_achievements");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return [];
  });

  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [activeAchievementToast, setActiveAchievementToast] = useState<Achievement | null>(null);
  const [streakLowStress, setStreakLowStress] = useState<number>(0);

  const updateStats = (updater: (prev: UserStats) => UserStats) => {
    setUserStats(prev => {
      const updated = updater(prev);
      try {
        localStorage.setItem("maligo_user_stats", JSON.stringify(updated));
      } catch (e) {}

      // Check unlocks
      const newlyUnlocked: string[] = [];
      const unlockedKey = "maligo_unlocked_ach_ids";
      let savedUnlocked: string[] = [];
      try {
        const raw = localStorage.getItem(unlockedKey);
        if (raw) savedUnlocked = JSON.parse(raw);
      } catch (e) {}

      ACHIEVEMENTS_LIST.forEach(ach => {
        const currentVal = getStatForAchievement(ach.id, updated);
        const isCompleted = currentVal >= ach.target;

        if (isCompleted && !savedUnlocked.includes(ach.id)) {
          newlyUnlocked.push(ach.id);
          savedUnlocked.push(ach.id);
          try {
            localStorage.setItem(unlockedKey, JSON.stringify(savedUnlocked));
          } catch (e) {}

          // Display gorgeous toast notification
          setActiveAchievementToast(ach);
          setTimeout(() => {
            setActiveAchievementToast(null);
          }, 5000);
        }
      });

      if (newlyUnlocked.length > 0) {
        setNewlyUnlockedIds(prevNew => {
          const nextNew = [...Array.from(new Set([...prevNew, ...newlyUnlocked]))];
          try {
            localStorage.setItem("maligo_new_achievements", JSON.stringify(nextNew));
          } catch (e) {}
          return nextNew;
        });
      }

      return updated;
    });
  };

  const handleClearNewStatus = (id: string) => {
    setNewlyUnlockedIds(prev => {
      const next = prev.filter(x => x !== id);
      try {
        localStorage.setItem("maligo_new_achievements", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleResetAchievements = () => {
    try {
      localStorage.removeItem("maligo_user_stats");
      localStorage.removeItem("maligo_new_achievements");
      localStorage.removeItem("maligo_unlocked_ach_ids");
    } catch (e) {}
    setUserStats(INITIAL_USER_STATS);
    setNewlyUnlockedIds([]);
    setStreakLowStress(0);
    setActiveAchievementToast(null);
  };

  // 1. Select Character & Start Game
  const handleSelectCharacter = (char: Character) => {
    // Starting balances
    const initialBalance = char.startingBalance;
    const initialSavings = char.startingSavings;
    const initialDebt = char.startingDebt;

    // Apply first month's salary and fixed costs at the very start
    const fixedRent = char.baseRent;
    const netStartBalance = initialBalance + char.baseIncome - fixedRent;

    setState({
      ...INITIAL_STATE,
      character: char,
      balance: netStartBalance,
      savings: initialSavings,
      debt: initialDebt,
      stress: 15, // start with minor baseline stress
      gamePhase: "PLAYING"
    });

    setMonthStartBalance(netStartBalance);
    setMonthStartSavings(initialSavings);
    setMonthStartDebt(initialDebt);
    setCurrentChoices([]);

    // Update Achievements stats for character selected
    updateStats(prev => ({
      ...prev,
      charactersPlayed: Array.from(new Set([...prev.charactersPlayed, char.id])),
      accumulatedCash: Math.max(prev.accumulatedCash, netStartBalance),
      totalSavingsAmassed: Math.max(prev.totalSavingsAmassed, initialSavings),
      highestNetWorth: Math.max(prev.highestNetWorth, netStartBalance + initialSavings - initialDebt)
    }));
  };

  // 2. Handle Decision Selection
  const handleChoiceSelected = (option: DecisionOption) => {
    if (!state.character) return;

    // Perk checks
    let balanceChangeMod = option.balanceChange;
    if (state.character.perk === "Thrifty Diet" && option.balanceChange < 0 && (option.text.toLowerCase().includes("grocer") || option.text.toLowerCase().includes("food") || option.text.toLowerCase().includes("meal"))) {
      balanceChangeMod = Math.round(option.balanceChange * 0.8);
    }

    let stressChangeMod = option.stressChange;
    if (state.character.perk === "Zen Mind" && option.stressChange > 0) {
      stressChangeMod = Math.round(option.stressChange * 0.75);
    }

    let newBalance = state.balance + balanceChangeMod;
    let newSavings = state.savings + option.savingsChange;
    let newDebt = state.debt + option.debtChange;
    let newStress = Math.max(0, Math.min(100, state.stress + stressChangeMod));

    // Real-world Cash Crisis Solver
    // If Cash Balance goes negative:
    if (newBalance < 0) {
      // 1. Check if we have Savings to cover the deficit
      if (newSavings >= Math.abs(newBalance)) {
        newSavings += newBalance; // deduct from savings
        newBalance = 0;
        newStress = Math.min(100, newStress + 10); // minor stress increase for dipping into savings
      } else {
        // 2. Drained savings entirely, remaining goes into HIGH-INTEREST DEBT
        const deficit = Math.abs(newBalance) - newSavings;
        newSavings = 0;
        newBalance = 0;
        newDebt += deficit;
        newStress = Math.min(100, newStress + 25); // high stress penalty for taking emergency debt!
      }
    }

    // --- Loss of Life checking ---
    const maxAllowedDebt = state.character.baseIncome * 2.5;
    let finalLives = state.lives;
    let finalStress = newStress;
    let finalDebt = newDebt;

    if (newStress >= 100) {
      finalLives = state.lives - 1;
      if (finalLives > 0) {
        finalStress = 35; // reset stress to a restabilized 35%
        setRescueMessage({
          title: "🚨 Severe Stress Burnout!",
          desc: "Your stress levels maxed out at 100%! You lost 1 life. Your support system stepped in to help you relax, resetting your stress back to 35% to let you recover."
        });
      }
    } else if (newDebt >= maxAllowedDebt) {
      finalLives = state.lives - 1;
      if (finalLives > 0) {
        finalDebt = Math.max(0, newDebt - 2000); // defer debt to prevent instant loop death
        finalStress = 40;
        setRescueMessage({
          title: "🛑 Critical Debt Overload!",
          desc: `Your total debt reached R${Math.round(maxAllowedDebt).toLocaleString()} (exceeding 2.5x your monthly custom income)! You lost 1 life. Creditors restructured your obligations, forgiving R2,000 to prevent immediate default.`
        });
      }
    }

    if (finalLives <= 0) {
      // Game Over immediately
      setState(prev => ({
        ...prev,
        lives: 0,
        balance: Math.round(newBalance),
        savings: Math.round(newSavings),
        debt: Math.round(newDebt),
        stress: 100,
        gamePhase: "GAME_OVER"
      }));
      return;
    }

    // Check if this choice was a proper nice financial decision
    const isNiceFinancialDecision = 
      option.savingsChange > 0 || 
      option.debtChange < 0 || 
      (option.balanceChange + option.savingsChange - option.debtChange > 0) ||
      (option.stressChange < 0 && option.balanceChange >= 0);

    if (isNiceFinancialDecision) {
      setHasBounceGameUnlocked(true);
      const games = ["SLICER", "BOUNCE", "TAP_MALI", "STACK"];
      const chosenGame = games[Math.floor(Math.random() * games.length)];
      setUnlockedGameType(chosenGame as any);

      if (chosenGame === "STACK") {
        unlockMilestoneGame("STACK", `🏆 MILESTONE UNLOCKED! Wealth Tower Stack mini-game unlocked! Build your skyscraper! 🏢`);
      } else if (chosenGame === "TAP_MALI") {
        unlockMilestoneGame("TAP_MALI", `🏆 MILESTONE UNLOCKED! Tap Mali Meerkat & Friends mini-game unlocked! Tap savers! 🦦`);
      } else if (chosenGame === "SLICER") {
        unlockMilestoneGame("SLICER", `🏆 MILESTONE UNLOCKED! Deal Slicer mini-game unlocked! Slice deals & vouchers! ✂️`);
      } else {
        unlockMilestoneGame("BOUNCE", `🏆 MILESTONE UNLOCKED! MaliGo Bounce Blitz unlocked! Bounce off wealth shield! ⚽`);
      }
    }

    // Check balance / savings / net worth milestones for automatic game unlocks
    const currentNetWorth = Math.round(newBalance + newSavings - finalDebt);
    if (newSavings >= 3000) {
      unlockMilestoneGame("TAP_MALI", `🏆 SAVINGS MILESTONE UNLOCKED! Tap Mali Meerkat Game unlocked! 🦦`);
    }
    if (newSavings >= 8000 || currentNetWorth >= 10000) {
      unlockMilestoneGame("STACK", `🏆 WEALTH TOWER MILESTONE! Stack High Game unlocked! 🏢`);
    }
    if (finalDebt === 0) {
      unlockMilestoneGame("FLAPPY", `🏆 DEBT-FREE MILESTONE! Chrono-Flap Arcade unlocked! 🕹️`);
    }
    if (currentNetWorth >= 20000) {
      unlockMilestoneGame("CHRONO", `🏆 FINANCIAL INDEPENDENCE MILESTONE! Chrono-Mirror Portal unlocked! 🕰️`);
    }

    // Record the choices made for AI feedback and ledger
    const financialImpactDesc = [
      option.balanceChange !== 0 ? `${option.balanceChange > 0 ? "+" : ""}R${option.balanceChange} Cash` : "",
      option.savingsChange !== 0 ? `${option.savingsChange > 0 ? "+" : ""}R${option.savingsChange} Savings` : "",
      option.debtChange !== 0 ? `${option.debtChange > 0 ? "+" : ""}R${option.debtChange} Debt` : "",
      option.stressChange !== 0 ? `${option.stressChange > 0 ? "+" : ""}R${option.stressChange}% Stress` : ""
    ].filter(Boolean).join(", ");

    const currentScenarios = getScenariosForMonth(state.character.type, state.currentMonthIndex);
    const currentEvent = currentScenarios[state.currentEventIndex];

    const recordedChoice = {
      eventTitle: currentEvent.title,
      choiceText: option.text,
      financialImpact: financialImpactDesc || "No direct impact"
    };

    const updatedChoices = [...currentChoices, recordedChoice];
    setCurrentChoices(updatedChoices);

    const nextEventIndex = state.currentEventIndex + 1;
    let sweptToSavings = 0;
    let nextLives = finalLives;

    if (nextEventIndex >= currentScenarios.length) {
      // MONTH COMPLETED - Trigger month-end ledger sweep & interest compounding
      
      // Side Hustler perk quarterly cash dividend
      if (state.character.perk === "Side Hustler" && (state.currentMonthIndex === 2 || state.currentMonthIndex === 5 || state.currentMonthIndex === 8 || state.currentMonthIndex === 11)) {
        newBalance += 300;
      }

      // A. Automatic Payday Savings Sweep
      // Leave a small cash buffer for the month, sweep remaining surplus to compounding savings
      let cashBuffer = 300; // default student
      if (state.character.type === CharacterType_YOUNG_PROFESSIONAL()) {
        cashBuffer = 1500;
      } else if (state.character.type === CharacterType_ENTREPRENEUR()) {
        cashBuffer = 1000;
      }

      if (newBalance > cashBuffer) {
        sweptToSavings = newBalance - cashBuffer;
        newSavings += sweptToSavings;
        newBalance = cashBuffer;
      }

      // Check for High Savings Reward (+1 life, capped at 3)
      const targetSavingsRate = Math.round(state.character.baseIncome * 0.15);
      if (sweptToSavings >= targetSavingsRate) {
        if (finalLives < 3) {
          nextLives = finalLives + 1;
          setEarnedLifeMessage(`Savings Star! You automated R${sweptToSavings.toLocaleString()} (over 15% of your income) into compound savings this month. You earned 1 life back!`);
        } else {
          setEarnedLifeMessage(`Savings Champion! You automated R${sweptToSavings.toLocaleString()} into savings. Your lives are already full, you are financially bulletproof!`);
        }
      }

      // B. Compound Interest Calculations
      // Savings compound interest (annual rates: Student 7%, Pro 11%, Ent 6%)
      let annualSavingsRate = 0.07;
      if (state.character.type === CharacterType_YOUNG_PROFESSIONAL()) {
        annualSavingsRate = 0.11;
      } else if (state.character.type === CharacterType_ENTREPRENEUR()) {
        annualSavingsRate = 0.06;
      }
      
      const monthlySavingsInterest = newSavings * (annualSavingsRate / 12);
      newSavings += monthlySavingsInterest;

      // Debt compounding (2.5% per month, standard credit card / retail debt)
      const monthlyDebtInterest = finalDebt * 0.025;
      finalDebt += monthlyDebtInterest;

      setInterestEarned(monthlySavingsInterest);
      setInterestAccrued(monthlyDebtInterest);

      const netExpenses = (monthStartBalance + state.character.baseIncome) - newBalance - sweptToSavings;

      const record: any = {
        monthName: MONTHS[state.currentMonthIndex].name,
        income: state.character.baseIncome,
        expenses: Math.max(0, netExpenses),
        saved: sweptToSavings,
        endBalance: Math.round(newBalance),
        endSavings: Math.round(newSavings),
        endDebt: Math.round(finalDebt),
        stress: finalStress,
        choicesMade: updatedChoices
      };

      const finalNetWorth = Math.round(newBalance + newSavings - finalDebt);
      const updatedNetWorthHistory = [...state.netWorthHistory, finalNetWorth];

      setState(prev => ({
        ...prev,
        balance: Math.round(newBalance),
        savings: Math.round(newSavings),
        debt: Math.round(finalDebt),
        stress: finalStress,
        lives: nextLives,
        netWorthHistory: updatedNetWorthHistory,
        history: [...prev.history, record],
        gamePhase: "MONTH_REVIEW",
        isAILoading: true,
        aiFeedback: null
      }));

      // Trigger Server-Side MaliGo AI Financial Coach (Gemini)
      triggerAICoachFeedback(state.character, state.currentMonthIndex, Math.round(newBalance), Math.round(newSavings), Math.round(finalDebt), finalStress, updatedChoices);

    } else {
      // Just advance to the next step in the monthly maze
      setState(prev => ({
        ...prev,
        balance: Math.round(newBalance),
        savings: Math.round(newSavings),
        debt: Math.round(finalDebt),
        stress: finalStress,
        lives: finalLives,
        currentEventIndex: nextEventIndex
      }));
    }

    // Update achievements stats
    updateStats(prev => {
      const extraThrifty = (option.balanceChange >= 0 || option.savingsChange > 0 || option.debtChange < 0) ? 1 : 0;
      const extraDebtRepaid = option.debtChange < 0 ? Math.abs(option.debtChange) : 0;

      let extraSweeps = 0;
      let extraLowStress = 0;
      let nextNoLossCount = prev.monthsCompletedNoLoss;

      if (nextEventIndex >= currentScenarios.length) {
        if (sweptToSavings > 0) {
          extraSweeps = 1;
        }
        if (finalStress < 30) {
          extraLowStress = 1;
        }
        if (nextLives < state.lives) {
          nextNoLossCount = 0;
        } else {
          nextNoLossCount = Math.min(12, nextNoLossCount + 1);
        }
      }

      const endBal = Math.round(newBalance);
      const endSav = Math.round(newSavings);
      const endDeb = Math.round(finalDebt);
      const nw = endBal + endSav - endDeb;

      return {
        ...prev,
        accumulatedCash: Math.max(prev.accumulatedCash, endBal),
        totalSavingsAmassed: Math.max(prev.totalSavingsAmassed, endSav),
        totalDebtRepaid: prev.totalDebtRepaid + extraDebtRepaid,
        totalThriftyChoices: prev.totalThriftyChoices + extraThrifty,
        highestNetWorth: Math.max(prev.highestNetWorth, nw),
        totalSweepsCompleted: prev.totalSweepsCompleted + extraSweeps,
        monthsWithLowStress: prev.monthsWithLowStress + extraLowStress,
        monthsCompletedNoLoss: nextNoLossCount
      };
    });
  };

  // Helper helper to get type references cleanly
  function CharacterType_YOUNG_PROFESSIONAL() {
    return "YOUNG_PROFESSIONAL";
  }
  function CharacterType_ENTREPRENEUR() {
    return "ENTREPRENEUR";
  }

  // 3. Trigger server-side Gemini AI Feedback
  const triggerAICoachFeedback = async (
    char: Character,
    monthIdx: number,
    bal: number,
    sav: number,
    deb: number,
    strs: number,
    choices: any[]
  ) => {
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character: char,
          monthIndex: monthIdx,
          balance: bal,
          savings: sav,
          debt: deb,
          stress: strs,
          choices: choices
        })
      });

      const data = await response.json();
      setState(prev => ({
        ...prev,
        isAILoading: false,
        aiFeedback: data.feedback || "Coach Gemini could not compile feedback. Keep going!"
      }));
    } catch (err) {
      console.error("Failed to query AI coach:", err);
      setState(prev => ({
        ...prev,
        isAILoading: false,
        aiFeedback: "MaliGo local backup: You navigated this chapter securely! Pay down your debt and keep automating savings to build robust long-term wealth."
      }));
    }
  };

  // 4. Advance to Next Month
  const handleNextMonth = () => {
    if (!state.character) return;

    if (state.currentMonthIndex >= 11) {
      // Reached Year End!
      setState(prev => ({
        ...prev,
        gamePhase: "YEAR_SUMMARY"
      }));
      updateStats(prev => ({
        ...prev,
        yearsFinished: prev.yearsFinished + 1
      }));
      return;
    }

    const nextMonthIdx = state.currentMonthIndex + 1;
    
    // Apply monthly salary/allowance and deduct fixed rent/groceries/bills
    const fixedRent = state.character.baseRent;
    const fixedGroceries = state.character.baseGroceries;
    const fixedBills = state.character.baseBills;
    const totalFixedOutflow = fixedRent + fixedGroceries + fixedBills;

    let updatedBalance = state.balance + state.character.baseIncome - totalFixedOutflow;
    let updatedSavings = state.savings;
    let updatedDebt = state.debt;
    let updatedStress = Math.min(100, Math.max(0, state.stress - 10)); // resting stress relief at month end

    // Check budget deficits on Payday
    if (updatedBalance < 0) {
      if (updatedSavings >= Math.abs(updatedBalance)) {
        updatedSavings += updatedBalance;
        updatedBalance = 0;
        updatedStress = Math.min(100, updatedStress + 10);
      } else {
        const diff = Math.abs(updatedBalance) - updatedSavings;
        updatedSavings = 0;
        updatedBalance = 0;
        updatedDebt += diff;
        updatedStress = Math.min(100, updatedStress + 25);
      }
    }

    // Check for Payday Default/Burnout Loss of Life
    const maxAllowedDebt = state.character.baseIncome * 2.5;
    let finalLives = state.lives;
    let finalStress = updatedStress;
    let finalDebt = updatedDebt;

    if (updatedStress >= 100) {
      finalLives = state.lives - 1;
      if (finalLives > 0) {
        finalStress = 35;
        setRescueMessage({
          title: "🚨 Severe Payday Burnout!",
          desc: "Paying off your fixed rent and monthly responsibilities maxed out your stress to 100%! You lost 1 life. Your support system helped you find breathing room, resetting stress back to 35%."
        });
      }
    } else if (updatedDebt >= maxAllowedDebt) {
      finalLives = state.lives - 1;
      if (finalLives > 0) {
        finalDebt = Math.max(0, updatedDebt - 2000);
        finalStress = 40;
        setRescueMessage({
          title: "🛑 Critical Payday Default!",
          desc: `Your fixed monthly outflows pushed your total debt to R${Math.round(maxAllowedDebt).toLocaleString()}! You lost 1 life. Creditors structured your obligations, forgiving R2,000 to keep you afloat.`
        });
      }
    }

    if (finalLives <= 0) {
      // Game Over immediately
      setState(prev => ({
        ...prev,
        lives: 0,
        balance: Math.round(updatedBalance),
        savings: Math.round(updatedSavings),
        debt: Math.round(updatedDebt),
        stress: 100,
        gamePhase: "GAME_OVER"
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      currentMonthIndex: nextMonthIdx,
      currentEventIndex: 0,
      balance: Math.round(updatedBalance),
      savings: Math.round(updatedSavings),
      debt: Math.round(finalDebt),
      stress: finalStress,
      lives: finalLives,
      gamePhase: "PLAYING",
      aiFeedback: null
    }));

    setMonthStartBalance(Math.round(updatedBalance));
    setMonthStartSavings(Math.round(updatedSavings));
    setMonthStartDebt(Math.round(finalDebt));
    setCurrentChoices([]);
  };

  // 5. Reset Game
  const handleReset = () => {
    setState(INITIAL_STATE);
    setCurrentChoices([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Outer Aesthetic Header */}
      <header className="bg-slate-900 text-white py-3.5 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/35 rounded-lg font-bold text-xs">
              M
            </span>
            <span className="font-sans font-extrabold text-sm tracking-tight flex items-center gap-1">
              MaliGo <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-semibold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">v1.2</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            Empowering Financial Literacy
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          
          {state.gamePhase === "WELCOME" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <WelcomeScreen onSelectCharacter={handleSelectCharacter} />
            </motion.div>
          )}

          {state.gamePhase === "PLAYING" && state.character && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {showFlappyGame ? (
                <FlappyLabyrinth
                  character={state.character}
                  currentBalance={state.balance}
                  currentSavings={state.savings}
                  currentDebt={state.debt}
                  stress={state.stress}
                  onGameRewardsGranted={(rewards) => {
                    setState(prev => {
                      const finalBal = Math.round(prev.balance + rewards.coinsEarned);
                      const finalSav = Math.round(prev.savings + rewards.shardsEarned * 10);
                      const nw = finalBal + finalSav - prev.debt;

                      updateStats(stats => ({
                        ...stats,
                        totalShardsCollected: stats.totalShardsCollected + rewards.shardsEarned,
                        highestFlappyScore: Math.max(stats.highestFlappyScore, rewards.shardsEarned),
                        accumulatedCash: Math.max(stats.accumulatedCash, finalBal),
                        totalSavingsAmassed: Math.max(stats.totalSavingsAmassed, finalSav),
                        highestNetWorth: Math.max(stats.highestNetWorth, nw)
                      }));

                      return {
                        ...prev,
                        balance: finalBal,
                        savings: finalSav,
                        stress: Math.max(0, prev.stress - rewards.stressRelieved)
                      };
                    });
                    setShowFlappyGame(false);
                  }}
                  onBack={() => setShowFlappyGame(false)}
                />
              ) : (
                <>
                  <Dashboard
                    character={state.character}
                    monthIndex={state.currentMonthIndex}
                    eventIndex={state.currentEventIndex}
                    totalEvents={getScenariosForMonth(state.character.type, state.currentMonthIndex).length}
                    balance={state.balance}
                    savings={state.savings}
                    debt={state.debt}
                    stress={state.stress}
                    lives={state.lives}
                    onReset={handleReset}
                    onOpenSpeedrunner={() => setShowSpeedrunner(true)}
                    onOpenFlappyGame={() => setShowFlappyGame(true)}
                    onOpenBounceGame={() => {
                      setShowBounceGame(true);
                      setHasBounceGameUnlocked(false);
                      setUnlockedGameType(null);
                      setBounceUnlockMessage(null);
                    }}
                    onOpenStackGame={() => {
                      setShowStackGame(true);
                      setHasBounceGameUnlocked(false);
                      setUnlockedGameType(null);
                      setBounceUnlockMessage(null);
                    }}
                    onOpenTapMaliGame={() => {
                      setShowTapMaliGame(true);
                      setHasBounceGameUnlocked(false);
                      setUnlockedGameType(null);
                      setBounceUnlockMessage(null);
                    }}
                    onOpenDealSlicerGame={() => {
                      setShowDealSlicerGame(true);
                      setHasBounceGameUnlocked(false);
                      setUnlockedGameType(null);
                      setBounceUnlockMessage(null);
                    }}
                    onOpenAchievements={() => setShowAchievements(true)}
                    newAchievementsCount={newlyUnlockedIds.length}
                    hasBounceGameUnlocked={hasBounceGameUnlocked}
                    unlockedGameType={unlockedGameType}
                    unlockedGamesList={unlockedGamesList}
                  />
                  <GameBoard
                    character={state.character}
                    event={getScenariosForMonth(state.character.type, state.currentMonthIndex)[state.currentEventIndex]}
                    stepIndex={state.currentEventIndex}
                    totalSteps={getScenariosForMonth(state.character.type, state.currentMonthIndex).length}
                    onChoiceSelected={handleChoiceSelected}
                    balance={state.balance}
                    savings={state.savings}
                    debt={state.debt}
                    stress={state.stress}
                    lives={state.lives}
                    onStatsChanged={(changes) => {
                      setState(prev => {
                        let newBalance = prev.balance + (changes.balance ?? 0);
                        let newSavings = prev.savings + (changes.savings ?? 0);
                        let newDebt = prev.debt + (changes.debt ?? 0);
                        let newStress = Math.max(0, Math.min(100, prev.stress + (changes.stress ?? 0)));
                        let newLives = prev.lives + (changes.lives ?? 0);

                        // Real-world Cash Crisis Solver
                        if (newBalance < 0) {
                          if (newSavings >= Math.abs(newBalance)) {
                            newSavings += newBalance;
                            newBalance = 0;
                            newStress = Math.min(100, newStress + 10);
                          } else {
                            const deficit = Math.abs(newBalance) - newSavings;
                            newSavings = 0;
                            newBalance = 0;
                            newDebt += deficit;
                            newStress = Math.min(100, newStress + 25);
                          }
                        }

                        // Loss of Life and Burnout checks
                        const maxAllowedDebt = (prev.character?.baseIncome ?? 1) * 2.5;
                        
                        if (newStress >= 100) {
                          newLives -= 1;
                          if (newLives > 0) {
                            newStress = 35;
                            setRescueMessage({
                              title: "🚨 Labyrinth Mental Burnout!",
                              desc: "Your meerkat was overwhelmed by extreme stress in the Labyrinth! You lost 1 life. Your mentor guided you to a resting sanctuary, resetting stress to 35%."
                            });
                          }
                        } else if (newDebt >= maxAllowedDebt) {
                          newLives -= 1;
                          if (newLives > 0) {
                            newDebt = Math.max(0, newDebt - 2000);
                            newStress = 40;
                            setRescueMessage({
                              title: "🛑 Critical Labyrinth Debt Curse!",
                              desc: `Your total debt in the Labyrinth reached R${Math.round(maxAllowedDebt).toLocaleString()}! You lost 1 life. Creditors restructured your liabilities, forgiving R2,000 to keep you on your path.`
                            });
                          }
                        }

                        if (newLives <= 0) {
                          return {
                            ...prev,
                            lives: 0,
                            balance: Math.round(newBalance),
                            savings: Math.round(newSavings),
                            debt: Math.round(newDebt),
                            stress: 100,
                            gamePhase: "GAME_OVER"
                          };
                        }

                        return {
                          ...prev,
                          balance: Math.round(newBalance),
                          savings: Math.round(newSavings),
                          debt: Math.round(newDebt),
                          stress: newStress,
                          lives: newLives
                        };
                      });
                    }}
                  />
                </>
              )}
            </motion.div>
          )}

          {state.gamePhase === "MONTH_REVIEW" && state.character && state.history.length > 0 && (
            <motion.div
              key="review"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MonthlyReview
                character={state.character}
                monthIndex={state.currentMonthIndex}
                monthRecord={state.history[state.history.length - 1]}
                interestEarned={interestEarned}
                interestAccrued={interestAccrued}
                aiFeedback={state.aiFeedback}
                isAILoading={state.isAILoading}
                onNextMonth={handleNextMonth}
                isYearEnd={state.currentMonthIndex === 11}
              />
            </motion.div>
          )}

          {state.gamePhase === "YEAR_SUMMARY" && state.character && (
            <motion.div
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <YearSummary
                character={state.character}
                history={state.history}
                netWorthHistory={state.netWorthHistory}
                onRestart={handleReset}
                onOpenSpeedrunner={() => setShowSpeedrunner(true)}
              />
            </motion.div>
          )}

          {state.gamePhase === "GAME_OVER" && state.character && (
            <motion.div
              key="game_over"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GameOverScreen
                character={state.character}
                monthIndex={state.currentMonthIndex}
                balance={state.balance}
                savings={state.savings}
                debt={state.debt}
                stress={state.stress}
                onRestart={handleReset}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Bounce Blitz Game Overlay Modal */}
      <AnimatePresence>
        {showBounceGame && state.character && (
          <BounceGame
            character={state.character}
            currentBalance={state.balance}
            currentSavings={state.savings}
            currentDebt={state.debt}
            stress={state.stress}
            onGameRewardsGranted={(rewards) => {
              setState(prev => {
                const finalBal = Math.round(prev.balance + rewards.coinsEarned);
                const finalSav = Math.round(prev.savings + rewards.shardsEarned);
                const nw = finalBal + finalSav - prev.debt;

                updateStats(stats => ({
                  ...stats,
                  accumulatedCash: Math.max(stats.accumulatedCash, finalBal),
                  totalSavingsAmassed: Math.max(stats.totalSavingsAmassed, finalSav),
                  highestNetWorth: Math.max(stats.highestNetWorth, nw)
                }));

                return {
                  ...prev,
                  balance: finalBal,
                  savings: finalSav,
                  stress: Math.max(0, prev.stress - rewards.stressRelieved)
                };
              });
              setShowBounceGame(false);
            }}
            onBack={() => setShowBounceGame(false)}
          />
        )}
      </AnimatePresence>

      {/* Stack High Wealth Tower Game Modal */}
      <AnimatePresence>
        {showStackGame && state.character && (
          <StackHighGame
            character={state.character}
            onGameRewardsGranted={(rewards) => {
              setState(prev => {
                const finalBal = Math.round(prev.balance + rewards.coinsEarned);
                const finalSav = Math.round(prev.savings + rewards.shardsEarned);
                const nw = finalBal + finalSav - prev.debt;

                updateStats(stats => ({
                  ...stats,
                  accumulatedCash: Math.max(stats.accumulatedCash, finalBal),
                  totalSavingsAmassed: Math.max(stats.totalSavingsAmassed, finalSav),
                  highestNetWorth: Math.max(stats.highestNetWorth, nw)
                }));

                return {
                  ...prev,
                  balance: finalBal,
                  savings: finalSav,
                  stress: Math.max(0, prev.stress - rewards.stressRelieved)
                };
              });
              setShowStackGame(false);
            }}
            onBack={() => setShowStackGame(false)}
          />
        )}
      </AnimatePresence>

      {/* Tap Mali Meerkat Game Modal */}
      <AnimatePresence>
        {showTapMaliGame && state.character && (
          <TapMaliGame
            character={state.character}
            onGameRewardsGranted={(rewards) => {
              setState(prev => {
                const finalBal = Math.round(prev.balance + rewards.coinsEarned);
                const finalSav = Math.round(prev.savings + rewards.shardsEarned);
                const nw = finalBal + finalSav - prev.debt;

                updateStats(stats => ({
                  ...stats,
                  accumulatedCash: Math.max(stats.accumulatedCash, finalBal),
                  totalSavingsAmassed: Math.max(stats.totalSavingsAmassed, finalSav),
                  highestNetWorth: Math.max(stats.highestNetWorth, nw)
                }));

                return {
                  ...prev,
                  balance: finalBal,
                  savings: finalSav,
                  stress: Math.max(0, prev.stress - rewards.stressRelieved)
                };
              });
              setShowTapMaliGame(false);
            }}
            onBack={() => setShowTapMaliGame(false)}
          />
        )}
      </AnimatePresence>

      {/* Deal Slicer Game Modal */}
      <AnimatePresence>
        {showDealSlicerGame && state.character && (
          <DealSlicerGame
            character={state.character}
            onGameRewardsGranted={(rewards) => {
              setState(prev => {
                const finalBal = Math.round(prev.balance + rewards.coinsEarned);
                const finalSav = Math.round(prev.savings + rewards.shardsEarned);
                const nw = finalBal + finalSav - prev.debt;

                updateStats(stats => ({
                  ...stats,
                  accumulatedCash: Math.max(stats.accumulatedCash, finalBal),
                  totalSavingsAmassed: Math.max(stats.totalSavingsAmassed, finalSav),
                  highestNetWorth: Math.max(stats.highestNetWorth, nw)
                }));

                return {
                  ...prev,
                  balance: finalBal,
                  savings: finalSav,
                  stress: Math.max(0, prev.stress - rewards.stressRelieved)
                };
              });
              setShowDealSlicerGame(false);
            }}
            onBack={() => setShowDealSlicerGame(false)}
          />
        )}
      </AnimatePresence>

      {/* Speedrunner Projections Engine overlay modal */}
      <AnimatePresence>
        {showSpeedrunner && state.character && (
          <LifeSpeedrunner
            character={state.character}
            currentBalance={state.balance}
            currentSavings={state.savings}
            currentDebt={state.debt}
            onClose={() => setShowSpeedrunner(false)}
            onSimulationRun={() => {
              updateStats(prev => ({
                ...prev,
                chronoMirrorSimulations: prev.chronoMirrorSimulations + 1
              }));
            }}
          />
        )}
      </AnimatePresence>

      {/* Achievements Overlay Modal */}
      <AnimatePresence>
        {showAchievements && (
          <AchievementsPanel
            userStats={userStats}
            newlyUnlockedIds={newlyUnlockedIds}
            onClearNewStatus={handleClearNewStatus}
            onResetStats={handleResetAchievements}
            onClose={() => setShowAchievements(false)}
          />
        )}
      </AnimatePresence>

      {/* Toast Notification for newly unlocked achievement */}
      <AnimatePresence>
        {activeAchievementToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-amber-500 max-w-sm flex items-start gap-3.5 cursor-pointer"
            onClick={() => {
              setShowAchievements(true);
              setActiveAchievementToast(null);
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl flex-shrink-0 animate-pulse">
              {activeAchievementToast.badgeIcon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-500">Achievement Unlocked!</span>
              </div>
              <h4 className="font-sans font-extrabold text-xs text-white leading-tight">
                {activeAchievementToast.name}
              </h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug font-sans">
                {activeAchievementToast.desc}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rescue and rewards feedback popups */}
      <AnimatePresence>
        {rescueMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-gray-150 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative"
            >
              <span className="text-4xl block mb-2 filter drop-shadow-xs">🩹</span>
              <h3 className="font-sans font-extrabold text-gray-950 text-base mb-2">{rescueMessage.title}</h3>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">{rescueMessage.desc}</p>
              <button
                onClick={() => setRescueMessage(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold text-xs py-3 rounded-xl cursor-pointer transition-colors"
              >
                Continue Simulating
              </button>
            </motion.div>
          </motion.div>
        )}

        {earnedLifeMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-emerald-100 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative"
            >
              <span className="text-4xl block mb-2 filter drop-shadow-xs">⭐</span>
              <h3 className="font-sans font-extrabold text-emerald-800 text-base mb-2">MaliGo Savings Reward!</h3>
              <p className="text-xs text-gray-500 mb-5 leading-relaxed">{earnedLifeMessage}</p>
              <button
                onClick={() => setEarnedLifeMessage(null)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs py-3 rounded-xl cursor-pointer transition-colors"
              >
                Claim Heart Reward ❤️
              </button>
            </motion.div>
          </motion.div>
        )}

        {bounceUnlockMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-6 left-6 z-50 bg-teal-950 text-white rounded-2xl p-4 shadow-2xl border border-teal-400 max-w-sm flex items-start gap-3.5"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-2xl flex-shrink-0 animate-bounce">
              {unlockedGameType === "STACK" ? "🏢" : unlockedGameType === "TAP_MALI" ? "🦦" : unlockedGameType === "SLICER" ? "✂️" : "⚽"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-[10px] uppercase font-mono font-extrabold text-amber-300">Wise Choice Reward!</span>
              </div>
              <p className="text-xs text-teal-100 font-sans leading-snug font-medium mb-2">
                {bounceUnlockMessage}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (unlockedGameType === "STACK") setShowStackGame(true);
                    else if (unlockedGameType === "TAP_MALI") setShowTapMaliGame(true);
                    else if (unlockedGameType === "SLICER") setShowDealSlicerGame(true);
                    else setShowBounceGame(true);

                    setBounceUnlockMessage(null);
                    setHasBounceGameUnlocked(false);
                    setUnlockedGameType(null);
                  }}
                  className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-sm"
                >
                  Play {unlockedGameType === "STACK" ? "Stack High 🏢" : unlockedGameType === "TAP_MALI" ? "Tap Mali 🦦" : unlockedGameType === "SLICER" ? "Deal Slicer ✂️" : "Bounce Blitz ⚽"}
                </button>
                <button
                  onClick={() => setBounceUnlockMessage(null)}
                  className="text-teal-300 hover:text-white text-xs px-2 py-1.5 cursor-pointer font-bold"
                >
                  Later
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Humble Footer */}
      <footer className="bg-slate-950 text-slate-500 py-6 text-center text-xs border-t border-slate-900 mt-12">
        <p className="font-mono">© 2026 MaliGo Financial Maze Simulator. Powered by MaliGo Financial Intelligence.</p>
        <p className="text-slate-600 mt-1">Simulate choices, compound assets, conquer debt. Play safe, live rich.</p>
      </footer>

    </div>
  );
}
