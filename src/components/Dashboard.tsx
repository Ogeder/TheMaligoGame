import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Character } from "../types";
import { MONTHS } from "../data/scenarios";
import { Wallet, PiggyBank, Flame, Calendar, RefreshCw, Lock, Unlock, Sparkles, Gamepad2, X, CheckCircle2 } from "lucide-react";

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
  onOpenBounceGame?: () => void;
  onOpenStackGame?: () => void;
  onOpenTapMaliGame?: () => void;
  onOpenDealSlicerGame?: () => void;
  onOpenAchievements?: () => void;
  newAchievementsCount?: number;
  hasBounceGameUnlocked?: boolean;
  unlockedGameType?: "BOUNCE" | "STACK" | "TAP_MALI" | "SLICER" | null;
  unlockedGamesList?: string[];
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
  onOpenFlappyGame,
  onOpenBounceGame,
  onOpenStackGame,
  onOpenTapMaliGame,
  onOpenDealSlicerGame,
  onOpenAchievements,
  newAchievementsCount = 0,
  hasBounceGameUnlocked = false,
  unlockedGameType = null,
  unlockedGamesList = []
}: DashboardProps) {
  const [showMilestoneModal, setShowMilestoneModal] = useState<boolean>(false);
  const currentMonthName = MONTHS[monthIndex].name;
  const currentMonthTheme = MONTHS[monthIndex].theme;
  const progressPercent = Math.min(100, (eventIndex / totalEvents) * 100);

  // All Milestone Arcade Games Definitions
  const milestoneGames = [
    {
      id: "BOUNCE",
      title: "MaliGo Bounce Blitz ⚽",
      desc: "Bounce off your financial wealth shield to collect coin drops and extra cash bonuses!",
      milestoneReq: "Wise Financial Decision in Scenarios or Cash >= R2,000",
      action: onOpenBounceGame,
      icon: "⚽",
      color: "from-teal-500 to-emerald-600"
    },
    {
      id: "SLICER",
      title: "Deal Slicer ✂️",
      desc: "Slice through high-yield deals and discount vouchers while slashing bad subscription fees!",
      milestoneReq: "Wise Financial Decision or Debt Payoff",
      action: onOpenDealSlicerGame,
      icon: "✂️",
      color: "from-cyan-500 to-teal-600"
    },
    {
      id: "TAP_MALI",
      title: "Tap Mali Meerkat & Friends 🦦",
      desc: "Tap fast saver meerkats to build interest pools and dodge high-interest debt sharks!",
      milestoneReq: "Automate >15% Savings or Accumulate R3,000 Savings",
      action: onOpenTapMaliGame,
      icon: "🦦",
      color: "from-emerald-500 to-green-600"
    },
    {
      id: "STACK",
      title: "Stack High Wealth Tower 🏢",
      desc: "Stack financial stability blocks to build your custom wealth skyscraper higher!",
      milestoneReq: "Savings >= R8,000 or Net Worth >= R10,000",
      action: onOpenStackGame,
      icon: "🏢",
      color: "from-amber-500 to-orange-600"
    },
    {
      id: "FLAPPY",
      title: "Chrono-Flap Arcade 🕹️",
      desc: "Navigate through volatile interest rate pillars without crashing into debt traps!",
      milestoneReq: "Completely Debt-Free (R0 Debt) or Complete Chapter 3",
      action: onOpenFlappyGame,
      icon: "🕹️",
      color: "from-indigo-500 to-purple-600"
    },
    {
      id: "CHRONO",
      title: "Chrono-Mirror Portal 🕰️",
      desc: "High-speed financial decision speedrunner simulator. Master time & money!",
      milestoneReq: "Financial Independence (Net Worth >= R20,000) or Complete Chapter 6",
      action: onOpenSpeedrunner,
      icon: "🕰️",
      color: "from-blue-600 to-indigo-700"
    }
  ];

  const unlockedCount = milestoneGames.filter(g => unlockedGamesList.includes(g.id) || (g.id === "BOUNCE" && hasBounceGameUnlocked)).length;

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

            {/* UNIFIED MILESTONE ARCADE LAUNCHER BUTTON */}
            <button
              onClick={() => setShowMilestoneModal(true)}
              className="bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white font-sans font-black text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer border border-indigo-500/40 relative group"
              title="Open Financial Milestone Arcade Games"
            >
              <Gamepad2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>🎮 Milestone Arcade</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold">
                {unlockedCount}/6
              </span>
              {unlockedCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 font-mono font-black text-[8px] px-1.5 py-0.5 rounded-full border border-white animate-bounce shadow-md">
                  REWARD!
                </span>
              )}
            </button>

            {/* Quick Access Pills for Unlocked Games ONLY */}
            {unlockedGamesList.includes("BOUNCE") && onOpenBounceGame && (
              <button
                onClick={onOpenBounceGame}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs px-2.5 py-2 rounded-xl transition-all flex items-center gap-1 shadow-sm cursor-pointer border border-teal-300"
                title="Play Bounce Blitz"
              >
                ⚽ Bounce
              </button>
            )}

            {unlockedGamesList.includes("STACK") && onOpenStackGame && (
              <button
                onClick={onOpenStackGame}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-2 rounded-xl transition-all flex items-center gap-1 shadow-sm cursor-pointer border border-amber-300"
                title="Play Stack High"
              >
                🏢 Stack
              </button>
            )}

            {onOpenAchievements && (
              <button
                onClick={onOpenAchievements}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans font-extrabold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer border border-amber-300 relative"
                title="Open MaliGo Achievements"
              >
                <span>🏆 Achievements</span>
                {newAchievementsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-mono font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white animate-bounce shadow-md">
                    {newAchievementsCount}
                  </span>
                )}
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

      {/* MILESTONE ARCADE MODAL */}
      <AnimatePresence>
        {showMilestoneModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-500 flex items-center justify-center text-xl text-slate-950 font-black shadow-lg">
                    🎮
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      Financial Milestone Arcade
                    </h3>
                    <p className="text-xs text-slate-400">
                      Mini-games unlock as rewards when you make great financial decisions or hit savings milestones!
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowMilestoneModal(false)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Games Grid */}
              <div className="py-4 overflow-y-auto space-y-3.5 pr-1 flex-1">
                {milestoneGames.map(game => {
                  const isUnlocked = unlockedGamesList.includes(game.id) || (game.id === "BOUNCE" && hasBounceGameUnlocked);

                  return (
                    <div
                      key={game.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        isUnlocked 
                          ? "bg-slate-950/90 border-emerald-500/50 shadow-lg"
                          : "bg-slate-950/40 border-slate-800/80 opacity-75"
                      }`}
                    >
                      <div className="flex items-start gap-3.5 flex-1">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-md ${
                          !isUnlocked && "grayscale opacity-50"
                        }`}>
                          {game.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-black text-white">{game.title}</h4>
                            {isUnlocked ? (
                              <span className="text-[9px] font-mono font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-700/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> UNLOCKED REWARD
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono font-black uppercase bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Lock className="w-3 h-3 text-slate-400" /> LOCKED MILESTONE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 font-sans mb-1.5 leading-relaxed">
                            {game.desc}
                          </p>
                          <div className="text-[11px] font-mono text-amber-300 flex items-center gap-1">
                            <span>🎯 Requirement:</span>
                            <span className="text-slate-300">{game.milestoneReq}</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto flex justify-end">
                        {isUnlocked ? (
                          <button
                            onClick={() => {
                              setShowMilestoneModal(false);
                              if (game.action) game.action();
                            }}
                            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-lg flex items-center justify-center gap-1.5"
                          >
                            Play Game 🎮
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full sm:w-auto bg-slate-800 text-slate-500 font-bold text-xs px-4 py-2.5 rounded-xl cursor-not-allowed border border-slate-700 flex items-center justify-center gap-1.5"
                          >
                            <Lock className="w-3.5 h-3.5" /> Locked
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400 font-mono">
                <span>Total Unlocked: <strong className="text-emerald-400">{unlockedCount} / 6</strong></span>
                <button
                  onClick={() => setShowMilestoneModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Close Arcade
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
