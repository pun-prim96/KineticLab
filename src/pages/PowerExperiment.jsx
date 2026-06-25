import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gauge, Play, RotateCcw, Info, Users } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SectionHeader from "@/components/shared/SectionHeader";
import DataCard from "@/components/shared/DataCard";

const G = 9.8;
const STAIR_COUNT = 10;

// Animated stick figure with walking/running limb swing
function StickFigure({ progress, color, speed, label, time, stairX, stairBaseY, stairW, stairH }) {
  const stepCount = STAIR_COUNT;
  const currentStair = Math.floor(progress * stepCount);
  const subStep = (progress * stepCount) % 1;

  // Position: move along staircase
  const figX = stairX + currentStair * stairW + subStep * stairW + stairW / 2;
  const figY = stairBaseY - currentStair * stairH - subStep * stairH;

  // Limb swing — frequency proportional to speed
  const swingAmt = Math.min(speed * 0.18, 22);
  const phase = progress * stepCount * Math.PI * 2;
  const legSwing = Math.sin(phase) * swingAmt;
  const armSwing = Math.cos(phase) * swingAmt * 0.7;

  return (
    <g>
      {/* Shadow */}
      <ellipse cx={figX} cy={stairBaseY - currentStair * stairH + 4} rx="10" ry="3" fill="rgba(0,0,0,0.08)" />
      {/* Head */}
      <circle cx={figX} cy={figY - 32} r="9" fill={color} />
      {/* Torso */}
      <line x1={figX} y1={figY - 23} x2={figX} y2={figY - 4} stroke={color} strokeWidth="3" strokeLinecap="round" />
      {/* Arms */}
      <line x1={figX} y1={figY - 18} x2={figX - 12 + armSwing} y2={figY - 9} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1={figX} y1={figY - 18} x2={figX + 12 - armSwing} y2={figY - 9} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* Legs */}
      <line x1={figX} y1={figY - 4} x2={figX - 7 - legSwing} y2={figY + 12} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1={figX} y1={figY - 4} x2={figX + 7 + legSwing} y2={figY + 12} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* Label above */}
      <text x={figX} y={figY - 44} fill={color} fontSize="10" fontFamily="Inter" fontWeight="700" textAnchor="middle">{label}</text>
      <text x={figX} y={figY - 55} fill="#94A3B8" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">t={time}s</text>
    </g>
  );
}

function PowerMeter({ value, max, label, color, animating }) {
  const clampedFrac = Math.min(value / max, 1);
  const angle = clampedFrac * 180;
  const arcLen = 110;

  return (
    <div className="glass-panel rounded-xl px-4 py-3 border border-slate-200 flex flex-col items-center min-w-[110px]">
      <svg width="90" height="54" viewBox="0 0 90 54">
        {/* Background arc */}
        <path d="M8,50 A37,37 0 0,1 82,50" fill="none" stroke="#E2E8F0" strokeWidth="7" strokeLinecap="round" />
        {/* Colored arc */}
        <motion.path
          d="M8,50 A37,37 0 0,1 82,50"
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${clampedFrac * arcLen} ${arcLen}`}
          initial={{ strokeDasharray: `0 ${arcLen}` }}
          animate={{ strokeDasharray: `${clampedFrac * arcLen} ${arcLen}` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        {/* Needle */}
        <motion.line
          x1="45" y1="50"
          x2={45 + 30 * Math.cos((Math.PI * (180 - angle)) / 180)}
          y2={50 - 30 * Math.sin((Math.PI * (180 - angle)) / 180)}
          stroke={color} strokeWidth="2.5" strokeLinecap="round"
          initial={{ x2: 45 + 30 * Math.cos(Math.PI), y2: 50 }}
          animate={{
            x2: 45 + 30 * Math.cos((Math.PI * (180 - angle)) / 180),
            y2: 50 - 30 * Math.sin((Math.PI * (180 - angle)) / 180),
          }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <circle cx="45" cy="50" r="3" fill={color} />
      </svg>
      <motion.span
        className="formula-mono text-sm font-bold"
        style={{ color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {value.toFixed(0)} W
      </motion.span>
      <span className="text-[10px] text-slate-400 mt-0.5">{label}</span>
    </div>
  );
}

export default function PowerExperiment() {
  const [mass, setMass] = useState(60);
  const [stairHeight, setStairHeight] = useState(3);
  const [timeA, setTimeA] = useState(10);
  const [timeB, setTimeB] = useState(4);
  const [phase, setPhase] = useState("idle");
  const [display, setDisplay] = useState({ progA: 0, progB: 0, elapsed: 0 });
  const [showResult, setShowResult] = useState(false);

  const animRef = useRef(null);
  const startTsRef = useRef(null);

  const work = mass * G * stairHeight;
  const powerA = work / timeA;
  const powerB = work / timeB;
  const maxTime = Math.max(timeA, timeB);
  // Speed in "stairs per second"
  const speedA = STAIR_COUNT / timeA;
  const speedB = STAIR_COUNT / timeB;

  const reset = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    startTsRef.current = null;
    setPhase("idle");
    setShowResult(false);
    setDisplay({ progA: 0, progB: 0, elapsed: 0 });
  }, []);

  const runSimulation = useCallback(() => {
    reset();
    setTimeout(() => {
      setPhase("running");
      startTsRef.current = null;

      const step = (ts) => {
        if (!startTsRef.current) startTsRef.current = ts;
        const elapsed = (ts - startTsRef.current) / 1000; // seconds

        const progA = Math.min(elapsed / timeA, 1);
        const progB = Math.min(elapsed / timeB, 1);
        setDisplay({ progA, progB, elapsed });

        if (elapsed < maxTime * 1.05) {
          animRef.current = requestAnimationFrame(step);
        } else {
          setPhase("done");
          setShowResult(true);
        }
      };
      animRef.current = requestAnimationFrame(step);
    }, 10);
  }, [reset, timeA, timeB, maxTime]);

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  const svgW = 700, svgH = 300;
  const stairW = 20, stairH = 18;
  const stairBaseY = 260;
  const stairAX = 80, stairBX = 400;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <SectionHeader icon={Gauge} title="Experiment 03: The Power Profiler" subtitle="Same work, different time — watch power output in real time" color="violet" />

      {/* Live formula bar */}
      <div className="mt-6 glass-panel rounded-xl p-4 border border-violet-200 violet-glow">
        <div className="flex flex-wrap gap-x-5 gap-y-1 formula-mono text-sm">
          <span className="text-violet-700 font-bold">W = mgh = {work.toFixed(1)} J</span>
          <span className="text-slate-400">|</span>
          <span className="text-indigo-600">P_A = {powerA.toFixed(1)} W</span>
          <span className="text-red-500">P_B = {powerB.toFixed(1)} W</span>
          <span className="text-slate-400">|</span>
          <span className="text-green-600">P_B / P_A = {(powerB / powerA).toFixed(2)}×</span>
          {phase === "running" && <span className="text-violet-500 animate-pulse font-bold">t = {display.elapsed.toFixed(1)}s</span>}
        </div>
      </div>

      {/* Simulation Canvas */}
      <div className="mt-6 rounded-2xl border border-violet-200 bg-white overflow-hidden shadow-sm">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: 300 }}>
          <defs>
            <linearGradient id="skyViolet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5F3FF" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width={svgW} height={svgH} fill="url(#skyViolet)" />

          {/* Ground */}
          <rect x="0" y={stairBaseY} width={svgW} height={svgH - stairBaseY} fill="#E2E8F0" />
          <line x1="0" y1={stairBaseY} x2={svgW} y2={stairBaseY} stroke="#94A3B8" strokeWidth="2" />

          {/* Stairs A */}
          {Array.from({ length: STAIR_COUNT }).map((_, i) => (
            <g key={i}>
              <rect x={stairAX + i * stairW} y={stairBaseY - (i + 1) * stairH} width={stairW} height={stairH}
                fill={i < Math.floor(display.progA * STAIR_COUNT) ? "#DDD6FE" : "#F5F3FF"}
                stroke="#7C3AED" strokeWidth="1" rx="1"
              />
            </g>
          ))}

          {/* Stairs B */}
          {Array.from({ length: STAIR_COUNT }).map((_, i) => (
            <g key={i}>
              <rect x={stairBX + i * stairW} y={stairBaseY - (i + 1) * stairH} width={stairW} height={stairH}
                fill={i < Math.floor(display.progB * STAIR_COUNT) ? "#FECACA" : "#FFF5F5"}
                stroke="#EF4444" strokeWidth="1" rx="1"
              />
            </g>
          ))}

          {/* Height markers */}
          {[
            { x: stairAX - 22, color: "#7C3AED" },
            { x: stairBX - 22, color: "#EF4444" },
          ].map((item, idx) => (
            <g key={idx}>
              <line x1={item.x} y1={stairBaseY - STAIR_COUNT * stairH} x2={item.x} y2={stairBaseY} stroke={item.color} strokeWidth="1.5" strokeDasharray="4,3" />
              <text x={item.x - 4} y={stairBaseY - STAIR_COUNT * stairH / 2} fill={item.color} fontSize="10" fontFamily="JetBrains Mono" textAnchor="end" dominantBaseline="middle">{stairHeight}m</text>
            </g>
          ))}

          {/* Person A */}
          <StickFigure
            progress={display.progA}
            color="#6366F1"
            speed={speedA * stairH}
            label="A (Walker)"
            time={timeA}
            stairX={stairAX}
            stairBaseY={stairBaseY}
            stairW={stairW}
            stairH={stairH}
          />

          {/* Person B */}
          <StickFigure
            progress={display.progB}
            color="#EF4444"
            speed={speedB * stairH}
            label="B (Runner)"
            time={timeB}
            stairX={stairBX}
            stairBaseY={stairBaseY}
            stairW={stairW}
            stairH={stairH}
          />

          {/* Section labels */}
          <text x={stairAX + STAIR_COUNT * stairW / 2} y={svgH - 8} textAnchor="middle" fill="#6366F1" fontSize="11" fontFamily="Inter" fontWeight="600">Person A — {timeA}s</text>
          <text x={stairBX + STAIR_COUNT * stairW / 2} y={svgH - 8} textAnchor="middle" fill="#EF4444" fontSize="11" fontFamily="Inter" fontWeight="600">Person B — {timeB}s</text>

          {/* Timer */}
          {phase === "running" && (
            <text x={svgW / 2} y="22" textAnchor="middle" fill="#7C3AED" fontSize="13" fontFamily="JetBrains Mono" fontWeight="700">
              t = {display.elapsed.toFixed(1)} s
            </text>
          )}

          {/* Finish line glow when person B reaches top */}
          {display.progB >= 1 && (
            <rect x={stairBX + STAIR_COUNT * stairW - 2} y={stairBaseY - STAIR_COUNT * stairH - 20} width="4" height="20" fill="#EF4444" opacity="0.6" rx="2" />
          )}
          {display.progA >= 1 && (
            <rect x={stairAX + STAIR_COUNT * stairW - 2} y={stairBaseY - STAIR_COUNT * stairH - 20} width="4" height="20" fill="#6366F1" opacity="0.6" rx="2" />
          )}
        </svg>
      </div>

      {/* Controls */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-xl p-6 border border-slate-200">
          <h4 className="font-heading font-semibold text-slate-800 mb-4 text-xs uppercase tracking-wide">Experiment Parameters</h4>
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700">Body Mass</label>
              <span className="formula-mono text-sm font-bold text-violet-600">{mass} kg</span>
            </div>
            <Slider value={[mass]} onValueChange={([v]) => { setMass(v); reset(); }} min={30} max={120} step={1} />
          </div>
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700">Stair Height</label>
              <span className="formula-mono text-sm font-bold text-violet-600">{stairHeight} m</span>
            </div>
            <Slider value={[stairHeight]} onValueChange={([v]) => { setStairHeight(v); reset(); }} min={1} max={10} step={0.5} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-indigo-600 mb-1 block">Person A Time (s)</label>
              <Input type="number" value={timeA} onChange={(e) => { setTimeA(Math.max(1, +e.target.value)); reset(); }} min={1} className="formula-mono" />
            </div>
            <div>
              <label className="text-xs font-semibold text-red-500 mb-1 block">Person B Time (s)</label>
              <Input type="number" value={timeB} onChange={(e) => { setTimeB(Math.max(1, +e.target.value)); reset(); }} min={1} className="formula-mono" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="glass-panel rounded-xl p-4 border border-slate-200 formula-mono text-sm space-y-2">
            <p className="font-semibold text-slate-700 text-xs uppercase tracking-wide mb-3">Live Power Breakdown</p>
            <div className="flex justify-between"><span className="text-slate-500">W = mgh</span><span className="text-violet-600 font-bold">{work.toFixed(1)} J</span></div>
            <div className="flex justify-between"><span className="text-slate-500">P_A = W/t_A</span><span className="text-indigo-600 font-bold">{powerA.toFixed(1)} W</span></div>
            <div className="flex justify-between"><span className="text-slate-500">P_B = W/t_B</span><span className="text-red-500 font-bold">{powerB.toFixed(1)} W</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-2"><span className="text-slate-600">Ratio P_B/P_A</span><span className="text-green-600 font-bold">{(powerB / powerA).toFixed(2)}×</span></div>
          </div>
          {showResult && (
            <div className="flex gap-3 justify-center">
              <PowerMeter value={powerA} max={Math.max(powerA, powerB) * 1.4} label="Person A" color="#6366F1" />
              <PowerMeter value={powerB} max={Math.max(powerA, powerB) * 1.4} label="Person B" color="#EF4444" />
            </div>
          )}
          <Button onClick={runSimulation} disabled={phase === "running"} className="h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-xl flex items-center gap-2">
            <Play className="w-4 h-4" /> Run Simulation
          </Button>
          <Button onClick={reset} variant="outline" className="h-12 rounded-xl flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {showResult && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <DataCard label="Mass" value={mass} unit="kg" color="slate" />
              <DataCard label="Height" value={stairHeight} unit="m" color="violet" />
              <DataCard label="Work Done" value={work} unit="J" color="violet" />
              <DataCard label="Power A" value={powerA} unit="W" color="violet" />
              <DataCard label="Power B" value={powerB} unit="W" color="violet" />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="glass-panel rounded-xl p-6 border border-indigo-200">
                <h4 className="font-heading font-semibold text-indigo-700 flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4" /> Person A — Walking
                </h4>
                <div className="space-y-2 formula-mono text-sm">
                  <p className="text-slate-600">W = {mass}×{G}×{stairHeight} = {work.toFixed(1)} J</p>
                  <p className="text-slate-600">P = {work.toFixed(1)} / {timeA} s</p>
                  <p className="text-indigo-700 font-bold text-lg">P = {powerA.toFixed(1)} W</p>
                </div>
              </div>
              <div className="glass-panel rounded-xl p-6 border border-red-200">
                <h4 className="font-heading font-semibold text-red-600 flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4" /> Person B — Running
                </h4>
                <div className="space-y-2 formula-mono text-sm">
                  <p className="text-slate-600">W = {mass}×{G}×{stairHeight} = {work.toFixed(1)} J</p>
                  <p className="text-slate-600">P = {work.toFixed(1)} / {timeB} s</p>
                  <p className="text-red-600 font-bold text-lg">P = {powerB.toFixed(1)} W</p>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-xl p-6 border border-violet-200 violet-glow">
              <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-violet-600" /> Key Insight
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                <strong>Both climbers do the same work</strong> ({work.toFixed(1)} J) — same mass, same height.
                But Person B produces <strong>{(powerB / powerA).toFixed(2)}× more power</strong> ({powerB.toFixed(1)} W vs {powerA.toFixed(1)} W)
                because they do it in {timeB}s instead of {timeA}s. Power = rate of energy delivery.
                Sprinting up stairs feels much harder because your body must supply fuel {(powerB / powerA).toFixed(2)}× faster.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 glass-panel rounded-xl p-6 border border-slate-200">
        <h3 className="font-heading font-bold text-lg text-slate-900 mb-4">Understanding Power</h3>
        <div className="grid sm:grid-cols-3 gap-6 text-sm text-slate-600 leading-relaxed">
          <div><h4 className="font-semibold text-slate-800 mb-2">Work Against Gravity</h4><p>W = mgh — same for both climbers. The height and mass determine the total energy needed.</p></div>
          <div><h4 className="font-semibold text-slate-800 mb-2">Power = Work / Time</h4><p>Power is the rate of doing work. Less time → more power. P = W/t measured in Watts (J/s).</p></div>
          <div><h4 className="font-semibold text-slate-800 mb-2">Real-World Scale</h4><p>A light bulb ≈ 60W. Walking upstairs ≈ 200–400W. Elite athletes can sustain 1,000W briefly.</p></div>
        </div>
      </div>
    </div>
  );
}