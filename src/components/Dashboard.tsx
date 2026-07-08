import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Character } from "../types";
import { MONTHS } from "../data/scenarios";
import { Wallet, PiggyBank, Flame, Calendar, RefreshCw } from "lucide-react";

interface DashboardProps {
  character: Character;
  monthIndex: number;
  eventIndex: number;
  totalEvents: number;
  balance: number;
  savings: number;
  debt: number;
  stress: number;
  lives: number;
  onReset: () => void;
  onOpenSpeedrunner?: () => void;
  onOpenFlappyGame?: () => void;
}

export default function Dashboard({
  character,
  monthIndex,
  eventIndex,
  totalEvents,
  balance,
  savings,
  debt,
  stress,
  lives,
  onReset,
  onOpenSpeedrunner,
  onOpenFlappyGame
}: DashboardProps) {
  const currentMonthName = MONTHS[monthIndex].name;
  const currentMonthTheme = MONTHS[monthIndex].theme;
  const progressPercent = Math.min(100, (eventIndex / totalEvents) * 100);

  // Render Hearts
  const renderHearts = () => {
    const hearts = [];
    for (let i = 1; i <= 3; i++) {
      hearts.push(
        <span
          key={i}
          className={`text-sm transition-all filter drop-shadow-xs select-none ${
            i <= lives ? "text-rose-500 saturate-120 scale-110" : "text-gray-200"
          }`}
        >
          ❤️
        </span>
      );
    }
    return (
      <div className="flex gap-1 items-center bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full" title={`${lives} of 3 lives left`}>
        {hearts}
      </div>
    );
  };

  // Determine stress visual feedback
  let stressColor = "bg-emerald-500";
  let stressTextColor = "text-emerald-700";
  let stressBg = "bg-emerald-50";
  if (stress > 30 && stress <= 60) {
    stressColor = "bg-amber-500";
    stressTextColor = "text-amber-700";
    stressBg = "bg-amber-50";
  } else if (stress > 60) {
    stressColor = "bg-rose-500 text-rose-700";
    stressTextColor = "text-rose-700";
    stressBg = "bg-rose-50";
  }

  // Calculate net worth
  const netWorth = balance + savings - debt;

  return (
    <div className="bg-white border-b border-gray-150 sticky top-0 z-40 shadow-sm" id="game-dashboard">
      <div className="max-w-6xl mx-auto px-4 py-4">
        
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
          {/* Character & Current Chapter */}
          <div className="flex items-center gap-3">
            {character.avatar.startsWith("/") || character.avatar.startsWith("http") ? (
              <img src={character.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400 bg-white shadow-sm" referrerPolicy="no-referrer" alt={character.name} />
            ) : (
              <span className="text-4xl filter drop-shadow-sm animate-pulse-slow">{character.avatar}</span>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-sans font-bold text-gray-900 leading-tight">{character.name}</h2>
                <span className="text-[10px] uppercase font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                  {character.role}
                </span>
                {renderHearts()}
              </div>
              <p className="text-xs text-gray-500 font-medium">Chapter {monthIndex + 1} of 12 (Year-to-Date)</p>
            </div>
          </div>

          {/* Month Indicator & Calendar node */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2.5 flex-1 sm:flex-initial shadow-xs">
              <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold font-sans flex items-center gap-1.5">
                  {currentMonthName}
                </div>
                <div className="text-[10px] text-emerald-600 font-mono leading-none font-medium">
                  {currentMonthTheme}
                </div>
              </div>
            </div>

            {onOpenSpeedrunner && (
              <button
                onClick={onOpenSpeedrunner}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Enter the Chrono-Mirror Labyrinth Portal"
              >
                <span>🕰️ Chrono-Mirror</span>
              </button>
            )}

            {onOpenFlappyGame && (
              <button
                onClick={onOpenFlappyGame}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer animate-pulse"
                title="Play Chrono-Flap Labyrinth"
              >
                <span>🕹️ Play Flappy Labyrinth</span>
              </button>
            )}

            <button
              onClick={onReset}
              title="Reset Game"
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 border border-gray-150 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Financial Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4" id="financial-metrics">
          
          {/* Card 1: Cash Balance */}
          <div className="bg-gray-50/50 border border-gray-200/80 rounded-xl p-3 flex flex-col justify-between shadow-xs">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] text-gray-500 font-bold tracking-wide uppercase">💰 Available Coins</span>
              <Wallet className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-gray-500 font-semibold">R</span>
              <motion.span 
                key={balance}
                initial={{ scale: 1.1, color: "#059669" }}
                animate={{ scale: 1, color: balance < 0 ? "#DC2626" : "#111827" }}
                className={`text-lg sm:text-xl font-sans font-bold tracking-tight ${balance < 0 ? "text-rose-600" : "text-gray-900"}`}
              >
                {balance.toLocaleString()}
              </motion.span>
            </div>
            <p className="text-[9px] text-gray-400 font-mono mt-1">Refreshed per decision</p>
          </div>

          {/* Card 2: Savings Reserve */}
          <div className="bg-emerald-50/20 border border-emerald-100/80 rounded-xl p-3 flex flex-col justify-between shadow-xs">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] text-emerald-700 font-bold tracking-wide uppercase">💎 Wealth Shards</span>
              <PiggyBank className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-emerald-600 font-semibold">R</span>
              <motion.span 
                key={savings}
                initial={{ scale: 1.1, color: "#059669" }}
                animate={{ scale: 1, color: "#047857" }}
                className="text-lg sm:text-xl font-sans font-bold tracking-tight text-emerald-700"
              >
                {savings.toLocaleString()}
              </motion.span>
            </div>
            <p className="text-[9px] text-emerald-500/75 font-mono mt-1">Compounds monthly</p>
          </div>

          {/* Card 3: Debt Card */}
          <div className={`border rounded-xl p-3 flex flex-col justify-between shadow-xs ${
            debt > 0 ? "bg-rose-50/10 border-rose-200" : "bg-gray-50/30 border-gray-200"
          }`}>
            <div className="flex justify-between items-center mb-1.5">
              <span className={`text-[10px] font-bold tracking-wide uppercase ${
                debt > 0 ? "text-rose-700" : "text-gray-500"
              }`}>⚠️ Debt Trap Curse</span>
              <Flame className={`w-3.5 h-3.5 ${debt > 0 ? "text-rose-500 animate-pulse" : "text-gray-400"}`} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xs font-semibold ${debt > 0 ? "text-rose-600" : "text-gray-400"}`}>R</span>
              <motion.span 
                key={debt}
                initial={{ scale: debt > 0 ? 1.1 : 1 }}
                animate={{ scale: 1 }}
                className={`text-lg sm:text-xl font-sans font-bold tracking-tight ${debt > 0 ? "text-rose-600" : "text-gray-900"}`}
              >
                {debt.toLocaleString()}
              </motion.span>
            </div>
            <p className={`text-[9px] font-mono mt-1 ${debt > 0 ? "text-rose-500/80 font-medium" : "text-gray-400"}`}>
              {debt > 0 ? "Compounds at 2.5% p.m." : "Debt-free! Awesome"}
            </p>
          </div>

          {/* Card 4: Net Worth */}
          <div className="bg-gray-50/50 border border-gray-200/80 rounded-xl p-3 flex flex-col justify-between shadow-xs">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] text-gray-500 font-bold tracking-wide uppercase">👑 Vault Net Worth</span>
              <span className="text-[10px] font-mono bg-gray-200 text-gray-700 px-1 rounded font-bold">NET</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-gray-500 font-semibold">R</span>
              <motion.span 
                key={netWorth}
                className={`text-lg sm:text-xl font-sans font-extrabold tracking-tight ${netWorth < 0 ? "text-rose-600" : "text-emerald-600"}`}
              >
                {netWorth.toLocaleString()}
              </motion.span>
            </div>
            <p className="text-[9px] text-gray-400 font-mono mt-1">Cash + Savings - Debt</p>
          </div>

          {/* Card 5: Stress & Progression (Full width on small, 1 col on large) */}
          <div className="col-span-2 md:col-span-1 bg-gray-50/50 border border-gray-200/80 rounded-xl p-3 flex flex-col justify-between shadow-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-gray-500 font-bold tracking-wide uppercase">🌀 Stress Level</span>
              <span className={`text-xs font-bold font-mono ${stressTextColor}`}>{stress}%</span>
            </div>
            
            {/* Stress progress bar */}
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-1.5">
              <motion.div 
                className={`h-full ${stressColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${stress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-[9px] text-gray-500 leading-none">
              {stress > 70 ? "🔥 Critically Stressed! Game Over risk." : stress > 35 ? "⚠️ Pressure mounting." : "🧘 Balanced & focused."}
            </p>
          </div>

        </div>

        {/* Maze Month Progress Bar */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-4">
          <div className="text-xs font-bold text-gray-600 font-sans flex-shrink-0">
            🗺️ Labyrinth Path Progress: <span className="text-emerald-600">{eventIndex}</span>/{totalEvents} steps
          </div>
          <div className="w-full bg-gray-150 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              className="bg-emerald-600 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
