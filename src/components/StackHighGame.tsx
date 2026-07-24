import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Character } from "../types";
import { 
  ArrowLeft, Volume2, VolumeX, Play, RotateCcw, Trophy, 
  Coins, PiggyBank, Sparkles, ChevronRight, Layers, Building
} from "lucide-react";

interface StackHighGameProps {
  character: Character;
  onGameRewardsGranted: (rewards: { coinsEarned: number; shardsEarned: number; stressRelieved: number }) => void;
  onBack: () => void;
}

interface StackBlock {
  x: number;
  z: number;
  width: number;
  depth: number;
  y: number;
  color: string;
}

export default function StackHighGame({
  character,
  onGameRewardsGranted,
  onBack
}: StackHighGameProps) {
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
      // silent fallback
    }
  };

  const playStackSound = (pitchMultiplier = 1) => playTone(220 * pitchMultiplier, "sine", 0.12, 0.2);
  const playPerfectSound = () => {
    playTone(523, "triangle", 0.1, 0.2);
    setTimeout(() => playTone(659, "triangle", 0.1, 0.2), 60);
    setTimeout(() => playTone(784, "triangle", 0.15, 0.25), 120);
  };
  const playFailSound = () => playTone(120, "sawtooth", 0.3, 0.25);

  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [savingsEarned, setSavingsEarned] = useState(0);

  // Canvas loop state stored in refs for 60fps execution
  const gameLoopRef = useRef<{
    stack: StackBlock[];
    currentX: number;
    currentSpeed: number;
    direction: number;
    blockWidth: number;
    cameraY: number;
    targetCameraY: number;
    score: number;
    combo: number;
    coins: number;
    savings: number;
  }>({
    stack: [],
    currentX: 0,
    currentSpeed: 3.5,
    direction: 1,
    blockWidth: 160,
    cameraY: 0,
    targetCameraY: 0,
    score: 0,
    combo: 0,
    coins: 0,
    savings: 0
  });

  const colors = [
    "#10B981", "#059669", "#3B82F6", "#2563EB", 
    "#8B5CF6", "#7C3AED", "#F59E0B", "#D97706", "#EC4899"
  ];

  const startGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;

    const baseWidth = 180;
    const baseBlock: StackBlock = {
      x: (w - baseWidth) / 2,
      z: 0,
      width: baseWidth,
      depth: 30,
      y: 320,
      color: colors[0]
    };

    gameLoopRef.current = {
      stack: [baseBlock],
      currentX: 0,
      currentSpeed: 3.5,
      direction: 1,
      blockWidth: baseWidth,
      cameraY: 0,
      targetCameraY: 0,
      score: 0,
      combo: 0,
      coins: 0,
      savings: 0
    };

    setScore(0);
    setCombo(0);
    setCoinsEarned(0);
    setSavingsEarned(0);
    setGameState("PLAYING");
  };

  const handlePlaceBlock = () => {
    if (gameState !== "PLAYING") return;

    const state = gameLoopRef.current;
    const topBlock = state.stack[state.stack.length - 1];
    const prevX = topBlock.x;
    const currX = state.currentX;
    const width = state.blockWidth;

    const diff = currX - prevX;
    const absDiff = Math.abs(diff);

    // Tolerance for perfect placement
    if (absDiff < 6) {
      // Perfect placement!
      const newScore = state.score + 1;
      const newCombo = state.combo + 1;
      const bonusMult = Math.min(4, newCombo);
      const earnedC = state.coins + 30 * bonusMult;
      const earnedS = state.savings + 20 * bonusMult;

      playPerfectSound();

      const newBlock: StackBlock = {
        x: prevX, // Align perfectly
        z: 0,
        width: width,
        depth: 30,
        y: topBlock.y - 24,
        color: colors[newScore % colors.length]
      };

      state.stack.push(newBlock);
      state.score = newScore;
      state.combo = newCombo;
      state.coins = earnedC;
      state.savings = earnedS;
      state.currentSpeed = Math.min(7.5, 3.5 + newScore * 0.15);
      state.currentX = 0;
      state.targetCameraY = Math.max(0, (newScore - 4) * 24);

      setScore(newScore);
      setCombo(newCombo);
      setCoinsEarned(earnedC);
      setSavingsEarned(earnedS);
    } else if (absDiff < width) {
      // Partial overhang slice
      const newWidth = width - absDiff;
      const newX = diff > 0 ? currX : prevX;

      const newScore = state.score + 1;
      const earnedC = state.coins + 15;
      const earnedS = state.savings + 10;

      playStackSound(1 + newScore * 0.05);

      const newBlock: StackBlock = {
        x: newX,
        z: 0,
        width: newWidth,
        depth: 30,
        y: topBlock.y - 24,
        color: colors[newScore % colors.length]
      };

      state.stack.push(newBlock);
      state.blockWidth = newWidth;
      state.score = newScore;
      state.combo = 0; // Reset combo on imperfect drop
      state.coins = earnedC;
      state.savings = earnedS;
      state.currentSpeed = Math.min(7.5, 3.5 + newScore * 0.15);
      state.currentX = 0;
      state.targetCameraY = Math.max(0, (newScore - 4) * 24);

      setScore(newScore);
      setCombo(0);
      setCoinsEarned(earnedC);
      setSavingsEarned(earnedS);
    } else {
      // Completely missed!
      playFailSound();
      setGameState("GAMEOVER");
      onGameRewardsGranted({
        coinsEarned: state.coins,
        shardsEarned: state.savings,
        stressRelieved: Math.min(25, Math.floor(state.score * 1.5))
      });
    }
  };

  // Main Render Loop
  useEffect(() => {
    if (gameState !== "PLAYING") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const state = gameLoopRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // Update Moving Block X position
      state.currentX += state.currentSpeed * state.direction;
      if (state.currentX > w - state.blockWidth) {
        state.currentX = w - state.blockWidth;
        state.direction = -1;
      } else if (state.currentX < 0) {
        state.currentX = 0;
        state.direction = 1;
      }

      // Smooth Camera follow
      state.cameraY += (state.targetCameraY - state.cameraY) * 0.1;

      // Clear Canvas
      ctx.fillStyle = "#0B0F19";
      ctx.fillRect(0, 0, w, h);

      // Draw Grid / Skyline
      ctx.strokeStyle = "rgba(16, 185, 129, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      ctx.save();
      // Apply Camera Offset
      ctx.translate(0, state.cameraY);

      // Draw Stacked Blocks
      state.stack.forEach((b, idx) => {
        // Main block face
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = idx === state.stack.length - 1 ? 10 : 0;
        ctx.fillRect(b.x, b.y, b.width, 22);

        // 3D pseudo top rim
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.fillRect(b.x, b.y, b.width, 3);

        // Inner coin / vault detail if wide enough
        if (b.width > 50) {
          ctx.font = "10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText("🏛️ WEALTH TOWER", b.x + b.width / 2, b.y + 14);
        }
      });

      // Draw Moving Block
      if (state.stack.length > 0) {
        const topY = state.stack[state.stack.length - 1].y - 24;
        const currentColor = colors[state.score % colors.length];

        ctx.fillStyle = currentColor;
        ctx.shadowColor = currentColor;
        ctx.shadowBlur = 15;
        ctx.fillRect(state.currentX, topY, state.blockWidth, 22);

        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fillRect(state.currentX, topY, state.blockWidth, 3);
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animId);
  }, [gameState]);

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

          <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-emerald-400" /> Wealth Tower Stack
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
          <div className="w-full grid grid-cols-3 gap-2 mb-3 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 text-center">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Floors Built</span>
              <span className="text-base font-extrabold text-white font-mono">{score} 🏢</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-emerald-400 block">Bonus Cash</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">+R{coinsEarned}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-amber-400 block">Streak Combo</span>
              <span className="text-base font-extrabold text-amber-400 font-mono">{combo}x 🔥</span>
            </div>
          </div>
        )}

        {/* Canvas Game Area */}
        <div 
          onClick={handlePlaceBlock}
          className="relative w-full aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner cursor-pointer select-none touch-none"
        >
          <canvas
            ref={canvasRef}
            width={480}
            height={360}
            className="w-full h-full object-contain"
          />

          {/* IDLE Overlay */}
          {gameState === "IDLE" && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-400 flex items-center justify-center text-3xl shadow-lg mb-3 animate-bounce">
                🏢
              </div>
              <h2 className="text-xl font-black text-white mb-1">Wealth Tower Stack</h2>
              <p className="text-xs text-slate-300 max-w-sm mb-4 leading-relaxed">
                Tap anywhere to stack financial asset blocks! Align them perfectly to stack high, compound interest, and earn massive bonus cash rewards!
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startGame();
                }}
                className="bg-gradient-to-r from-emerald-500 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 font-black text-sm px-8 py-3 rounded-2xl shadow-lg transition-all transform hover:scale-105 cursor-pointer flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-slate-950" /> Start Stacking
              </button>
            </div>
          )}

          {/* GAMEOVER Overlay */}
          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 bg-slate-950/92 flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mb-2">
                🏆
              </div>
              <h3 className="text-xl font-black text-white">Tower Construction Complete!</h3>
              <p className="text-xs text-slate-400 mb-4">You built a {score}-story wealth skyscraper!</p>

              <div className="w-full max-w-xs bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-5 text-left space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-emerald-400" /> Floors Built</span>
                  <span className="font-mono font-bold text-white">{score} Stories</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-400 flex items-center gap-1.5"><Coins className="w-3.5 h-3.5" /> Cash Earned</span>
                  <span className="font-mono font-bold text-emerald-400">+R{coinsEarned}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-400 flex items-center gap-1.5"><PiggyBank className="w-3.5 h-3.5" /> Savings Shards</span>
                  <span className="font-mono font-bold text-blue-400">+R{savingsEarned}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startGame();
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBack();
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronRight className="w-4 h-4" /> Claim & Return
                </button>
              </div>
            </div>
          )}
        </div>

        {gameState === "PLAYING" && (
          <p className="text-[11px] text-slate-400 mt-3 font-medium animate-pulse">
            👇 Tap anywhere on screen to drop the block!
          </p>
        )}
      </div>
    </motion.div>
  );
}
