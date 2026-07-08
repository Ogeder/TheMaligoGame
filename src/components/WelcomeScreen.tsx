import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CHARACTERS } from "../data/scenarios";
import { Character, CharacterType } from "../types";
import { 
  TrendingUp, Award, Activity, ShieldCheck, Compass, Sliders, X, Sparkles, 
  AlertCircle, Flame, User, Palette, Plus, Minus, Shield, Coins, 
  Heart, ArrowLeft, CheckCircle2, Zap 
} from "lucide-react";

interface WelcomeScreenProps {
  onSelectCharacter: (char: Character) => void;
}

const AVATAR_OPTIONS = [
  { char: "🦦", label: "Meerkat", desc: "Sleek and vigilant" },
  { char: "🦡", label: "Badger", desc: "Tough and persistent" },
  { char: "🦊", label: "Fox", desc: "Cunning and swift" },
  { char: "🦫", label: "Beaver", desc: "Disciplined and hard-working" },
  { char: "🦁", label: "Lion", desc: "Proud and bold" },
  { char: "🐨", label: "Koala", desc: "Calm and calculated" },
  { char: "🦉", label: "Owl", desc: "Wise and strategic" },
  { char: "🐸", label: "Frog", desc: "Agile and quick" },
  { char: "🐱", label: "Cat", desc: "Independent thinker" },
  { char: "🐶", label: "Dog", desc: "Loyal and energetic" },
  { char: "🐼", label: "Panda", desc: "Patient investor" },
  { char: "🦄", label: "Unicorn", desc: "High scaling outlier" }
];

const FLAME_COLORS = [
  { hex: "#10b981", label: "Emerald Green", shadow: "shadow-emerald-500/50" },
  { hex: "#06b6d4", label: "Cyber Cyan", shadow: "shadow-cyan-500/50" },
  { hex: "#f59e0b", label: "Solar Amber", shadow: "shadow-amber-500/50" },
  { hex: "#ef4444", label: "Rose Plasma", shadow: "shadow-rose-500/50" },
  { hex: "#a855f7", label: "Royal Purple", shadow: "shadow-purple-500/50" }
];

const PERK_OPTIONS = [
  {
    id: "Shield Master",
    name: "🛡️ Shield Master",
    desc: "Start the Flappy Labyrinth game with +1 Extra Shield (2 total) to withstand debt pillars!"
  },
  {
    id: "Thrifty Diet",
    name: "💸 Thrifty Diet",
    desc: "Grocery and food cost choices in your monthly adventures are reduced by 20% permanently."
  },
  {
    id: "Zen Mind",
    name: "🧘 Zen Mind",
    desc: "Your mindful approach reduces all passive or choice-based Stress penalties by 25%."
  },
  {
    id: "Side Hustler",
    name: "⚡ Side Hustler",
    desc: "Receive a R300 cash bonus at the end of every quarter (March, June, September, December)."
  },
  {
    id: "Labyrinth Star",
    name: "🚀 Labyrinth Star",
    desc: "Collect wealth shards in Flappy Labyrinth with +2 bonus shards per diamond!"
  }
];

export default function WelcomeScreen({ onSelectCharacter }: WelcomeScreenProps) {
  // Config Modal (Standard Characters)
  const [activeConfigChar, setActiveConfigChar] = useState<Character | null>(null);
  const [customIncome, setCustomIncome] = useState<number>(18000);
  const [avoidInflation, setAvoidInflation] = useState<boolean>(false);

  // Custom Character Designer States
  const [isCreatingCustom, setIsCreatingCustom] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>("Mali");
  const [customRole, setCustomRole] = useState<string>("Wealth Pathfinder");
  const [customAvatar, setCustomAvatar] = useState<string>("🦦");
  const [customType, setCustomType] = useState<CharacterType>(CharacterType.YOUNG_PROFESSIONAL);
  const [selectedPerk, setSelectedPerk] = useState<string>("Shield Master");
  const [selectedJetpackColor, setSelectedJetpackColor] = useState<string>("#10b981");

  // Custom RPG Stat points (Pool of 10 points total)
  const [salaryPoints, setSalaryPoints] = useState<number>(3);
  const [cashPoints, setCashPoints] = useState<number>(3);
  const [savingsPoints, setSavingsPoints] = useState<number>(2);
  const [debtPoints, setDebtPoints] = useState<number>(2);

  const totalSpentPoints = salaryPoints + cashPoints + savingsPoints + debtPoints;
  const statPointsLeft = Math.max(0, 10 - totalSpentPoints);

  // Standard Characters slider opening
  const handleOpenConfig = (char: Character) => {
    setActiveConfigChar(char);
    setCustomIncome(char.baseIncome);
    setAvoidInflation(false);
  };

  const getSliderBounds = (type: CharacterType) => {
    switch (type) {
      case CharacterType.STUDENT:
        return { min: 1000, max: 3500, step: 100 };
      case CharacterType.YOUNG_PROFESSIONAL:
        return { min: 10000, max: 30000, step: 500 };
      case CharacterType.ENTREPRENEUR:
        return { min: 6000, max: 22000, step: 500 };
      default:
        return { min: 1000, max: 20000, step: 500 };
    }
  };

  const getScaledCosts = (char: Character, income: number, avoid: boolean) => {
    if (avoid) {
      return {
        rent: char.baseRent,
        groceries: char.baseGroceries,
        bills: char.baseBills,
      };
    }
    const factor = income / char.baseIncome;
    return {
      rent: Math.round(char.baseRent * factor),
      groceries: Math.round(char.baseGroceries * factor),
      bills: Math.round(char.baseBills * factor),
    };
  };

  const handleStartStandardGame = () => {
    if (!activeConfigChar) return;
    const costs = getScaledCosts(activeConfigChar, customIncome, avoidInflation);
    const customized: Character = {
      ...activeConfigChar,
      baseIncome: customIncome,
      baseRent: costs.rent,
      baseGroceries: costs.groceries,
      baseBills: costs.bills,
    };
    onSelectCharacter(customized);
  };

  // Compute Custom Designer Stats
  const getCustomBaseValues = () => {
    switch (customType) {
      case CharacterType.STUDENT:
        return {
          baseIncome: 1200,
          baseRent: 350,
          baseGroceries: 250,
          baseBills: 100,
          startingBalance: 400,
          startingSavings: 100,
          startingDebt: 0,
          goals: [
            "Graduate with R1,500+ in savings buffer",
            "Avoid credit cards and predatory retail loans",
            "Maintain physical & academic resilience"
          ]
        };
      case CharacterType.YOUNG_PROFESSIONAL:
        return {
          baseIncome: 13500,
          baseRent: 4500,
          baseGroceries: 1400,
          baseBills: 900,
          startingBalance: 2500,
          startingSavings: 1000,
          startingDebt: 10000,
          goals: [
            "Repay starting debt cushion",
            "Amass an Emergency Savings Buffer of R15,000",
            "Secure at least R5,000 in high-yield compounding assets"
          ]
        };
      case CharacterType.ENTREPRENEUR:
        return {
          baseIncome: 8000,
          baseRent: 2600,
          baseGroceries: 800,
          baseBills: 1000,
          startingBalance: 1500,
          startingSavings: 300,
          startingDebt: 4000,
          goals: [
            "Clear business equipment loans",
            "Upgrade delivery fleet equipment (invest R4,000)",
            "Grow net worth to R25,000 through high sales margins"
          ]
        };
    }
  };

  const getCustomCalculatedStats = () => {
    const bases = getCustomBaseValues();
    
    // Scale stats with assigned RPG points
    let bonusIncome = 0;
    let bonusCash = 0;
    let bonusSavings = 0;
    let debtReduction = 0;

    switch (customType) {
      case CharacterType.STUDENT:
        bonusIncome = salaryPoints * 200;
        bonusCash = cashPoints * 100;
        bonusSavings = savingsPoints * 50;
        debtReduction = 0; // Students don't have starting debt to reduce
        break;
      case CharacterType.YOUNG_PROFESSIONAL:
        bonusIncome = salaryPoints * 1500;
        bonusCash = cashPoints * 500;
        bonusSavings = savingsPoints * 400;
        debtReduction = debtPoints * 1500;
        break;
      case CharacterType.ENTREPRENEUR:
        bonusIncome = salaryPoints * 1000;
        bonusCash = cashPoints * 300;
        bonusSavings = savingsPoints * 200;
        debtReduction = debtPoints * 600;
        break;
    }

    const finalIncome = bases.baseIncome + bonusIncome;
    const finalBalance = bases.startingBalance + bonusCash;
    const finalSavings = bases.startingSavings + bonusSavings;
    const finalDebt = Math.max(0, bases.startingDebt - debtReduction);

    // Costs scale proportionally with Income to reflect custom lifestyle requirements
    const scalingFactor = finalIncome / bases.baseIncome;
    const finalRent = Math.round(bases.baseRent * scalingFactor);
    const finalGroceries = Math.round(bases.baseGroceries * scalingFactor);
    const finalBills = Math.round(bases.baseBills * scalingFactor);

    return {
      income: finalIncome,
      balance: finalBalance,
      savings: finalSavings,
      debt: finalDebt,
      rent: finalRent,
      groceries: finalGroceries,
      bills: finalBills,
      goals: bases.goals
    };
  };

  const handleLaunchCustomGame = () => {
    const stats = getCustomCalculatedStats();
    
    const customChar: Character = {
      id: "custom_meerkat",
      type: customType,
      name: customName,
      role: customRole,
      avatar: customAvatar === "🦦" ? "/src/assets/images/mali_meerkat_1783490207362.jpg" : customAvatar,
      description: `A custom designed ${customType.toLowerCase().replace("_", " ")} build featuring the ${selectedPerk} perk.`,
      startingBalance: stats.balance,
      startingSavings: stats.savings,
      startingDebt: stats.debt,
      baseIncome: stats.income,
      baseRent: stats.rent,
      baseGroceries: stats.groceries,
      baseBills: stats.bills,
      goals: stats.goals,
      perk: selectedPerk,
      jetpackColor: selectedJetpackColor
    };

    onSelectCharacter(customChar);
  };

  const customStats = getCustomCalculatedStats();
  const surplus = customStats.income - (customStats.rent + customStats.groceries + customStats.bills);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 relative" id="welcome-screen">
      
      <AnimatePresence mode="wait">
        {!isCreatingCustom ? (
          <motion.div
            key="standard-welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Hero Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 shadow-sm"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                MaliGo: Financial Maze Simulator
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl font-sans font-bold tracking-tight text-gray-900 mb-4"
              >
                Navigate the Month, Build <span className="text-emerald-600 font-extrabold relative inline-block">Real Wealth</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
              >
                Every month is a maze of choices. Rent, grocery runs, social events, and unexpected emergencies. Will your decisions lead to financial freedom or compound into debt?
              </motion.p>
            </div>

            {/* Rules of the Game Grid */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 mb-12 shadow-sm"
            >
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100 flex-shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-gray-900 mb-1">1. The Maze is the Month</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">Advance step-by-step through a series of essential, social, and emergency decisions. Each month runs over 5 key nodes.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-3 bg-rose-50 rounded-xl text-rose-600 border border-rose-100 flex-shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-gray-900 mb-1">2. Feel the Consequences</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">Spending now boosts happiness but drains savings. Overspending adds debt that compounds over time with high interest.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100 flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-gray-900 mb-1">3. Live vs Saving Game</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">You start with 3 lives. Extreme stress or massive debt deducts a life. Safeguard lives by achieving your compound savings goals!</p>
                </div>
              </div>
            </motion.div>

            {/* Character Choice Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-sans font-bold text-gray-900">Choose Your Character & Life Path</h2>
              <p className="text-sm text-gray-500">Select a pre-made archetype or craft your own customized build below.</p>
            </div>

            {/* Characters List Grid (3 standards + 1 custom creator tile) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fade-in" id="character-selection">
              {CHARACTERS.map((char, index) => {
                const isStudent = char.type === CharacterType.STUDENT;
                const isPro = char.type === CharacterType.YOUNG_PROFESSIONAL;
                
                return (
                  <motion.div
                    key={char.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.08 }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    onClick={() => handleOpenConfig(char)}
                    className="cursor-pointer flex flex-col justify-between bg-white border border-gray-200 hover:border-emerald-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group relative overflow-hidden"
                    id={`char-card-${char.id}`}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-10 -translate-y-10 bg-emerald-50 group-hover:bg-emerald-100 rounded-full transition-colors" />

                    <div>
                      {/* Avatar & Tag */}
                      <div className="flex items-center justify-between mb-3 relative z-10">
                        {char.avatar.startsWith("/") || char.avatar.startsWith("http") ? (
                          <img src={char.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400 bg-white" referrerPolicy="no-referrer" alt={char.name} />
                        ) : (
                          <span className="text-3xl">{char.avatar}</span>
                        )}
                        <span className={`text-[9px] uppercase font-mono tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                          isStudent ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                          isPro ? "bg-amber-50 text-amber-700 border border-amber-100" :
                          "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}>
                          {char.type.replace("_", " ")}
                        </span>
                      </div>

                      <h3 className="text-lg font-sans font-bold text-gray-900 mb-1.5 relative z-10 group-hover:text-emerald-600 transition-colors">
                        {char.name}
                      </h3>
                      <div className="text-[10px] text-gray-500 font-mono font-semibold mb-2">{char.role}</div>
                      
                      <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-3">
                        {char.description}
                      </p>

                      {/* Financial specs */}
                      <div className="space-y-1.5 border-t border-b border-gray-100 py-3 mb-4">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-gray-400">Income:</span>
                          <span className="text-gray-800 font-bold font-mono">R{char.baseIncome.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-gray-400">Rent:</span>
                          <span className="text-rose-500 font-semibold font-mono">-R{char.baseRent.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-gray-400">Net Worth:</span>
                          <span className="text-emerald-700 font-semibold font-mono">
                            R{(char.startingBalance + char.startingSavings - char.startingDebt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button className="w-full bg-gray-50 group-hover:bg-emerald-600 text-gray-700 group-hover:text-white border border-gray-200 group-hover:border-emerald-600 rounded-xl py-2 text-[11px] font-bold font-sans transition-all flex items-center justify-center gap-1">
                      <Sliders className="w-3 h-3" />
                      Configure & Start
                    </button>
                  </motion.div>
                );
              })}

              {/* Custom Character Creator Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.65 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                onClick={() => setIsCreatingCustom(true)}
                className="cursor-pointer flex flex-col justify-between bg-indigo-950/95 border-2 border-dashed border-indigo-500 hover:border-indigo-400 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group relative overflow-hidden text-white"
                id="char-card-custom"
              >
                <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-10 -translate-y-10 bg-indigo-500/15 group-hover:bg-indigo-500/30 rounded-full transition-colors" />

                <div>
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <span className="text-3xl">🎨</span>
                    <span className="text-[9px] uppercase font-mono tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-500/30">
                      DNA DESIGNER
                    </span>
                  </div>

                  <h3 className="text-lg font-sans font-bold text-white mb-1 relative z-10 group-hover:text-indigo-300 transition-colors">
                    Custom Character
                  </h3>
                  <div className="text-[10px] text-indigo-300 font-mono font-semibold mb-2">Build from Scratch</div>

                  <p className="text-xs text-indigo-200/70 leading-relaxed mb-4">
                    Create a custom meerkat or animal build. Distribute stats, configure starting parameters, select unique perks, and custom flight exhaust!
                  </p>

                  <div className="space-y-1.5 border-t border-b border-indigo-850 py-3 mb-4 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-300">RPG Stat Points:</span>
                      <span className="text-white font-bold">10 Points Pool</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-300">Special Perks:</span>
                      <span className="text-white font-bold">5 Powerful Options</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-300">Jetpack exhaust:</span>
                      <span className="text-emerald-400 font-bold">RGB Selectable</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 rounded-xl py-2 text-[11px] font-bold font-sans transition-all flex items-center justify-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-indigo-200" />
                  Design Custom build
                </button>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          /* Custom Character Creator Module Screen */
          <motion.div
            key="custom-designer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-md"
            id="character-creator-panel"
          >
            {/* Header / Navigation bar */}
            <div className="flex justify-between items-start gap-4 mb-6 border-b border-gray-100 pb-5">
              <div>
                <button
                  onClick={() => setIsCreatingCustom(false)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-bold mb-1 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Archetypes
                </button>
                <h2 className="text-2xl font-sans font-bold text-gray-900 flex items-center gap-2">
                  🧬 Meerkat DNA Laboratory & Character Customizer
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Distribute attributes, customize your animal's appearance, and select special passive abilities.
                </p>
              </div>
              
              <span className="text-3xl p-2 bg-indigo-50 border border-indigo-100 rounded-xl">🎨</span>
            </div>

            {/* Main designer layout: Left visual, Right RPG Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT COLUMN: Visuals, Perks & Cosmetics (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* 1. Name and role description */}
                <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 space-y-3.5">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-gray-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-500" /> Name & Identity
                  </h3>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase">Animal/Character Name:</label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value.slice(0, 18))}
                        placeholder="E.g. Mali"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-hidden focus:border-indigo-500 font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1 uppercase">Custom Career Title:</label>
                      <input
                        type="text"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value.slice(0, 24))}
                        placeholder="E.g. Fullstack Developer"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-hidden focus:border-indigo-500 font-sans"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Avatar Sprite selector */}
                <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-gray-500 flex items-center gap-1.5 mb-3">
                    <Palette className="w-3.5 h-3.5 text-indigo-500" /> Select Animal Sprite
                  </h3>

                  <div className="grid grid-cols-4 gap-2.5">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        key={av.char}
                        onClick={() => setCustomAvatar(av.char)}
                        title={`${av.label}: ${av.desc}`}
                        className={`text-2xl p-2.5 rounded-xl border transition-all hover:scale-105 flex items-center justify-center cursor-pointer ${
                          customAvatar === av.char
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                            : "bg-white border-gray-200 hover:border-indigo-300 text-gray-800"
                        }`}
                      >
                        {av.char}
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-2 text-center font-medium">
                    Chosen: {AVATAR_OPTIONS.find(a => a.char === customAvatar)?.label} - "{AVATAR_OPTIONS.find(a => a.char === customAvatar)?.desc}"
                  </div>
                </div>

                {/* 3. Jetpack exhaustion flight color */}
                <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-gray-500 flex items-center gap-1.5 mb-3">
                    <Flame className="w-3.5 h-3.5 text-indigo-500" /> Jetpack Thrust Exhaust Color
                  </h3>

                  <div className="flex gap-3 justify-center">
                    {FLAME_COLORS.map((fl) => (
                      <button
                        key={fl.hex}
                        onClick={() => setSelectedJetpackColor(fl.hex)}
                        title={fl.label}
                        className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer relative flex items-center justify-center ${fl.shadow} hover:scale-110 ${
                          selectedJetpackColor === fl.hex ? "border-indigo-600 scale-105" : "border-transparent"
                        }`}
                        style={{ backgroundColor: fl.hex }}
                      >
                        {selectedJetpackColor === fl.hex && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-2 text-center font-medium">
                    This exhaust color will render as particles inside the Chrono-Flap Labyrinth game!
                  </div>
                </div>

                {/* 4. Select passive perk ability */}
                <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-gray-500 flex items-center gap-1.5 mb-3">
                    <Zap className="w-3.5 h-3.5 text-indigo-500" /> Unique Passive Perk
                  </h3>

                  <div className="space-y-2.5">
                    {PERK_OPTIONS.map((perk) => (
                      <button
                        key={perk.id}
                        onClick={() => setSelectedPerk(perk.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-start ${
                          selectedPerk === perk.id
                            ? "bg-indigo-50/80 border-indigo-400 ring-1 ring-indigo-300"
                            : "bg-white border-gray-200 hover:border-indigo-200"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="text-xs font-bold text-gray-900 mb-0.5">{perk.name}</div>
                          <div className="text-[10px] text-gray-500 leading-normal">{perk.desc}</div>
                        </div>
                        {selectedPerk === perk.id && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Stats & Calculations (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Career Class baseline toggle */}
                <div className="bg-slate-900 text-white rounded-2xl p-4">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3.5 flex items-center gap-1.5">
                    💼 Step 1: Select Career Path Baseline
                  </h3>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setCustomType(CharacterType.STUDENT);
                        setDebtPoints(0); // student always starts at 0 debt
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                        customType === CharacterType.STUDENT
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      🎓 Student
                    </button>
                    <button
                      onClick={() => setCustomType(CharacterType.YOUNG_PROFESSIONAL)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                        customType === CharacterType.YOUNG_PROFESSIONAL
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      👔 Professional
                    </button>
                    <button
                      onClick={() => setCustomType(CharacterType.ENTREPRENEUR)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                        customType === CharacterType.ENTREPRENEUR
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-sm"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      🚀 Entrepreneur
                    </button>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 mt-3 leading-relaxed font-sans">
                    {customType === CharacterType.STUDENT 
                      ? "Grad res lifestyle. Subsidized rents, small allowance, zero base liabilities. Low stakes, high freedom."
                      : customType === CharacterType.YOUNG_PROFESSIONAL
                        ? "Corporate entry lifestyle. Higher baseline income, but weighed down by fiber rent, gym bills, and R10,000 student debt."
                        : "Lease a workshop, fuel delivery trucks. Variable high revenue, fluctuating cash reserves, and machinery lease liabilities."
                    }
                  </p>
                </div>

                {/* 2. Point allocator pool */}
                <div className="bg-gray-50 border border-gray-150 rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xs uppercase tracking-wider font-bold text-gray-500 flex items-center gap-1.5">
                        🧬 Step 2: Allocate RPG Stat Points
                      </h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">Spend points to modify starting budgets and clear debts.</p>
                    </div>

                    <div className="bg-indigo-100 border border-indigo-200 text-indigo-900 rounded-lg px-2.5 py-1 text-xs font-mono font-black animate-pulse">
                      POINTS LEFT: {statPointsLeft}
                    </div>
                  </div>

                  {/* Attribute Point sliders/inputs */}
                  <div className="space-y-4">
                    {/* Stat 1: Income boost */}
                    <div className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-xl">
                      <div>
                        <div className="text-xs font-bold text-gray-800 flex items-center gap-1">
                          💼 Monthly Income Boost
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {customType === CharacterType.STUDENT ? "+R200 per point" : customType === CharacterType.YOUNG_PROFESSIONAL ? "+R1,500 per point" : "+R1,000 per point"}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          disabled={salaryPoints <= 0}
                          onClick={() => setSalaryPoints(salaryPoints - 1)}
                          className="w-7 h-7 border border-gray-200 hover:bg-gray-100 disabled:opacity-30 rounded-lg flex items-center justify-center cursor-pointer font-bold text-gray-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-sm w-4 text-center text-indigo-600">{salaryPoints}</span>
                        <button
                          disabled={statPointsLeft <= 0 || salaryPoints >= 5}
                          onClick={() => setSalaryPoints(salaryPoints + 1)}
                          className="w-7 h-7 border border-gray-200 hover:bg-gray-100 disabled:opacity-30 rounded-lg flex items-center justify-center cursor-pointer font-bold text-gray-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Stat 2: Cash reserves */}
                    <div className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-xl">
                      <div>
                        <div className="text-xs font-bold text-gray-800 flex items-center gap-1">
                          💰 Starting Cash Wallet
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {customType === CharacterType.STUDENT ? "+R100 per point" : customType === CharacterType.YOUNG_PROFESSIONAL ? "+R500 per point" : "+R300 per point"}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          disabled={cashPoints <= 0}
                          onClick={() => setCashPoints(cashPoints - 1)}
                          className="w-7 h-7 border border-gray-200 hover:bg-gray-100 disabled:opacity-30 rounded-lg flex items-center justify-center cursor-pointer font-bold text-gray-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-sm w-4 text-center text-indigo-600">{cashPoints}</span>
                        <button
                          disabled={statPointsLeft <= 0 || cashPoints >= 5}
                          onClick={() => setCashPoints(cashPoints + 1)}
                          className="w-7 h-7 border border-gray-200 hover:bg-gray-100 disabled:opacity-30 rounded-lg flex items-center justify-center cursor-pointer font-bold text-gray-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Stat 3: Savings reserves */}
                    <div className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-xl">
                      <div>
                        <div className="text-xs font-bold text-gray-800 flex items-center gap-1">
                          🐖 Starting Compound Savings
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {customType === CharacterType.STUDENT ? "+R50 per point" : customType === CharacterType.YOUNG_PROFESSIONAL ? "+R400 per point" : "+R200 per point"}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          disabled={savingsPoints <= 0}
                          onClick={() => setSavingsPoints(savingsPoints - 1)}
                          className="w-7 h-7 border border-gray-200 hover:bg-gray-100 disabled:opacity-30 rounded-lg flex items-center justify-center cursor-pointer font-bold text-gray-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-sm w-4 text-center text-indigo-600">{savingsPoints}</span>
                        <button
                          disabled={statPointsLeft <= 0 || savingsPoints >= 5}
                          onClick={() => setSavingsPoints(savingsPoints + 1)}
                          className="w-7 h-7 border border-gray-200 hover:bg-gray-100 disabled:opacity-30 rounded-lg flex items-center justify-center cursor-pointer font-bold text-gray-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Stat 4: Debt reduction (NOT applicable to students) */}
                    <div className={`flex items-center justify-between p-3 rounded-xl border ${customType === CharacterType.STUDENT ? "bg-gray-100/65 border-gray-200/50 opacity-40" : "bg-white border-gray-200"}`}>
                      <div>
                        <div className="text-xs font-bold text-gray-800 flex items-center gap-1">
                          🛑 starting Debt Forgiveness
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {customType === CharacterType.STUDENT ? "Students start with zero debt" : customType === CharacterType.YOUNG_PROFESSIONAL ? "-R1,500 debt per point" : "-R600 debt per point"}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          disabled={customType === CharacterType.STUDENT || debtPoints <= 0}
                          onClick={() => setDebtPoints(debtPoints - 1)}
                          className="w-7 h-7 border border-gray-200 hover:bg-gray-100 disabled:opacity-30 rounded-lg flex items-center justify-center cursor-pointer font-bold text-gray-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-sm w-4 text-center text-indigo-600">{debtPoints}</span>
                        <button
                          disabled={customType === CharacterType.STUDENT || statPointsLeft <= 0 || debtPoints >= 5}
                          onClick={() => setDebtPoints(debtPoints + 1)}
                          className="w-7 h-7 border border-gray-200 hover:bg-gray-100 disabled:opacity-30 rounded-lg flex items-center justify-center cursor-pointer font-bold text-gray-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Live Budget Forecast Card */}
                <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-300 flex items-center gap-1.5">
                    ⚙️ Customized Monthly Budget Outlook
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-b border-slate-800 pb-4">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-[9px] text-slate-500 uppercase font-black">Starting Cash</div>
                      <div className="text-xs sm:text-sm font-mono font-bold text-slate-200 mt-0.5">R{customStats.balance.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-[9px] text-slate-500 uppercase font-black">Savings Pool</div>
                      <div className="text-xs sm:text-sm font-mono font-bold text-cyan-400 mt-0.5">R{customStats.savings.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-[9px] text-slate-500 uppercase font-black">Starting Debt</div>
                      <div className="text-xs sm:text-sm font-mono font-bold text-rose-500 mt-0.5">R{customStats.debt.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-[9px] text-slate-500 uppercase font-black">Net Salary</div>
                      <div className="text-xs sm:text-sm font-mono font-bold text-emerald-400 mt-0.5">R{customStats.income.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Outflows summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Fixed Rent & Utility Outflow:</span>
                      <span className="font-mono text-rose-400 font-bold">-R{customStats.rent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Fixed Groceries Outflow:</span>
                      <span className="font-mono text-rose-400 font-bold">-R{customStats.groceries.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Fixed Essential Bills Outflow:</span>
                      <span className="font-mono text-rose-400 font-bold">-R{customStats.bills.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Surplus Equation */}
                  <div className={`p-4 rounded-xl border ${surplus < 0 ? "bg-rose-950/60 border-rose-800/80 text-rose-200" : "bg-emerald-950/60 border-emerald-800/80 text-emerald-200"}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider block opacity-90">Leftover Monthly Cash Margin:</span>
                        <span className="text-[10px] opacity-75">Used to invest or support social/emergency decisions.</span>
                      </div>
                      <span className="text-lg sm:text-xl font-black font-mono">
                        R{surplus.toLocaleString()}
                      </span>
                    </div>
                    {surplus <= 0 && (
                      <div className="mt-2 text-[10px] font-bold flex items-center gap-1 text-rose-300">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        Warning: Surplus is in deficit! Clear debt or allocate more to Income boost to start safely.
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Complete button */}
                <button
                  disabled={statPointsLeft > 0 || surplus < 0 || !customName.trim()}
                  onClick={handleLaunchCustomGame}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-sans font-bold text-sm py-4 rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {statPointsLeft > 0 ? (
                    <>
                      <span>⚠️ Allocate {statPointsLeft} Remaining Points</span>
                    </>
                  ) : surplus < 0 ? (
                    <>
                      <span>⚠️ Solve Surplus Cash Deficit First</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-indigo-200 animate-pulse" />
                      <span>Launch Custom character Build ({customName})</span>
                    </>
                  )}
                </button>

              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Customizable Salary/Cost Panel Drawer Modal for Pre-made Characters */}
      <AnimatePresence>
        {activeConfigChar && (() => {
          const bounds = getSliderBounds(activeConfigChar.type);
          const costs = getScaledCosts(activeConfigChar, customIncome, avoidInflation);
          const totalOutflow = costs.rent + costs.groceries + costs.bills;
          const leftOver = customIncome - totalOutflow;

          return (
            <div className="fixed inset-0 bg-gray-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white border border-gray-150 shadow-2xl rounded-3xl p-6 sm:p-8 max-w-lg w-full relative overflow-hidden"
              >
                {/* Close Button */}
                <button
                  onClick={() => setActiveConfigChar(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  {activeConfigChar.avatar.startsWith("/") || activeConfigChar.avatar.startsWith("http") ? (
                    <img src={activeConfigChar.avatar} className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400 bg-white shadow-xs" referrerPolicy="no-referrer" alt={activeConfigChar.name} />
                  ) : (
                    <span className="text-4xl">{activeConfigChar.avatar}</span>
                  )}
                  <div>
                    <h3 className="text-xl font-sans font-bold text-gray-900">
                      Configure {activeConfigChar.name}'s Budget
                    </h3>
                    <p className="text-xs text-gray-500">
                      Adjust starting conditions to test alternative lifestyle equations.
                    </p>
                  </div>
                </div>

                {/* Salary Slider Section */}
                <div className="space-y-5 mb-6">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Custom Starting Salary:</span>
                      <span className="text-lg font-mono font-extrabold text-emerald-600">R{customIncome.toLocaleString()}</span>
                    </div>

                    <input
                      type="range"
                      min={bounds.min}
                      max={bounds.max}
                      step={bounds.step}
                      value={customIncome}
                      onChange={(e) => setCustomIncome(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />

                    <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                      <span>Min: R{bounds.min.toLocaleString()}</span>
                      <span>Default: R{activeConfigChar.baseIncome.toLocaleString()}</span>
                      <span>Max: R{bounds.max.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Lifestyle Inflation Switch */}
                  <div className="flex items-start justify-between gap-4 p-4 border border-gray-100 rounded-2xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-amber-500" />
                        <h4 className="text-xs font-bold text-gray-800">Avoid Lifestyle Inflation</h4>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-normal">
                        If checked, fixed expenses (Rent, Bills, Food) stay at original lower baseline despite earning a higher salary.
                      </p>
                    </div>
                    <button
                      onClick={() => setAvoidInflation(!avoidInflation)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        avoidInflation ? "bg-emerald-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          avoidInflation ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Calculated Outflows */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Proportional Fixed Outflows:</h4>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs bg-gray-50/50 py-1.5 px-3 rounded-lg border border-gray-100">
                        <span className="text-gray-500">Fixed Rent:</span>
                        <span className="font-mono text-rose-600 font-bold">-R{costs.rent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs bg-gray-50/50 py-1.5 px-3 rounded-lg border border-gray-100">
                        <span className="text-gray-500">Fixed Groceries:</span>
                        <span className="font-mono text-rose-600 font-bold">-R{costs.groceries.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs bg-gray-50/50 py-1.5 px-3 rounded-lg border border-gray-100">
                        <span className="text-gray-500">Fixed Essential Bills:</span>
                        <span className="font-mono text-rose-600 font-bold">-R{costs.bills.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Budget Equation Card */}
                  <div className={`p-4 rounded-2xl border ${leftOver < 0 ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider block opacity-70">Estimated Leftover Surplus:</span>
                        <span className="text-[10px] opacity-80 leading-snug">Available to invest or buffer choices each month.</span>
                      </div>
                      <span className="text-xl font-extrabold font-mono">
                        R{leftOver.toLocaleString()}
                      </span>
                    </div>
                    {leftOver <= 0 && (
                      <div className="mt-2 text-[10px] font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        Warning: Starting in a deficit makes survivability extremely hard! Add more salary or turn on Avoid Inflation.
                      </div>
                    )}
                  </div>
                </div>

                {/* Action button */}
                <button
                  disabled={leftOver < 0 && !avoidInflation}
                  onClick={handleStartStandardGame}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-sans font-bold text-sm py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Launch MaliGo Simulation
                </button>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
