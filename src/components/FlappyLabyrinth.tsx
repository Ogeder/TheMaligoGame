import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Character } from "../types";
import { 
  Play, RotateCcw, Shield, Coins, Sparkles, Trophy, 
  ChevronRight, Volume2, VolumeX, ArrowLeft, Heart, Info
} from "lucide-react";

interface FlappyLabyrinthProps {
  character: Character;
  currentBalance: number;
  currentSavings: number;
  currentDebt: number;
  stress: number;
  onGameRewardsGranted: (rewards: { coinsEarned: number; shardsEarned: number; stressRelieved: number }) => void;
  onBack: () => void;
}

export default function FlappyLabyrinth({
  character,
  currentBalance,
  currentSavings,
  currentDebt,
  stress,
  onGameRewardsGranted,
  onBack
}: FlappyLabyrinthProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Game States
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GAMEOVER">("IDLE");
  const [avatarImg, setAvatarImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (character.avatar && (character.avatar.startsWith("/") || character.avatar.startsWith("http"))) {
      const img = new Image();
      img.src = character.avatar;
      img.onload = () => {
        setAvatarImg(img);
      };
    } else {
      setAvatarImg(null);
    }
  }, [character.avatar]);

  const [score, setScore] = useState(0);
  const [shardsCollected, setShardsCollected] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [shields, setShields] = useState(() => {
    return character.perk === "Shield Master" ? 2 : 1;
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem("maligo_flappy_highscore") || "0");
  });

  // Keep mutables in ref to avoid react re-render latency in game loop
  const stateRef = useRef({
    gameState: "IDLE",
    player: {
      y: 150,
      vy: 0,
      radius: 18,
      rotation: 0,
      flapStrength: -5.4,
      gravity: 0.22,
    },
    pillars: [] as Array<{
      x: number;
      width: number;
      topHeight: number;
      bottomHeight: number;
      gap: number;
      passed: boolean;
      label: string;
    }>,
    items: [] as Array<{
      x: number;
      y: number;
      type: "SHARD" | "COIN" | "SHIELD";
      radius: number;
      collected: boolean;
      pulse: number;
    }>,
    particles: [] as Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      size: number;
    }>,
    score: 0,
    shards: 0,
    coins: 0,
    shields: character.perk === "Shield Master" ? 2 : 1,
    stressLevel: stress,
    scrollSpeed: 2.2, // Base speed
    backgroundOffset: 0,
    frameCount: 0,
  });

  // Pillars educational labels
  const debtLabels = [
    "FOMO Splurge", "Impulse Buy", "Credit Card Debt", 
    "Unpaid Bills", "30% APR Loan", "Loan Shark", 
    "Store Card Trap", "Guaranteed Scheme", "Unbudgeted Party", 
    "Emergency Crisis"
  ];

  // Set the canvas size
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 380;
      }
    };
    
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Update speed based on Stress level
  useEffect(() => {
    // Higher stress makes the game scroll faster (simulating financial anxiety!)
    const stressFactor = 1 + (stress / 100) * 0.8; 
    stateRef.current.scrollSpeed = 2.2 * stressFactor;
    stateRef.current.stressLevel = stress;
  }, [stress]);

  // Audio synthethizer triggers for retro sound effects without assets
  const playSynthSound = (type: "FLAP" | "COLLECT" | "SHIELD_BREAK" | "CRASH" | "SCORE") => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "FLAP") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === "COLLECT") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.setValueAtTime(700, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.22);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      } else if (type === "SHIELD_BREAK") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === "SCORE") {
        osc.type = "square";
        osc.frequency.setValueAtTime(550, ctx.currentTime);
        osc.frequency.setValueAtTime(900, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === "CRASH") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch (e) {
      // Ignored if browser blocks audio
    }
  };

  // Main Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const game = stateRef.current;

    const spawnPillar = () => {
      const gap = Math.max(115, 145 - (game.score * 1.5) - (game.stressLevel / 6)); // smaller gap as score increases or stress increases
      const minHeight = 40;
      const maxHeight = canvas.height - gap - minHeight;
      const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
      const bottomHeight = canvas.height - gap - topHeight;
      const label = debtLabels[Math.floor(Math.random() * debtLabels.length)];

      game.pillars.push({
        x: canvas.width + 40,
        width: 60,
        topHeight,
        bottomHeight,
        gap,
        passed: false,
        label
      });

      // Spawn item in the gap
      if (Math.random() < 0.85) {
        const itemType = Math.random() < 0.15 ? "SHIELD" : Math.random() < 0.5 ? "COIN" : "SHARD";
        game.items.push({
          x: canvas.width + 40 + 30, // Center of pillar width
          y: topHeight + gap / 2 + (Math.random() * 40 - 20),
          type: itemType,
          radius: 10,
          collected: false,
          pulse: 0
        });
      }
    };

    const resetGameData = () => {
      game.player.y = 150;
      game.player.vy = 0;
      game.player.rotation = 0;
      game.pillars = [];
      game.items = [];
      game.particles = [];
      game.score = 0;
      game.shards = 0;
      game.coins = 0;
      game.shields = character.perk === "Shield Master" ? 2 : 1;
      game.frameCount = 0;
      setScore(0);
      setShardsCollected(0);
      setCoinsCollected(0);
      setShields(character.perk === "Shield Master" ? 2 : 1);
    };

    const runLoop = () => {
      game.frameCount++;

      // 1. Clear & Scroll Background
      ctx.fillStyle = "#0f172a"; // Slate 900
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw starry ambient maze grids
      ctx.strokeStyle = "rgba(16, 185, 129, 0.05)"; // Emerald
      ctx.lineWidth = 1;
      const gridSize = 40;
      game.backgroundOffset = (game.backgroundOffset - game.scrollSpeed * 0.4) % gridSize;
      for (let x = game.backgroundOffset; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 2. Physics & Player updates
      if (game.gameState === "PLAYING") {
        game.player.vy += game.player.gravity;
        game.player.y += game.player.vy;
        
        // Tilt animation
        game.player.rotation = Math.min(Math.PI / 6, Math.max(-Math.PI / 12, game.player.vy * 0.06));

        // Ceiling/Floor boundaries
        if (game.player.y - game.player.radius < 0) {
          game.player.y = game.player.radius;
          game.player.vy = 0.5;
        }
        if (game.player.y + game.player.radius > canvas.height) {
          triggerCrash();
        }

        // Spawn pillars
        if (game.pillars.length === 0 || game.pillars[game.pillars.length - 1].x < canvas.width - 240) {
          spawnPillar();
        }

        // Emit particles
        if (game.frameCount % 4 === 0) {
          game.particles.push({
            x: 60 - game.player.radius + 2,
            y: game.player.y + (Math.random() * 8 - 4),
            vx: -game.scrollSpeed - (Math.random() * 1),
            vy: (Math.random() * 2 - 1),
            color: character.jetpackColor || (game.shields > 0 ? "#f59e0b" : "#10b981"), // orange particle if shielded, green if not
            alpha: 1,
            size: Math.random() * 4 + 2
          });
        }
      }

      // Update Particles
      game.particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;
        if (p.alpha <= 0) {
          game.particles.splice(idx, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // 3. Render Pillars
      game.pillars.forEach((pillar, idx) => {
        if (game.gameState === "PLAYING") {
          pillar.x -= game.scrollSpeed;
        }

        // Draw top pillar (Brick-style styling)
        ctx.fillStyle = "#1e293b"; // slate 800
        ctx.strokeStyle = "#475569"; // slate 600
        ctx.lineWidth = 2.5;

        // Draw Top Pillar rect
        ctx.fillRect(pillar.x, 0, pillar.width, pillar.topHeight);
        ctx.strokeRect(pillar.x, -2, pillar.width, pillar.topHeight + 2);

        // Draw Bottom Pillar rect
        ctx.fillRect(pillar.x, canvas.height - pillar.bottomHeight, pillar.width, pillar.bottomHeight);
        ctx.strokeRect(pillar.x, canvas.height - pillar.bottomHeight, pillar.width, pillar.bottomHeight + 2);

        // Pillar lips (caps)
        ctx.fillStyle = "#334155";
        ctx.fillRect(pillar.x - 4, pillar.topHeight - 16, pillar.width + 8, 16);
        ctx.strokeRect(pillar.x - 4, pillar.topHeight - 16, pillar.width + 8, 16);

        ctx.fillRect(pillar.x - 4, canvas.height - pillar.bottomHeight, pillar.width + 8, 16);
        ctx.strokeRect(pillar.x - 4, canvas.height - pillar.bottomHeight, pillar.width + 8, 16);

        // Draw warning text on the pillar cap!
        ctx.fillStyle = "#ef4444"; // high-visibility warning text
        ctx.font = "bold 9px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        
        // Truncate label if it is too long for the cap
        const maxTextWidth = pillar.width + 6;
        let textToShow = pillar.label;
        if (ctx.measureText(textToShow).width > maxTextWidth) {
          textToShow = textToShow.slice(0, 8) + "..";
        }
        ctx.fillText(textToShow, pillar.x + pillar.width / 2, pillar.topHeight - 5);
        ctx.fillText(textToShow, pillar.x + pillar.width / 2, canvas.height - pillar.bottomHeight + 27);

        // Score check
        if (game.gameState === "PLAYING" && !pillar.passed && pillar.x + pillar.width < 60) {
          pillar.passed = true;
          game.score += 1;
          setScore(game.score);
          playSynthSound("SCORE");
        }

        // Collision Check
        if (game.gameState === "PLAYING") {
          const px = 60; // Player fixed X
          const py = game.player.y;
          const r = game.player.radius - 3; // soft collision radius

          const hitTop = (px + r > pillar.x && px - r < pillar.x + pillar.width && py - r < pillar.topHeight);
          const hitBottom = (px + r > pillar.x && px - r < pillar.x + pillar.width && py + r > canvas.height - pillar.bottomHeight);

          if (hitTop || hitBottom) {
            if (game.shields > 0) {
              // Absorb hit
              game.shields--;
              setShields(game.shields);
              playSynthSound("SHIELD_BREAK");
              // Remove the pillar so they don't get stuck colliding
              game.pillars.splice(idx, 1);
              // Make player flash red/invincible
              game.player.vy = -1.8; // soft bounce
            } else {
              triggerCrash();
            }
          }
        }

        // Splice off-screen pillars
        if (pillar.x + pillar.width < -50) {
          game.pillars.splice(idx, 1);
        }
      });

      // 4. Render and Collect Items
      game.items.forEach((item, idx) => {
        if (game.gameState === "PLAYING") {
          item.x -= game.scrollSpeed;
          item.pulse += 0.08;
        }

        if (!item.collected) {
          const itemPulseRadius = item.radius + Math.sin(item.pulse) * 1.5;

          if (item.type === "SHARD") {
            ctx.fillStyle = "#22d3ee"; // cyan 400
            ctx.shadowColor = "#06b6d4";
            ctx.shadowBlur = 10;
            // Draw diamond shape
            ctx.beginPath();
            ctx.moveTo(item.x, item.y - itemPulseRadius);
            ctx.lineTo(item.x + itemPulseRadius, item.y);
            ctx.lineTo(item.x, item.y + itemPulseRadius);
            ctx.lineTo(item.x - itemPulseRadius, item.y);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0; // reset
          } else if (item.type === "COIN") {
            ctx.fillStyle = "#f59e0b"; // amber 500
            ctx.shadowColor = "#eab308";
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(item.x, item.y, itemPulseRadius, 0, Math.PI * 2);
            ctx.fill();
            // Draw a tiny 'C' inside the coin
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 9px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("C", item.x, item.y);
            ctx.shadowBlur = 0;
          } else if (item.type === "SHIELD") {
            ctx.fillStyle = "#f43f5e"; // rose 500
            ctx.shadowColor = "#e11d48";
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(item.x, item.y, itemPulseRadius, 0, Math.PI * 2);
            ctx.fill();
            // Draw tiny shield star icon
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 8px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("🛡️", item.x, item.y);
            ctx.shadowBlur = 0;
          }

          // Item Collection check
          if (game.gameState === "PLAYING") {
            const dist = Math.hypot(60 - item.x, game.player.y - item.y);
            if (dist < game.player.radius + item.radius) {
              item.collected = true;
              playSynthSound("COLLECT");
              
              if (item.type === "SHARD") {
                const bonus = character.perk === "Labyrinth Star" ? 6 : 4;
                game.shards += bonus; // collect with perk modifier
                setShardsCollected(game.shards);
              } else if (item.type === "COIN") {
                game.coins += 25; // collect R25 coins
                setCoinsCollected(game.coins);
              } else if (item.type === "SHIELD") {
                game.shields = Math.min(3, game.shields + 1);
                setShields(game.shields);
              }

              // Flash reward text on player
              for (let i = 0; i < 6; i++) {
                game.particles.push({
                  x: item.x,
                  y: item.y,
                  vx: (Math.random() * 4 - 2),
                  vy: (Math.random() * 4 - 2),
                  color: item.type === "SHARD" ? "#22d3ee" : item.type === "COIN" ? "#f59e0b" : "#f43f5e",
                  alpha: 1,
                  size: Math.random() * 3 + 1
                });
              }

              game.items.splice(idx, 1);
            }
          }
        }

        // Splice offscreen items
        if (item.x < -30) {
          game.items.splice(idx, 1);
        }
      });

      // 5. Render Player: Mali the Meerkat (With animated flying jetpack aura!)
      ctx.save();
      ctx.translate(60, game.player.y);
      ctx.rotate(game.player.rotation);

      // Jetpack flame particle effects
      if (game.gameState === "PLAYING" && game.frameCount % 2 === 0) {
        ctx.fillStyle = character.jetpackColor || (game.shields > 0 ? "#fbbf24" : "#34d399");
        ctx.beginPath();
        ctx.arc(-game.player.radius, 4, Math.random() * 6 + 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Meerkat avatar circle container
      ctx.beginPath();
      ctx.arc(0, 0, game.player.radius, 0, Math.PI * 2);
      ctx.fillStyle = game.shields > 0 ? "#f59e0b" : "#1e293b"; // golden amber if shielded, dark standard if not
      ctx.strokeStyle = game.shields > 0 ? "#fbbf24" : "#10b981"; // neon green outline
      ctx.lineWidth = 2.5;
      ctx.fill();
      ctx.stroke();

      // Inside text/emoji or custom image representing Meerkat Mali!
      if (avatarImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, game.player.radius - 1.5, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImg, -game.player.radius, -game.player.radius, game.player.radius * 2, game.player.radius * 2);
        ctx.restore();
      } else {
        ctx.font = "19px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(character.avatar || "🦦", 0, 1); // draw the Meerkat avatar emoji!
      }

      // Draw active shield ring
      if (game.shields > 0) {
        ctx.strokeStyle = "rgba(244, 63, 94, 0.7)"; // pulsing rose circle
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, game.player.radius + 6 + Math.sin(game.frameCount * 0.15) * 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      // Draw Creeping Shadow Debt wall indicator
      if (game.gameState === "PLAYING") {
        const shadowPulse = Math.sin(game.frameCount * 0.08) * 4;
        const shadowGradient = ctx.createLinearGradient(0, 0, 40 + shadowPulse, 0);
        shadowGradient.addColorStop(0, "rgba(239, 68, 68, 0.4)"); // Rose red shadow
        shadowGradient.addColorStop(1, "rgba(239, 68, 68, 0.0)");
        ctx.fillStyle = shadowGradient;
        ctx.fillRect(0, 0, 40 + shadowPulse, canvas.height);

        // Warning line
        ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(40 + shadowPulse, 0);
        ctx.lineTo(40 + shadowPulse, canvas.height);
        ctx.stroke();

        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 8px 'JetBrains Mono', monospace";
        ctx.textAlign = "left";
        ctx.fillText("⚠️ SHADOW DEBT CREEP", 8, 15);
      }

      // Draw instructions or overlay on IDLE
      if (game.gameState === "IDLE") {
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🎮 CHRONO-FLAP LABYRINTH ESCAPE", canvas.width / 2, canvas.height / 2 - 30);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "12px sans-serif";
        ctx.fillText("Click Canvas or Tap SPACEBAR to Fly Mali the Meerkat", canvas.width / 2, canvas.height / 2);
        ctx.fillText("Avoid Red Warning Pillars & Collect Wealth Shards and Coins!", canvas.width / 2, canvas.height / 2 + 20);

        ctx.fillStyle = "#10b981";
        ctx.font = "bold 11px 'JetBrains Mono', monospace";
        ctx.fillText(`🎮 High Score: ${highScore} points`, canvas.width / 2, canvas.height / 2 + 55);
      }

      // Keep animation running
      animId = requestAnimationFrame(runLoop);
    };

    const triggerCrash = () => {
      game.gameState = "GAMEOVER";
      setGameState("GAMEOVER");
      playSynthSound("CRASH");

      // Save highscore
      if (game.score > highScore) {
        localStorage.setItem("maligo_flappy_highscore", String(game.score));
        setHighScore(game.score);
      }
    };

    // Trigger loop
    animId = requestAnimationFrame(runLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [soundEnabled, gameState, highScore]);

  // Handle flap triggers
  const handleFlap = (e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const game = stateRef.current;

    if (game.gameState === "IDLE") {
      game.gameState = "PLAYING";
      setGameState("PLAYING");
      // Initial minor boost
      game.player.vy = game.player.flapStrength;
      playSynthSound("FLAP");
    } else if (game.gameState === "PLAYING") {
      game.player.vy = game.player.flapStrength;
      playSynthSound("FLAP");

      // Emit nice splash of particles on click
      for (let i = 0; i < 4; i++) {
        game.particles.push({
          x: 60 - game.player.radius,
          y: game.player.y + 10,
          vx: -2 - (Math.random() * 2),
          vy: 1 + Math.random() * 3,
          color: "#eab308", // Golden sparks
          alpha: 1,
          size: Math.random() * 3 + 1.5
        });
      }
    }
  };

  // Keyboard Space trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        const game = stateRef.current;
        if (game.gameState !== "GAMEOVER") {
          e.preventDefault();
          game.player.vy = game.player.flapStrength;
          playSynthSound("FLAP");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Claim Rewards
  const claimRewardsAndExit = () => {
    // Add real game values to main game:
    onGameRewardsGranted({
      coinsEarned: coinsCollected,
      shardsEarned: shardsCollected,
      stressRelieved: Math.min(20, Math.floor(score * 1.5)) // traveling the labyrinth reduces stress!
    });
  };

  // Restarting inside flappy
  const handleRestartGame = () => {
    const game = stateRef.current;
    game.gameState = "PLAYING";
    setGameState("PLAYING");
    game.player.y = 150;
    game.player.vy = 0;
    game.player.rotation = 0;
    game.pillars = [];
    game.items = [];
    game.particles = [];
    game.score = 0;
    game.shards = 0;
    game.coins = 0;
    game.shields = character.perk === "Shield Master" ? 2 : 1;
    game.frameCount = 0;
    setScore(0);
    setShardsCollected(0);
    setCoinsCollected(0);
    setShields(character.perk === "Shield Master" ? 2 : 1);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4" id="flappy-game-screen">
      
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-semibold mb-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Decisions
          </button>
          <h2 className="text-xl sm:text-2xl font-sans font-bold text-gray-900 flex items-center gap-2">
            🧭 Chrono-Flap Labyrinth Game <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono font-bold">ARCADE</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            The compound power of your financial choices generates energy to fly Mali! Relieve stress and secure bonus shards.
          </p>
        </div>

        {/* Audio Toggler */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all text-gray-500 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>SFX On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-gray-400" />
              <span>SFX Off</span>
            </>
          )}
        </button>
      </div>

      {/* Floating HUD dashboard */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {/* Distance Score */}
        <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-2 sm:p-3 text-center shadow-sm">
          <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Distance Score</div>
          <div className="text-base sm:text-xl font-bold font-mono text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
            <Trophy className="w-4 h-4 text-emerald-400" />
            {score}
          </div>
        </div>

        {/* Wealth Shards Collected */}
        <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-2 sm:p-3 text-center shadow-sm">
          <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Shards Collected</div>
          <div className="text-base sm:text-xl font-bold font-mono text-cyan-400 flex items-center justify-center gap-1 mt-0.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            +{shardsCollected}
          </div>
        </div>

        {/* Coins Collected */}
        <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-2 sm:p-3 text-center shadow-sm">
          <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Bonus Cash</div>
          <div className="text-base sm:text-xl font-bold font-mono text-amber-400 flex items-center justify-center gap-1 mt-0.5">
            <Coins className="w-4 h-4 text-amber-400" />
            R{coinsCollected}
          </div>
        </div>

        {/* Active Shields */}
        <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-2 sm:p-3 text-center shadow-sm">
          <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Labyrinth Shields</div>
          <div className="text-base sm:text-xl font-bold font-mono text-rose-400 flex items-center justify-center gap-1 mt-0.5">
            <Shield className="w-4 h-4 text-rose-400" />
            {shields}/3
          </div>
        </div>
      </div>

      {/* Main Canvas Stage */}
      <div className="relative border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 shadow-md">
        <canvas
          ref={canvasRef}
          onMouseDown={handleFlap}
          onTouchStart={handleFlap}
          className="block w-full h-[380px] cursor-pointer"
        />

        {/* Stress-Anxiety Warning overlay */}
        {stress > 60 && gameState === "PLAYING" && (
          <div className="absolute top-2.5 right-2.5 bg-rose-950/90 border border-rose-800 text-rose-300 rounded-lg px-2 py-1 text-[10px] font-mono font-bold animate-pulse flex items-center gap-1.5">
            <span>🚨 HIGH STRESS SPEEDUP (Factor: +80%)</span>
          </div>
        )}

        {/* Game Over Screen Overlay */}
        {gameState === "GAMEOVER" && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full"
            >
              <span className="text-5xl block mb-2 filter drop-shadow-sm">💥</span>
              <h3 className="text-xl sm:text-2xl font-sans font-extrabold text-white mb-2 tracking-tight">
                Crashed into a Debt Trap Pillar!
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-5 leading-relaxed">
                Mali collided with the shadow debt trap! Your final distance score is <span className="text-emerald-400 font-bold font-mono">{score}</span>.
                You collected total bonus assets in this run.
              </p>

              {/* Reward stats banner */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 mb-6 grid grid-cols-3 gap-2">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Cash Earned</div>
                  <div className="text-sm font-bold font-mono text-amber-400 mt-0.5">R{coinsCollected}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Shards Secured</div>
                  <div className="text-sm font-bold font-mono text-cyan-400 mt-0.5">+{shardsCollected}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Stress Relief</div>
                  <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">-{Math.min(20, Math.floor(score * 1.5))}%</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleRestartGame}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-sans font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                >
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
                <button
                  onClick={claimRewardsAndExit}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-emerald-950/20"
                >
                  <Coins className="w-4 h-4" /> Claim Rewards & Return
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Mini Tips */}
      <div className="mt-4 p-3 bg-slate-50 border border-gray-200/60 rounded-xl flex gap-2.5 items-start">
        <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-600 leading-relaxed">
          <span className="font-bold text-gray-800">Why are there pillars?</span> 
          Each pillar represents a real-life financial pitfall (like high-interest retail debt or impulse splurges). Hitting one costs you a <span className="font-semibold text-rose-600">Labyrinth Shield</span>. Automating savings and compounding money in the main game earns you shields and shards to boost your score!
        </div>
      </div>

    </div>
  );
}
