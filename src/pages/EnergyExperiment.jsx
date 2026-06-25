import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Play, RotateCcw, Info, BarChart3 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/shared/SectionHeader";
import DataCard from "@/components/shared/DataCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ScatterChart, Scatter } from "recharts";

const G = 9.8;

function SliderRow({ label, unit, value, min, max, step, color, onChange }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <span className={`formula-mono text-sm font-bold ${color}`}>{value} {unit}</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} />
    </div>
  );
}

export default function EnergyExperiment() {
  const [height, setHeight] = useState(4);
  const [mass, setMass] = useState(2);
  const [mu, setMu] = useState(0.1);
  const [rampAngle, setRampAngle] = useState(30);
  const [phase, setPhase] = useState("idle");
  const [display, setDisplay] = useState({ t: 0, s: 0, v: 0, rot: 0, epFrac: 1, ekFrac: 0, elossFrac: 0 });
  const [showResult, setShowResult] = useState(false);
  const [trials, setTrials] = useState([]);
  const [activeChart, setActiveChart] = useState("energy");

  const animRef = useRef(null);
  const physRef = useRef(null);

  const θ = (rampAngle * Math.PI) / 180;
  const rampLen = height / Math.sin(θ);
  const Ep = mass * G * height;
  const N_force = mass * G * Math.cos(θ);
  const Ff = mu * N_force;
  const Eloss = Ff * rampLen;
  const Ek = Math.max(0, Ep - Eloss);
  const v_final = Ek > 0 ? Math.sqrt((2 * Ek) / mass) : 0;
  const accelAlongRamp = (mass * G * Math.sin(θ) - Ff) / mass; // net accel down ramp
  const efficiency = Ep > 0 ? (Ek / Ep) * 100 : 0;

  const reset = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setPhase("idle");
    setShowResult(false);
    setDisplay({ t: 0, s: 0, v: 0, rot: 0, epFrac: 1, ekFrac: 0, elossFrac: 0 });
    physRef.current = null;
  }, []);

  const runSimulation = useCallback(() => {
    reset();
    setTimeout(() => {
      setPhase("running");
      physRef.current = { s: 0, v: 0, rot: 0, lastTs: null };

      const step = (ts) => {
        const p = physRef.current;
        if (!p) return;
        if (!p.lastTs) p.lastTs = ts;
        const dt = Math.min((ts - p.lastTs) / 1000, 0.05);
        p.lastTs = ts;

        if (accelAlongRamp > 0) {
          p.v += accelAlongRamp * dt;
          p.s += p.v * dt;
          p.rot += (p.v / 0.12) * dt * (180 / Math.PI); // ball radius ~0.12m
        } else {
          // Ball doesn't move (friction too high)
          setPhase("done");
          setShowResult(true);
          return;
        }

        const sFrac = Math.min(p.s / rampLen, 1);
        const currentH = height * (1 - sFrac);
        const currentEp = mass * G * currentH;
        const currentEloss = Ff * p.s;
        const currentEk = Math.max(0, Ep - currentEp - currentEloss);

        setDisplay({
          t: p.s,
          s: sFrac,
          v: p.v,
          rot: p.rot,
          epFrac: currentEp / Ep,
          ekFrac: Ep > 0 ? currentEk / Ep : 0,
          elossFrac: Ep > 0 ? Math.min(currentEloss / Ep, 1) : 0,
        });

        if (p.s < rampLen) {
          animRef.current = requestAnimationFrame(step);
        } else {
          setPhase("done");
          setShowResult(true);
          setTrials(prev => [...prev, {
            label: `h=${height} θ=${rampAngle}° μ=${mu}`,
            height, rampAngle, mass, mu,
            ep: +Ep.toFixed(2), ek: +Ek.toFixed(2),
            eloss: +Eloss.toFixed(2), velocity: +v_final.toFixed(2),
            rampLen: +rampLen.toFixed(2),
          }].slice(-5));
        }
      };
      animRef.current = requestAnimationFrame(step);
    }, 10);
  }, [accelAlongRamp, rampLen, height, mass, mu, Ep, Ff, Ek, Eloss, v_final, rampAngle, reset]);

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  // SVG
  const svgW = 700, svgH = 290;
  const originX = 90, originY = 250;
  const rampScale = Math.min(160 / height, 380 / rampLen, 2.5);
  const topX = originX;
  const topY = originY - height * rampScale;
  const bottomX = originX + rampLen * Math.cos(θ) * rampScale;
  const bottomY = originY;

  const sFrac = display.s;
  const ballX = topX + sFrac * (bottomX - topX);
  const ballY = topY + sFrac * (bottomY - topY);
  const ballR = 13;

  // Energy bar heights (max 120px)
  const epH = Math.max(2, display.epFrac * 120);
  const ekH = Math.max(2, display.ekFrac * 120);
  const elossH = Math.max(2, display.elossFrac * 120);

  const charts = {
    energy: {
      label: "Energy",
      content: trials.length > 1 && (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={trials}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="label" tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} />
            <YAxis tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} />
            <Tooltip contentStyle={{ fontFamily: "JetBrains Mono", fontSize: 10 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="ep" name="Ep (J)" fill="#D97706" radius={[3, 3, 0, 0]} />
            <Bar dataKey="ek" name="Ek (J)" fill="#7C3AED" radius={[3, 3, 0, 0]} />
            <Bar dataKey="eloss" name="E_loss (J)" fill="#EF4444" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    velocity: {
      label: "Angle vs v",
      content: trials.length > 1 && (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={[...trials].sort((a, b) => a.rampAngle - b.rampAngle)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="rampAngle" tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} label={{ value: "Angle (°)", position: "insideBottom", offset: -2, fontSize: 9 }} />
            <YAxis tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} />
            <Tooltip contentStyle={{ fontFamily: "JetBrains Mono", fontSize: 10 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line type="monotone" dataKey="velocity" name="v (m/s)" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    friction: {
      label: "Friction vs L",
      content: trials.length > 1 && (
        <ResponsiveContainer width="100%" height={200}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="rampLen" name="L (m)" tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} type="number" label={{ value: "Ramp L (m)", position: "insideBottom", offset: -2, fontSize: 9 }} />
            <YAxis dataKey="eloss" name="E_loss (J)" tick={{ fontSize: 9, fontFamily: "JetBrains Mono" }} />
            <Tooltip contentStyle={{ fontFamily: "JetBrains Mono", fontSize: 10 }} cursor={{ strokeDasharray: "3 3" }} />
            <Scatter name="E_loss" data={trials} fill="#EF4444" />
          </ScatterChart>
        </ResponsiveContainer>
      ),
    },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <SectionHeader icon={Zap} title="Experiment 02: The Energy Flux" subtitle="Physics-based ramp simulation with friction and real acceleration" color="amber" />

      {/* Live formula bar */}
      <div className="mt-6 glass-panel rounded-xl p-4 border border-amber-200 amber-glow">
        <div className="flex flex-wrap gap-x-5 gap-y-1 formula-mono text-sm">
          <span className="text-amber-700 font-bold">Ep={Ep.toFixed(2)}J</span>
          <span className="text-red-400">E_loss={Eloss.toFixed(2)}J</span>
          <span className="text-violet-700 font-bold">Ek={Ek.toFixed(2)}J</span>
          <span className="text-green-600 font-bold">v_f={v_final.toFixed(2)}m/s</span>
          <span className="text-indigo-500">a={accelAlongRamp.toFixed(2)}m/s²</span>
          <span className="text-slate-400">η={efficiency.toFixed(1)}%</span>
          {phase === "running" && <span className="text-amber-500 animate-pulse font-bold">v={display.v.toFixed(2)}m/s</span>}
        </div>
      </div>

      {/* Simulation Canvas */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-white overflow-hidden shadow-sm">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: 290 }}>
          <defs>
            <radialGradient id="ballGrad2" cx="35%" cy="35%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>
            <linearGradient id="skyAmber" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>
            <linearGradient id="groundAmber" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
            <filter id="ballGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <rect x="0" y="0" width={svgW} height={svgH} fill="url(#skyAmber)" />
          <rect x="0" y={originY} width={svgW} height={svgH - originY} fill="url(#groundAmber)" />
          <line x1="0" y1={originY} x2={svgW} y2={originY} stroke="#94A3B8" strokeWidth="2" />
          {Array.from({ length: 22 }).map((_, i) => (
            <line key={i} x1={i * 32} y1={originY} x2={i * 32 - 12} y2={originY + 12} stroke="#94A3B8" strokeWidth="1" />
          ))}

          {/* Ramp shadow */}
          <polygon points={`${topX + 3},${topY + 3} ${bottomX + 3},${bottomY + 3} ${topX + 3},${originY + 3}`} fill="#CBD5E1" />
          {/* Ramp surface */}
          <polygon points={`${topX},${topY} ${bottomX},${bottomY} ${topX},${originY}`} fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
          {/* Ramp surface texture */}
          {mu > 0.3 && Array.from({ length: Math.floor(rampLen * rampScale / 20) }).map((_, i) => {
            const t = (i + 0.5) / Math.floor(rampLen * rampScale / 20);
            const lx = topX + t * (bottomX - topX);
            const ly = topY + t * (bottomY - topY);
            return <line key={i} x1={lx - 4} y1={ly - 4} x2={lx + 4} y2={ly + 4} stroke="#D97706" strokeWidth="1" opacity="0.4" />;
          })}

          {/* Height marker */}
          <line x1={topX - 22} y1={topY} x2={topX - 22} y2={originY} stroke="#D97706" strokeWidth="1.5" strokeDasharray="4,3" />
          <line x1={topX - 27} y1={topY} x2={topX - 17} y2={topY} stroke="#D97706" strokeWidth="1.5" />
          <line x1={topX - 27} y1={originY} x2={topX - 17} y2={originY} stroke="#D97706" strokeWidth="1.5" />
          <text x={topX - 35} y={(topY + originY) / 2} fill="#D97706" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle" dominantBaseline="middle">{height}m</text>

          {/* Ramp length */}
          <text x={(topX + bottomX) / 2 + 12} y={(topY + bottomY) / 2 - 10} fill="#92400E" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">L={rampLen.toFixed(1)}m</text>

          {/* Angle arc */}
          <path d={`M${bottomX - 32},${bottomY} A32,32 0 0,0 ${bottomX - 32 * Math.cos(θ)},${bottomY - 32 * Math.sin(θ)}`} fill="none" stroke="#6366F1" strokeWidth="1.5" />
          <text x={bottomX - 44} y={bottomY - 14} fill="#6366F1" fontSize="10" fontFamily="JetBrains Mono">{rampAngle}°</text>

          {/* Ball with spin marks */}
          <g transform={`translate(${ballX},${ballY}) rotate(${display.rot})`}>
            <circle cx="0" cy="0" r={ballR} fill="url(#ballGrad2)" stroke="#D97706" strokeWidth="2" filter="url(#ballGlow)" />
            {/* Spin indicator lines */}
            <line x1="0" y1={-ballR + 2} x2="0" y2={ballR - 2} stroke="#92400E" strokeWidth="1" opacity="0.4" />
            <line x1={-ballR + 2} y1="0" x2={ballR - 2} y2="0" stroke="#92400E" strokeWidth="1" opacity="0.4" />
          </g>
          <text x={ballX} y={ballY + 1} fill="white" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle" dominantBaseline="middle">{mass}kg</text>

          {/* Force vectors on ball (during motion) */}
          {phase === "running" && display.s > 0.05 && display.s < 0.92 && (
            <g>
              {/* Gravity */}
              <line x1={ballX} y1={ballY + ballR} x2={ballX} y2={ballY + ballR + 30} stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrAmber2)" />
              <text x={ballX + 4} y={ballY + ballR + 30} fill="#F59E0B" fontSize="8" fontFamily="JetBrains Mono">mg</text>
              {/* Normal */}
              <line x1={ballX} y1={ballY} x2={ballX + 26 * Math.sin(θ)} y2={ballY - 26 * Math.cos(θ)} stroke="#10B981" strokeWidth="2" markerEnd="url(#arrGreen2)" />
              <text x={ballX + 28 * Math.sin(θ)} y={ballY - 28 * Math.cos(θ)} fill="#10B981" fontSize="8" fontFamily="JetBrains Mono">N</text>
              {/* Friction (up ramp) */}
              {mu > 0 && (
                <line x1={ballX} y1={ballY} x2={ballX - 22 * Math.cos(θ)} y2={ballY + 22 * Math.sin(θ)} stroke="#EF4444" strokeWidth="2" markerEnd="url(#arrRed2)" />
              )}
            </g>
          )}

          {/* Velocity arrow at bottom */}
          {phase === "done" && v_final > 0 && (
            <g>
              <line x1={bottomX + 16} y1={originY - 14}
                x2={bottomX + 16 + Math.min(v_final * 9, 130)} y2={originY - 14}
                stroke="#7C3AED" strokeWidth="2.5" markerEnd="url(#arrViolet2)" />
              <text x={bottomX + 22 + Math.min(v_final * 9, 130)} y={originY - 11} fill="#7C3AED" fontSize="10" fontFamily="JetBrains Mono">v={v_final.toFixed(2)}m/s</text>
            </g>
          )}

          {/* Energy thermometers */}
          <g transform={`translate(${svgW - 128}, 18)`}>
            {[
              { label: "Ep", color: "#D97706", barH: epH, val: (display.epFrac * Ep).toFixed(1) },
              { label: "Ek", color: "#7C3AED", barH: ekH, val: (display.ekFrac * Ep).toFixed(1) },
              { label: "Heat", color: "#EF4444", barH: elossH, val: (display.elossFrac * Ep).toFixed(1) },
            ].map((item, i) => (
              <g key={i} transform={`translate(${i * 40}, 0)`}>
                <text x="14" y="12" fill={item.color} fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">{item.label}</text>
                <rect x="4" y="18" width="20" height="120" rx="10" fill="#F1F5F9" stroke={item.color} strokeWidth="1" />
                <rect x="4" y={18 + 120 - item.barH} width="20" height={item.barH} rx="10" fill={item.color} opacity="0.85" />
                <text x="14" y="148" fill={item.color} fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">{item.val}J</text>
              </g>
            ))}
          </g>

          {/* Status */}
          {phase === "running" && (
            <text x={svgW / 2 - 60} y="18" fill="#D97706" fontSize="11" fontFamily="JetBrains Mono">v = {display.v.toFixed(2)} m/s | s = {display.t.toFixed(2)} m</text>
          )}
          {accelAlongRamp <= 0 && phase === "idle" && (
            <text x="20" y="18" fill="#EF4444" fontSize="11" fontFamily="JetBrains Mono">⚠ Friction too high — ball won't move!</text>
          )}

          {/* Legend */}
          <g transform="translate(14, 18)">
            {[{ c: "#F59E0B", l: "Gravity" }, { c: "#10B981", l: "Normal" }, { c: "#EF4444", l: "Friction" }, { c: "#7C3AED", l: "Velocity" }].map((item, i) => (
              <g key={i} transform={`translate(${i * 100}, 0)`}>
                <line x1="0" y1="6" x2="12" y2="6" stroke={item.c} strokeWidth="2" />
                <text x="15" y="10" fill="#64748B" fontSize="9" fontFamily="JetBrains Mono">{item.l}</text>
              </g>
            ))}
          </g>

          <defs>
            <marker id="arrAmber2" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto"><path d="M0,0 L6,0 L3,6 Z" fill="#F59E0B" /></marker>
            <marker id="arrGreen2" markerWidth="6" markerHeight="6" refX="3" refY="0" orient="auto"><path d="M0,6 L6,6 L3,0 Z" fill="#10B981" /></marker>
            <marker id="arrRed2" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#EF4444" /></marker>
            <marker id="arrViolet2" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#7C3AED" /></marker>
          </defs>
        </svg>
      </div>

      {/* Controls */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-xl p-6 border border-slate-200">
          <h4 className="font-heading font-semibold text-slate-800 mb-4 text-xs uppercase tracking-wide">Experiment Parameters</h4>
          <SliderRow label="Starting Height (h)" unit="m" value={height} min={1} max={10} step={0.5} color="text-amber-600" onChange={(v) => { setHeight(v); reset(); }} />
          <SliderRow label="Ramp Angle (θ)" unit="°" value={rampAngle} min={10} max={80} step={1} color="text-indigo-600" onChange={(v) => { setRampAngle(v); reset(); }} />
          <SliderRow label="Object Mass (m)" unit="kg" value={mass} min={0.5} max={20} step={0.5} color="text-slate-600" onChange={(v) => { setMass(v); reset(); }} />
          <SliderRow label="Friction Coefficient (μ)" unit="" value={mu} min={0} max={0.9} step={0.05} color="text-red-500" onChange={(v) => { setMu(v); reset(); }} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="glass-panel rounded-xl p-4 border border-slate-200 formula-mono text-sm space-y-2">
            <p className="font-semibold text-slate-700 text-xs uppercase tracking-wide mb-3">Live Physics</p>
            <div className="flex justify-between"><span className="text-slate-500">Ramp length (L)</span><span className="text-amber-600 font-bold">{rampLen.toFixed(2)} m</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Ep = mgh</span><span className="text-amber-600 font-bold">{Ep.toFixed(2)} J</span></div>
            <div className="flex justify-between"><span className="text-slate-500">N = mg·cos(θ)</span><span className="text-green-600 font-bold">{N_force.toFixed(2)} N</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Ff = μN</span><span className="text-red-500 font-bold">{Ff.toFixed(2)} N</span></div>
            <div className="flex justify-between"><span className="text-slate-500">E_loss = Ff·L</span><span className="text-red-500 font-bold">{Eloss.toFixed(2)} J</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-2"><span className="text-slate-600">Ek at bottom</span><span className="text-violet-600 font-bold">{Ek.toFixed(2)} J</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Final velocity</span><span className="text-violet-600 font-bold">{v_final.toFixed(2)} m/s</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Acceleration</span><span className="text-indigo-600 font-bold">{accelAlongRamp.toFixed(2)} m/s²</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Efficiency</span><span className={`font-bold ${efficiency > 70 ? "text-green-600" : "text-orange-500"}`}>{efficiency.toFixed(1)}%</span></div>
          </div>
          <Button onClick={runSimulation} disabled={phase === "running"} className="h-12 bg-amber-600 hover:bg-amber-700 text-white rounded-xl flex items-center gap-2">
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <DataCard label="Potential Energy" value={Ep} unit="J" color="amber" />
              <DataCard label="Energy Lost" value={Eloss} unit="J" color="slate" />
              <DataCard label="Kinetic Energy" value={Ek} unit="J" color="violet" />
              <DataCard label="Final Velocity" value={v_final} unit="m/s" color="violet" />
            </div>
            <div className="glass-panel rounded-xl p-6 border border-amber-200 amber-glow">
              <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-amber-600" /> Full Calculation
              </h3>
              <div className="grid sm:grid-cols-2 gap-6 formula-mono text-sm">
                <div className="space-y-2">
                  <p className="text-slate-500 font-semibold">Energy Setup</p>
                  <p className="text-amber-700">Ep = {mass}×{G}×{height} = <strong>{Ep.toFixed(2)} J</strong></p>
                  <p className="text-green-600">N = {mass}×{G}×cos({rampAngle}°) = <strong>{N_force.toFixed(2)} N</strong></p>
                  <p className="text-red-500">Ff = {mu}×{N_force.toFixed(2)} = <strong>{Ff.toFixed(2)} N</strong></p>
                  <p className="text-red-500">E_loss = {Ff.toFixed(2)}×{rampLen.toFixed(2)} = <strong>{Eloss.toFixed(2)} J</strong></p>
                </div>
                <div className="space-y-2">
                  <p className="text-slate-500 font-semibold">Final State</p>
                  <p className="text-violet-700">Ek = {Ep.toFixed(2)} − {Eloss.toFixed(2)} = <strong>{Ek.toFixed(2)} J</strong></p>
                  <p className="text-violet-700">v = √(2×{Ek.toFixed(2)}/{mass}) = <strong>{v_final.toFixed(2)} m/s</strong></p>
                  <p className="text-indigo-600">a_ramp = <strong>{accelAlongRamp.toFixed(2)} m/s²</strong></p>
                  <p className="text-green-600 font-bold">Efficiency = {efficiency.toFixed(1)}%</p>
                </div>
              </div>
              <div className="mt-5 p-4 bg-amber-50 rounded-lg border border-amber-100 text-sm text-slate-700">
                <strong>Insight:</strong> The ball accelerated at {accelAlongRamp.toFixed(2)} m/s² and reached {v_final.toFixed(2)} m/s at the bottom.
                Friction dissipated <span className="text-red-500 font-semibold">{Eloss.toFixed(2)} J</span> as heat — {(100 - efficiency).toFixed(1)}% of stored energy.
                {Ek <= 0 && <span className="text-red-600 font-semibold ml-1"> Friction is too high — the ball stops on the ramp!</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charts */}
      {trials.length > 1 && (
        <div className="mt-8 glass-panel rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-600" /> Trial Analysis
            </h3>
            <div className="flex gap-2">
              {Object.entries(charts).map(([key, { label }]) => (
                <button key={key} onClick={() => setActiveChart(key)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${activeChart === key ? "bg-amber-100 text-amber-700 border border-amber-200" : "text-slate-500 hover:bg-slate-100"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {charts[activeChart].content || <p className="text-slate-400 text-sm formula-mono text-center py-6">Run more trials to populate this chart.</p>}
        </div>
      )}

      <div className="mt-10 glass-panel rounded-xl p-6 border border-slate-200">
        <h3 className="font-heading font-bold text-lg text-slate-900 mb-4">Physics Concepts</h3>
        <div className="grid sm:grid-cols-4 gap-5 text-sm text-slate-600 leading-relaxed">
          <div><h4 className="font-semibold text-slate-800 mb-1">Potential Energy</h4><p>Ep = mgh. Stored gravitational energy that drives the ball.</p></div>
          <div><h4 className="font-semibold text-slate-800 mb-1">Ramp Angle</h4><p>Steeper angle → shorter ramp, less friction distance, higher acceleration.</p></div>
          <div><h4 className="font-semibold text-slate-800 mb-1">Friction Heat</h4><p>E_loss = μ·mg·cos(θ)·L converts kinetic energy into heat irreversibly.</p></div>
          <div><h4 className="font-semibold text-slate-800 mb-1">Conservation</h4><p>At μ=0: Ep = Ek exactly. Every J of loss reduces final velocity.</p></div>
        </div>
      </div>
    </div>
  );
}