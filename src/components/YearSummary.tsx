import React from "react";
import { motion } from "motion/react";
import { Character, MonthRecord } from "../types";
import { TrendingUp, Award, RefreshCw, Star, ShieldCheck, Heart, AlertCircle, Compass } from "lucide-react";

interface YearSummaryProps {
  character: Character;
  history: MonthRecord[];
  netWorthHistory: number[];
  onRestart: () => void;
  onOpenSpeedrunner: () => void;
}

export default function YearSummary({
  character,
  history,
  netWorthHistory,
  onRestart,
  onOpenSpeedrunner
}: YearSummaryProps) {
  
  const finalMonth = history[history.length - 1];
  const finalBalance = finalMonth ? finalMonth.endBalance : 0;
  const finalSavings = finalMonth ? finalMonth.endSavings : 0;
  const finalDebt = finalMonth ? finalMonth.endDebt : 0;
  const finalNetWorth = finalBalance + finalSavings - finalDebt;

  const startingNetWorth = character.startingBalance + character.startingSavings - character.startingDebt;
  const netWorthGrowth = finalNetWorth - startingNetWorth;
  const growthPercent = (netWorthGrowth / Math.max(1, Math.abs(startingNetWorth))) * 100;

  // Calculate Average Stress
  const averageStress = Math.round(
    history.reduce((acc, curr) => acc + curr.stress, 0) / Math.max(1, history.length)
  );

  // Evaluate Achievements
  const achievements = [];
  if (finalDebt === 0) {
    achievements.push({
      title: "Debt-Free Champion",
      desc: "Ended the year with absolutely zero debt. Fantastic leverage control!",
      icon: "🛡️",
      color: "bg-emerald-50 border-emerald-200 text-emerald-800"
    });
  }
  if (finalNetWorth > startingNetWorth) {
    achievements.push({
      title: "Wealth Builder",
      desc: "Grew your net worth from starting baselines. Compound growth in action!",
      icon: "📈",
      color: "bg-blue-50 border-blue-200 text-blue-800"
    });
  }
  if (averageStress < 40) {
    achievements.push({
      title: "Zen Money Master",
      desc: "Kept average stress levels below 40%. Highly balanced life and budget.",
      icon: "🧘",
      color: "bg-indigo-50 border-indigo-200 text-indigo-800"
    });
  }
  if (finalSavings > 8000) {
    achievements.push({
      title: "High-Yield Super Saver",
      desc: "Accumulated more than R8,000 in compound savings. A bulletproof buffer!",
      icon: "🦄",
      color: "bg-purple-50 border-purple-200 text-purple-800"
    });
  }
  if (achievements.length === 0) {
    achievements.push({
      title: "Resilient Financial Survivor",
      desc: "Faced extreme market pressures, debt emergencies, and survived a full year!",
      icon: "🎒",
      color: "bg-amber-50 border-amber-200 text-amber-800"
    });
  }

  // Calculate coordinates for SVG custom Line Chart
  const svgWidth = 500;
  const svgHeight = 200;
  const padding = 35;
  const chartWidth = svgWidth - padding * 2;
  const chartHeight = svgHeight - padding * 2;

  // Find min and max of net worth history to scale chart
  const netWorthVals = [startingNetWorth, ...netWorthHistory];
  const maxVal = Math.max(...netWorthVals, 2000);
  const minVal = Math.min(...netWorthVals, -2000);
  const valRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const points = netWorthVals.map((val, idx) => {
    const x = padding + (idx / (netWorthVals.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((val - minVal) / valRange) * chartHeight;
    return { x, y, val, month: idx === 0 ? "Start" : `M${idx}` };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div className="max-w-4xl mx-auto py-10 px-4" id="year-summary-screen">
      
      {/* Top Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 shadow-sm">
          <Star className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
          12 Chapters Cleared: A Full Year Achieved!
        </div>

        <h1 className="text-3xl sm:text-4xl font-sans font-bold text-gray-900 tracking-tight">
          Your Annual Wealth Report
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Reviewing {character.name}'s compounding trajectory and financial habits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Core Metrics Cards */}
        <div className="bg-white border border-gray-150 rounded-2xl p-5 text-center shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Final Net Worth</span>
          <span className={`text-3xl font-extrabold font-mono block my-1 ${finalNetWorth < 0 ? "text-rose-600" : "text-emerald-600"}`}>
            R{finalNetWorth.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500 font-medium">
            Started: R{startingNetWorth.toLocaleString()}
          </span>
        </div>

        <div className="bg-white border border-gray-150 rounded-2xl p-5 text-center shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Net Capital Growth</span>
          <span className={`text-3xl font-extrabold font-mono block my-1 ${netWorthGrowth < 0 ? "text-rose-600" : "text-emerald-600"}`}>
            {netWorthGrowth >= 0 ? "+" : ""}R{netWorthGrowth.toLocaleString()}
          </span>
          <span className={`text-xs font-semibold flex items-center justify-center gap-1 ${netWorthGrowth >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            <TrendingUp className="w-3.5 h-3.5" />
            {growthPercent.toFixed(1)}% YoY Growth
          </span>
        </div>

        <div className="bg-white border border-gray-150 rounded-2xl p-5 text-center shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Average Stress Level</span>
          <span className={`text-3xl font-extrabold font-mono block my-1 ${averageStress > 60 ? "text-rose-600" : averageStress > 35 ? "text-amber-600" : "text-emerald-600"}`}>
            {averageStress}%
          </span>
          <span className="text-xs text-gray-500 font-medium">
            {averageStress > 60 ? "Heavy burnout pressure" : averageStress > 35 ? "Moderate lifestyle load" : "Excellent mental cushion"}
          </span>
        </div>
      </div>

      {/* Net Worth custom SVG Chart & Detailed Ledger Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        
        {/* 1. Custom Net Worth Trend Chart */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-600" />
              Net Worth Trajectory Chart
            </h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              Witness the compounding effects of savings sweeps, investments, and loan payoffs over 12 chapters.
            </p>
          </div>

          {/* SVG Custom Line Chart */}
          <div className="w-full h-auto bg-gray-50/50 rounded-xl border border-gray-100 p-2 relative">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="#e5e7eb" strokeDasharray="3,3" />
              <line x1={padding} y1={padding + chartHeight / 2} x2={svgWidth - padding} y2={padding + chartHeight / 2} stroke="#e5e7eb" strokeDasharray="3,3" />
              <line x1={padding} y1={padding + chartHeight} x2={svgWidth - padding} y2={padding + chartHeight} stroke="#e5e7eb" strokeDasharray="3,3" strokeWidth="1.5" />

              {/* Zero line if range crosses zero */}
              {minVal < 0 && maxVal > 0 && (
                <line 
                  x1={padding} 
                  y1={padding + chartHeight - ((0 - minVal) / valRange) * chartHeight} 
                  x2={svgWidth - padding} 
                  y2={padding + chartHeight - ((0 - minVal) / valRange) * chartHeight} 
                  stroke="#f43f5e" 
                  strokeWidth="1" 
                  strokeDasharray="4,4"
                />
              )}

              {/* Connected Trajectory Polyline */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
              />

              {/* Shaded Area under the curve */}
              <path
                d={`M ${points[0].x} ${padding + chartHeight} L ${polylinePoints} L ${points[points.length - 1].x} ${padding + chartHeight} Z`}
                fill="url(#emerald-gradient)"
                opacity="0.1"
              />

              {/* Data Node Dots */}
              {points.map((p, i) => (
                <g key={i} className="group cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  {/* Tooltip on nodes */}
                  <text
                    x={p.x}
                    y={p.y - 8}
                    textAnchor="middle"
                    className="text-[8px] font-mono font-bold fill-gray-900 hidden group-hover:block"
                  >
                    R{Math.round(p.val)}
                  </text>
                </g>
              ))}

              {/* X-Axis labels (Months) */}
              {points.map((p, i) => {
                if (i % 2 !== 0 && i !== 0 && i !== points.length - 1) return null; // reduce clutter
                return (
                  <text
                    key={i}
                    x={p.x}
                    y={padding + chartHeight + 15}
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-gray-400 font-medium"
                  >
                    {p.month}
                  </text>
                );
              })}

              {/* Y-Axis High/Low markers */}
              <text x={padding - 5} y={padding + 4} textAnchor="end" className="text-[8px] font-mono fill-gray-400 font-semibold">
                R{Math.round(maxVal).toLocaleString()}
              </text>
              <text x={padding - 5} y={padding + chartHeight + 2} textAnchor="end" className="text-[8px] font-mono fill-gray-400 font-semibold">
                R{Math.round(minVal).toLocaleString()}
              </text>

              {/* Definitions */}
              <defs>
                <linearGradient id="emerald-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <div className="text-[10px] text-gray-400 text-center font-mono mt-3">
            Nodes depict compound trajectory from start to Month 12 (YTD)
          </div>
        </div>

        {/* 2. Educational Achievements / Badges */}
        <div className="bg-white border border-gray-250 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              Unlocked Financial Achievements
            </h3>

            <div className="space-y-4">
              {achievements.map((ach, idx) => (
                <div key={idx} className={`flex gap-3 items-start border rounded-xl p-3.5 ${ach.color}`}>
                  <span className="text-2xl flex-shrink-0">{ach.icon}</span>
                  <div>
                    <h4 className="font-sans font-bold text-xs sm:text-sm leading-snug">{ach.title}</h4>
                    <p className="text-xs opacity-90 mt-1 leading-normal">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 leading-normal font-medium">
            🧠 Learn by Experience: The financial decisions you made here map directly to real retail, personal banking, and investment vehicles. Playing multiple paths teaches versatile compounding skills.
          </div>
        </div>

      </div>

      {/* Play Again Call to action */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 text-center text-white relative overflow-hidden shadow-md">
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />
        
        <h2 className="text-xl sm:text-2xl font-sans font-bold tracking-tight mb-2 relative z-10">
          Ready to master another lifestyle path?
        </h2>
        <p className="text-sm text-gray-400 max-w-lg mx-auto mb-6 relative z-10 leading-relaxed">
          Try navigating a year as Mali the Entrepreneur to handle high sales volatility, or test out Mali the Student to practice high-frugality resilience!
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 relative z-10">
          <button
            onClick={onOpenSpeedrunner}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-sm px-6 py-3 rounded-xl transition-all inline-flex items-center gap-2 shadow-sm cursor-pointer"
          >
            🔮 Warp Time with the Chrono-Mirror
          </button>

          <button
            onClick={onRestart}
            className="bg-slate-800 hover:bg-slate-700 text-white font-sans font-bold text-sm px-6 py-3 rounded-xl transition-all inline-flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
            Play Again with New Character
          </button>
        </div>
      </div>

    </div>
  );
}
