import React from "react";
import { motion } from "motion/react";
import { Character, MonthRecord } from "../types";
import { TrendingUp, Flame, ShieldAlert, Sparkles, Receipt, ChevronRight, HelpCircle } from "lucide-react";

interface MonthlyReviewProps {
  character: Character;
  monthIndex: number;
  monthRecord: MonthRecord;
  interestEarned: number;
  interestAccrued: number;
  aiFeedback: string | null;
  isAILoading: boolean;
  onNextMonth: () => void;
  isYearEnd: boolean;
}

// Simple custom markdown renderer to format AI advice without external dependencies
function CustomMarkdownRenderer({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split("\n");
  let listMode = false;

  return (
    <div className="space-y-4 font-sans text-sm text-gray-700 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // Render H3 titles (###)
        if (trimmed.startsWith("###")) {
          listMode = false;
          const headingText = trimmed.replace(/^###\s*/, "");
          return (
            <h4 key={idx} className="text-base font-bold text-gray-900 mt-5 border-l-3 border-emerald-500 pl-2">
              {headingText}
            </h4>
          );
        }

        // Render lists (* or -)
        if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
          listMode = true;
          const listText = trimmed.replace(/^[*|-]\s*/, "");
          return (
            <div key={idx} className="flex gap-2 items-start pl-2">
              <span className="text-emerald-500 font-bold mt-1">•</span>
              <div>{parseBoldText(listText)}</div>
            </div>
          );
        }

        // Standard Paragraph
        listMode = false;
        return <p key={idx}>{parseBoldText(trimmed)}</p>;
      })}
    </div>
  );
}

// Helper to support bold text (e.g. **bold**)
function parseBoldText(text: string) {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-gray-900 font-semibold">{part}</strong> : part);
}

export default function MonthlyReview({
  character,
  monthIndex,
  monthRecord,
  interestEarned,
  interestAccrued,
  aiFeedback,
  isAILoading,
  onNextMonth,
  isYearEnd
}: MonthlyReviewProps) {
  
  const netSaved = monthRecord.saved;
  const currentNetWorth = monthRecord.endBalance + monthRecord.endSavings - monthRecord.endDebt;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4" id="monthly-review">
      
      {/* Celebration Header */}
      <div className="text-center mb-8">
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl inline-block mb-2"
        >
          🏆
        </motion.span>
        <h2 className="text-2xl sm:text-3xl font-sans font-bold text-gray-900">
          Month {monthIndex + 1} Cleared!
        </h2>
        <p className="text-sm text-gray-500">
          Ledger and wealth compounding statement for {monthRecord.monthName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Financial Summary Ledger */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-1.5 border-b border-gray-100 pb-2">
              <Receipt className="w-4 h-4" />
              Monthly Bank Statement
            </h3>

            {/* Income & Savings Swept Ledger */}
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>Monthly Income (In):</span>
                <span className="font-mono font-semibold text-emerald-600">+R{monthRecord.income.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Expenses & Decisions (Out):</span>
                <span className="font-mono font-semibold text-rose-600">-R{monthRecord.expenses.toLocaleString()}</span>
              </div>

              <div className="border-t border-gray-100 my-2 pt-2" />

              <div className="flex justify-between items-center text-gray-600">
                <span>Sweeped into Savings:</span>
                <span className="font-mono font-semibold text-emerald-600">R{netSaved.toLocaleString()}</span>
              </div>

              {/* Compounding Interest Details */}
              {interestEarned > 0 && (
                <div className="flex justify-between items-center text-emerald-700 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50">
                  <span className="flex items-center gap-1 text-xs">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Savings Compound Interest:
                  </span>
                  <span className="font-mono font-bold text-xs">+R{interestEarned.toFixed(2)}</span>
                </div>
              )}

              {interestAccrued > 0 && (
                <div className="flex justify-between items-center text-rose-700 bg-rose-50/50 p-2 rounded-lg border border-rose-100/50">
                  <span className="flex items-center gap-1 text-xs">
                    <Flame className="w-3.5 h-3.5" />
                    Debt Accrued Interest (2.5%):
                  </span>
                  <span className="font-mono font-bold text-xs">-R{interestAccrued.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-gray-150 my-2 pt-2" />

              {/* End Balances */}
              <div className="flex justify-between items-center font-bold text-gray-900 pt-1">
                <span>Closing Cash Balance:</span>
                <span className="font-mono">R{monthRecord.endBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-emerald-700">
                <span>Closing Savings Buffer:</span>
                <span className="font-mono">R{monthRecord.endSavings.toLocaleString()}</span>
              </div>
              {monthRecord.endDebt > 0 && (
                <div className="flex justify-between items-center font-bold text-rose-600">
                  <span>Closing Debt Owed:</span>
                  <span className="font-mono">R{monthRecord.endDebt.toLocaleString()}</span>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mt-4 text-center">
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Month-End Net Worth</span>
                <span className={`text-xl font-extrabold font-mono ${currentNetWorth < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  R{currentNetWorth.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Month Choice Footprint */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Decision Footprint</h3>
            <div className="space-y-3">
              {monthRecord.choicesMade.map((choice, i) => (
                <div key={i} className="text-xs border-l-2 border-gray-200 pl-3 py-1">
                  <div className="font-semibold text-gray-800">{choice.eventTitle}</div>
                  <div className="text-gray-500 mt-0.5">Selected: <span className="text-gray-900 font-medium">{choice.choiceText}</span></div>
                  <div className="text-[10px] font-mono text-gray-400 mt-0.5">{choice.financialImpact}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MaliGo AI Financial Coach (Gemini) */}
        <div className="flex flex-col h-full">
          <div className="bg-radial from-slate-900 to-gray-950 text-white border border-slate-800 rounded-2xl p-6 sm:p-8 flex-1 flex flex-col justify-between shadow-md relative overflow-hidden min-h-[400px]">
            {/* Ambient Background Glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
            
            <div>
              {/* AI Coach Title */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg">
                    <Sparkles className="w-4 h-4 animate-spin-slow" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold font-sans tracking-wide">MaliGo Financial Coach</h3>
                    <p className="text-[10px] text-emerald-400 font-mono">MaliGo AI Wealth Advisor</p>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                  LIVE FEEDBACK
                </span>
              </div>

              {/* Feedback Content Area */}
              <div className="relative z-10">
                {isAILoading ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                    {/* Glowing pulse loader */}
                    <div className="relative flex items-center justify-center">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-full animate-ping absolute" />
                      <div className="w-8 h-8 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                        AI
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200">MaliGo Coach is analyzing your balance sheets...</p>
                      <p className="text-xs text-slate-400">Synthesizing real-world wealth strategies</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-200">
                    {aiFeedback ? (
                      <CustomMarkdownRenderer text={aiFeedback} />
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                        <HelpCircle className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                        <p className="text-xs">Coach is resting. Click next to continue.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Progress Actions */}
            <div className="mt-8 relative z-10">
              <button
                onClick={onNextMonth}
                disabled={isAILoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white border border-emerald-600 hover:border-emerald-500 rounded-xl py-3.5 text-sm font-bold font-sans transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                {isYearEnd ? "Proceed to Annual Net Worth Report" : "Unlock Next Month / Chapter"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
