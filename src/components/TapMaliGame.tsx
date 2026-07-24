import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Character } from "../types";
import { 
  ArrowLeft, Volume2, VolumeX, Play, RotateCcw, Trophy, 
  Coins, PiggyBank, Sparkles, ChevronRight, Zap, ShieldAlert
} from "lucide-react";

interface TapMaliGameProps {
  character: Character;
  onGameRewardsGranted: (rewards: { coinsEarned: number; shardsEarned: number; stressRelieved: number }) => void;
  onBack: () => void;
}

interface MoleHole {
  id: number;
  active: boolean;
  type: "MALI_MEERKAT" | "STOKVEL_FRIEND" | "SAVINGS_OWL" | "DEBT_SHARK";
  points: number;
  cashReward: number;
  savingsReward: number;
  emoji: string;
  name: string;
  timer: number;
}

export default function TapMaliGame({
  character,
  onGameRewardsGranted,
  onBack
}: TapMaliGameProps) {
  // Audio Context
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const playTone = (freq: number, type: OscillatorType, duration: number, vol = 0.15) => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // silent
    }
  };

  const playPopSound = () => playTone(600, "sine", 0.08, 0.2);
  const playHitFriendSound = () => {
    playTone(880, "sine", 0.08, 0.2);
    setTimeout(() => playTone(1100, "triangle", 0.1, 0.25), 50);
  };
  const playHitSharkSound = () => playTone(140, "sawtooth", 0.25, 0.3);

  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [savingsEarned, setSavingsEarned] = useState(0);
  const [combo, setCombo] = useState(1);

  // 9 Burrow Holes Grid
  const [holes, setHoles] = useState<MoleHole[]>(
    Array.from({ length: 9 }, (_, i) => ({
      id: i,
      active: false,
      type: "MALI_MEERKAT",
      points: 100,
      cashReward: 30,
      savingsReward: 10,
      emoji: "🦦",
      name: "Mali Meerkat",
      timer: 0
    }))
  );

  const startGame = () => {
    setScore(0);
    setCoinsEarned(0);
    setSavingsEarned(0);
    setTimeLeft(30);
    setCombo(1);
    setGameState("PLAYING");
  };

  // Main Pop Timer loop
  useEffect(() => {
    if (gameState !== "PLAYING") return;

    const gameTimer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(gameTimer);
          setGameState("GAMEOVER");
          onGameRewardsGranted({
            coinsEarned: Math.max(0, coinsEarned),
            shardsEarned: Math.max(0, savingsEarned),
            stressRelieved: Math.min(25, Math.floor(score / 150))
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(gameTimer);
  }, [gameState, score, coinsEarned, savingsEarned]);

  // Spawning friends / sharks loop
  useEffect(() => {
    if (gameState !== "PLAYING") return;

    const spawnInterval = setInterval(() => {
      setHoles(prevHoles => {
        // Deactivate expired holes
        const now = Date.now();
        const updated = prevHoles.map(h => {
          if (h.active && now > h.timer) {
            return { ...h, active: false };
          }
          return h;
        });

        // Choose a random inactive hole to spawn
        const inactiveIndices = updated.map((h, i) => (!h.active ? i : -1)).filter(i => i !== -1);
        if (inactiveIndices.length > 0) {
          const randomIndex = inactiveIndices[Math.floor(Math.random() * inactiveIndices.length)];
          const rand = Math.random();

          let type: MoleHole["type"] = "MALI_MEERKAT";
          let points = 100;
          let cashReward = 35;
          let savingsReward = 15;
          let emoji = "🦦";
          let name = "Mali Meerkat";

          if (rand < 0.3) {
            type = "STOKVEL_FRIEND";
            points = 250;
            cashReward = 75;
            savingsReward = 50;
            emoji = "🦊";
            name = "Stokvel Fox";
          } else if (rand < 0.5) {
            type = "SAVINGS_OWL";
            points = 200;
            cashReward = 20;
            savingsReward = 80;
            emoji = "🦉";
            name = "Wise Owl";
          } else if (rand < 0.75) {
            type = "DEBT_SHARK";
            points = -150;
            cashReward = -50;
            savingsReward = 0;
            emoji = "🦈";
            name = "Debt Shark!";
          }

          playPopSound();

          updated[randomIndex] = {
            ...updated[randomIndex],
            active: true,
            type,
            points,
            cashReward,
            savingsReward,
            emoji,
            name,
            timer: now + 1200 - Math.min(600, (30 - timeLeft) * 15) // speeds up as time passes
          };
        }

        return updated;
      });
    }, 600);

    return () => clearInterval(spawnInterval);
  }, [gameState, timeLeft]);

  const handleTapHole = (index: number) => {
    if (gameState !== "PLAYING") return;

    setHoles(prevHoles => {
      const hole = prevHoles[index];
      if (!hole.active) return prevHoles;

      if (hole.type === "DEBT_SHARK") {
        playHitSharkSound();
        setCombo(1);
        setScore(s => Math.max(0, s + hole.points));
        setCoinsEarned(c => Math.max(0, c + hole.cashReward));
      } else {
        playHitFriendSound();
        setCombo(c => Math.min(5, c + 1));
        const gainedScore = hole.points * combo;
        const gainedCash = hole.cashReward * combo;
        const gainedSavings = hole.savingsReward * combo;

        setScore(s => s + gainedScore);
        setCoinsEarned(c => c + gainedCash);
        setSavingsEarned(s => s + gainedSavings);
      }

      // Deactivate immediately upon tap
      const next = [...prevHoles];
      next[index] = { ...hole, active: false };
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center relative">
        
        {/* Top Header */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Exit Arcade
          </button>

          <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-300 flex items-center gap-1.5">
            🦦 Tap Mali & Savers Friends
          </span>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Live HUD */}
        {gameState === "PLAYING" && (
          <div className="w-full grid grid-cols-4 gap-2 mb-3 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 text-center">
            <div>
              <span className="text-[10px] uppercase font-mono text-amber-400 block">Timer</span>
              <span className="text-base font-extrabold text-amber-400 font-mono">{timeLeft}s ⏳</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-300 block">Score</span>
              <span className="text-base font-extrabold text-white font-mono">{score}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-emerald-400 block">Cash</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">+R{coinsEarned}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-blue-400 block">Combo</span>
              <span className="text-base font-extrabold text-blue-400 font-mono">{combo}x 🔥</span>
            </div>
          </div>
        )}

        {/* Burrow Grid Area */}
        <div className="relative w-full aspect-square max-w-sm bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-950 rounded-3xl p-4 border border-slate-800 shadow-inner flex flex-col items-center justify-center">
          
          <div className="grid grid-cols-3 gap-3 w-full h-full">
            {holes.map((hole) => (
              <button
                key={hole.id}
                onClick={() => handleTapHole(hole.id)}
                className="relative bg-slate-900 border-2 border-amber-900/60 rounded-2xl shadow-inner overflow-hidden flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
              >
                {/* Hole burrow texture */}
                <div className="absolute inset-x-2 bottom-1 h-6 bg-amber-950/90 rounded-full border border-amber-900/80 shadow-md" />

                <AnimatePresence>
                  {hole.active && (
                    <motion.div
                      initial={{ y: 40, scale: 0.5, opacity: 0 }}
                      animate={{ y: -6, scale: 1, opacity: 1 }}
                      exit={{ y: 40, scale: 0.5, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="relative z-10 flex flex-col items-center"
                    >
                      <span className="text-4xl drop-shadow-lg select-none">{hole.emoji}</span>
                      <span className={`text-[9px] font-black font-mono px-1.5 py-0.5 rounded ${
                        hole.type === "DEBT_SHARK" ? "bg-red-500 text-white" : "bg-emerald-500 text-slate-950"
                      }`}>
                        {hole.name}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>

          {/* IDLE Overlay */}
          {gameState === "IDLE" && (
            <div className="absolute inset-0 bg-slate-950/90 rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-400 flex items-center justify-center text-3xl shadow-lg mb-3 animate-bounce">
                🦦
              </div>
              <h2 className="text-xl font-black text-white mb-1">Tap Mali & Savers Friends</h2>
              <p className="text-xs text-slate-300 max-w-sm mb-4 leading-relaxed">
                Tap Mali the Meerkat, Wise Owl, and Fox Stokvel friends as they pop out! <br/>
                <span className="text-red-400 font-bold">⚠️ Avoid Debt Sharks!</span>
              </p>

              <button
                onClick={startGame}
                className="bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 font-black text-sm px-8 py-3 rounded-2xl shadow-lg transition-all transform hover:scale-105 cursor-pointer flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-slate-950" /> Start Tapping
              </button>
            </div>
          )}

          {/* GAMEOVER Overlay */}
          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 bg-slate-950/92 rounded-3xl flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mb-2">
                🏆
              </div>
              <h3 className="text-xl font-black text-white">Tap Frenzy Complete!</h3>
              <p className="text-xs text-slate-400 mb-4">You mobilized the MaliGo Savers Network!</p>

              <div className="w-full max-w-xs bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-5 text-left space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-amber-400" /> Total Tap Score</span>
                  <span className="font-mono font-bold text-white">{score} Pts</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-400 flex items-center gap-1.5"><Coins className="w-3.5 h-3.5" /> Bonus Cash Earned</span>
                  <span className="font-mono font-bold text-emerald-400">+R{coinsEarned}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-400 flex items-center gap-1.5"><PiggyBank className="w-3.5 h-3.5" /> Savings Shards</span>
                  <span className="font-mono font-bold text-blue-400">+R{savingsEarned}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={startGame}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Tap Again
                </button>
                <button
                  onClick={onBack}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronRight className="w-4 h-4" /> Claim & Return
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
