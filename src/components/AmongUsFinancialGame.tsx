import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Character } from "../types";
import {
  Gamepad2,
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Zap,
  CreditCard,
  Sliders,
  Upload,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Users,
  Shield,
  Siren,
  HelpCircle,
  Award
} from "lucide-react";

interface AmongUsFinancialGameProps {
  character: Character;
  balance: number;
  savings: number;
  debt: number;
  stress: number;
  onRewardEarned: (cash: number, savingsBonus: number, text: string) => void;
  onClose: () => void;
}

// Mali Meerkat Colors (Different Mali Fur Variants)
const MALI_COLORS = [
  { name: "Golden Sand Mali", fur: "#d97706", belly: "#fef3c7", patch: "#451a03", visor: "#93c5fd" },
  { name: "Emerald Growth Mali", fur: "#059669", belly: "#d1fae5", patch: "#064e3b", visor: "#a7f3d0" },
  { name: "Royal Cyan Mali", fur: "#0891b2", belly: "#cffafe", patch: "#164e63", visor: "#a5f3fc" },
  { name: "Sunset Orange Mali", fur: "#ea580c", belly: "#ffedd5", patch: "#7c2d12", visor: "#fed7aa" },
  { name: "Amethyst Spark Mali", fur: "#9333ea", belly: "#f3e8ff", patch: "#581c87", visor: "#e9d5ff" },
  { name: "Ruby Wealth Mali", fur: "#dc2626", belly: "#fee2e2", patch: "#7f1d1d", visor: "#fca5a5" }
];

// Map Rooms definition
interface Room {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  icon: string;
}

const ROOMS: Room[] = [
  { id: "CAFETERIA", name: "Central Cafeteria", x: 250, y: 50, w: 300, h: 200, color: "#1e293b", icon: "☕" },
  { id: "VAULT", name: "Vault & Savings Lab", x: 50, y: 50, w: 160, h: 180, color: "#0f172a", icon: "🏦" },
  { id: "POWER", name: "Solar & Power Room", x: 50, y: 270, w: 160, h: 200, color: "#172554", icon: "⚡" },
  { id: "NAV", name: "Goal & Navigation Hub", x: 590, y: 50, w: 160, h: 180, color: "#052e16", icon: "🧭" },
  { id: "MEDBAY", name: "MedBay & Zen Lounge", x: 250, y: 290, w: 140, h: 160, color: "#064e3b", icon: "🧘" },
  { id: "SECURITY", name: "Security & Credit Radar", x: 410, y: 290, w: 140, h: 160, color: "#311042", icon: "📡" },
  { id: "STORAGE", name: "Budget Storage", x: 590, y: 270, w: 160, h: 200, color: "#3f2305", icon: "📦" }
];

// Interactive Tasks spread across rooms
interface StationTask {
  id: string;
  roomId: string;
  title: string;
  type: "SWIPE_CARD" | "FIX_WIRES" | "CALIBRATE_FUSE" | "UPLOAD_STATEMENT" | "DIVERT_BUDGET";
  x: number;
  y: number;
  completed: boolean;
  rewardCash: number;
  rewardSavings: number;
  icon: string;
}

const INITIAL_TASKS: StationTask[] = [
  { id: "task1", roomId: "VAULT", title: "Swipe Bank Card Reader", type: "SWIPE_CARD", x: 120, y: 120, completed: false, rewardCash: 150, rewardSavings: 50, icon: "💳" },
  { id: "task2", roomId: "VAULT", title: "Upload Bank Statement Data", type: "UPLOAD_STATEMENT", x: 150, y: 180, completed: false, rewardCash: 120, rewardSavings: 80, icon: "📄" },
  { id: "task3", roomId: "POWER", title: "Fix Budget Electrical Wires", type: "FIX_WIRES", x: 100, y: 350, completed: false, rewardCash: 100, rewardSavings: 100, icon: "🔌" },
  { id: "task4", roomId: "POWER", title: "Calibrate Solar Inverter Fuse", type: "CALIBRATE_FUSE", x: 140, y: 420, completed: false, rewardCash: 180, rewardSavings: 20, icon: "☀️" },
  { id: "task5", roomId: "NAV", title: "Divert Subscription Power", type: "DIVERT_BUDGET", x: 670, y: 120, completed: false, rewardCash: 130, rewardSavings: 70, icon: "📊" },
  { id: "task6", roomId: "CAFETERIA", title: "Swipe Meal Plan Card", type: "SWIPE_CARD", x: 400, y: 150, completed: false, rewardCash: 90, rewardSavings: 30, icon: "🍲" },
  { id: "task7", roomId: "STORAGE", title: "Sort Expense Vouchers Wires", type: "FIX_WIRES", x: 670, y: 350, completed: false, rewardCash: 110, rewardSavings: 60, icon: "🏷️" }
];

export default function AmongUsFinancialGame({
  character,
  balance,
  savings,
  debt,
  stress,
  onRewardEarned,
  onClose
}: AmongUsFinancialGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Player State in 2D Space
  const [playerX, setPlayerX] = useState<number>(400);
  const [playerY, setPlayerY] = useState<number>(150);
  const [facingLeft, setFacingLeft] = useState<boolean>(false);
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [colorIndex, setColorIndex] = useState<number>(0);
  const [hat, setHat] = useState<string>("MEERKAT");

  // Game Progress
  const [tasks, setTasks] = useState<StationTask[]>(INITIAL_TASKS);
  const [activeModalTask, setActiveModalTask] = useState<StationTask | null>(null);
  const [nearbyTask, setNearbyTask] = useState<StationTask | null>(null);
  const [currentRoomName, setCurrentRoomName] = useState<string>("Central Cafeteria");

  // Sabotage State
  const [sabotageActive, setSabotageActive] = useState<boolean>(false);
  const [sabotageTimer, setSabotageTimer] = useState<number>(30);
  const [sabotageType, setSabotageType] = useState<string>("INFLATION_SPIKE");
  const [emergencyMeetingOpen, setEmergencyMeetingOpen] = useState<boolean>(false);

  // Card Swipe Mini-Task State
  const [cardX, setCardX] = useState<number>(0);
  const [isDraggingCard, setIsDraggingCard] = useState<boolean>(false);
  const [swipeSpeedStatus, setSwipeSpeedStatus] = useState<string>("Ready! Drag card from left to right.");
  const dragStartTimeRef = useRef<number>(0);

  // Fix Wires Mini-Task State
  const [wiresLeft, setWiresLeft] = useState<string[]>(["Rent", "Savings", "Groceries", "Emergency"]);
  const [wiresRight, setWiresRight] = useState<string[]>(["Groceries", "Rent", "Emergency", "Savings"]);
  const [connectedWires, setConnectedWires] = useState<{ [key: string]: string }>({});
  const [selectedLeftWire, setSelectedLeftWire] = useState<string | null>(null);

  // Upload Statement Task State
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Fuse Calibration State
  const [fuseAngle, setFuseAngle] = useState<number>(0);
  const [targetFuseAngle, setTargetFuseAngle] = useState<number>(180);

  // Divert Budget State
  const [divertSliders, setDivertSliders] = useState<{ [key: string]: number }>({
    "Impulse Purchases": 80,
    "Streaming Subs": 60,
    "Emergency Fund": 10,
    "High Yield Vault": 20
  });

  // Key state listener
  const keysRef = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;

      // Quick interact key (E or Space)
      if ((e.key === "e" || e.key === "E" || e.key === " ") && nearbyTask && !activeModalTask) {
        setActiveModalTask(nearbyTask);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [nearbyTask, activeModalTask]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animId: number;
    let px = playerX;
    let py = playerY;
    let legCycle = 0;

    const SPEED = 3.5;

    const gameLoop = () => {
      let dx = 0;
      let dy = 0;

      const keys = keysRef.current;
      if (keys["w"] || keys["arrowup"]) dy -= SPEED;
      if (keys["s"] || keys["arrowdown"]) dy += SPEED;
      if (keys["a"] || keys["arrowleft"]) {
        dx -= SPEED;
        setFacingLeft(true);
      }
      if (keys["d"] || keys["arrowright"]) {
        dx += SPEED;
        setFacingLeft(false);
      }

      if (dx !== 0 || dy !== 0) {
        setIsWalking(true);
        legCycle += 0.2;

        // Wall collisions (Stay inside canvas 800x500 boundary)
        let nextX = px + dx;
        let nextY = py + dy;

        // Simple boundary checks
        if (nextX >= 30 && nextX <= 770) px = nextX;
        if (nextY >= 30 && nextY <= 470) py = nextY;

        setPlayerX(px);
        setPlayerY(py);
      } else {
        setIsWalking(false);
      }

      // Check current room
      let foundRoom = "Station Corridor";
      for (const r of ROOMS) {
        if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) {
          foundRoom = r.name;
          break;
        }
      }
      setCurrentRoomName(foundRoom);

      // Check proximity to station tasks
      let closestTask: StationTask | null = null;
      let minDist = 45; // Interaction distance

      for (const t of tasks) {
        if (t.completed) continue;
        const dist = Math.hypot(px - t.x, py - t.y);
        if (dist < minDist) {
          closestTask = t;
          break;
        }
      }
      setNearbyTask(closestTask);

      // Render Canvas Scene
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          renderScene(ctx, px, py, legCycle);
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animId);
  }, [playerX, playerY, tasks, colorIndex, hat]);

  // Sabotage Countdown Timer
  useEffect(() => {
    if (!sabotageActive) return;
    const interval = setInterval(() => {
      setSabotageTimer(prev => {
        if (prev <= 1) {
          setSabotageActive(false);
          // Penalty if sabotage timer expires
          onRewardEarned(-150, 0, "⚠️ Inflation Sabotage triggered! Lost R150 due to delayed action.");
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sabotageActive]);

  // Random Sabotage Event Generator every 45s
  useEffect(() => {
    const sabotageInterval = setInterval(() => {
      if (!sabotageActive && Math.random() < 0.6) {
        setSabotageActive(true);
        setSabotageTimer(25);
        setSabotageType(Math.random() > 0.5 ? "INFLATION_SPIKE" : "SUBSCRIPTION_LEAK");
      }
    }, 40000);

    return () => clearInterval(sabotageInterval);
  }, [sabotageActive]);

  // Canvas Drawing Function (2D Among Us Style Engine)
  const renderScene = (ctx: CanvasRenderingContext2D, px: number, py: number, legCycle: number) => {
    const W = 800;
    const H = 500;

    // Clear Space Background
    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, W, H);

    // Draw Stars
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    for (let i = 0; i < 40; i++) {
      const sx = (i * 97) % W;
      const sy = (i * 53) % H;
      ctx.fillRect(sx, sy, (i % 2) + 1, (i % 2) + 1);
    }

    // Draw Corridors connecting rooms
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 18;
    ctx.beginPath();
    // Horizontal corridor
    ctx.moveTo(100, 150);
    ctx.lineTo(700, 150);
    ctx.moveTo(100, 360);
    ctx.lineTo(700, 360);
    // Vertical corridors
    ctx.moveTo(130, 150);
    ctx.lineTo(130, 360);
    ctx.moveTo(400, 150);
    ctx.lineTo(400, 360);
    ctx.moveTo(670, 150);
    ctx.lineTo(670, 360);
    ctx.stroke();

    // Draw Rooms
    for (const room of ROOMS) {
      ctx.fillStyle = room.color;
      ctx.fillRect(room.x, room.y, room.w, room.h);

      // Room border
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 3;
      ctx.strokeRect(room.x, room.y, room.w, room.h);

      // Room Name & Icon
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${room.icon} ${room.name}`, room.x + room.w / 2, room.y + 24);
    }

    // Draw Vents (Among Us Vents)
    const vents = [
      { x: 130, y: 190 },
      { x: 400, y: 220 },
      { x: 670, y: 190 }
    ];
    for (const v of vents) {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(v.x - 14, v.y - 10, 28, 20);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.strokeRect(v.x - 14, v.y - 10, 28, 20);
      // Vent grill lines
      ctx.beginPath();
      ctx.moveTo(v.x - 8, v.y - 5);
      ctx.lineTo(v.x + 8, v.y - 5);
      ctx.moveTo(v.x - 8, v.y);
      ctx.lineTo(v.x + 8, v.y);
      ctx.moveTo(v.x - 8, v.y + 5);
      ctx.lineTo(v.x + 8, v.y + 5);
      ctx.stroke();
    }

    // Draw Tasks Terminals (Exclamation points / Consoles)
    for (const t of tasks) {
      if (t.completed) {
        ctx.fillStyle = "#10b981"; // Green checkmark
        ctx.beginPath();
        ctx.arc(t.x, t.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#020617";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("✓", t.x, t.y + 3);
      } else {
        // Glowing Yellow Terminal
        const glow = Math.sin(Date.now() / 200) * 3;
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(t.x, t.y, 11 + glow, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.fillText("!", t.x, t.y + 4);
      }
    }

    // Draw Emergency Meeting Table in Cafeteria
    ctx.fillStyle = "#475569";
    ctx.beginPath();
    ctx.arc(400, 150, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(400, 150, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 8px sans-serif";
    ctx.fillText("EMERGENCY", 400, 153);

    // Draw Other AI Mali Meerkats (NPCS wandering around station)
    const npcs = [
      { x: 120, y: 320, fur: "#dc2626", belly: "#fee2e2", patch: "#7f1d1d", visor: "#fca5a5", hat: "👑" },
      { x: 650, y: 120, fur: "#0891b2", belly: "#cffafe", patch: "#164e63", visor: "#a5f3fc", hat: "🎓" },
      { x: 320, y: 340, fur: "#059669", belly: "#d1fae5", patch: "#064e3b", visor: "#a7f3d0", hat: "🦦" }
    ];
    for (const npc of npcs) {
      drawMaliMeerkat(ctx, npc.x, npc.y, npc.fur, npc.belly, npc.patch, npc.visor, false, 0, npc.hat);
    }

    // Draw Player Mali Meerkat
    const maliColor = MALI_COLORS[colorIndex];
    drawMaliMeerkat(ctx, px, py, maliColor.fur, maliColor.belly, maliColor.patch, maliColor.visor, facingLeft, legCycle, hat);

    // Player Name Tag
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${character.name} (Mali)`, px, py - 36);

    // Highlight prompt if near a task
    if (nearbyTask && !activeModalTask) {
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.fillRect(px - 60, py - 58, 120, 20);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 1;
      ctx.strokeRect(px - 60, py - 58, 120, 20);

      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText(`Press [E] or TAP to ${nearbyTask.title.split(" ")[0]}`, px, py - 44);
    }
  };

  // Helper function to render Mali the Meerkat in 2D Top-Down canvas
  const drawMaliMeerkat = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    furColor: string,
    bellyColor: string,
    patchColor: string,
    visorColor: string,
    isFacingLeft: boolean,
    legCycle: number,
    hatIcon: string
  ) => {
    ctx.save();
    ctx.translate(x, y);
    if (isFacingLeft) ctx.scale(-1, 1);

    // 1. Curved Meerkat Tail extending behind
    ctx.strokeStyle = patchColor;
    ctx.lineWidth = 4.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-8, 6);
    ctx.quadraticCurveTo(-22, -6, -18, -22);
    ctx.stroke();

    // Dark Tail Tip
    ctx.fillStyle = patchColor;
    ctx.beginPath();
    ctx.arc(-18, -22, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 2. High-Tech Mali Utility Belt / Pack
    ctx.fillStyle = patchColor;
    ctx.beginPath();
    ctx.roundRect(-16, -10, 7, 18, 3);
    ctx.fill();

    // 3. Upright Slender Body (Torso)
    ctx.fillStyle = furColor;
    ctx.beginPath();
    ctx.roundRect(-11, -18, 22, 28, 10);
    ctx.fill();

    // Light Colored Belly Patch
    ctx.fillStyle = bellyColor;
    ctx.beginPath();
    ctx.ellipse(0, -3, 6.5, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Animated Legs
    const legOffset = Math.sin(legCycle) * 5;
    ctx.fillStyle = furColor;
    // Left Leg
    ctx.beginPath();
    ctx.roundRect(-9, 8 + legOffset, 7, 11, 3);
    ctx.fill();
    // Right Leg
    ctx.beginPath();
    ctx.roundRect(2, 8 - legOffset, 7, 11, 3);
    ctx.fill();

    // Paws / Feet
    ctx.fillStyle = patchColor;
    ctx.fillRect(-10, 16 + legOffset, 8, 3);
    ctx.fillRect(1, 16 - legOffset, 8, 3);

    // Front Paws (folded over belly)
    ctx.fillStyle = furColor;
    ctx.beginPath();
    ctx.ellipse(5, -6, 4.5, 3.5, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // 5. Meerkat Head & Snout
    ctx.fillStyle = furColor;
    ctx.beginPath();
    ctx.ellipse(0, -22, 11, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pointy Meerkat Snout
    ctx.fillStyle = bellyColor;
    ctx.beginPath();
    ctx.ellipse(6, -20, 6.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute Dark Nose Tip
    ctx.fillStyle = patchColor;
    ctx.beginPath();
    ctx.arc(10.5, -21, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Rounded Meerkat Ears (Two ears)
    // Left Ear
    ctx.fillStyle = patchColor;
    ctx.beginPath();
    ctx.arc(-7, -29, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Right Ear
    ctx.beginPath();
    ctx.arc(3, -31, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 6. Signature Dark Eye Patch (Around Eyes)
    ctx.fillStyle = patchColor;
    ctx.beginPath();
    ctx.ellipse(3, -23, 5.5, 4.5, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Expressive Eye / High-Tech Visor
    ctx.fillStyle = visorColor;
    ctx.beginPath();
    ctx.ellipse(4, -23, 3.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye Shine Highlight
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(5, -24, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Hat / Accessory on top of Mali's Head
    if (hatIcon) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(hatIcon, 0, -33);
    }

    ctx.restore();
  };

  // Card Swipe Drag Handler
  const handleCardMouseDown = () => {
    setIsDraggingCard(true);
    dragStartTimeRef.current = Date.now();
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingCard) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - rect.left - 40;
    const clampedX = Math.max(0, Math.min(240, relativeX));
    setCardX(clampedX);

    if (clampedX >= 230) {
      // Completed Swipe! Check Duration
      setIsDraggingCard(false);
      const duration = Date.now() - dragStartTimeRef.current;
      if (duration < 350) {
        setSwipeSpeedStatus("❌ TOO FAST! Please swipe at a steady pace.");
        setCardX(0);
      } else if (duration > 1800) {
        setSwipeSpeedStatus("❌ TOO SLOW! Try swiping smoothly.");
        setCardX(0);
      } else {
        setSwipeSpeedStatus("✅ CARD ACCEPTED! Financial Authorization Verified!");
        completeCurrentTask();
      }
    }
  };

  const handleCardMouseUp = () => {
    if (isDraggingCard && cardX < 230) {
      setIsDraggingCard(false);
      setCardX(0);
      setSwipeSpeedStatus("⚠️ BAD READ! Try swiping all the way through.");
    }
  };

  // Wire Connection Handler
  const handleWireLeftClick = (wireName: string) => {
    setSelectedLeftWire(wireName);
  };

  const handleWireRightClick = (wireName: string) => {
    if (selectedLeftWire && selectedLeftWire === wireName) {
      const updated = { ...connectedWires, [selectedLeftWire]: wireName };
      setConnectedWires(updated);
      setSelectedLeftWire(null);

      // Check if all 4 wires connected
      if (Object.keys(updated).length === 4) {
        completeCurrentTask();
      }
    } else {
      setSelectedLeftWire(null);
    }
  };

  // Bank Statement Upload Handler
  const startUploadStatement = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          completeCurrentTask();
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // Complete Active Task
  const completeCurrentTask = () => {
    if (!activeModalTask) return;

    const taskToUpdate = activeModalTask;
    setTasks(prev =>
      prev.map(t => (t.id === taskToUpdate.id ? { ...t, completed: true } : t))
    );

    onRewardEarned(
      taskToUpdate.rewardCash,
      taskToUpdate.rewardSavings,
      `🎉 Task Completed: ${taskToUpdate.title}! Earned +R${taskToUpdate.rewardCash} Cash & +R${taskToUpdate.rewardSavings} Savings!`
    );

    setTimeout(() => {
      setActiveModalTask(null);
    }, 1200);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const taskProgressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 max-w-4xl w-full shadow-2xl relative flex flex-col max-h-[95vh] text-white overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-500 flex items-center justify-center text-xl text-slate-950 font-black shadow-lg">
              🦦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white flex items-center gap-1.5">
                  Mali's Financial Station (2D Top-Down)
                </h3>
                <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  Mali Meerkat Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Current Location: <strong className="text-emerald-400">{currentRoomName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Task Progress Bar */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                Total Station Tasks: {completedCount}/{tasks.length}
              </span>
              <div className="w-32 h-2.5 bg-slate-950 rounded-full border border-slate-800 overflow-hidden mt-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${taskProgressPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SABOTAGE ALARM BANNER */}
        {sabotageActive && (
          <div className="my-2 bg-red-950/90 border border-red-600 text-red-200 p-2.5 rounded-xl flex items-center justify-between text-xs animate-pulse">
            <div className="flex items-center gap-2 font-bold">
              <Siren className="w-5 h-5 text-red-400 animate-spin" />
              <span>
                CRITICAL SABOTAGE: {sabotageType === "INFLATION_SPIKE" ? "INFLATION CRISIS IN REACTOR!" : "SUBSCRIPTION LEAK IN STORAGE!"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-amber-300 font-extrabold text-sm">
                ⏱️ {sabotageTimer}s
              </span>
              <button
                onClick={() => setEmergencyMeetingOpen(true)}
                className="bg-red-600 hover:bg-red-500 text-white font-extrabold px-3 py-1 rounded-lg text-xs cursor-pointer shadow-md"
              >
                CALL EMERGENCY MEETING
              </button>
            </div>
          </div>
        )}

        {/* 2D CANVAS GAME VIEWPORT */}
        <div className="relative my-3 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center flex-1 min-h-[360px]">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full h-full object-contain cursor-crosshair"
            onClick={() => {
              if (nearbyTask && !activeModalTask) {
                setActiveModalTask(nearbyTask);
              }
            }}
          />

          {/* On-Screen Touch Controls for Mobile */}
          <div className="absolute bottom-3 left-3 flex flex-col gap-1 sm:hidden">
            <div className="flex justify-center">
              <button
                onPointerDown={() => (keysRef.current["w"] = true)}
                onPointerUp={() => (keysRef.current["w"] = false)}
                className="w-10 h-10 bg-slate-800/80 active:bg-emerald-600 rounded-xl border border-slate-700 text-white font-bold text-lg"
              >
                ▲
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onPointerDown={() => (keysRef.current["a"] = true)}
                onPointerUp={() => (keysRef.current["a"] = false)}
                className="w-10 h-10 bg-slate-800/80 active:bg-emerald-600 rounded-xl border border-slate-700 text-white font-bold text-lg"
              >
                ◀
              </button>
              <button
                onPointerDown={() => (keysRef.current["s"] = true)}
                onPointerUp={() => (keysRef.current["s"] = false)}
                className="w-10 h-10 bg-slate-800/80 active:bg-emerald-600 rounded-xl border border-slate-700 text-white font-bold text-lg"
              >
                ▼
              </button>
              <button
                onPointerDown={() => (keysRef.current["d"] = true)}
                onPointerUp={() => (keysRef.current["d"] = false)}
                className="w-10 h-10 bg-slate-800/80 active:bg-emerald-600 rounded-xl border border-slate-700 text-white font-bold text-lg"
              >
                ▶
              </button>
            </div>
          </div>

          {/* Mobile Task Button */}
          {nearbyTask && (
            <button
              onClick={() => setActiveModalTask(nearbyTask)}
              className="absolute bottom-3 right-3 bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black text-xs px-4 py-3 rounded-2xl shadow-2xl animate-bounce border border-white cursor-pointer"
            >
              [USE TASK] 🎮
            </button>
          )}

          {/* Customization Bar Overlay */}
          <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-800 flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono text-[10px]">Mali Fur:</span>
            <button
              onClick={() => setColorIndex(prev => (prev + 1) % MALI_COLORS.length)}
              className="w-6 h-6 rounded-full border border-white shadow-md transition-all cursor-pointer hover:scale-110"
              style={{ backgroundColor: MALI_COLORS[colorIndex].fur }}
              title={`Mali Color: ${MALI_COLORS[colorIndex].name}`}
            />
            <span className="text-slate-400 font-mono text-[10px] ml-1">Hat:</span>
            <button
              onClick={() => {
                const hats = ["MEERKAT", "SOLAR", "CROWN", "GRADUATION", "NONE"];
                const next = hats[(hats.indexOf(hat) + 1) % hats.length];
                setHat(next === "MEERKAT" ? "🦦" : next === "SOLAR" ? "☀️" : next === "CROWN" ? "👑" : next === "GRADUATION" ? "🎓" : "");
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold cursor-pointer"
            >
              {hat || "Top"}
            </button>
          </div>
        </div>

        {/* Bottom Bar Controls Instructions */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono gap-2">
          <div className="flex items-center gap-3">
            <span>Controls: <strong className="text-white">WASD / Arrow Keys</strong></span>
            <span>Interact: <strong className="text-amber-300">[E] / [Space]</strong></span>
          </div>

          <button
            onClick={() => setEmergencyMeetingOpen(true)}
            className="bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1"
          >
            <Siren className="w-3.5 h-3.5 text-red-400" /> Emergency Meeting Table
          </button>
        </div>

      </div>

      {/* INTERACTIVE AMONG US TASK MODAL OVERLAY */}
      <AnimatePresence>
        {activeModalTask && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative text-white"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{activeModalTask.icon}</span>
                  <div>
                    <h4 className="text-base font-black text-white">{activeModalTask.title}</h4>
                    <span className="text-[10px] font-mono text-emerald-400">
                      Reward: +R{activeModalTask.rewardCash} Cash | +R{activeModalTask.rewardSavings} Savings
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModalTask(null)}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* TASK TYPE 1: SWIPE BANK CARD */}
              {activeModalTask.type === "SWIPE_CARD" && (
                <div className="py-6 space-y-4 text-center">
                  <p className="text-xs text-slate-300">
                    Swipe your MaliGo Financial Debit Card through the terminal reader at a steady pace!
                  </p>

                  <div
                    onMouseMove={handleCardMouseMove}
                    onMouseUp={handleCardMouseUp}
                    className="w-full h-24 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden flex items-center px-4 select-none cursor-ew-resize"
                  >
                    {/* Reader Slot Line */}
                    <div className="absolute inset-x-4 h-3 bg-slate-800 rounded-full border border-slate-700" />

                    {/* Draggable Debit Card */}
                    <div
                      onMouseDown={handleCardMouseDown}
                      style={{ transform: `translateX(${cardX}px)` }}
                      className="w-20 h-14 bg-gradient-to-br from-amber-500 to-emerald-500 rounded-xl shadow-2xl border border-white flex flex-col justify-between p-2 cursor-grab active:cursor-grabbing z-10 transition-transform duration-75"
                    >
                      <div className="flex justify-between items-center text-[8px] font-mono font-bold text-slate-950">
                        <span>MaliGo</span>
                        <span>VISA</span>
                      </div>
                      <div className="text-[9px] font-mono font-black text-slate-900">
                        •••• 8821
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-mono font-bold text-amber-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    {swipeSpeedStatus}
                  </div>
                </div>
              )}

              {/* TASK TYPE 2: FIX BUDGET WIRES */}
              {activeModalTask.type === "FIX_WIRES" && (
                <div className="py-6 space-y-4">
                  <p className="text-xs text-slate-300 text-center">
                    Connect left budget categories to matching right savings allocations!
                  </p>

                  <div className="grid grid-cols-2 gap-8 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    {/* Left Wires */}
                    <div className="space-y-3">
                      {wiresLeft.map(wire => (
                        <button
                          key={wire}
                          onClick={() => handleWireLeftClick(wire)}
                          className={`w-full p-2.5 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer border ${
                            connectedWires[wire]
                              ? "bg-emerald-950 border-emerald-600 text-emerald-300"
                              : selectedLeftWire === wire
                              ? "bg-amber-950 border-amber-500 text-amber-300 ring-2 ring-amber-500"
                              : "bg-slate-900 border-slate-700 text-slate-300"
                          }`}
                        >
                          <span>🔌 {wire}</span>
                          {connectedWires[wire] && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                      ))}
                    </div>

                    {/* Right Wires */}
                    <div className="space-y-3">
                      {wiresRight.map(wire => (
                        <button
                          key={wire}
                          onClick={() => handleWireRightClick(wire)}
                          className="w-full p-2.5 rounded-xl text-xs font-bold text-right bg-slate-900 border border-slate-700 text-slate-300 hover:border-amber-500 transition-all cursor-pointer"
                        >
                          <span>{wire} ⚡</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TASK TYPE 3: UPLOAD BANK STATEMENT */}
              {activeModalTask.type === "UPLOAD_STATEMENT" && (
                <div className="py-6 space-y-4 text-center">
                  <p className="text-xs text-slate-300">
                    Sync financial transaction history statement to train your AI budget assistant!
                  </p>

                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center mx-auto text-2xl">
                      <Upload className="w-6 h-6" />
                    </div>

                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-150"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>

                    <div className="text-xs font-mono text-slate-400">
                      Upload Progress: <strong className="text-emerald-400">{uploadProgress}%</strong>
                    </div>

                    {!isUploading && uploadProgress < 100 && (
                      <button
                        onClick={startUploadStatement}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all shadow-md"
                      >
                        Start Statement Sync 🚀
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TASK TYPE 4: CALIBRATE FUSE */}
              {activeModalTask.type === "CALIBRATE_FUSE" && (
                <div className="py-6 space-y-4 text-center">
                  <p className="text-xs text-slate-300">
                    Rotate the solar inverter fuse dial to 180° to calibrate power output!
                  </p>

                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center gap-3">
                    <div
                      style={{ transform: `rotate(${fuseAngle}deg)` }}
                      className="w-24 h-24 rounded-full border-4 border-amber-500 bg-slate-900 flex items-center justify-center text-2xl font-bold shadow-2xl transition-transform duration-150"
                    >
                      ⚡
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const newAngle = (fuseAngle + 45) % 360;
                          setFuseAngle(newAngle);
                          if (newAngle === targetFuseAngle) {
                            completeCurrentTask();
                          }
                        }}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl cursor-pointer"
                      >
                        Rotate Fuse +45°
                      </button>
                    </div>

                    <div className="text-xs font-mono text-slate-400">
                      Current Angle: <strong className="text-amber-300">{fuseAngle}°</strong> (Target: 180°)
                    </div>
                  </div>
                </div>
              )}

              {/* TASK TYPE 5: DIVERT BUDGET */}
              {activeModalTask.type === "DIVERT_BUDGET" && (
                <div className="py-6 space-y-4 text-center">
                  <p className="text-xs text-slate-300">
                    Lower non-essential subscription power and divert budget to High Yield Vault!
                  </p>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-left">
                    {Object.entries(divertSliders).map(([label, val]) => (
                      <div key={label} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-300">{label}</span>
                          <span className="text-emerald-400">{val}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={val}
                          onChange={e => {
                            const newVals = { ...divertSliders, [label]: parseInt(e.target.value) };
                            setDivertSliders(newVals);
                            if (newVals["Impulse Purchases"] <= 10 && newVals["High Yield Vault"] >= 80) {
                              completeCurrentTask();
                            }
                          }}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EMERGENCY MEETING MODAL */}
      <AnimatePresence>
        {emergencyMeetingOpen && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border-2 border-red-600 rounded-3xl p-6 max-w-xl w-full shadow-2xl text-white space-y-4"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-600 flex items-center justify-center text-2xl text-red-400">
                  <Siren className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Emergency Financial Meeting</h3>
                  <p className="text-xs text-slate-400">Discuss spending habits and eject bad financial debt sharks!</p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono text-slate-300">
                <div className="text-amber-400 font-bold">💬 Discussion Logs:</div>
                <div className="text-cyan-300">Cyan Crewmate: "I noticed impulse takeaway orders spiking debt!"</div>
                <div className="text-emerald-300">Emerald Crewmate: "Let's vote out high-interest credit card debt!"</div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setEmergencyMeetingOpen(false);
                    setSabotageActive(false);
                    onRewardEarned(100, 50, "🎉 Emergency Meeting successful! Bad debt ejected (+R100 Cash).");
                  }}
                  className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-extrabold px-5 py-2.5 rounded-xl cursor-pointer text-xs shadow-lg"
                >
                  Vote Out Impulse Spending 🗳️
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
