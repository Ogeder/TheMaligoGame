import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FinancialEvent, DecisionOption, Character } from "../types";
import UnityEnvironmentBridge from "./UnityEnvironmentBridge";
import AmongUsFinancialGame from "./AmongUsFinancialGame";
import { 
  Home, ShoppingCart, BookOpen, PartyPopper, 
  Bus, Heart, Wifi, Sparkles, Car, Palmtree, 
  Activity, Dumbbell, ShieldAlert, Package, 
  Globe, Users, PiggyBank, TrendingUp, Coins, 
  ChevronRight, Info, Eye, Shield, Coffee, Compass,
  Laptop, Tv, Armchair, Sun, Zap, Award, CheckCircle2,
  AlertTriangle, Lock, Unlock, Flame, Gamepad2, Building
} from "lucide-react";

interface GameBoardProps {
  character: Character;
  event: FinancialEvent;
  stepIndex: number;
  totalSteps: number;
  onChoiceSelected: (option: DecisionOption) => void;
  balance: number;
  savings: number;
  debt: number;
  stress: number;
  lives: number;
  onStatsChanged: (changes: { balance?: number; savings?: number; debt?: number; stress?: number; lives?: number }) => void;
}

// Category icon helper
const iconMap: { [key: string]: React.ComponentType<any> } = {
  Home, ShoppingCart, BookOpen, PartyPopper, Bus, Heart, Wifi, Sparkles, Car, Palmtree, Activity, Dumbbell, ShieldAlert, Package, Globe, Users, PiggyBank, TrendingUp, Coins
};

export default function GameBoard({
  character,
  event,
  stepIndex,
  totalSteps,
  onChoiceSelected,
  balance,
  savings,
  debt,
  stress,
  lives,
  onStatsChanged
}: GameBoardProps) {
  const [activeTab, setActiveTab] = useState<"PLACE" | "DECISION" | "VAULT" | "SHOP" | "UNITY_3D">("PLACE");
  const [isAmongUsGameOpen, setIsAmongUsGameOpen] = useState<boolean>(false);
  const [hasShield, setHasShield] = useState<boolean>(false);
  const [hasSolarInverter, setHasSolarInverter] = useState<boolean>(false);
  const [hasMoneyTree, setHasMoneyTree] = useState<boolean>(false);
  const [hasSmartLaptop, setHasSmartLaptop] = useState<boolean>(false);
  const [lastNotification, setLastNotification] = useState<string>("Welcome to your Personal Living Environment Universe!");

  // Calculate Net Worth and Estate Rank
  const netWorth = balance + savings - debt;

  const getEstateRank = () => {
    if (netWorth >= 35000) return { title: "Solar Eco Sanctuary", icon: "🏡", color: "from-emerald-600 to-teal-500", desc: "Luxury, zero-debt sustainable estate with solar power and high-yield investments." };
    if (netWorth >= 15000) return { title: "Executive Tech Loft", icon: "🏙️", color: "from-blue-600 to-indigo-500", desc: "Sleek multi-monitor loft with automated budgeting systems." };
    if (netWorth >= 5000) return { title: "Urban Town Apartment", icon: "🏢", color: "from-amber-600 to-orange-500", desc: "Cozy furnished residence with smart appliances and growing savings." };
    return { title: "Starter Student Quarter", icon: "🏚️", color: "from-slate-700 to-slate-800", desc: "Modest studio apartment. The foundation of your financial journey!" };
  };

  const estate = getEstateRank();

  // Buy Environment Upgrades
  const buyMoneyTree = () => {
    if (balance < 120) {
      setLastNotification("❌ Not enough cash to buy the Golden Money Tree! (R120 required)");
      return;
    }
    onStatsChanged({ balance: -120, savings: 50 });
    setHasMoneyTree(true);
    setLastNotification("🪴 Planted Golden Money Tree! Added +R50 to Savings and boosts passive interest!");
  };

  const buySolarInverter = () => {
    if (balance < 200) {
      setLastNotification("❌ Not enough cash for Solar Backup Inverter! (R200 required)");
      return;
    }
    onStatsChanged({ balance: -200, stress: -10 });
    setHasSolarInverter(true);
    setLastNotification("☀️ Solar Inverter Installed! Shields your place from electricity tariff spikes and reduced stress (-10%)!");
  };

  const buySmartLaptop = () => {
    if (balance < 250) {
      setLastNotification("❌ Not enough cash for Smart Budgeting Workstation! (R250 required)");
      return;
    }
    onStatsChanged({ balance: -250, stress: -15 });
    setHasSmartLaptop(true);
    setLastNotification("💻 Upgraded to Smart Workstation! Automated financial tracking reduces choice stress permanently (-15%)!");
  };

  const buyDebtShield = () => {
    if (balance < 100) {
      setLastNotification("❌ Not enough cash for Emergency Debt Shield! (R100 required)");
      return;
    }
    onStatsChanged({ balance: -100 });
    setHasShield(true);
    setLastNotification("🛡️ Emergency Protection Shield Active! Absorbs the next unexpected debt penalty!");
  };

  const buyStressTea = () => {
    if (balance < 60) {
      setLastNotification("❌ Not enough cash for Zen Herbal Tea! (R60 required)");
      return;
    }
    if (stress === 0) {
      setLastNotification("🧘 Your character is already completely relaxed!");
      return;
    }
    onStatsChanged({ balance: -60, stress: -20 });
    setLastNotification("🍵 Consumed Zen Herbal Tea. Stress reduced by -20%!");
  };

  // Choice Selection
  const handleSelectOption = (option: DecisionOption) => {
    // Apply debt shield if negative balance change and shield active
    if (hasShield && option.balanceChange < 0) {
      setHasShield(false);
      const reducedLoss = Math.round(option.balanceChange * 0.5);
      setLastNotification(`🛡️ Emergency Shield absorbed 50% of financial loss! Saved ${Math.abs(reducedLoss)} Coins!`);
      onChoiceSelected({
        ...option,
        balanceChange: reducedLoss
      });
    } else {
      onChoiceSelected(option);
    }
  };

  const CategoryIcon = iconMap[event.icon] || Compass;

  return (
    <div className="max-w-6xl mx-auto py-4 px-3 sm:px-6 font-sans" id="place-universe">
      
      {/* Top Banner: Personal Estate Status & Live Notification */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl mb-6 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${estate.color} opacity-15 rounded-full blur-3xl pointer-events-none`} />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${estate.color} text-3xl flex items-center justify-center shadow-lg border border-white/20`}>
              {estate.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-md">
                  Personal Place & Universe
                </span>
                <span className="text-xs text-slate-400 font-mono">Month Step #{stepIndex + 1} of {totalSteps}</span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5 flex items-center gap-2">
                {estate.title}
              </h2>
              <p className="text-xs text-slate-400 font-medium max-w-lg mt-0.5 leading-snug">
                {estate.desc}
              </p>
            </div>
          </div>

          {/* Quick Place Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80 w-full sm:w-auto justify-center">
            <button
              onClick={() => setActiveTab("PLACE")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "PLACE" ? "bg-emerald-500 text-slate-950 shadow-md font-extrabold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Home className="w-3.5 h-3.5" /> Living Room
            </button>
            <button
              onClick={() => setActiveTab("DECISION")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative ${
                activeTab === "DECISION" ? "bg-amber-400 text-slate-950 shadow-md font-extrabold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Laptop className="w-3.5 h-3.5" /> Workstation
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-1 right-1" />
            </button>
            <button
              onClick={() => setActiveTab("VAULT")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "VAULT" ? "bg-blue-500 text-white shadow-md font-extrabold" : "text-slate-400 hover:text-white"
              }`}
            >
              <PiggyBank className="w-3.5 h-3.5" /> Wealth Vault
            </button>
            <button
              onClick={() => setActiveTab("SHOP")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "SHOP" ? "bg-purple-500 text-white shadow-md font-extrabold" : "text-slate-400 hover:text-white"
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Place Upgrades
            </button>
            <button
              onClick={() => setActiveTab("UNITY_3D")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "UNITY_3D" ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-extrabold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-purple-300" /> Unity 3D World
            </button>
            <button
              onClick={() => setIsAmongUsGameOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-lg transition-all flex items-center gap-1.5 cursor-pointer animate-pulse border border-white/20"
            >
              <span>🦦</span>
              <span>2D Mali Meerkat Station</span>
            </button>
          </div>
        </div>

        {/* Live Event Log Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-300 font-mono">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
          <span className="truncate">{lastNotification}</span>
        </div>
      </div>

      {/* MAIN ENVIRONMENT CONTENT CONTAINER */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: INTERACTIVE LIVING PLACE CANVAS */}
        {activeTab === "PLACE" && (
          <motion.div
            key="tab-place"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left 8 Cols: Visual Interactive Room Canvas */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[460px]">
              
              {/* Room Background Texture & Ambient Lights */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/50 via-slate-950 to-slate-950 pointer-events-none" />
              
              {/* Room Header Info */}
              <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{estate.icon}</span>
                  <div>
                    <h3 className="text-sm font-black text-white">{character.name}'s Residence</h3>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">Net Worth: R{netWorth.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
                  <span>Stress Level:</span>
                  <span className={`font-bold ${stress > 60 ? "text-rose-400" : stress > 30 ? "text-amber-400" : "text-emerald-400"}`}>
                    {stress}%
                  </span>
                </div>
              </div>

              {/* Room Interactive Scene / Visual Elements */}
              <div className="relative z-10 my-6 grid grid-cols-2 sm:grid-cols-3 gap-4 items-center">
                
                {/* 1. Character Avatar Living in Room */}
                <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg relative group">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border-2 border-emerald-400/40 flex items-center justify-center text-5xl mb-2 relative">
                    {character.avatar.startsWith("/") || character.avatar.startsWith("http") ? (
                      <img src={character.avatar} className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" alt={character.name} />
                    ) : (
                      character.avatar
                    )}
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 text-[9px] font-black font-mono px-1.5 py-0.5 rounded-md">
                      ACTIVE
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-white">{character.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{character.role}</span>
                </div>

                {/* 2. Workstation Desk (Triggers Decision) */}
                <button
                  onClick={() => setActiveTab("DECISION")}
                  className="bg-slate-950/90 hover:bg-slate-950 border-2 border-amber-500/50 hover:border-amber-400 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xl transition-all transform hover:scale-105 cursor-pointer relative group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl mb-2 text-amber-300 relative">
                    💻
                    <span className="absolute -top-2 -right-2 bg-rose-500 text-white font-mono font-black text-[9px] px-2 py-0.5 rounded-full animate-bounce">
                      ACTION!
                    </span>
                  </div>
                  <span className="text-xs font-black text-amber-300">Financial Workstation</span>
                  <span className="text-[10px] text-slate-400 font-mono">Month #{stepIndex + 1} Decision</span>
                </button>

                {/* 3. Golden Money Tree */}
                <div className={`bg-slate-950/90 border rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg relative transition-all ${
                  hasMoneyTree ? "border-emerald-500/60" : "border-slate-800 opacity-60"
                }`}>
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-3xl mb-2">
                    {hasMoneyTree ? "🪴" : "🌱"}
                  </div>
                  <span className="text-xs font-black text-slate-200">
                    {hasMoneyTree ? "Golden Money Tree" : "Empty Plant Pot"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {hasMoneyTree ? "Compounding Savings" : "Buy in Place Shop"}
                  </span>
                </div>

                {/* 4. Solar Power / Smart Utilities */}
                <div className={`bg-slate-950/90 border rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg relative transition-all ${
                  hasSolarInverter ? "border-cyan-500/60" : "border-slate-800 opacity-60"
                }`}>
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-3xl mb-2">
                    {hasSolarInverter ? "☀️" : "🔌"}
                  </div>
                  <span className="text-xs font-black text-slate-200">
                    {hasSolarInverter ? "Solar Backup Inverter" : "Grid Power"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {hasSolarInverter ? "Tariff Shield Active" : "Unprotected"}
                  </span>
                </div>

                {/* 5. Emergency Protection Shield */}
                <div className={`bg-slate-950/90 border rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg relative transition-all ${
                  hasShield ? "border-purple-500/60" : "border-slate-800 opacity-60"
                }`}>
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-3xl mb-2">
                    {hasShield ? "🛡️" : "📦"}
                  </div>
                  <span className="text-xs font-black text-slate-200">
                    {hasShield ? "Debt Shield Active" : "No Shield"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {hasShield ? "Absorbs Debt Traps" : "Get in Shop"}
                  </span>
                </div>

                {/* 6. Zen Mindfulness Station */}
                <button
                  onClick={buyStressTea}
                  className="bg-slate-950/90 hover:bg-slate-950 border border-amber-800/80 hover:border-amber-400 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-3xl mb-2 group-hover:scale-110 transition-transform">
                    🍵
                  </div>
                  <span className="text-xs font-black text-amber-300">Sip Zen Herbal Tea</span>
                  <span className="text-[10px] text-slate-400 font-mono">Reduce Stress (-R60)</span>
                </button>

              </div>

              {/* Bottom Room Call-To-Action */}
              <div className="relative z-10 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  💡 Tip: Click your <strong className="text-amber-300">Financial Workstation</strong> to handle this month's decision!
                </span>

                <button
                  onClick={() => setActiveTab("DECISION")}
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  Open Workstation Decision <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Right 4 Cols: Living Place Environment Perks & Ledger */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Financial Balances Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
                <h3 className="text-xs font-extrabold uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-400" /> Current Financial Standings
                </h3>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Available Cash</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">R{balance.toLocaleString()}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Savings Pool</span>
                    <span className="text-lg font-black text-blue-400 font-mono">R{savings.toLocaleString()}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Active Debt</span>
                    <span className="text-lg font-black text-rose-400 font-mono">R{debt.toLocaleString()}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Mind Stress</span>
                    <span className="text-lg font-black text-amber-400 font-mono">{stress}%</span>
                  </div>
                </div>
              </div>

              {/* Estate Level Progression */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">Estate Rank Progress</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">R{netWorth.toLocaleString()} / R15,000</span>
                </div>
                
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, (netWorth / 15000) * 100))}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                  Grow net worth to unlock the <strong className="text-slate-200">Urban Town Apartment</strong> & <strong className="text-slate-200">Solar Sanctuary Estate</strong>!
                </span>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: FINANCIAL WORKSTATION DECISION HOTSPOT */}
        {activeTab === "DECISION" && (
          <motion.div
            key="tab-decision"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6"
          >
            {/* Event Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center text-2xl">
                  <CategoryIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded">
                      {event.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Hotspot Decision #{stepIndex + 1}</span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-0.5">{event.title}</h3>
                </div>
              </div>

              <button
                onClick={() => setActiveTab("PLACE")}
                className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl transition-all cursor-pointer font-bold"
              >
                ← Back to Living Room
              </button>
            </div>

            {/* Event Description Narrative */}
            <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 text-slate-200 text-sm leading-relaxed font-sans">
              {event.description}
            </div>

            {/* Decision Choices */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-extrabold uppercase font-mono tracking-wider text-slate-400">
                Choose your financial action path:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {event.options.map((option, idx) => {
                  const isPositiveNet = (option.balanceChange + option.savingsChange - option.debtChange) >= 0;

                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectOption(option)}
                      className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer shadow-lg relative overflow-hidden group ${
                        isPositiveNet 
                          ? "bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-emerald-500/60"
                          : "bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-amber-500/60"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h5 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                            {option.text}
                          </h5>
                          {isPositiveNet && (
                            <span className="text-[9px] font-black uppercase font-mono bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                              WISE CHOICE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                          {option.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 space-y-1.5 font-mono text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Cash:</span>
                          <span className={`font-bold ${option.balanceChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {option.balanceChange >= 0 ? "+" : ""}R{option.balanceChange}
                          </span>
                        </div>

                        {option.savingsChange !== 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Savings:</span>
                            <span className={`font-bold ${option.savingsChange > 0 ? "text-blue-400" : "text-rose-400"}`}>
                              {option.savingsChange > 0 ? "+" : ""}R{option.savingsChange}
                            </span>
                          </div>
                        )}

                        {option.debtChange !== 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Debt:</span>
                            <span className={`font-bold ${option.debtChange < 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {option.debtChange > 0 ? "+" : ""}R{option.debtChange}
                            </span>
                          </div>
                        )}

                        {option.stressChange !== 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Stress:</span>
                            <span className={`font-bold ${option.stressChange < 0 ? "text-emerald-400" : "text-amber-400"}`}>
                              {option.stressChange > 0 ? "+" : ""}{option.stressChange}%
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: WEALTH VAULT & COMPOUNDING TREE */}
        {activeTab === "VAULT" && (
          <motion.div
            key="tab-vault"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center text-2xl">
                  🏛️
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Wealth Vault & Money Tree</h3>
                  <p className="text-xs text-slate-400">Track long-term asset compounding and investment yields.</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab("PLACE")}
                className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl transition-all cursor-pointer font-bold"
              >
                ← Return to Room
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 uppercase font-mono block">Total Accumulated Savings</span>
                <span className="text-2xl font-black text-blue-400 font-mono">R{savings.toLocaleString()}</span>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Earning ~8% annual compound interest every month end!
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 uppercase font-mono block">Net Worth Position</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">R{netWorth.toLocaleString()}</span>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Liquid Cash + Savings minus Total Outstanding Debt.
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 uppercase font-mono block">Passive Yield Multiplier</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {hasMoneyTree ? "1.25x (Boosted)" : "1.00x"}
                </span>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {hasMoneyTree ? "Golden Money Tree active in place!" : "Plant Money Tree in Place Shop!"}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: PLACE & ENVIRONMENT UPGRADES SHOP */}
        {activeTab === "SHOP" && (
          <motion.div
            key="tab-shop"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center text-2xl">
                  🛒
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Place & Environment Upgrades Store</h3>
                  <p className="text-xs text-slate-400">Upgrade your living space to automate savings and protect your lifestyle.</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab("PLACE")}
                className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl transition-all cursor-pointer font-bold"
              >
                ← Return to Room
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Upgrade 1: Money Tree */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-3xl mb-2">🪴</div>
                  <h4 className="text-sm font-extrabold text-white">Golden Money Tree Seedling</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Plants a compounding tree in your room. Adds +R50 savings immediately and boosts interest yield!
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-300">R120</span>
                  <button
                    onClick={buyMoneyTree}
                    disabled={hasMoneyTree}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      hasMoneyTree 
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black"
                    }`}
                  >
                    {hasMoneyTree ? "Owned ✓" : "Purchase"}
                  </button>
                </div>
              </div>

              {/* Upgrade 2: Solar Inverter */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-3xl mb-2">☀️</div>
                  <h4 className="text-sm font-extrabold text-white">Solar Backup Inverter</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Protects your residence against sudden utility price spikes and lowers stress levels by -10%!
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-300">R200</span>
                  <button
                    onClick={buySolarInverter}
                    disabled={hasSolarInverter}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      hasSolarInverter 
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black"
                    }`}
                  >
                    {hasSolarInverter ? "Installed ✓" : "Purchase"}
                  </button>
                </div>
              </div>

              {/* Upgrade 3: Smart Workstation */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-3xl mb-2">💻</div>
                  <h4 className="text-sm font-extrabold text-white">Smart Budgeting Workstation</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Automates budget calculations. Permanently reduces choice stress penalties by -15%!
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-300">R250</span>
                  <button
                    onClick={buySmartLaptop}
                    disabled={hasSmartLaptop}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      hasSmartLaptop 
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-purple-500 hover:bg-purple-400 text-white font-black"
                    }`}
                  >
                    {hasSmartLaptop ? "Installed ✓" : "Purchase"}
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 5: UNITY 3D ENVIRONMENT BRIDGE */}
        {activeTab === "UNITY_3D" && (
          <motion.div
            key="tab-unity-3d"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <UnityEnvironmentBridge
              character={character}
              balance={balance}
              savings={savings}
              debt={debt}
              stress={stress}
              lives={lives}
              estateTitle={estate.title}
              estateIcon={estate.icon}
              hasSolarInverter={hasSolarInverter}
              hasSmartLaptop={hasSmartLaptop}
              hasShield={hasShield}
              onBuySolarInverter={buySolarInverter}
              onBuySmartLaptop={buySmartLaptop}
              onBuyDebtShield={buyDebtShield}
              onWaterPlant={buyMoneyTree}
              plantLevel={hasMoneyTree ? 3 : 1}
              lastNotification={lastNotification}
            />
          </motion.div>
        )}

      </AnimatePresence>

      {/* AMONG US 2D CREWMATE FINANCIAL STATION OVERLAY */}
      {isAmongUsGameOpen && (
        <AmongUsFinancialGame
          character={character}
          balance={balance}
          savings={savings}
          debt={debt}
          stress={stress}
          onRewardEarned={(cash, savingsBonus, msg) => {
            onStatsChanged({ balance: cash, savings: savingsBonus, stress: -5 });
            setLastNotification(msg);
          }}
          onClose={() => setIsAmongUsGameOpen(false)}
        />
      )}

    </div>
  );
}
