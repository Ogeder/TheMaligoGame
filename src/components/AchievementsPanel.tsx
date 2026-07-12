import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserStats, Achievement, ACHIEVEMENTS_LIST, getStatForAchievement } from "../data/achievements";
import { Trophy, X, Award, Sparkles, Check, Flame, Heart, RefreshCw } from "lucide-react";

interface AchievementsPanelProps {
  userStats: UserStats;
  onClose: () => void;
  newlyUnlockedIds: string[];
  onClearNewStatus: (id: string) => void;
  onResetStats?: () => void;
}

export default function AchievementsPanel({
  userStats,
  onClose,
  newlyUnlockedIds,
  onClearNewStatus,
  onResetStats
}: AchievementsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Categories list
  const categories = [
    { id: "all", label: "All Badges" },
    { id: "completed", label: "Completed" },
    { id: "in_progress", label: "In Progress" },
    { id: "wealth", label: "Wealth & Savings" },
    { id: "games", label: "Games & Mastery" }
  ];

  // Helper to check progress
  const getProgressInfo = (achievement: Achievement) => {
    const current = getStatForAchievement(achievement.id, userStats);
    const target = achievement.target;
    const percent = Math.min(100, Math.round((current / target) * 100));
    const isCompleted = current >= target;
    return { current, target, percent, isCompleted };
  };

  // Filtered achievements
  const filteredAchievements = ACHIEVEMENTS_LIST.filter(ach => {
    const { isCompleted } = getProgressInfo(ach);
    if (selectedCategory === "all") return true;
    if (selectedCategory === "completed") return isCompleted;
    if (selectedCategory === "in_progress") return !isCompleted;
    if (selectedCategory === "wealth") return ach.category === "wealth" || ach.category === "savings" || ach.category === "debt";
    if (selectedCategory === "games") return ach.category === "games" || ach.category === "mastery" || ach.category === "stress";
    return true;
  });

  // Overall calculations
  const totalAchievements = ACHIEVEMENTS_LIST.length;
  const completedCount = ACHIEVEMENTS_LIST.filter(ach => getProgressInfo(ach).isCompleted).length;
  const overallPercent = Math.round((completedCount / totalAchievements) * 100);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl text-slate-100 shadow-2xl overflow-hidden my-8"
        id="achievements-modal-content"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between sticky top-0 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-sans font-black tracking-tight text-white flex items-center gap-2">
                MaliGo Achievements
              </h2>
              <p className="text-xs text-slate-400 font-medium">Complete financial milestones & conquer the Savannah</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 rounded-full transition-all cursor-pointer"
            id="close-achievements-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Progress Bar Card */}
        <div className="px-6 py-5 bg-linear-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-grow">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Savannah Medal Tracker
                </span>
                <span className="text-xs font-mono font-extrabold text-emerald-400">{completedCount} / {totalAchievements} Unlocked ({overallPercent}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700/50">
                <motion.div
                  className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
            {onResetStats && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to reset your achievements and game statistics? This cannot be undone.")) {
                    onResetStats();
                  }
                }}
                className="self-end md:self-center px-3 py-1.5 border border-slate-800 hover:border-rose-900/50 hover:bg-rose-950/20 text-[10px] uppercase font-mono tracking-wider text-slate-400 hover:text-rose-400 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                title="Reset Statistics"
              >
                <RefreshCw className="w-3 h-3" /> Reset Stats
              </button>
            )}
          </div>
        </div>

        {/* Tabs Filter Bar */}
        <div className="px-6 pt-4 pb-2 flex gap-1.5 overflow-x-auto scrollbar-none border-b border-slate-800/30 bg-slate-900/30">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold font-sans transition-all cursor-pointer flex-shrink-0 whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-emerald-600 text-white shadow-md border border-emerald-500/30"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Body Grid of Badges */}
        <div className="p-6 overflow-y-auto max-h-[440px] bg-slate-900/50" id="achievements-scroll-area">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-3 gap-y-7 justify-items-center">
            {filteredAchievements.map((ach) => {
              const { current, target, percent, isCompleted } = getProgressInfo(ach);
              const isNewlyUnlocked = newlyUnlockedIds.includes(ach.id);

              return (
                <motion.div
                  key={ach.id}
                  layoutId={`ach-card-${ach.id}`}
                  onClick={() => {
                    setSelectedAchievement(ach);
                    if (isNewlyUnlocked) {
                      onClearNewStatus(ach.id);
                    }
                  }}
                  whileHover={{ scale: 1.04 }}
                  className="relative flex flex-col items-center text-center cursor-pointer group select-none"
                >
                  {/* Newly unlocked 'NEW' badge */}
                  {isNewlyUnlocked && (
                    <span className="absolute -top-1.5 z-20 bg-rose-500 text-white font-mono font-extrabold text-[8px] tracking-widest px-1.5 py-0.5 rounded-full border border-slate-900 animate-bounce shadow-md">
                      NEW
                    </span>
                  )}

                  {/* Badge Outer Shield Layer */}
                  <div className="relative">
                    {/* Golden/Silver Border Medal Effect */}
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center relative p-1.5 transition-all duration-300 ${
                        isCompleted
                          ? "bg-slate-950 border-[3.5px] border-amber-400 ring-4 ring-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.25)]"
                          : "bg-slate-950/90 border-[3px] border-slate-700/60 opacity-65 grayscale-40"
                      }`}
                    >
                      {/* Inner Circle Gradient Backing */}
                      <div
                        className={`w-full h-full rounded-full bg-gradient-to-b ${ach.iconGradient} flex items-center justify-center relative overflow-hidden`}
                      >
                        {/* Shimmer overlay for completed badges */}
                        {isCompleted && (
                          <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/20 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                        )}

                        {/* Centered Emoji Icon */}
                        <span className={`text-3.5xl drop-shadow-md select-none transform transition-transform duration-300 group-hover:scale-110 ${isCompleted ? "" : "opacity-75"}`}>
                          {ach.iconEmoji}
                        </span>

                        {/* Little shiny sparkles for completed badges */}
                        {isCompleted && (
                          <Sparkles className="absolute w-3 h-3 text-white top-1 right-1 animate-pulse" />
                        )}
                      </div>

                      {/* Milestone Number Label on top of badge */}
                      <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 z-10">
                        <div
                          className={`px-2 py-0.5 rounded-full text-[9px] font-sans font-extrabold shadow-sm border whitespace-nowrap ${
                            isCompleted
                              ? "bg-amber-400 text-slate-950 border-amber-300 font-black"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {ach.milestoneNumber.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badge Text */}
                  <div className="mt-4 flex flex-col items-center">
                    <span className={`text-xs font-extrabold font-sans leading-tight transition-colors ${isCompleted ? "text-slate-100 font-bold" : "text-slate-500"}`}>
                      {ach.title}
                    </span>
                    
                    {/* Progress textual indicator */}
                    <div className="mt-1">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full tracking-wide ${
                        isCompleted
                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-900/50"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {percent}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 font-sans font-medium text-sm">No badges match your filter.</p>
              <button
                onClick={() => setSelectedCategory("all")}
                className="mt-2 text-xs font-bold text-emerald-400 underline hover:text-emerald-300 cursor-pointer"
              >
                Show All Badges
              </button>
            </div>
          )}
        </div>

        {/* Selected Badge Detailed Preview Overlay Drawer */}
        <AnimatePresence>
          {selectedAchievement && (() => {
            const { current, target, percent, isCompleted } = getProgressInfo(selectedAchievement);
            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="p-5 border-t border-slate-800 bg-slate-950 relative"
              >
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs bg-slate-900 hover:bg-slate-850 p-1 rounded-full cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="flex gap-4 items-center">
                  <div className={`w-14 h-14 rounded-full flex-shrink-0 bg-gradient-to-b ${selectedAchievement.iconGradient} flex items-center justify-center text-2xl border-2 border-slate-800 shadow-md`}>
                    {selectedAchievement.iconEmoji}
                  </div>
                  <div className="flex-grow pr-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-sans font-black text-white">{selectedAchievement.title}</h4>
                      {isCompleted ? (
                        <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-mono uppercase font-black px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Unlocked
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-400 text-[8px] font-mono uppercase font-bold px-1.5 py-0.5 rounded border border-slate-700">
                          Locked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium">
                      {selectedAchievement.description}
                    </p>
                    
                    {/* Detailed Progress Bar */}
                    <div className="mt-2.5">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mb-1">
                        <span>Labyrinth Value: <span className="text-slate-300 font-bold">R{Math.round(current).toLocaleString()}</span></span>
                        <span>Milestone: <span className="text-slate-300 font-bold">R{target.toLocaleString()}</span></span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCompleted ? "bg-emerald-500" : "bg-indigo-500"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs rounded-xl cursor-pointer shadow-md transition-colors"
          >
            Back to Simulation
          </button>
        </div>
      </motion.div>
    </div>
  );
}
