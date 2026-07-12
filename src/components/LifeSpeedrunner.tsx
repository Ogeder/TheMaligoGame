import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Character } from "../types";
import { Compass, Sparkles, TrendingUp, RefreshCw, X, Coins, ShieldCheck, Flame, Info } from "lucide-react";

interface LifeSpeedrunnerProps {
  character: Character;
  currentBalance: number;
  currentSavings: number;
  currentDebt: number;
  onClose: () => void;
  onSimulationRun?: () => void;
}

export default function LifeSpeedrunner({
  character,
  currentBalance,
  currentSavings,
  currentDebt,
  onClose,
  onSimulationRun
}: LifeSpeedrunnerProps) {
  const [monthsToProject, setMonthsToProject] = useState<number>(24);
  const [monthlySavingsInput, setMonthlySavingsInput] = useState<number>(
    Math.round(character.baseIncome * 0.15) // default 15%
  );
  const [monthlyDebtRepayment, setMonthlyDebtRepayment] = useState<number>(
    currentDebt > 0 ? Math.round(character.baseIncome * 0.10) : 0
  );

  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentSimStep, setCurrentSimStep] = useState<number>(0);

  // AI-Estimated State
  const [simulationMode, setSimulationMode] = useState<"MATH" | "AI">("MATH");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiGrade, setAiGrade] = useState<string | null>(null);
  const [aiMilestones, setAiMilestones] = useState<any[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  // Interest Rates
  let annualSavingsRate = 0.07;
  if (character.type === "YOUNG_PROFESSIONAL") {
    annualSavingsRate = 0.11;
  } else if (character.type === "ENTREPRENEUR") {
    annualSavingsRate = 0.06;
  }
  const monthlySavingsRate = annualSavingsRate / 12;
  const monthlyDebtInterestRate = 0.025; // 2.5% monthly compound debt

  const runMathSimulation = () => {
    let tempBalance = currentBalance;
    let tempSavings = currentSavings;
    let tempDebt = currentDebt;
    const history: any[] = [];

    // Push initial node
    history.push({
      month: 0,
      balance: Math.round(tempBalance),
      savings: Math.round(tempSavings),
      debt: Math.round(tempDebt),
      netWorth: Math.round(tempBalance + tempSavings - tempDebt),
      interestEarned: 0,
      eventText: "Initial starting position."
    });

    for (let m = 1; m <= monthsToProject; m++) {
      // 1. Earn income & deduct fixed outflows
      const baseOutflow = character.baseRent + character.baseGroceries + character.baseBills;
      let surplus = character.baseIncome - baseOutflow;

      // 2. Apply Custom Savings Target and Extra Debt Repayment from surplus
      let actualSaved = monthlySavingsInput;
      let actualRepaid = monthlyDebtRepayment;

      if (surplus < actualSaved + actualRepaid) {
        // adjust proportional to surplus
        const totalTarget = actualSaved + actualRepaid;
        if (totalTarget > 0) {
          const ratio = Math.max(0, surplus) / totalTarget;
          actualSaved = Math.round(actualSaved * ratio);
          actualRepaid = Math.round(actualRepaid * ratio);
        } else {
          actualSaved = 0;
          actualRepaid = 0;
        }
      }

      // 3. Move actualSaved to savings
      tempSavings += actualSaved;
      tempBalance += (surplus - actualSaved - actualRepaid);

      // 4. Pay debt
      const debtPaid = Math.min(tempDebt, actualRepaid);
      tempDebt -= debtPaid;

      // 5. Apply monthly compounding interest
      const monthlyEarned = tempSavings * monthlySavingsRate;
      tempSavings += monthlyEarned;

      const monthlyDebtCost = tempDebt * monthlyDebtInterestRate;
      tempDebt += monthlyDebtCost;

      // Handle negative cash balances
      if (tempBalance < 0) {
        if (tempSavings >= Math.abs(tempBalance)) {
          tempSavings += tempBalance;
          tempBalance = 0;
        } else {
          tempDebt += (Math.abs(tempBalance) - tempSavings);
          tempSavings = 0;
          tempBalance = 0;
        }
      }

      history.push({
        month: m,
        balance: Math.round(tempBalance),
        savings: Math.round(tempSavings),
        debt: Math.round(tempDebt),
        netWorth: Math.round(tempBalance + tempSavings - tempDebt),
        interestEarned: Math.round(monthlyEarned),
        eventText: "Regular compounding month"
      });
    }

    setSimulationData(history);
  };

  const runSimulation = async () => {
    setIsRunning(true);
    setCurrentSimStep(0);
    setSimulationData([]);
    setAiReport(null);
    setAiGrade(null);
    setAiMilestones([]);
    setAiError(null);
    onSimulationRun?.();

    if (simulationMode === "AI") {
      setIsAiLoading(true);
      try {
        const response = await fetch("/api/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            character,
            currentBalance,
            currentSavings,
            currentDebt,
            monthsToProject,
            monthlySavingsInput,
            monthlyDebtRepayment
          })
        });

        if (!response.ok) {
          throw new Error("Failed to load AI response");
        }

        const data = await response.json();
        setSimulationData(data.trajectory || []);
        setAiReport(data.strategicReport || "");
        setAiGrade(data.finalGrade || "");
        setAiMilestones(data.milestones || []);
      } catch (err: any) {
        console.error(err);
        setAiError("AI Projections server is occupied. Running Standard Math Projection instead.");
        runMathSimulation();
      } finally {
        setIsAiLoading(false);
      }
    } else {
      runMathSimulation();
    }
  };

  // Run initial simulation on load and configuration shifts
  useEffect(() => {
    runSimulation();
  }, [monthsToProject, monthlySavingsInput, monthlyDebtRepayment, simulationMode]);

  // Handle animation ticks
  useEffect(() => {
    if (!isRunning) return;
    if (currentSimStep >= simulationData.length - 1) {
      setIsRunning(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentSimStep(prev => prev + 1);
    }, 45);

    return () => clearTimeout(timer);
  }, [isRunning, currentSimStep, simulationData]);

  // Setup SVG chart sizing
  const svgWidth = 600;
  const svgHeight = 250;
  const padding = 40;
  const chartWidth = svgWidth - padding * 2;
  const chartHeight = svgHeight - padding * 2;

  // Active dataset slice for animation
  const activeDataset = isRunning 
    ? simulationData.slice(0, currentSimStep + 1)
    : simulationData;

  const netWorthVals = simulationData.map(d => d.netWorth);
  const maxVal = Math.max(...netWorthVals, 5000);
  const minVal = Math.min(...netWorthVals, -5000);
  const valRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const getCoordinates = (d: any, idx: number) => {
    const x = padding + (idx / (simulationData.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((d.netWorth - minVal) / valRange) * chartHeight;
    return { x, y };
  };

  const points = activeDataset.map((d, idx) => getCoordinates(d, idx));
  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(" ");

  // Final Projected Stats
  const finalState = simulationData[simulationData.length - 1] || { savings: 0, debt: 0, netWorth: 0, interestEarned: 0 };
  const totalProjectedSavings = finalState.savings;
  const totalProjectedDebt = finalState.debt;
  const totalProjectedNetWorth = finalState.netWorth;
  const cumulativeInterest = simulationData.reduce((sum, d) => sum + (d.interestEarned || 0), 0);

  // Grab currently animated point for events display
  const currentPoint = simulationData[currentSimStep] || null;

  return (
    <div className="fixed inset-0 bg-gray-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white border border-gray-150 shadow-2xl rounded-3xl p-6 sm:p-8 max-w-3xl w-full relative my-8"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600 animate-pulse">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-xl font-sans font-bold text-gray-900 flex items-center gap-2">
              The Chrono-Mirror Time-Warp
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                LABYRINTH PORTAL
              </span>
            </h2>
            <p className="text-xs text-gray-500">
              Warp through time to foresee how your custom savings spells and debt repayments compound within the Wealth Labyrinth.
            </p>
          </div>
        </div>

        {/* Simulation Engine Toggle Selector */}
        <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-bounce-slow" />
            <div className="text-left">
              <span className="text-xs font-bold text-slate-900 block leading-tight">Chrono-Mirror Oracle Model</span>
              <span className="text-[10px] text-slate-500">Peer through static maze math or invoke the MaliGo Labyrinth Spirit Oracle.</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
            <button
              onClick={() => setSimulationMode("MATH")}
              className={`py-1.5 px-3 text-[11px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
                simulationMode === "MATH" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              🔮 Static Maze Math
            </button>
            <button
              onClick={() => setSimulationMode("AI")}
              className={`py-1.5 px-3 text-[11px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
                simulationMode === "AI" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              ✨ MaliGo Labyrinth Oracle
            </button>
          </div>
        </div>

        {/* AI Notification Banner */}
        {simulationMode === "AI" && (
          <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl px-4 py-2.5 mb-5 flex items-center gap-2">
            <span className="text-xs">✨</span>
            <span className="text-[10px] text-emerald-800 font-medium">
              The MaliGo Labyrinth Oracle will weave unexpected events (stokvel rewards, device breakdowns, bonuses) into your journey.
            </span>
          </div>
        )}

        {/* Error notification */}
        {aiError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] rounded-xl px-4 py-2 mb-4 font-semibold">
            ⚠️ {aiError}
          </div>
        )}

        {/* Inputs row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          
          {/* Timeline Selector */}
          <div className="bg-gray-50 p-4 border border-gray-100 rounded-2xl text-left">
            <label className="text-[10px] uppercase font-bold text-gray-500 block mb-2 tracking-wide">
              Warp Duration (Months):
            </label>
            <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-xs">
              {[12, 24, 36].map((m) => (
                <button
                  key={m}
                  onClick={() => setMonthsToProject(m)}
                  className={`py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    monthsToProject === m ? "bg-emerald-600 text-white shadow-xs" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {m} Cycles
                </button>
              ))}
            </div>
            <p className="text-[9px] text-gray-400 leading-normal mt-2">
              Cast your trajectory over {monthsToProject} monthly cycles.
            </p>
          </div>

          {/* Monthly Savings Sweeps */}
          <div className="bg-gray-50 p-4 border border-gray-100 rounded-2xl text-left">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 block tracking-wide">
                Automated Shard Deposits:
              </label>
              <span className="text-xs font-mono font-bold text-emerald-600">R{monthlySavingsInput}</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.round(character.baseIncome * 0.40)}
              step="100"
              value={monthlySavingsInput}
              onChange={(e) => setMonthlySavingsInput(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <p className="text-[9px] text-gray-400 leading-normal mt-2.5">
              Multiplies Wealth Shards at <span className="text-emerald-600 font-semibold">{(annualSavingsRate*100).toFixed(0)}% p.a.</span> interest.
            </p>
          </div>

          {/* Monthly Debt Repayment Allocation */}
          <div className="bg-gray-50 p-4 border border-gray-100 rounded-2xl text-left">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] uppercase font-bold text-gray-500 block tracking-wide">
                Extra Debt Shield Spell:
              </label>
              <span className="text-xs font-mono font-bold text-rose-600">R{monthlyDebtRepayment}</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.round(character.baseIncome * 0.30)}
              step="100"
              value={monthlyDebtRepayment}
              onChange={(e) => setMonthlyDebtRepayment(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
            <p className="text-[9px] text-gray-400 leading-normal mt-2.5">
              Suppresses Debt Trap compound growth of <span className="text-rose-600 font-semibold">2.5% p.m.</span>
            </p>
          </div>

        </div>

        {/* Animated Simulation Graph Container */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-5 relative mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Projected Labyrinth Wealth Trajectory
            </span>
            <button
              onClick={runSimulation}
              disabled={isAiLoading}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-[10px] uppercase tracking-wider font-mono px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isRunning || isAiLoading ? "animate-spin" : ""}`} />
              Re-Animate
            </button>
          </div>

          {isAiLoading ? (
            <div className="h-44 flex flex-col items-center justify-center space-y-3.5 text-center">
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full animate-ping absolute" />
                <div className="w-8 h-8 bg-emerald-500 border border-slate-950 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md relative z-10">
                  AI
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">🔮 Peer deep into the Oracle's visions of your future...</p>
                <p className="text-[10px] text-slate-400 mt-1">Weaving unpredictable Labyrinth tests with sacred compounding math</p>
              </div>
            </div>
          ) : simulationData.length > 0 ? (
            <div className="w-full h-auto">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
                {/* Horizontal grid guide lines */}
                <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" />
                <line x1={padding} y1={padding + chartHeight/2} x2={svgWidth - padding} y2={padding + chartHeight/2} stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" />
                <line x1={padding} y1={padding + chartHeight} x2={svgWidth - padding} y2={padding + chartHeight} stroke="#475569" strokeWidth="1" />

                {/* Trajectory Polyline */}
                {points.length > 0 && (
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={polylinePoints}
                  />
                )}

                {/* Shaded Area under trajectory */}
                {points.length > 0 && (
                  <path
                    d={`M ${points[0].x} ${padding + chartHeight} L ${polylinePoints} L ${points[points.length - 1].x} ${padding + chartHeight} Z`}
                    fill="url(#proj-gradient)"
                    opacity="0.15"
                  />
                )}

                {/* Grid nodes */}
                {points.map((p, i) => {
                  if (i % Math.max(1, Math.round(monthsToProject / 4)) !== 0 && i !== 0 && i !== points.length - 1) return null;
                  return (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="3" fill="#10b981" stroke="#0f172a" strokeWidth="1" />
                      <text x={p.x} y={p.y - 7} textAnchor="middle" className="text-[7px] font-mono font-bold fill-slate-300">
                        R{Math.round(simulationData[i]?.netWorth).toLocaleString()}
                      </text>
                    </g>
                  );
                })}

                {/* Axis Labels */}
                <text x={padding} y={padding + chartHeight + 15} className="text-[8px] font-mono fill-slate-500">Month 0</text>
                <text x={padding + chartWidth/2} y={padding + chartHeight + 15} textAnchor="middle" className="text-[8px] font-mono fill-slate-500">M{monthsToProject / 2}</text>
                <text x={svgWidth - padding} y={padding + chartHeight + 15} textAnchor="end" className="text-[8px] font-mono fill-slate-500">Month {monthsToProject}</text>

                {/* Definitions */}
                <defs>
                  <linearGradient id="proj-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-500 text-xs font-mono">
              Summoning oracle calculations...
            </div>
          )}

          {/* Live Event ticker during animation animation */}
          {isRunning && currentPoint && currentPoint.eventText && currentPoint.eventText !== "Regular compounding month" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 bg-emerald-500/15 border border-emerald-500/20 rounded-xl p-2.5 text-center"
            >
              <p className="text-xs text-emerald-400 font-medium leading-relaxed">
                📅 <strong className="font-bold">Month {currentPoint.month}:</strong> {currentPoint.eventText}
              </p>
            </motion.div>
          )}
        </div>

        {/* Future Outcomes Report */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          
          <div className="border border-gray-150 rounded-2xl p-4 bg-white shadow-xs text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Projected Wealth Shards</span>
            <span className="text-xl font-extrabold font-mono text-emerald-600 block">R{Math.round(totalProjectedSavings).toLocaleString()}</span>
            <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1 mt-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Includes R{Math.round(cumulativeInterest).toLocaleString()} in interest blessings!
            </span>
          </div>

          <div className="border border-gray-150 rounded-2xl p-4 bg-white shadow-xs text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Projected Debt Trap</span>
            <span className={`text-xl font-extrabold font-mono block ${totalProjectedDebt > 0 ? "text-rose-600" : "text-emerald-600"}`}>
              R{Math.round(totalProjectedDebt).toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-500 font-medium mt-1 block">
              {totalProjectedDebt === 0 ? "🛡️ Fully Debt Free! Zero Leverage Curse." : "⚠️ High Compound Risk at 2.5% p.m."}
            </span>
          </div>

          <div className="border border-gray-150 rounded-2xl p-4 bg-white shadow-xs text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Final Vault Net Worth</span>
            <span className={`text-xl font-extrabold font-mono block ${totalProjectedNetWorth < 0 ? "text-rose-600" : "text-emerald-600"}`}>
              R{Math.round(totalProjectedNetWorth).toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-500 font-medium mt-1 block font-mono">
              Growth: {(((totalProjectedNetWorth - (currentBalance+currentSavings-currentDebt)) / Math.max(1, Math.abs(currentBalance+currentSavings-currentDebt))) * 100).toFixed(1)}% total
            </span>
          </div>

        </div>

        {/* Gemini AI Projections report */}
        <AnimatePresence>
          {simulationMode === "AI" && !isAiLoading && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 mb-6"
            >
              {/* Strategic Report */}
              {aiReport && (
                <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 sm:p-6 text-left relative overflow-hidden shadow-xl">
                  {/* Subtle radial emerald background glow */}
                  <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />
                  
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4 relative z-10">
                     <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      <h3 className="font-sans font-extrabold text-xs text-slate-100 uppercase tracking-wide">
                        📜 Labyrinth Oracle Scroll of Destiny
                      </h3>
                    </div>
                    {aiGrade && (
                      <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-extrabold px-3 py-0.5 rounded-full border border-emerald-500/20">
                        GUARDIAN RANK: {aiGrade}
                      </span>
                    )}
                  </div>

                  <div className="relative z-10">
                    <CustomMarkdownRenderer text={aiReport} />
                  </div>
                </div>
              )}

              {/* Milestones dynamic timeline */}
              {aiMilestones.length > 0 && (
                <div className="bg-gray-50 border border-gray-150 rounded-3xl p-5 text-left">
                  <h3 className="font-sans font-bold text-xs text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    🎲 Projected Labyrinth Trials & Milestones
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {aiMilestones.map((ms, i) => (
                      <div key={i} className="bg-white border border-gray-200/60 rounded-xl p-3 shadow-xs relative">
                        <span className="absolute top-2.5 right-2.5 text-[8px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          Month {ms.month}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 pr-10">{ms.title}</h4>
                        <p className="text-[10px] text-gray-500 mt-1 leading-normal">{ms.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Projections Insight Callout */}
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-3 items-start mb-6 text-left">
          <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-800 leading-relaxed font-medium">
            🧠 <strong className="font-bold">What this proves</strong>: Compounding curves are exponential! The longer you maintain a stable savings allocation, the faster your net worth spikes. By dodging lifestyle inflation, your surplus works 10x harder for you in real retail-banking products.
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={onClose}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold text-sm py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
        >
          Return to Game Maze
        </button>

      </motion.div>
    </div>
  );
}

// Simple custom markdown renderer to format AI advice without external dependencies
function CustomMarkdownRenderer({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split("\n");

  return (
    <div className="space-y-4 font-sans text-xs sm:text-sm text-slate-300 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // Render H3 titles (###)
        if (trimmed.startsWith("###")) {
          const headingText = trimmed.replace(/^###\s*/, "");
          return (
            <h4 key={idx} className="text-sm font-bold text-white mt-5 border-l-3 border-emerald-500 pl-2">
              {headingText}
            </h4>
          );
        }

        // Render lists (* or -)
        if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
          const listText = trimmed.replace(/^[*|-]\s*/, "");
          return (
            <div key={idx} className="flex gap-2 items-start pl-2">
              <span className="text-emerald-400 font-bold mt-1">•</span>
              <div className="text-slate-300">{parseBoldText(listText)}</div>
            </div>
          );
        }

        // Standard Paragraph
        return <p key={idx} className="text-slate-300">{parseBoldText(trimmed)}</p>;
      })}
    </div>
  );
}

// Helper to support bold text (e.g. **bold**)
function parseBoldText(text: string) {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part);
}
