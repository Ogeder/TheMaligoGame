import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Character } from "../types";
import { 
  ArrowLeft, Volume2, VolumeX, Play, RotateCcw, Trophy, 
  Coins, PiggyBank, Sparkles, ChevronRight, Scissors, Heart
} from "lucide-react";

interface DealSlicerGameProps {
  character: Character;
  onGameRewardsGranted: (rewards: { coinsEarned: number; shardsEarned: number; stressRelieved: number }) => void;
  onBack: () => void;
}

interface FlyingItem {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  rotSpeed: number;
  type: "DISCOUNT_DEAL" | "STOKVEL_BONUS" | "DIVIDEND_CHECK" | "LOAN_SHARK_BOMB";
  points: number;
  cashReward: number;
  savingsReward: number;
  emoji: string;
  label: string;
  color: string;
  sliced: boolean;
}

interface TrailPoint {
  x: number;
  y: number;
  life: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export default function DealSlicerGame({
  character,
  onGameRewardsGranted,
  onBack
}: DealSlicerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  const playSliceSound = () => {
    playTone(1200, "sine", 0.05, 0.2);
    setTimeout(() => playTone(1800, "sine", 0.08, 0.25), 40);
  };
  const playBombSound = () => playTone(100, "sawtooth", 0.3, 0.3);

  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [savingsEarned, setSavingsEarned] = useState(0);

  const isMouseDownRef = useRef(false);
  const sliceTrailRef = useRef<TrailPoint[]>([]);

  const gameLoopRef = useRef<{
    items: FlyingItem[];
    particles: Particle[];
    lives: number;
    score: number;
    coins: number;
    savings: number;
  }>({
    items: [],
    particles: [],
    lives: 3,
    score: 0,
    coins: 0,
    savings: 0
  });

  const startGame = () => {
    gameLoopRef.current = {
      items: [],
      particles: [],
      lives: 3,
      score: 0,
      coins: 0,
      savings: 0
    };

    setScore(0);
    setLives(3);
    setCoinsEarned(0);
    setSavingsEarned(0);
    setGameState("PLAYING");
  };

  // Main Physics and Rendering Loop
  useEffect(() => {
    if (gameState !== "PLAYING") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let spawnCounter = 0;

    const spawnParticles = (x: number, y: number, color: string) => {
      for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        gameLoopRef.current.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          size: 3 + Math.random() * 3,
          life: 0,
          maxLife: 20 + Math.random() * 15
        });
      }
    };

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const state = gameLoopRef.current;

      ctx.fillStyle = "#090D16";
      ctx.fillRect(0, 0, w, h);

      // Subtle ambient slice line background
      ctx.strokeStyle = "rgba(16, 185, 129, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // 1. Spawn Flying Deals
      spawnCounter++;
      if (spawnCounter % 50 === 0) {
        const x = 60 + Math.random() * (w - 120);
        const rand = Math.random();

        let type: FlyingItem["type"] = "DISCOUNT_DEAL";
        let points = 100;
        let cashReward = 40;
        let savingsReward = 10;
        let emoji = "🏷️";
        let label = "50% Discount";
        let color = "#10B981";

        if (rand < 0.25) {
          type = "DIVIDEND_CHECK";
          points = 250;
          cashReward = 80;
          savingsReward = 40;
          emoji = "📜";
          label = "Dividend Check";
          color = "#3B82F6";
        } else if (rand < 0.45) {
          type = "STOKVEL_BONUS";
          points = 300;
          cashReward = 100;
          savingsReward = 60;
          emoji = "🎁";
          label = "Stokvel Yield";
          color = "#F59E0B";
        } else if (rand < 0.65) {
          type = "LOAN_SHARK_BOMB";
          points = -100;
          cashReward = 0;
          savingsReward = 0;
          emoji = "💣";
          label = "Payday Trap!";
          color = "#EF4444";
        }

        state.items.push({
          id: Date.now() + Math.random(),
          x,
          y: h + 30,
          vx: (Math.random() - 0.5) * 4,
          vy: -(8.5 + Math.random() * 3.5),
          radius: 22,
          rotation: 0,
          rotSpeed: (Math.random() - 0.5) * 0.1,
          type,
          points,
          cashReward,
          savingsReward,
          emoji,
          label,
          color,
          sliced: false
        });
      }

      // 2. Update and Draw Items
      state.items.forEach(item => {
        item.x += item.vx;
        item.y += item.vy;
        item.vy += 0.2; // Gravity
        item.rotation += item.rotSpeed;

        if (!item.sliced) {
          ctx.save();
          ctx.translate(item.x, item.y);
          ctx.rotate(item.rotation);

          // Glow circle
          ctx.beginPath();
          ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
          ctx.fillStyle = item.color;
          ctx.shadowColor = item.color;
          ctx.shadowBlur = 12;
          ctx.fill();

          // Emoji content
          ctx.font = "18px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#FFFFFF";
          ctx.shadowBlur = 0;
          ctx.fillText(item.emoji, 0, 0);

          ctx.restore();
        }
      });

      // Remove fallen items
      state.items = state.items.filter(item => item.y < h + 50);

      // 3. Slice Trail Collision
      const trail = sliceTrailRef.current;
      if (trail.length >= 2) {
        const p1 = trail[trail.length - 1];
        const p2 = trail[trail.length - 2];

        state.items.forEach(item => {
          if (!item.sliced) {
            // Distance from point p1 to item center
            const dx = p1.x - item.x;
            const dy = p1.y - item.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < item.radius + 15) {
              item.sliced = true;
              spawnParticles(item.x, item.y, item.color);

              if (item.type === "LOAN_SHARK_BOMB") {
                playBombSound();
                state.lives -= 1;
                setLives(state.lives);

                if (state.lives <= 0) {
                  setGameState("GAMEOVER");
                  onGameRewardsGranted({
                    coinsEarned: Math.max(0, state.coins),
                    shardsEarned: Math.max(0, state.savings),
                    stressRelieved: Math.min(25, Math.floor(state.score / 200))
                  });
                  return;
                }
              } else {
                playSliceSound();
                state.score += item.points;
                state.coins += item.cashReward;
                state.savings += item.savingsReward;

                setScore(state.score);
                setCoinsEarned(state.coins);
                setSavingsEarned(state.savings);
              }
            }
          }
        });
      }

      // 4. Draw Slice Trail
      if (trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length; i++) {
          ctx.lineTo(trail[i].x, trail[i].y);
        }
        ctx.strokeStyle = "#10B981";
        ctx.lineWidth = 4;
        ctx.shadowColor = "#10B981";
        ctx.shadowBlur = 10;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Decay trail points
      sliceTrailRef.current = sliceTrailRef.current.filter(p => p.life > 0);
      sliceTrailRef.current.forEach(p => p.life -= 1);

      // 5. Particles
      state.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });
      state.particles = state.particles.filter(p => p.life < p.maxLife);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    sliceTrailRef.current.push({ x, y, life: 8 });
    if (sliceTrailRef.current.length > 12) sliceTrailRef.current.shift();
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

          <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300 flex items-center gap-1.5">
            <Scissors className="w-4 h-4 text-teal-400" /> Deal Slicer Cut
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
              <span className="text-[10px] uppercase font-mono text-red-400 block">Shield Lives</span>
              <span className="text-base font-extrabold text-red-400 font-mono">{"❤️".repeat(lives)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-300 block">Cut Score</span>
              <span className="text-base font-extrabold text-white font-mono">{score}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-emerald-400 block">Cash</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">+R{coinsEarned}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-blue-400 block">Savings</span>
              <span className="text-base font-extrabold text-blue-400 font-mono">+R{savingsEarned}</span>
            </div>
          </div>
        )}

        {/* Canvas Slice Arena */}
        <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner cursor-crosshair touch-none">
          <canvas
            ref={canvasRef}
            width={480}
            height={360}
            onPointerMove={handlePointerMove}
            className="w-full h-full object-contain"
          />

          {/* IDLE Overlay */}
          {gameState === "IDLE" && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-3xl shadow-lg mb-3 animate-bounce">
                ✂️
              </div>
              <h2 className="text-xl font-black text-white mb-1">Deal Slicer Cut</h2>
              <p className="text-xs text-slate-300 max-w-sm mb-4 leading-relaxed">
                Swipe across the screen to slice great financial discounts 🏷️, dividends 📜, and stokvel yields 🎁! <br/>
                <span className="text-red-400 font-bold">⚠️ Do NOT slice Payday Traps 💣!</span>
              </p>

              <button
                onClick={startGame}
                className="bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-black text-sm px-8 py-3 rounded-2xl shadow-lg transition-all transform hover:scale-105 cursor-pointer flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-slate-950" /> Start Slicing
              </button>
            </div>
          )}

          {/* GAMEOVER Overlay */}
          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 bg-slate-950/92 flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-3xl mb-2">
                🏆
              </div>
              <h3 className="text-xl font-black text-white">Deal Slicer Complete!</h3>
              <p className="text-xs text-slate-400 mb-4">You sliced through the worst interest markups!</p>

              <div className="w-full max-w-xs bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-5 text-left space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-amber-400" /> Slicer Score</span>
                  <span className="font-mono font-bold text-white">{score} Pts</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-400 flex items-center gap-1.5"><Coins className="w-3.5 h-3.5" /> Bonus Cash Sliced</span>
                  <span className="font-mono font-bold text-emerald-400">+R{coinsEarned}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-400 flex items-center gap-1.5"><PiggyBank className="w-3.5 h-3.5" /> Savings Compounded</span>
                  <span className="font-mono font-bold text-blue-400">+R{savingsEarned}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={startGame}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
                <button
                  onClick={onBack}
                  className="bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronRight className="w-4 h-4" /> Claim & Return
                </button>
              </div>
            </div>
          )}
        </div>

        {gameState === "PLAYING" && (
          <p className="text-[11px] text-slate-400 mt-3 font-medium animate-pulse">
            ✍️ Drag/Swipe your finger across deals to slice them!
          </p>
        )}
      </div>
    </motion.div>
  );
}
