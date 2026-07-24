import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Character } from "../types";
import { 
  Play, RotateCcw, Shield, Coins, Sparkles, Trophy, 
  ChevronRight, Volume2, VolumeX, ArrowLeft, Heart, Zap,
  TrendingUp, PiggyBank, Target
} from "lucide-react";

interface BounceGameProps {
  character: Character;
  currentBalance: number;
  currentSavings: number;
  currentDebt: number;
  stress: number;
  onGameRewardsGranted: (rewards: { coinsEarned: number; shardsEarned: number; stressRelieved: number }) => void;
  onBack: () => void;
}

interface TargetItem {
  id: number;
  x: number;
  y: number;
  radius: number;
  type: "COIN" | "SAVINGS" | "STOKVEL" | "MULTIPLIER" | "DEBT_SPIKE";
  points: number;
  cashReward: number;
  savingsReward: number;
  color: string;
  label: string;
  icon: string;
  hitCount: number;
  maxHits: number;
  floatOffset: number;
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

export default function BounceGame({
  character,
  currentBalance,
  currentSavings,
  currentDebt,
  stress,
  onGameRewardsGranted,
  onBack
}: BounceGameProps) {
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
      if (ctx.state === "suspended") {
        ctx.resume();
      }
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
      // Audio fallback silent
    }
  };

  const playBounceSound = () => playTone(320, "sine", 0.1, 0.15);
  const playCoinSound = () => {
    playTone(880, "sine", 0.1, 0.2);
    setTimeout(() => playTone(1200, "triangle", 0.15, 0.2), 60);
  };
  const playBonusSound = () => {
    playTone(523, "triangle", 0.08, 0.2);
    setTimeout(() => playTone(659, "triangle", 0.08, 0.2), 70);
    setTimeout(() => playTone(784, "triangle", 0.12, 0.25), 140);
  };
  const playHurtSound = () => playTone(150, "sawtooth", 0.2, 0.25);

  // Game Phase
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");

  // Scores and Rewards
  const [score, setScore] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [savingsCollected, setSavingsCollected] = useState(0);
  const [comboCount, setComboCount] = useState(1);
  const [lives, setLives] = useState(3);
  const [multiplierTimer, setMultiplierTimer] = useState(0);

  // Control Inputs
  const isLeftPressed = useRef(false);
  const isRightPressed = useRef(false);
  const touchXRef = useRef<number | null>(null);

  // Avatar Image
  const [avatarImg, setAvatarImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (character.avatar && (character.avatar.startsWith("/") || character.avatar.startsWith("http"))) {
      const img = new Image();
      img.src = character.avatar;
      img.onload = () => setAvatarImg(img);
    }
  }, [character.avatar]);

  // Key Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        isLeftPressed.current = true;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        isRightPressed.current = true;
      }
      if (e.key === " " && gameState === "IDLE") {
        startGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        isLeftPressed.current = false;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        isRightPressed.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState]);

  // Spawn Targets Helper
  const createTargets = (width: number, height: number): TargetItem[] => {
    const targets: TargetItem[] = [];
    const rows = 4;
    const cols = 6;
    const startY = 80;
    const spacingX = width / (cols + 1);
    const spacingY = 45;

    let idCounter = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = spacingX * (c + 1) + (Math.random() * 12 - 6);
        const y = startY + r * spacingY + (Math.random() * 8 - 4);

        const rand = Math.random();
        let type: TargetItem["type"] = "COIN";
        let points = 100;
        let cashReward = 25;
        let savingsReward = 0;
        let color = "#10B981"; // emerald
        let label = "R25";
        let icon = "🪙";
        let maxHits = 1;

        if (rand < 0.25) {
          type = "SAVINGS";
          points = 200;
          cashReward = 0;
          savingsReward = 50;
          color = "#3B82F6"; // blue
          label = "R50 Sav";
          icon = "💎";
        } else if (rand < 0.4) {
          type = "STOKVEL";
          points = 500;
          cashReward = 100;
          savingsReward = 50;
          color = "#F59E0B"; // amber
          label = "Stokvel";
          icon = "🎁";
          maxHits = 2;
        } else if (rand < 0.55) {
          type = "MULTIPLIER";
          points = 300;
          cashReward = 50;
          color = "#8B5CF6"; // purple
          label = "2X Boost";
          icon = "📈";
        } else if (rand < 0.75) {
          type = "DEBT_SPIKE";
          points = -50;
          cashReward = -20;
          color = "#EF4444"; // red
          label = "Spike";
          icon = "⚡";
        }

        targets.push({
          id: idCounter++,
          x,
          y,
          radius: 18,
          type,
          points,
          cashReward,
          savingsReward,
          color,
          label,
          icon,
          hitCount: 0,
          maxHits,
          floatOffset: Math.random() * Math.PI * 2
        });
      }
    }
    return targets;
  };

  const startGame = () => {
    setScore(0);
    setCoinsCollected(0);
    setSavingsCollected(0);
    setComboCount(1);
    setLives(3);
    setMultiplierTimer(0);
    setGameState("PLAYING");
  };

  // Main Canvas Loop
  useEffect(() => {
    if (gameState !== "PLAYING") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas size
    const width = canvas.width;
    const height = canvas.height;

    // Paddle setup
    const paddleWidth = 110;
    const paddleHeight = 16;
    let paddleX = (width - paddleWidth) / 2;
    const paddleY = height - 40;
    const paddleSpeed = 8.5;

    // Ball setup
    const ballRadius = 12;
    let ballX = width / 2;
    let ballY = paddleY - ballRadius - 10;
    let ballVx = (Math.random() > 0.5 ? 1 : -1) * (3.5 + Math.random() * 1.5);
    let ballVy = -5.5;

    // Trail effect
    const trail: { x: number; y: number; alpha: number }[] = [];

    // Targets and Particles
    let targets = createTargets(width, height);
    let particles: Particle[] = [];

    let currentLives = 3;
    let currentScore = 0;
    let currentCoins = 0;
    let currentSavings = 0;
    let currentCombo = 1;
    let currentMultiplierTime = 0;

    let animFrameId: number;
    let lastTime = performance.now();

    const spawnParticles = (x: number, y: number, color: string, count = 12) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          size: 2 + Math.random() * 3,
          life: 0,
          maxLife: 20 + Math.random() * 15
        });
      }
    };

    const render = (time: number) => {
      const dt = Math.min(32, time - lastTime);
      lastTime = time;

      // Clear background
      ctx.fillStyle = "#090D16";
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid pattern
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 1. Move Paddle
      if (isLeftPressed.current) {
        paddleX -= paddleSpeed;
      }
      if (isRightPressed.current) {
        paddleX += paddleSpeed;
      }

      // Touch / Mouse control over paddle
      if (touchXRef.current !== null) {
        paddleX = touchXRef.current - paddleWidth / 2;
      }

      paddleX = Math.max(10, Math.min(width - paddleWidth - 10, paddleX));

      // 2. Update Ball Physics
      const currentSpeedMult = currentMultiplierTime > 0 ? 1.25 : 1.0;
      ballX += ballVx * currentSpeedMult;
      ballY += ballVy * currentSpeedMult;

      // Add to ball trail
      trail.unshift({ x: ballX, y: ballY, alpha: 1.0 });
      if (trail.length > 8) trail.pop();

      // Wall Collisions
      if (ballX - ballRadius <= 0) {
        ballX = ballRadius;
        ballVx = Math.abs(ballVx);
        playBounceSound();
      } else if (ballX + ballRadius >= width) {
        ballX = width - ballRadius;
        ballVx = -Math.abs(ballVx);
        playBounceSound();
      }

      if (ballY - ballRadius <= 0) {
        ballY = ballRadius;
        ballVy = Math.abs(ballVy);
        playBounceSound();
      }

      // Paddle Collision
      if (
        ballVy > 0 &&
        ballY + ballRadius >= paddleY &&
        ballY - ballRadius <= paddleY + paddleHeight &&
        ballX >= paddleX - 5 &&
        ballX <= paddleX + paddleWidth + 5
      ) {
        ballY = paddleY - ballRadius;
        
        // Dynamic angle bounce based on hit point on paddle
        const hitPoint = (ballX - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
        const maxAngle = Math.PI / 3; // 60 deg max
        const bounceAngle = hitPoint * maxAngle;
        const speed = Math.sqrt(ballVx * ballVx + ballVy * ballVy);

        ballVx = Math.sin(bounceAngle) * speed;
        ballVy = -Math.abs(Math.cos(bounceAngle) * speed);

        // Incremental combo for continuous bounces
        currentCombo = Math.min(5, currentCombo + 1);
        setComboCount(currentCombo);

        spawnParticles(ballX, paddleY, "#10B981", 8);
        playBounceSound();
      }

      // Ball Out of Bounds (Bottom Drop)
      if (ballY - ballRadius > height) {
        currentLives -= 1;
        setLives(currentLives);
        playHurtSound();

        if (currentLives <= 0) {
          setGameState("GAMEOVER");
          onGameRewardsGranted({
            coinsEarned: Math.max(0, currentCoins),
            shardsEarned: Math.max(0, currentSavings),
            stressRelieved: Math.min(25, Math.floor(currentScore / 200))
          });
          return;
        } else {
          // Reset ball to above paddle
          ballX = paddleX + paddleWidth / 2;
          ballY = paddleY - ballRadius - 15;
          ballVx = (Math.random() > 0.5 ? 1 : -1) * 4;
          ballVy = -5.5;
          currentCombo = 1;
          setComboCount(1);
        }
      }

      // 3. Multiplier Timer Decrease
      if (currentMultiplierTime > 0) {
        currentMultiplierTime -= dt;
        if (currentMultiplierTime <= 0) {
          currentMultiplierTime = 0;
        }
        setMultiplierTimer(Math.ceil(currentMultiplierTime / 1000));
      }

      // 4. Target Collisions & Render Targets
      const now = performance.now();
      targets.forEach(target => {
        // Floating movement
        const floatY = target.y + Math.sin(now / 400 + target.floatOffset) * 3;

        // Draw Target
        ctx.save();
        ctx.beginPath();
        ctx.arc(target.x, floatY, target.radius, 0, Math.PI * 2);
        ctx.fillStyle = target.color;
        ctx.shadowColor = target.color;
        ctx.shadowBlur = 12;
        ctx.fill();

        // Inner ring
        ctx.beginPath();
        ctx.arc(target.x, floatY, target.radius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fill();

        // Label icon
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowBlur = 0;
        ctx.fillText(target.icon, target.x, floatY);
        ctx.restore();

        // Check Collision with Ball
        const dx = ballX - target.x;
        const dy = ballY - floatY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < ballRadius + target.radius) {
          // Bounce Ball away
          const angle = Math.atan2(dy, dx);
          const speed = Math.sqrt(ballVx * ballVx + ballVy * ballVy);
          ballVx = Math.cos(angle) * speed;
          ballVy = Math.sin(angle) * speed;

          // Target Hit logic
          target.hitCount += 1;
          spawnParticles(target.x, floatY, target.color, 12);

          const finalMult = currentMultiplierTime > 0 ? currentCombo * 2 : currentCombo;
          const gainedScore = target.points * finalMult;
          currentScore += gainedScore;
          setScore(currentScore);

          if (target.cashReward !== 0) {
            currentCoins += target.cashReward * finalMult;
            setCoinsCollected(currentCoins);
          }
          if (target.savingsReward !== 0) {
            currentSavings += target.savingsReward * finalMult;
            setSavingsCollected(currentSavings);
          }

          if (target.type === "MULTIPLIER") {
            currentMultiplierTime = 6000; // 6 seconds 2x boost
            playBonusSound();
          } else if (target.type === "DEBT_SPIKE") {
            playHurtSound();
            currentCombo = 1;
            setComboCount(1);
          } else if (target.type === "STOKVEL") {
            playBonusSound();
          } else {
            playCoinSound();
          }
        }
      });

      // Filter destroyed targets
      targets = targets.filter(t => t.hitCount < t.maxHits);

      // Respawn targets if all destroyed
      if (targets.length <= 2) {
        targets = [...targets, ...createTargets(width, height)];
        playBonusSound();
      }

      // 5. Draw Trail
      trail.forEach((p, idx) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, ballRadius * (1 - idx * 0.08), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${0.4 - idx * 0.04})`;
        ctx.fill();
      });

      // 6. Draw Ball
      ctx.save();
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = currentMultiplierTime > 0 ? "#A855F7" : "#10B981";
      ctx.shadowColor = currentMultiplierTime > 0 ? "#A855F7" : "#10B981";
      ctx.shadowBlur = 15;
      ctx.fill();

      // Ball Avatar or Emoji inside
      if (avatarImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius - 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImg, ballX - ballRadius, ballY - ballRadius, ballRadius * 2, ballRadius * 2);
        ctx.restore();
      } else {
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("🪙", ballX, ballY);
      }
      ctx.restore();

      // 7. Draw Paddle
      ctx.save();
      const pGradient = ctx.createLinearGradient(paddleX, paddleY, paddleX + paddleWidth, paddleY + paddleHeight);
      pGradient.addColorStop(0, "#10B981");
      pGradient.addColorStop(0.5, "#3B82F6");
      pGradient.addColorStop(1, "#10B981");

      ctx.beginPath();
      ctx.roundRect(paddleX, paddleY, paddleWidth, paddleHeight, 8);
      ctx.fillStyle = pGradient;
      ctx.shadowColor = "#10B981";
      ctx.shadowBlur = 10;
      ctx.fill();

      // Paddle Label
      ctx.font = "bold 9px sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.fillText("🛡️ WEALTH BUFFER", paddleX + paddleWidth / 2, paddleY + 11);
      ctx.restore();

      // 8. Draw & Update Particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;
        const alpha = 1 - p.life / p.maxLife;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });
      particles = particles.filter(p => p.life < p.maxLife);

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [gameState]);

  // Touch Handling for Canvas
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    if (touch) {
      touchXRef.current = touch.clientX - rect.left;
    }
  };

  const handleTouchEnd = () => {
    touchXRef.current = null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative flex flex-col items-center">
        
        {/* Top Navigation */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Exit Arcade
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              ⚽ MaliGo Bounce Blitz
            </span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-all cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Live HUD Stats Header */}
        {gameState === "PLAYING" && (
          <div className="w-full grid grid-cols-4 gap-2 mb-3 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 text-center">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Score</span>
              <span className="text-sm font-extrabold text-white font-mono">{score}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-emerald-400 block">Cash 🪙</span>
              <span className="text-sm font-extrabold text-emerald-400 font-mono">+R{coinsCollected}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-blue-400 block">Savings 💎</span>
              <span className="text-sm font-extrabold text-blue-400 font-mono">+R{savingsCollected}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-amber-400 block">Combo</span>
              <span className="text-sm font-extrabold text-amber-400 font-mono">{comboCount}x</span>
            </div>
          </div>
        )}

        {/* Game Canvas Box */}
        <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
          
          <canvas
            ref={canvasRef}
            width={520}
            height={390}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full h-full object-contain cursor-crosshair touch-none"
          />

          {/* IDLE / Start Screen Overlay */}
          {gameState === "IDLE" && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-3xl shadow-lg mb-3 animate-bounce">
                ⚽
              </div>
              <h2 className="text-xl font-black text-white mb-1">MaliGo Bounce Blitz</h2>
              <p className="text-xs text-slate-300 max-w-sm mb-4 leading-relaxed">
                Bounce off your <span className="text-emerald-400 font-bold">Wealth Shield Paddle</span> to collect cash coins 🪙, stokvel chests 🎁, and savings shards 💎 while avoiding debt spikes ⚡!
              </p>

              <div className="flex flex-wrap justify-center gap-3 text-[11px] text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800 mb-5">
                <span className="flex items-center gap-1">⬅️➡️ Arrow Keys / Mouse / Drag</span>
                <span className="flex items-center gap-1">💥 3 Lives</span>
                <span className="flex items-center gap-1">📈 Multipliers</span>
              </div>

              <button
                onClick={startGame}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm px-8 py-3 rounded-2xl shadow-lg transition-all transform hover:scale-105 cursor-pointer flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-slate-950" /> Launch Bounce Blitz
              </button>
            </div>
          )}

          {/* GAMEOVER / Results Overlay */}
          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 bg-slate-950/92 flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mb-2">
                🏆
              </div>
              <h3 className="text-xl font-black text-white">Bounce Blitz Complete!</h3>
              <p className="text-xs text-slate-400 mb-4">Your decision boost paid off! Here are your earned financial rewards:</p>

              <div className="w-full max-w-xs bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-5 text-left space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-amber-400" /> Arcade Score</span>
                  <span className="font-mono font-bold text-white">{score} Pts</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-400 flex items-center gap-1.5"><Coins className="w-3.5 h-3.5" /> Bonus Cash Added</span>
                  <span className="font-mono font-bold text-emerald-400">+R{Math.max(0, coinsCollected)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-400 flex items-center gap-1.5"><PiggyBank className="w-3.5 h-3.5" /> Savings Compounded</span>
                  <span className="font-mono font-bold text-blue-400">+R{Math.max(0, savingsCollected)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-teal-400 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Stress Relieved</span>
                  <span className="font-mono font-bold text-teal-400">-{Math.min(25, Math.floor(score / 200))}%</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={startGame}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Play Again
                </button>
                <button
                  onClick={onBack}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronRight className="w-4 h-4" /> Claim & Return
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Control Pad */}
        {gameState === "PLAYING" && (
          <div className="w-full flex items-center justify-between gap-3 mt-3 sm:hidden">
            <button
              onTouchStart={() => (isLeftPressed.current = true)}
              onTouchEnd={() => (isLeftPressed.current = false)}
              className="flex-1 bg-slate-800 active:bg-emerald-600 text-white font-black py-3 rounded-2xl text-center select-none cursor-pointer"
            >
              ◀ LEFT
            </button>
            <button
              onTouchStart={() => (isRightPressed.current = true)}
              onTouchEnd={() => (isRightPressed.current = false)}
              className="flex-1 bg-slate-800 active:bg-emerald-600 text-white font-black py-3 rounded-2xl text-center select-none cursor-pointer"
            >
              RIGHT ▶
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
