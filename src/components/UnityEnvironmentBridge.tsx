import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Character } from "../types";
import { UnityBridge, UnityPlayerState } from "../services/UnityBridgeService";
import {
  Gamepad2,
  Code2,
  Box,
  Layers,
  Sparkles,
  RefreshCw,
  Maximize2,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  Laptop,
  Sun,
  Shield,
  Sprout,
  Coins,
  AlertTriangle,
  Info,
  Download,
  Settings
} from "lucide-react";

interface UnityEnvironmentBridgeProps {
  character: Character;
  balance: number;
  savings: number;
  debt: number;
  stress: number;
  lives: number;
  estateTitle: string;
  estateIcon: string;
  hasSolarInverter: boolean;
  hasSmartLaptop: boolean;
  hasShield: boolean;
  onBuySolarInverter: () => void;
  onBuySmartLaptop: () => void;
  onBuyDebtShield: () => void;
  onWaterPlant: () => void;
  plantLevel: number;
  lastNotification?: string | null;
}

export default function UnityEnvironmentBridge({
  character,
  balance,
  savings,
  debt,
  stress,
  lives,
  estateTitle,
  estateIcon,
  hasSolarInverter,
  hasSmartLaptop,
  hasShield,
  onBuySolarInverter,
  onBuySmartLaptop,
  onBuyDebtShield,
  onWaterPlant,
  plantLevel,
  lastNotification
}: UnityEnvironmentBridgeProps) {
  const [activeTab, setActiveTab] = useState<"SIMULATOR_3D" | "UNITY_LOADER" | "CSHARP_CODE" | "OPTIMIZATION">("SIMULATOR_3D");
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [unityLoadingProgress, setUnityLoadingProgress] = useState<number>(0);
  const [isUnityLoaded, setIsUnityLoaded] = useState<boolean>(false);
  const [unityBuildNotFound, setUnityBuildNotFound] = useState<boolean>(false);
  const [rotationAngle, setRotationAngle] = useState<number>(30);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync state to UnityBridge whenever stats change
  useEffect(() => {
    const currentState: UnityPlayerState = {
      characterName: character.name,
      characterType: character.type,
      balance,
      savings,
      debt,
      stress,
      lives,
      estateTitle,
      hasSolarInverter,
      hasSmartLaptop,
      hasShield,
      plantLevel
    };

    UnityBridge.sendStateToUnity(currentState);
  }, [character, balance, savings, debt, stress, lives, estateTitle, hasSolarInverter, hasSmartLaptop, hasShield, plantLevel]);

  // Handle canvas 3D simulation rendering
  useEffect(() => {
    if (activeTab !== "SIMULATOR_3D") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let angle = rotationAngle;

    const render3DRoom = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background ambient gradient
      const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width / 1.2);
      grad.addColorStop(0, "#0f172a");
      grad.addColorStop(1, "#020617");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw Grid Floor (Isometric Projection)
      const centerX = width / 2;
      const centerY = height / 2 + 30;
      const tileSize = 28;
      const gridDim = 8;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Rotate floor grid dynamically
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      // Draw floor tiles
      for (let x = -gridDim / 2; x < gridDim / 2; x++) {
        for (let z = -gridDim / 2; z < gridDim / 2; z++) {
          // Iso conversion
          const isoX = (x - z) * tileSize * cos;
          const isoY = (x + z) * tileSize * sin * 0.5;

          ctx.beginPath();
          ctx.moveTo(isoX, isoY);
          ctx.lineTo(isoX + tileSize * cos, isoY + tileSize * sin * 0.5);
          ctx.lineTo(isoX, isoY + tileSize * sin);
          ctx.lineTo(isoX - tileSize * cos, isoY + tileSize * sin * 0.5);
          ctx.closePath();

          const isEven = (x + z) % 2 === 0;
          ctx.fillStyle = isEven ? "rgba(30, 41, 59, 0.8)" : "rgba(15, 23, 42, 0.9)";
          ctx.strokeStyle = "rgba(51, 65, 85, 0.5)";
          ctx.lineWidth = 1;
          ctx.fill();
          ctx.stroke();
        }
      }

      // Draw 3D Objects on Grid
      // 1. Character Avatar at center
      const charIsoX = 0;
      const charIsoY = 0;
      
      // Shadow
      ctx.beginPath();
      ctx.ellipse(charIsoX, charIsoY + 5, 20, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fill();

      // Avatar Pillar/Stand
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(charIsoX, charIsoY - 25, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#6ee7b7";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Avatar text icon
      ctx.fillStyle = "#020617";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(character.avatar || "🧑‍🎓", charIsoX, charIsoY - 25);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px monospace";
      ctx.fillText(character.name, charIsoX, charIsoY - 50);

      // 2. Workstation Object (If bought or default)
      const laptopX = -60 * cos;
      const laptopY = -60 * sin * 0.5;
      ctx.fillStyle = hasSmartLaptop ? "#38bdf8" : "#475569";
      ctx.fillRect(laptopX - 15, laptopY - 30, 30, 20);
      ctx.fillStyle = hasSmartLaptop ? "#0284c7" : "#334155";
      ctx.fillRect(laptopX - 12, laptopY - 26, 24, 12);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "10px sans-serif";
      ctx.fillText(hasSmartLaptop ? "💻 Smart Station" : "💻 Basic Laptop", laptopX, laptopY - 38);

      // 3. Solar Inverter Object (If bought)
      if (hasSolarInverter) {
        const solarX = 70 * cos;
        const solarY = -40 * sin * 0.5;
        ctx.fillStyle = "#f59e0b";
        ctx.fillRect(solarX - 12, solarY - 35, 24, 30);
        ctx.fillStyle = "#fef08a";
        ctx.fillText("☀️ Solar Inverter", solarX, solarY - 42);
      }

      // 4. Money Tree / Plant
      const plantX = 60 * cos;
      const plantY = 50 * sin * 0.5;
      ctx.fillStyle = "#15803d";
      ctx.beginPath();
      ctx.arc(plantX, plantY - 20, 10 + plantLevel * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#86efac";
      ctx.font = "10px sans-serif";
      ctx.fillText(`🪴 Money Tree (Lvl ${plantLevel})`, plantX, plantY - 35);

      // 5. Emergency Shield Aura (If active)
      if (hasShield) {
        ctx.beginPath();
        ctx.ellipse(charIsoX, charIsoY - 25, 32, 28, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();

      // UI Overlay stats on Canvas
      ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
      ctx.fillRect(12, 12, 220, 75);
      ctx.strokeStyle = "rgba(51, 65, 85, 0.8)";
      ctx.strokeRect(12, 12, 220, 75);

      ctx.fillStyle = "#34d399";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`💰 Cash: R${balance.toLocaleString()}`, 24, 32);
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(`🏦 Savings: R${savings.toLocaleString()}`, 24, 50);
      ctx.fillStyle = "#f87171";
      ctx.fillText(`📉 Debt: R${debt.toLocaleString()}`, 24, 68);

      // Rotate slightly over time
      angle = (angle + 0.15) % 360;
      animationFrameId = requestAnimationFrame(render3DRoom);
    };

    render3DRoom();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeTab, rotationAngle, character, balance, savings, debt, hasSolarInverter, hasSmartLaptop, hasShield, plantLevel]);

  // Code snippets for C# Integration
  const csBridgeCode = `using UnityEngine;
using System.Runtime.InteropServices;

namespace MaliGo.WebBridge 
{
    [System.Serializable]
    public class PlayerStateData 
    {
        public string characterName;
        public string characterType;
        public float balance;
        public float savings;
        public float debt;
        public float stress;
        public int lives;
        public string estateTitle;
        public bool hasSolarInverter;
        public bool hasSmartLaptop;
        public bool hasShield;
        public int plantLevel;
    }

    public class MaliGoWorldController : MonoBehaviour 
    {
        [Header("3D Scene References")]
        public Transform playerAvatar;
        public GameObject solarInverter3D;
        public GameObject smartLaptop3D;
        public GameObject shieldAuraEffect;
        public Transform moneyTreeTransform;

        // JS Plugin import to send events back to React
        [DllImport("__Internal")]
        private static extern void DispatchReactEvent(string action, string payloadJson);

        void Start() 
        {
            Debug.Log("🎮 [Unity 3D Engine] MaliGo World Controller Initialized!");
        }

        // Called from React via UnityBridge.sendStateToUnity()
        public void SyncPlayerStateFromReact(string jsonState) 
        {
            PlayerStateData state = JsonUtility.FromJson<PlayerStateData>(jsonState);
            
            // Update 3D World Objects
            if (solarInverter3D != null) 
                solarInverter3D.SetActive(state.hasSolarInverter);
                
            if (smartLaptop3D != null) 
                smartLaptop3D.SetActive(state.hasSmartLaptop);
                
            if (shieldAuraEffect != null) 
                shieldAuraEffect.SetActive(state.hasShield);

            // Scale Money Tree based on savings milestone level
            if (moneyTreeTransform != null) {
                float scale = 1.0f + (state.plantLevel * 0.2f);
                moneyTreeTransform.localScale = new Vector3(scale, scale, scale);
            }
        }

        // Called when user clicks an object in 3D scene
        public void OnClick3DWorkstation() 
        {
            #if UNITY_WEBGL && !UNITY_EDITOR
            DispatchReactEvent("BUY_WORKSTATION", "{}");
            #endif
        }
    }
}`;

  const jslibCode = `mergeInto(LibraryManager.library, {
  DispatchReactEvent: function (actionPtr, payloadPtr) {
    var action = UTF8ToString(actionPtr);
    var payload = UTF8ToString(payloadPtr);
    if (window.dispatchUnityEvent) {
      window.dispatchUnityEvent(action, payload);
    }
  }
});`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl my-6 text-white overflow-hidden relative">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg border border-white/20">
            🎮
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-950/80 border border-purple-800 px-2 py-0.5 rounded-md">
                3D World Engine Bridge
              </span>
              <span className="text-xs text-slate-400 font-mono">Unity WebGL & React Sync</span>
            </div>
            <h3 className="text-xl font-black text-white mt-0.5 flex items-center gap-2">
              MaliGo Unity 3D Environment Simulator
            </h3>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab("SIMULATOR_3D")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "SIMULATOR_3D"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Box className="w-4 h-4 text-purple-300" />
            <span>Interactive 3D Viewport</span>
          </button>

          <button
            onClick={() => setActiveTab("UNITY_LOADER")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "UNITY_LOADER"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <span>Unity WebGL Loader</span>
          </button>

          <button
            onClick={() => setActiveTab("CSHARP_CODE")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "CSHARP_CODE"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Code2 className="w-4 h-4 text-amber-400" />
            <span>C# & JS Bridge Code</span>
          </button>

          <button
            onClick={() => setActiveTab("OPTIMIZATION")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "OPTIMIZATION"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Mobile & Size Tips</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE 3D VIEWPORT */}
      {activeTab === "SIMULATOR_3D" && (
        <div className="pt-5 space-y-4">
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 relative overflow-hidden flex flex-col items-center">
            
            {/* Live Notification Bar */}
            {lastNotification && (
              <div className="w-full mb-3 bg-indigo-950/90 border border-indigo-700/80 text-indigo-200 text-xs px-3.5 py-2 rounded-xl font-medium flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{lastNotification}</span>
              </div>
            )}

            {/* Canvas 3D Viewport */}
            <div className="relative w-full max-w-2xl h-[320px] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-950 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={640}
                height={320}
                className="w-full h-full object-cover cursor-grab active:cursor-grabbing"
              />

              {/* Angle Control Overlay */}
              <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 flex items-center gap-2 text-xs text-slate-300 font-mono">
                <button
                  onClick={() => setRotationAngle(prev => (prev - 15) % 360)}
                  className="p-1 hover:bg-slate-800 rounded-md transition-all cursor-pointer"
                  title="Rotate Camera Left"
                >
                  🔄
                </button>
                <span>3D Viewport View</span>
              </div>
            </div>

            {/* Interactive 3D Room Upgrade Hotspots */}
            <div className="w-full mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={onBuySmartLaptop}
                className={`p-3 rounded-2xl border transition-all text-left flex items-start gap-3 cursor-pointer ${
                  hasSmartLaptop
                    ? "bg-slate-900/90 border-cyan-500/60"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-lg flex-shrink-0">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>Workstation</span>
                    {hasSmartLaptop && <CheckCircle2 className="w-3 h-3 text-cyan-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {hasSmartLaptop ? "Smart Workstation Active" : "R250 • Reduces stress"}
                  </p>
                </div>
              </button>

              <button
                onClick={onBuySolarInverter}
                className={`p-3 rounded-2xl border transition-all text-left flex items-start gap-3 cursor-pointer ${
                  hasSolarInverter
                    ? "bg-slate-900/90 border-amber-500/60"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center text-lg flex-shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>Solar Inverter</span>
                    {hasSolarInverter && <CheckCircle2 className="w-3 h-3 text-amber-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {hasSolarInverter ? "Inverter Installed" : "R200 • Electricity protection"}
                  </p>
                </div>
              </button>

              <button
                onClick={onBuyDebtShield}
                className={`p-3 rounded-2xl border transition-all text-left flex items-start gap-3 cursor-pointer ${
                  hasShield
                    ? "bg-slate-900/90 border-sky-500/60"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-sky-950 text-sky-400 border border-sky-800 flex items-center justify-center text-lg flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>Financial Shield</span>
                    {hasShield && <CheckCircle2 className="w-3 h-3 text-sky-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {hasShield ? "Shield Charged (100%)" : "R100 • Debt absorption"}
                  </p>
                </div>
              </button>

              <button
                onClick={onWaterPlant}
                className="p-3 rounded-2xl border border-emerald-800/80 bg-emerald-950/40 hover:bg-emerald-900/40 transition-all text-left flex items-start gap-3 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-900 text-emerald-300 border border-emerald-700 flex items-center justify-center text-lg flex-shrink-0">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>Money Tree Lvl {plantLevel}</span>
                  </div>
                  <p className="text-[10px] text-emerald-300 mt-0.5">
                    Water for bonus coins! 🪴
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OFFICIAL UNITY WEBGL LOADER */}
      {activeTab === "UNITY_LOADER" && (
        <div className="pt-5 space-y-4">
          <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-950 border border-indigo-700/80 text-indigo-400 flex items-center justify-center mx-auto text-3xl shadow-xl">
              <Gamepad2 className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto">
              <h4 className="text-base font-black text-white">Unity WebGL Mount Container</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                When you build your Unity 3D project for WebGL, drop the exported files into <code className="text-indigo-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">public/unity/</code>.
              </p>
            </div>

            {/* Folder Structure Target */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-left font-mono text-xs max-w-md mx-auto space-y-1 text-slate-300">
              <div className="text-amber-400 font-bold mb-1">📁 Target Build Directory Structure:</div>
              <div>public/</div>
              <div className="pl-4 text-emerald-400">└── unity/</div>
              <div className="pl-8 text-slate-400">└── Build/</div>
              <div className="pl-12 text-slate-300">├── MaliGoUniverse.loader.js</div>
              <div className="pl-12 text-slate-300">├── MaliGoUniverse.data</div>
              <div className="pl-12 text-slate-300">├── MaliGoUniverse.framework.js</div>
              <div className="pl-12 text-slate-300">└── MaliGoUniverse.wasm</div>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" />
                <span>Unity Bridge Communication:</span>
              </div>
              <span className="text-emerald-400 font-mono font-bold">READY (Active)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: C# & JS BRIDGE CODE EXPORTER */}
      {activeTab === "CSHARP_CODE" && (
        <div className="pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-black text-white">1. C# Unity Controller Script (<code className="text-amber-400 font-mono">MaliGoWorldController.cs</code>)</h4>
              <p className="text-xs text-slate-400">Drop this script on your root Manager GameObject in Unity.</p>
            </div>
            <button
              onClick={() => copyToClipboard(csBridgeCode, "cs")}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {copiedScript === "cs" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedScript === "cs" ? "Copied!" : "Copy C# Code"}</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-[11px] text-amber-200 overflow-x-auto max-h-60 leading-relaxed">
            {csBridgeCode}
          </pre>

          <div className="flex items-center justify-between pt-3">
            <div>
              <h4 className="text-sm font-black text-white">2. Unity JS Library Plugin (<code className="text-indigo-400 font-mono">ReactBridge.jslib</code>)</h4>
              <p className="text-xs text-slate-400">Place inside <code className="text-indigo-300 font-mono">Assets/Plugins/WebGL/ReactBridge.jslib</code> in Unity.</p>
            </div>
            <button
              onClick={() => copyToClipboard(jslibCode, "jslib")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {copiedScript === "jslib" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedScript === "jslib" ? "Copied!" : "Copy JSLIB"}</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-[11px] text-indigo-200 overflow-x-auto max-h-40 leading-relaxed">
            {jslibCode}
          </pre>
        </div>
      )}

      {/* TAB 4: MOBILE & BUILD SIZE OPTIMIZATION TIPS */}
      {activeTab === "OPTIMIZATION" && (
        <div className="pt-5 space-y-4">
          <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-3">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Unity WebGL Build & Download Size Mitigation Strategies
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-emerald-400">1. Universal Render Pipeline (URP)</div>
                <p className="text-slate-300 leading-relaxed">
                  Use low-poly stylized art assets (e.g., Synty Studios style) with unlit shaders to reduce shader compile sizes and GPU memory on mobile browsers.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-cyan-400">2. Brotli / Gzip Compression</div>
                <p className="text-slate-300 leading-relaxed">
                  Enable Brotli compression in Unity Project Settings &gt; Player &gt; WebGL. Reduces the <code className="text-cyan-300 font-mono">.wasm</code> download footprint from 45MB down to ~8-12MB!
                </p>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-amber-400">3. Addressables & Asset Bundles</div>
                <p className="text-slate-300 leading-relaxed">
                  Keep initial load under 5MB by streaming high-resolution 3D models only when the player unlocks new estate ranks or mini-games.
                </p>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-pink-400">4. Texture Compression (ASTC / WebP)</div>
                <p className="text-slate-300 leading-relaxed">
                  Compress environment lightmaps and character textures to 512x512 with ASTC/ETC2 compression.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
