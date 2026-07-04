import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CHARACTERS } from "../data/scenarios";
import { Character, CharacterType } from "../types";
import { TrendingUp, Award, Activity, ShieldCheck, Compass, Sliders, X, Sparkles, AlertCircle, EyeOff, Flame } from "lucide-react";

interface WelcomeScreenProps {
  onSelectCharacter: (char: Character) => void;
}

export default function WelcomeScreen({ onSelectCharacter }: WelcomeScreenProps) {
  const [activeConfigChar, setActiveConfigChar] = useState<Character | null>(null);
  const [customIncome, setCustomIncome] = useState<number>(18000);
  const [avoidInflation, setAvoidInflation] = useState<boolean>(false);

  // Set default sliders depending on selected character
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

  // Compute live scaling costs
  const getScaledCosts = (char: Character, income: number, avoid: boolean) => {
    if (avoid) {
      return {
        rent: char.baseRent,
        groceries: char.baseGroceries,
        bills: char.baseBills,
      };
    }
    // Proportional scaling factor
    const factor = income / char.baseIncome;
    return {
      rent: Math.round(char.baseRent * factor),
      groceries: Math.round(char.baseGroceries * factor),
      bills: Math.round(char.baseBills * factor),
    };
  };

  const handleStartGame = () => {
    if (!activeConfigChar) return;
    const costs = getScaledCosts(activeConfigChar, customIncome, avoidInflation);
    
    // Create a modified Character object with player's custom configurations
    const customized: Character = {
      ...activeConfigChar,
      baseIncome: customIncome,
      baseRent: costs.rent,
      baseGroceries: costs.groceries,
      baseBills: costs.bills,
    };
    
    onSelectCharacter(customized);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 relative" id="welcome-screen">
      {/* Hero Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 shadow-sm"
        >
          <Compass className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
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
        <p className="text-sm text-gray-500">Customize starting income to explore the financial interaction effects of different lifestyle baselines.</p>
      </div>

      {/* Characters List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12" id="character-selection">
        {CHARACTERS.map((char, index) => {
          const isStudent = char.type === CharacterType.STUDENT;
          const isPro = char.type === CharacterType.YOUNG_PROFESSIONAL;
          
          return (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              onClick={() => handleOpenConfig(char)}
              className="cursor-pointer flex flex-col justify-between bg-white border border-gray-200 hover:border-emerald-500 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
              id={`char-card-${char.id}`}
            >
              {/* Highlight Tag */}
              <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-12 -translate-y-12 bg-emerald-50 group-hover:bg-emerald-100 rounded-full transition-colors" />

              <div>
                {/* Avatar & Role Header */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="text-4xl">{char.avatar}</span>
                  <span className={`text-[10px] uppercase font-mono tracking-wider font-semibold px-2.5 py-1 rounded-full ${
                    isStudent ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                    isPro ? "bg-amber-50 text-amber-700 border border-amber-100" :
                    "bg-rose-50 text-rose-700 border border-rose-100"
                  }`}>
                    {char.type.replace("_", " ")}
                  </span>
                </div>

                {/* Name & Role */}
                <h3 className="text-xl font-sans font-bold text-gray-900 mb-2 relative z-10 group-hover:text-emerald-600 transition-colors">
                  {char.name}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  {char.description}
                </p>

                {/* Financial Baseline Specs */}
                <div className="space-y-2 border-t border-b border-gray-100 py-4 mb-6">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-medium">Standard Income:</span>
                    <span className="text-gray-900 font-bold font-mono">R{char.baseIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-medium">Fixed Rent:</span>
                    <span className="text-rose-600 font-semibold font-mono">-R{char.baseRent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-medium">Starting Net Worth:</span>
                    <span className="text-emerald-700 font-semibold font-mono">
                      R{(char.startingBalance + char.startingSavings - char.startingDebt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Goals */}
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Key Milestones:
                  </h4>
                  <ul className="space-y-1.5">
                    {char.goals.map((goal, i) => (
                      <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5 leading-snug">
                        <span className="text-emerald-500 font-bold">•</span>
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Select Button */}
              <button className="w-full bg-gray-50 group-hover:bg-emerald-600 text-gray-700 group-hover:text-white border border-gray-200 group-hover:border-emerald-600 rounded-xl py-2.5 text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 shadow-sm">
                <Sliders className="w-3.5 h-3.5" />
                Customize & Choose {char.name}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Customizable Salary/Cost Panel Drawer Modal */}
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
                  <span className="text-4xl">{activeConfigChar.avatar}</span>
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
                  onClick={handleStartGame}
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
