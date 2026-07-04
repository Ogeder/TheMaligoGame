import React from "react";
import { motion } from "motion/react";
import { Character } from "../types";
import { RefreshCw, HeartCrack, Flame, TrendingDown, Info, ShieldAlert } from "lucide-react";

interface GameOverScreenProps {
  character: Character;
  monthIndex: number;
  balance: number;
  savings: number;
  debt: number;
  stress: number;
  onRestart: () => void;
}

export default function GameOverScreen({
  character,
  monthIndex,
  balance,
  savings,
  debt,
  stress,
  onRestart
}: GameOverScreenProps) {
  const currentMonthName = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ][monthIndex] || "Month " + (monthIndex + 1);

  const netWorth = balance + savings - debt;

  return (
    <div className="max-w-xl mx-auto px-4 py-12" id="game-over-screen">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="bg-white border border-gray-250 shadow-2xl rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden"
      >
        {/* Red Glow decoration */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl" />

        {/* Heart Crack Graphic */}
        <div className="mx-auto w-16 h-16 bg-rose-50 rounded-2xl border border-rose-100 text-rose-500 flex items-center justify-center mb-6 relative z-10 animate-bounce-slow">
          <HeartCrack className="w-9 h-9" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-sans font-extrabold tracking-tight text-gray-950 mb-2 relative z-10">
          Simulation Terminated
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto mb-8 relative z-10">
          You experienced critical burnout or default in <strong className="font-bold text-gray-800">{currentMonthName} (Chapter {monthIndex + 1})</strong>. Your financial buffer collapsed.
        </p>

        {/* Character info */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center gap-4 text-left mb-6">
          <span className="text-4xl filter drop-shadow-sm select-none">{character.avatar}</span>
          <div>
            <h3 className="font-sans font-bold text-sm text-gray-900">{character.name}</h3>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-mono font-bold">{character.role}</p>
          </div>
          <span className="ml-auto bg-rose-100 text-rose-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-rose-200">
            0 LIVES LEFT
          </span>
        </div>

        {/* Final Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-50 p-3 border border-gray-100 rounded-xl text-left">
            <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Final Cash</span>
            <span className={`font-mono text-sm font-bold ${balance < 0 ? "text-rose-600" : "text-gray-900"}`}>
              R{balance.toLocaleString()}
            </span>
          </div>

          <div className="bg-gray-50 p-3 border border-gray-100 rounded-xl text-left">
            <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Savings Drained</span>
            <span className="font-mono text-sm font-bold text-emerald-600">
              R{savings.toLocaleString()}
            </span>
          </div>

          <div className="bg-gray-50 p-3 border border-gray-100 rounded-xl text-left col-span-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Critical Unpaid Debt</span>
              <span className="text-[10px] text-rose-500 font-semibold uppercase font-mono">Limit: R{(character.baseIncome * 2.5).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="font-mono text-base font-extrabold text-rose-600">
                R{debt.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-500">
                ({((debt / (character.baseIncome * 2.5)) * 100).toFixed(0)}% leverage)
              </span>
            </div>
          </div>
        </div>

        {/* Educational Lesson */}
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 items-start text-left mb-8">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed font-medium">
            <strong className="font-bold block mb-1">💡 Educational Takeaway:</strong>
            When debt exceeds 2.5 times your monthly income, your interest compounding accelerates faster than your paycheck can keep up! Next time, prioritize automating your savings sweep early, and choose lower stress options to protect your emotional and physical productivity lives.
          </div>
        </div>

        {/* Retry Button */}
        <button
          onClick={onRestart}
          className="w-full bg-rose-600 hover:bg-rose-500 text-white font-sans font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Restart MaliGo Simulation
        </button>

      </motion.div>
    </div>
  );
}
