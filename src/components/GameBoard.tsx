import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FinancialEvent, DecisionOption, Character } from "../types";
import { 
  Home, ShoppingCart, BookOpen, PartyPopper, 
  Bus, Heart, Wifi, Sparkles, Car, Palmtree, 
  Activity, Dumbbell, ShieldAlert, Package, 
  Globe, Users, PiggyBank, TrendingUp, Coins, 
  ChevronRight, Info, Eye, Shield, Coffee, Compass,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, AlertTriangle
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

// Map category icons to lucide React components
const iconMap: { [key: string]: React.ComponentType<any> } = {
  Home, ShoppingCart, BookOpen, PartyPopper, Bus, Heart, Wifi, Sparkles, Car, Palmtree, Activity, Dumbbell, ShieldAlert, Package, Globe, Users, PiggyBank, TrendingUp, Coins
};

// High-quality solvable 10x10 maze layouts
const MAZE_LAYOUTS = [
  [
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 1, 1, 1, 0],
    [0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0, 1, 1, 0, 0, 0]
  ],
  [
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0, 1, 1],
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    [1, 1, 1, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0]
  ],
  [
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    [1, 1, 0, 0, 0, 1, 1, 1, 1, 0]
  ]
];

// Potential hazard cards in the Labyrinth
const HAZARD_TYPES = [
  { text: "Dorm pipe burst / Mobile charger cracked", type: "debt", change: 150 },
  { text: "Predatory store card marketing pressure", type: "stress", change: 8 },
  { text: "Taxi tariff spike / High commute delays", type: "debt", change: 100 },
  { text: "Spilled coffee on textbook / work battery", type: "debt", change: 200 },
  { text: "Urgent family grocery request", type: "debt", change: 150 },
  { text: "Uncapped subscription automatic trial renewal", type: "stress", change: 10 }
];

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
  // Select active layout fixed for this month
  const monthIdHash = event.id.split("_").pop() || "0";
  const layoutIndex = Math.abs(parseInt(monthIdHash, 10) || 0) % MAZE_LAYOUTS.length;
  const layout = MAZE_LAYOUTS[layoutIndex];

  // Game board interactive states
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [chests, setChests] = useState<{ id: number; x: number; y: number; solved: boolean }[]>([]);
  const [collectibles, setCollectibles] = useState<{ id: string; x: number; y: number; type: "coin" | "shard"; amount: number; collected: boolean }[]>([]);
  const [hazards, setHazards] = useState<{ id: string; x: number; y: number; text: string; type: string; change: number; triggered: boolean }[]>([]);
  
  // Power-up active states
  const [shieldsCount, setShieldsCount] = useState<number>(0);
  const [hasVision, setHasVision] = useState<boolean>(false);
  const [activeDilemmaOpen, setActiveDilemmaOpen] = useState<boolean>(false);
  const [lastLog, setLastLog] = useState<string>("Use Arrow keys / WASD or buttons below to explore the Labyrinth!");

  // Initialize/Reset Labyrinth state at the beginning of each new month (stepIndex === 0)
  useEffect(() => {
    if (stepIndex === 0) {
      // Find all empty non-wall tiles excluding starting point (0,0)
      const emptySlots: { x: number; y: number }[] = [];
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          if (layout[r][c] === 0 && !(r === 0 && c === 0)) {
            emptySlots.push({ x: c, y: r });
          }
        }
      }

      // Quick helper to shuffle
      const shuffled = [...emptySlots].sort(() => Math.random() - 0.5);

      // 1. Place dilemma Chests (exactly totalSteps chests)
      const newChests = shuffled.slice(0, totalSteps).map((pos, idx) => ({
        id: idx,
        x: pos.x,
        y: pos.y,
        solved: false
      }));

      // 2. Place Collectibles (Coins and Shards)
      const newCollectibles = shuffled.slice(totalSteps, totalSteps + 5).map((pos, idx) => ({
        id: `coll_${idx}`,
        x: pos.x,
        y: pos.y,
        type: (idx % 2 === 0 ? "coin" : "shard") as "coin" | "shard",
        amount: 50,
        collected: false
      }));

      // 3. Place Hazard traps
      const newHazards = shuffled.slice(totalSteps + 5, totalSteps + 9).map((pos, idx) => {
        const hTemplate = HAZARD_TYPES[idx % HAZARD_TYPES.length];
        return {
          id: `haz_${idx}`,
          x: pos.x,
          y: pos.y,
          text: hTemplate.text,
          type: hTemplate.type,
          change: hTemplate.change,
          triggered: false
        };
      });

      setPlayerPos({ x: 0, y: 0 });
      setChests(newChests);
      setCollectibles(newCollectibles);
      setHazards(newHazards);
      setShieldsCount(0);
      setHasVision(false);
      setActiveDilemmaOpen(false);
      setLastLog(`🗺️ Entered Month #${parseInt(monthIdHash, 10) + 1} Labyrinth. Find and open all 3 scrolls!`);
    } else {
      // If advancing steps, mark the chest at the current player position as solved!
      setChests(prev => 
        prev.map(c => (c.x === playerPos.x && c.y === playerPos.y) ? { ...c, solved: true } : c)
      );
    }
  }, [event.id, stepIndex]);

  // Check collision with chests, coins, or hazards
  const checkCollisions = (x: number, y: number) => {
    // 1. Collectible coins/shards
    const coll = collectibles.find(c => c.x === x && c.y === y && !c.collected);
    if (coll) {
      coll.collected = true;
      setCollectibles([...collectibles]);
      if (coll.type === "coin") {
        onStatsChanged({ balance: coll.amount });
        setLastLog(`💰 Found chest of Coins! +R${coll.amount} Available Coins added.`);
      } else {
        onStatsChanged({ savings: coll.amount });
        setLastLog(`💎 Found glowing Wealth Shard! +R${coll.amount} Savings compounded.`);
      }
    }

    // 2. Hazards/traps
    const haz = hazards.find(h => h.x === x && h.y === y && !h.triggered);
    if (haz) {
      haz.triggered = true;
      setHazards([...hazards]);
      if (shieldsCount > 0) {
        setShieldsCount(prev => prev - 1);
        setLastLog(`🛡️ Debt Shield Spell absorbed the trap: "${haz.text}"! Saved!`);
      } else {
        if (haz.type === "debt") {
          onStatsChanged({ balance: -haz.change });
          setLastLog(`⚠️ Trap Triggered! "${haz.text}" (-R${haz.change} Coins)`);
        } else {
          onStatsChanged({ stress: haz.change });
          setLastLog(`⚠️ Trap Triggered! "${haz.text}" (+${haz.change}% Stress)`);
        }
      }
    }

    // 3. Dilemma chests
    const chest = chests.find(c => c.x === x && c.y === y && !c.solved);
    if (chest) {
      setActiveDilemmaOpen(true);
    }
  };

  // Move function
  const handleMove = (dx: number, dy: number) => {
    if (activeDilemmaOpen) return; // ignore move when dilemma choice is active

    const nextX = playerPos.x + dx;
    const nextY = playerPos.y + dy;

    // Check boundaries
    if (nextX < 0 || nextX >= 10 || nextY < 0 || nextY >= 10) return;

    // Check walls
    if (layout[nextY][nextX] === 1) {
      setLastLog("💥 Ouch! You bumped into a Labyrinth Wall.");
      return;
    }

    setPlayerPos({ x: nextX, y: nextY });
    checkCollisions(nextX, nextY);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "arrowup" || key === "w") {
        e.preventDefault();
        handleMove(0, -1);
      } else if (key === "arrowdown" || key === "s") {
        e.preventDefault();
        handleMove(0, 1);
      } else if (key === "arrowleft" || key === "a") {
        e.preventDefault();
        handleMove(-1, 0);
      } else if (key === "arrowright" || key === "d") {
        e.preventDefault();
        handleMove(1, 0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerPos, activeDilemmaOpen, chests, collectibles, hazards, shieldsCount]);

  // Magic Potion Shops
  const buyVisionPotion = () => {
    if (balance < 60) {
      setLastLog("❌ Not enough Coins to buy Vision Potion! (Requires R60)");
      return;
    }
    onStatsChanged({ balance: -60 });
    setHasVision(true);
    setLastLog("🔮 Drank Vision Potion! All hidden traps revealed on your path.");
  };

  const buyDebtShield = () => {
    if (balance < 100) {
      setLastLog("❌ Not enough Coins to buy Debt Shield spell! (Requires R100)");
      return;
    }
    onStatsChanged({ balance: -100 });
    setShieldsCount(prev => prev + 1);
    setLastLog("🛡️ Shield Spell active! The next hazard trap you hit will be absorbed.");
  };

  const buyStressRelief = () => {
    if (balance < 80) {
      setLastLog("❌ Not enough Coins to buy Stress Relief herbs! (Requires R80)");
      return;
    }
    if (stress === 0) {
      setLastLog("🧘 Your Meerkat is already perfectly calm!");
      return;
    }
    onStatsChanged({ balance: -80, stress: -20 });
    setLastLog("🌿 Consumed soothing herbs. Stress decreased by 20%!");
  };

  // Dilemma Selection Wrapper
  const handleOptionClick = (option: DecisionOption) => {
    setActiveDilemmaOpen(false);
    onChoiceSelected(option);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4" id="labyrinth-game">
      
      {/* Visual Game Screen Grid and Sidebar Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SIDEBAR: Labyrinth Legend, Controls, and Magic Potion Shop */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Labyrinth status and lore */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-4 shadow-md">
            <h3 className="text-sm font-bold font-sans text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
              <Compass className="w-4 h-4" />
              Labyrinth Navigator
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              Guide your Meerkat <span className="text-slate-100 font-bold">{character.name}</span> through the visual Wealth Labyrinth. Walk into the golden Challenge Scrolls to make critical choices!
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/60">
                <span className="text-xs text-slate-500 uppercase font-mono leading-none block">Shields</span>
                <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5 block flex items-center justify-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  {shieldsCount}
                </span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/60">
                <span className="text-xs text-slate-500 uppercase font-mono leading-none block">Vision</span>
                <span className="text-sm font-bold font-mono text-indigo-400 mt-0.5 block">
                  {hasVision ? "ACTIVE" : "OFF"}
                </span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/60">
                <span className="text-xs text-slate-500 uppercase font-mono leading-none block">Lives</span>
                <span className="text-sm font-bold font-mono text-rose-500 mt-0.5 block">
                  ❤️{lives}
                </span>
              </div>
            </div>
          </div>

          {/* Labyrinth Magic Shop */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-4 shadow-md">
            <h3 className="text-sm font-bold font-sans text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Labyrinth Spell Shop
            </h3>
            
            <div className="space-y-2.5">
              <button
                onClick={buyVisionPotion}
                className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/55 p-2 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-500/20">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-slate-200">Vision Potion</span>
                    <span className="text-[10px] text-slate-500 leading-none">Reveals hidden trap locations</span>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono bg-indigo-950 text-indigo-300 border border-indigo-800/80 px-2 py-0.5 rounded">
                  R60
                </span>
              </button>

              <button
                onClick={buyDebtShield}
                className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/55 p-2 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:bg-emerald-500/20">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-slate-200">Debt Shield Spell</span>
                    <span className="text-[10px] text-slate-500 leading-none">Absorbs the next hazard/trap hit</span>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2 py-0.5 rounded">
                  R100
                </span>
              </button>

              <button
                onClick={buyStressRelief}
                className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/55 p-2 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg group-hover:bg-amber-500/20">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-slate-200">Stress-Away Herbs</span>
                    <span className="text-[10px] text-slate-500 leading-none">Reduces stress levels by -20%</span>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono bg-amber-950 text-amber-300 border border-amber-800/80 px-2 py-0.5 rounded">
                  R80
                </span>
              </button>
            </div>
          </div>

          {/* Map legend description */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-4 shadow-sm text-xs space-y-2">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">Legend</span>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🦦</span>
                <span>Your Meerkat</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">📜</span>
                <span>Dilemma Scroll</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">💰</span>
                <span>Coin (+R50)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">💎</span>
                <span>Shard (+R50)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg text-rose-500">⚠️</span>
                <span>Hazard Trap</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">✅</span>
                <span>Solved Scroll</span>
              </div>
            </div>
          </div>

        </div>

        {/* CENTER: The Visual 2D Labyrinth Grid & Live Action logs */}
        <div className="lg:col-span-8 flex flex-col items-center">
          
          {/* Active Logs Banner */}
          <div className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs py-2 px-4 rounded-xl font-mono mb-4 text-center select-none flex items-center justify-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>{lastLog}</span>
          </div>

          {/* Visual 2D grid canvas container */}
          <div className="bg-slate-950 border-2 border-emerald-500/40 rounded-2xl p-4 shadow-[0_0_15px_rgba(16,185,129,0.15)] relative overflow-hidden select-none">
            
            {/* The actual 10x10 tile matrix map */}
            <div className="grid grid-cols-10 gap-1 sm:gap-1.5 max-w-lg mx-auto">
              {layout.map((row, rIdx) => 
                row.map((cell, cIdx) => {
                  const isWall = cell === 1;
                  const isPlayer = playerPos.x === cIdx && playerPos.y === rIdx;
                  
                  // Locate items
                  const activeChest = chests.find(c => c.x === cIdx && c.y === rIdx);
                  const activeColl = collectibles.find(c => c.x === cIdx && c.y === rIdx && !c.collected);
                  const activeHaz = hazards.find(h => h.x === cIdx && h.y === rIdx && !h.triggered);

                  let cellColor = "bg-slate-900 border-slate-800/40 hover:bg-slate-850";
                  if (isWall) {
                    cellColor = "bg-slate-800 border-slate-700/80 shadow-inner";
                  }

                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => {
                        // Click to move to adjacent slots
                        const dx = cIdx - playerPos.x;
                        const dy = rIdx - playerPos.y;
                        if (Math.abs(dx) + Math.abs(dy) === 1) {
                          handleMove(dx, dy);
                        }
                      }}
                      className={`relative aspect-square w-7 h-7 sm:w-11 sm:h-11 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${cellColor}`}
                    >
                      {/* Grid walls visual overlay border */}
                      {isWall && (
                        <div className="absolute inset-1 rounded bg-slate-900/60 border border-emerald-500/20" />
                      )}

                      {/* Display Items */}
                      {!isWall && !isPlayer && (
                        <>
                          {/* Chest dilemma scroll */}
                          {activeChest && (
                            <motion.span
                              animate={{ scale: activeChest.solved ? 1 : [1, 1.15, 1], y: activeChest.solved ? 0 : [0, -3, 0] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="text-base sm:text-xl filter drop-shadow-sm"
                            >
                              {activeChest.solved ? "✅" : "📜"}
                            </motion.span>
                          )}

                          {/* Collectible Coin or Shards */}
                          {activeColl && (
                            <motion.span
                              animate={{ scale: [0.9, 1.1, 0.9], rotate: [0, 10, -10, 0] }}
                              transition={{ repeat: Infinity, duration: 2.5 }}
                              className="text-base sm:text-xl"
                            >
                              {activeColl.type === "coin" ? "💰" : "💎"}
                            </motion.span>
                          )}

                          {/* Triggerable hazards */}
                          {activeHaz && (hasVision || activeHaz.triggered) && (
                            <span className="text-base sm:text-xl text-rose-500 font-bold">
                              ⚠️
                            </span>
                          )}
                        </>
                      )}

                      {/* Animated Player Meerkat */}
                      {isPlayer && (
                        <motion.div
                          layoutId="meerkat-player"
                          className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl z-10 filter drop-shadow-md"
                        >
                          {character.avatar}
                        </motion.div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Neon Green overlay laser glow grids */}
            <div className="absolute inset-0 border border-emerald-500/10 pointer-events-none" />
          </div>

          {/* Tactical tactile On-screen D-Pad arrow controls (for Touch/Mobile) */}
          <div className="mt-5 flex flex-col items-center gap-1 sm:hidden">
            <button
              onClick={() => handleMove(0, -1)}
              className="p-3 bg-slate-900 text-slate-100 hover:bg-slate-800 active:bg-slate-950 border border-slate-700 rounded-2xl cursor-pointer"
            >
              <ArrowUp className="w-5 h-5 text-emerald-400" />
            </button>
            <div className="flex gap-4">
              <button
                onClick={() => handleMove(-1, 0)}
                className="p-3 bg-slate-900 text-slate-100 hover:bg-slate-800 active:bg-slate-950 border border-slate-700 rounded-2xl cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-emerald-400" />
              </button>
              <button
                onClick={() => handleMove(1, 0)}
                className="p-3 bg-slate-900 text-slate-100 hover:bg-slate-800 active:bg-slate-950 border border-slate-700 rounded-2xl cursor-pointer"
              >
                <ArrowRight className="w-5 h-5 text-emerald-400" />
              </button>
            </div>
            <button
              onClick={() => handleMove(0, 1)}
              className="p-3 bg-slate-900 text-slate-100 hover:bg-slate-800 active:bg-slate-950 border border-slate-700 rounded-2xl cursor-pointer"
            >
              <ArrowDown className="w-5 h-5 text-emerald-400" />
            </button>
          </div>

          {/* Desktop tactile helper arrows panel */}
          <div className="hidden sm:flex items-center gap-1.5 mt-4 text-[10px] text-slate-400 font-mono">
            <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">W / ⬆️</span>
            <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">A / ⬅️</span>
            <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">S / ⬇️</span>
            <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">D / ➡️</span>
            <span>to move. Click nearby cells to glide.</span>
          </div>

        </div>

      </div>

      {/* OVERLAY DILEMMA MODAL: Triggers when the Meerkat steps on a Chest */}
      <AnimatePresence>
        {activeDilemmaOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="bg-white border border-gray-200 rounded-3xl max-w-xl w-full shadow-2xl p-6 sm:p-8 overflow-hidden relative"
            >
              {/* Category tag header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-100">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="capitalize">{event.category} challenge</span>
                </span>
                <span className="text-xs text-gray-400 font-mono uppercase">
                  Node {stepIndex + 1} of {totalSteps}
                </span>
              </div>

              {/* Dilemma Text and Narrative Description */}
              <h2 className="text-lg sm:text-xl font-sans font-extrabold text-gray-950 mb-2 leading-tight">
                {event.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                {event.description}
              </p>

              {/* Choices list */}
              <div className="space-y-3.5">
                {event.options.map((option, idx) => {
                  const balanceAfter = balance + option.balanceChange;
                  const savingsAfter = savings + option.savingsChange;
                  const triggersDebt = balanceAfter < 0 && (balanceAfter + savingsAfter) < 0;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(option)}
                      className="w-full text-left bg-gray-50/50 hover:bg-emerald-50/10 border border-gray-200 hover:border-emerald-500 rounded-2xl p-4 transition-all block cursor-pointer group relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-sans font-extrabold text-xs sm:text-sm text-gray-950 group-hover:text-emerald-700 transition-colors">
                              {option.text}
                            </span>
                            {triggersDebt && (
                              <span className="text-[8px] uppercase font-mono tracking-wider bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded border border-rose-200">
                                Triggers Debt Trap
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 leading-normal mb-2.5">
                            {option.description}
                          </p>

                          {/* Impacts badge row */}
                          <div className="flex flex-wrap gap-1.5">
                            {option.balanceChange !== 0 && (
                              <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${
                                option.balanceChange > 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                              }`}>
                                {option.balanceChange > 0 ? `+R${option.balanceChange}` : `-R${Math.abs(option.balanceChange)}`} Coins
                              </span>
                            )}
                            {option.savingsChange !== 0 && (
                              <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${
                                option.savingsChange > 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                              }`}>
                                {option.savingsChange > 0 ? `+R${option.savingsChange}` : `-R${Math.abs(option.savingsChange)}`} Shards
                              </span>
                            )}
                            {option.debtChange !== 0 && (
                              <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${
                                option.debtChange < 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                              }`}>
                                {option.debtChange > 0 ? `+R${option.debtChange} Curse` : `-R${Math.abs(option.debtChange)} Curse`}
                              </span>
                            )}
                            {option.stressChange !== 0 && (
                              <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${
                                option.stressChange < 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                              }`}>
                                {option.stressChange > 0 ? `+${option.stressChange}% Stress` : `${option.stressChange}% Stress`}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 flex-shrink-0 mt-0.5 transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Tip / Education Footer */}
              {event.options.some(o => o.longTermBenefit) && (
                <div className="mt-5 p-3 bg-blue-50/40 border border-blue-100 rounded-2xl flex gap-2 items-start">
                  <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-800 leading-normal font-medium">
                    Note: Investing in compound savings shields or paying down debt early creates robust financial protection for future cycles!
                  </p>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
