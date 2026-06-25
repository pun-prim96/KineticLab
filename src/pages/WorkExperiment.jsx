import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, Play, RotateCcw, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/shared/SectionHeader";
import DataCard from "@/components/shared/DataCard";

const G = 9.8;

function SliderRow({ label, unit, value, min, max, step, color, onChange }) {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <span className={`formula-mono text-sm font-bold ${color}`}>{value} {unit}</span>
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} />
    </div>
  );
}

export default function WorkExperiment() {
  const [force, setForce] = useState(20);
  const [angle, setAngle] = useState(15);
  const [distance, setDistance] = useState(5);
  const [mass, setMass] = useState(10);
  const [mu, setMu] = useState(0.3);
  const [phase, setPhase] = useState("idle"); // idle | running | done
  const [display, setDisplay] = useState({ boxX: 0, vel: 0, springStretch: 0, trail: [] });
  const [showResult, setShowResult] = useState(false);

  const animRef = useRef(null);
  const physRef = useRef(null);

  const θ = (angle * Math.PI) / 180;
  const Fx = force * Math.cos(θ);
  const N = Math.max(0, mass * G - force * Math.sin(θ));
  const Ff = mu * N;
  const Fnet = Fx - Ff;
  const accel = Fnet / mass;
  const W = force * distance * Math.cos(θ);
  const Wf = Ff * distance;
  const Wnet = W - Wf;
  const canMove = Fnet > 0;

  // pixels per meter
  const PX_PER_M = 44;
  const maxPx = Math.min(distance * PX_PER_M, 460);

  const reset = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setPhase("idle");
    setShowResult(false);
    setDisplay({ boxX: 0, vel: 0, springStretch: 0, trail: [] });
    physRef.current = null;
  }, []);

  const runSimulation = useCallback(() => {
    if (!canMove) return;
    reset();
    setPhase("running");
    physRef.current = { pos: 0, vel: 0, lastTs: null };

    const step = (ts) => {
      const p = physRef.current;
      if (!p) return;
      if (!p.lastTs) p.lastTs = ts;
      const dt = Math.min((ts - p.lastTs) / 1000, 0.05); // cap dt at 50ms
      p.lastTs = ts;

      // physics: v += a*dt, pos += v*dt
      p.vel += accel * dt;
      p.pos += p.vel * dt;

      const pxPos = Math.min(p.pos * PX_PER_M, maxPx);
      const progress = pxPos / maxPx;
      // spring stretch: proportional to force, oscillates slightly
      const springStretch = 1 + Math.sin(ts / 120) * 0.06 * Math.min(force / 20, 1);

      setDisplay(prev => ({
        boxX: pxPos,
        vel: p.vel,
        springStretch,
        trail: [...prev.trail.slice(-18), pxPos],
      }));

      if (p.pos * PX_PER_M < maxPx) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setPhase("done");
        setShowResult(true);
      }
    };
    animRef.current = requestAnimationFrame(step);
  }, [canMove, accel, maxPx, force, reset]);

  // Reset when params change during idle
  useEffect(() => {
    if (phase === "idle") setDisplay({ boxX: 0, vel: 0, springStretch: 0, trail: [] });
  }, [force, angle, distance, mass, mu]);

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  // SVG layout
  const svgW = 700, svgH = 230;
  const groundY = 185;
  const boxW = 46, boxH = 46;
  const boxStartX = 55;
  const boxX = boxStartX + display.boxX;
  const boxY = groundY - boxH;
  const ropeEndX = boxX + boxW;
  const ropeLen = 52 * (display.springStretch || 1);
  const ropeTargetX = ropeEndX + ropeLen * Math.cos(θ);
  const ropeEndY = boxY + boxH / 2 - ropeLen * Math.sin(θ);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <SectionHeader icon={FlaskConical} title="Experiment 01: The Work Engine" subtitle="Pull a box across a surface — angle, friction, and real physics" color="blue" />

      {/* Live formula bar */}
      <div className="mt-6 glass-panel rounded-xl p-4 border border-blue-200 cobalt-glow">
        <div className="flex flex-wrap gap-x-5 gap-y-1 formula-mono text-sm">
          <span className="text-slate-500">W = Fd·cos(θ)</span>
          <span className="text-blue-700 font-bold">= {W.toFixed(2)} J</span>
          <span className="text-red-400">Wf = {Wf.toFixed(2)} J</span>
          <span className={`font-bold ${Wnet >= 0 ? "text-green-600" : "text-red-600"}`}>Wnet = {Wnet.toFixed(2)} J</span>
          <span className="text-slate-400">|</span>
          <span className="text-indigo-500">a = {accel.toFixed(2)} m/s²</span>
          {phase === "running" && <span className="text-blue-500 animate-pulse">v = {display.vel.toFixed(2)} m/s</span>}
        </div>
      </div>

      {/* Canvas */}
      <div className="mt-6 rounded-2xl border border-blue-200 bg-white overflow-hidden shadow-sm">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: 230 }}>
          {/* Sky gradient */}
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EFF6FF" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>
            <linearGradient id="boxGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
            <filter id="boxShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#1E40AF" floodOpacity="0.25" />
            </filter>
          </defs>

          <rect x="0" y="0" width={svgW} height={svgH} fill="url(#skyGrad)" />
          {/* Ground */}
          <rect x="0" y={groundY} width={svgW} height={svgH - groundY} fill="url(#groundGrad)" />
          <line x1="0" y1={groundY} x2={svgW} y2={groundY} stroke="#94A3B8" strokeWidth="2" />
          {/* Ground hatching */}
          {Array.from({ length: 22 }).map((_, i) => (
            <line key={i} x1={i * 32} y1={groundY} x2={i * 32 - 12} y2={groundY + 12} stroke="#94A3B8" strokeWidth="1" />
          ))}

          {/* Motion trail */}
          {display.trail.map((tx, i) => (
            <rect
              key={i}
              x={boxStartX + tx + boxW / 2 - 2}
              y={boxY + boxH - 4}
              width={4}
              height={4}
              rx="2"
              fill="#93C5FD"
              opacity={(i / display.trail.length) * 0.5}
            />
          ))}

          {/* Distance ruler */}
          {Array.from({ length: Math.min(distance + 1, 13) }).map((_, i) => (
            <g key={i}>
              <line x1={boxStartX + i * PX_PER_M} y1={groundY + 2} x2={boxStartX + i * PX_PER_M} y2={groundY + 10} stroke="#94A3B8" strokeWidth="1" />
              <text x={boxStartX + i * PX_PER_M} y={groundY + 21} fill="#94A3B8" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">{i}m</text>
            </g>
          ))}

          {/* Box with shadow */}
          <rect x={boxX} y={boxY} width={boxW} height={boxH} rx="5" fill="url(#boxGrad)" stroke="#2563EB" strokeWidth="2" filter="url(#boxShadow)" />
          <text x={boxX + boxW / 2} y={boxY + boxH / 2 + 1} fill="white" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle" dominantBaseline="middle">{mass}kg</text>

          {/* Spring coils */}
          {(() => {
            const coils = 10;
            const coilW = ropeLen / coils;
            const points = Array.from({ length: coils * 2 + 1 }, (_, i) => {
              const t = i / (coils * 2);
              const cx = ropeEndX + t * ropeLen * Math.cos(θ);
              const cy = (boxY + boxH / 2) + t * (-ropeLen * Math.sin(θ));
              const perp = (i % 2 === 0 ? 0 : (i % 4 === 1 ? 4 : -4));
              return `${cx + perp * (-Math.sin(θ))},${cy + perp * Math.cos(θ)}`;
            });
            return <polyline points={points.join(" ")} fill="none" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" />;
          })()}

          {/* Rope end handle */}
          <circle cx={ropeTargetX} cy={ropeEndY} r="5" fill="#60A5FA" stroke="#2563EB" strokeWidth="1.5" />

          {/* Applied force arrow */}
          <line x1={ropeTargetX} y1={ropeEndY}
            x2={ropeTargetX + force * 1.1 * Math.cos(θ)} y2={ropeEndY - force * 1.1 * Math.sin(θ)}
            stroke="#2563EB" strokeWidth="2.5" markerEnd="url(#arrBlue)" />
          <text x={ropeTargetX + force * 1.1 * Math.cos(θ) + 6} y={ropeEndY - force * 1.1 * Math.sin(θ) + 4}
            fill="#2563EB" fontSize="10" fontFamily="JetBrains Mono">F={force}N</text>

          {/* Friction arrow */}
          {Ff > 0 && (
            <g>
              <line x1={boxX + boxW / 2} y1={groundY - 5}
                x2={Math.max(boxX + boxW / 2 - Ff * 1.6, 10)} y2={groundY - 5}
                stroke="#EF4444" strokeWidth="2" markerEnd="url(#arrRed)" />
              <text x={Math.max(boxX + boxW / 2 - Ff * 1.6 - 4, 10)} y={groundY - 9}
                fill="#EF4444" fontSize="9" fontFamily="JetBrains Mono" textAnchor="end">Ff={Ff.toFixed(1)}N</text>
            </g>
          )}

          {/* Gravity */}
          <line x1={boxX + boxW / 2} y1={boxY + boxH}
            x2={boxX + boxW / 2} y2={Math.min(boxY + boxH + mass * 2.2, groundY - 2)}
            stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrAmber)" />

          {/* Normal force */}
          <line x1={boxX + boxW / 2} y1={groundY}
            x2={boxX + boxW / 2} y2={groundY - Math.min(N * 0.45, 50)}
            stroke="#10B981" strokeWidth="2" markerEnd="url(#arrGreen)" />

          {/* Angle arc */}
          <path d={`M${ropeEndX + 24},${boxY + boxH / 2} A24,24 0 0,0 ${ropeEndX + 24 * Math.cos(θ)},${boxY + boxH / 2 - 24 * Math.sin(θ)}`}
            fill="none" stroke="#6366F1" strokeWidth="1.5" />
          <text x={ropeEndX + 30} y={boxY + boxH / 2 + 3} fill="#6366F1" fontSize="10" fontFamily="JetBrains Mono">θ={angle}°</text>

          {/* No-move warning */}
          {!canMove && phase === "idle" && (
            <text x={svgW / 2} y="22" fill="#EF4444" fontSize="12" fontFamily="JetBrains Mono" textAnchor="middle">⚠ Friction exceeds Fx — box won't move!</text>
          )}
          {phase === "running" && (
            <text x={svgW / 2} y="22" fill="#2563EB" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">
              Moving... {(display.boxX / PX_PER_M).toFixed(2)}m  |  v = {display.vel.toFixed(2)} m/s
            </text>
          )}

          {/* Legend */}
          <g transform={`translate(${svgW - 155}, 8)`}>
            {[{ c: "#2563EB", l: "Applied (F)" }, { c: "#EF4444", l: "Friction (Ff)" }, { c: "#F59E0B", l: "Gravity" }, { c: "#10B981", l: "Normal (N)" }].map((item, i) => (
              <g key={i} transform={`translate(0,${i * 18})`}>
                <line x1="0" y1="6" x2="14" y2="6" stroke={item.c} strokeWidth="2" />
                <text x="18" y="10" fill="#64748B" fontSize="9" fontFamily="JetBrains Mono">{item.l}</text>
              </g>
            ))}
          </g>

          <defs>
            <marker id="arrBlue" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#2563EB" /></marker>
            <marker id="arrRed" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#EF4444" /></marker>
            <marker id="arrAmber" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto"><path d="M0,0 L6,0 L3,6 Z" fill="#F59E0B" /></marker>
            <marker id="arrGreen" markerWidth="6" markerHeight="6" refX="3" refY="0" orient="auto"><path d="M0,6 L6,6 L3,0 Z" fill="#10B981" /></marker>
          </defs>
        </svg>
      </div>

      {/* Controls */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-xl p-6 border border-slate-200">
          <h4 className="font-heading font-semibold text-slate-800 mb-4 text-xs uppercase tracking-wide">Experiment Parameters</h4>
          <SliderRow label="Applied Force (F)" unit="N" value={force} min={1} max={100} step={1} color="text-blue-600" onChange={(v) => { setForce(v); reset(); }} />
          <SliderRow label="Pulling Angle (θ)" unit="°" value={angle} min={0} max={60} step={1} color="text-indigo-600" onChange={(v) => { setAngle(v); reset(); }} />
          <SliderRow label="Distance (d)" unit="m" value={distance} min={1} max={12} step={0.5} color="text-blue-600" onChange={(v) => { setDistance(v); reset(); }} />
          <SliderRow label="Box Mass (m)" unit="kg" value={mass} min={1} max={50} step={1} color="text-slate-600" onChange={(v) => { setMass(v); reset(); }} />
          <SliderRow label="Friction Coefficient (μ)" unit="" value={mu} min={0} max={1} step={0.05} color="text-red-500" onChange={(v) => { setMu(v); reset(); }} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="glass-panel rounded-xl p-4 border border-slate-200 formula-mono text-sm space-y-2">
            <p className="font-semibold text-slate-700 text-xs uppercase tracking-wide mb-3">Live Force Breakdown</p>
            <div className="flex justify-between"><span className="text-slate-500">Fx = F·cos(θ)</span><span className="text-blue-600 font-bold">{Fx.toFixed(2)} N</span></div>
            <div className="flex justify-between"><span className="text-slate-500">N = mg − F·sin(θ)</span><span className="text-green-600 font-bold">{N.toFixed(2)} N</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Ff = μN</span><span className="text-red-500 font-bold">{Ff.toFixed(2)} N</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Fnet = Fx − Ff</span><span className={`font-bold ${Fnet >= 0 ? "text-green-600" : "text-red-600"}`}>{Fnet.toFixed(2)} N</span></div>
            <div className="flex justify-between border-t border-slate-200 pt-2"><span className="text-slate-500">Acceleration</span><span className="text-indigo-600 font-bold">{accel.toFixed(3)} m/s²</span></div>
          </div>
          <Button onClick={runSimulation} disabled={phase === "running" || !canMove} className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              <DataCard label="Force (F)" value={force} unit="N" color="blue" />
              <DataCard label="Horizontal Fx" value={Fx} unit="N" color="blue" />
              <DataCard label="Normal (N)" value={N} unit="N" color="slate" />
              <DataCard label="Friction (Ff)" value={Ff} unit="N" color="slate" />
              <DataCard label="Work by F" value={W} unit="J" color="blue" />
              <DataCard label="Friction Loss" value={Wf} unit="J" color="slate" />
            </div>
            <div className="glass-panel rounded-xl p-6 border border-blue-200 cobalt-glow">
              <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-blue-600" /> Full Calculation
              </h3>
              <div className="grid sm:grid-cols-2 gap-6 formula-mono text-sm">
                <div className="space-y-2">
                  <p className="text-slate-500 font-semibold">Forces</p>
                  <p className="text-blue-700">Fx = {force}·cos({angle}°) = <strong>{Fx.toFixed(2)} N</strong></p>
                  <p className="text-green-600">N = {mass}×{G} − {force}·sin({angle}°) = <strong>{N.toFixed(2)} N</strong></p>
                  <p className="text-red-500">Ff = {mu}×{N.toFixed(2)} = <strong>{Ff.toFixed(2)} N</strong></p>
                  <p className="text-indigo-600">a = Fnet/m = {Fnet.toFixed(2)}/{mass} = <strong>{accel.toFixed(3)} m/s²</strong></p>
                </div>
                <div className="space-y-2">
                  <p className="text-slate-500 font-semibold">Work</p>
                  <p className="text-blue-700">W = {force}×{distance}×cos({angle}°) = <strong>{W.toFixed(2)} J</strong></p>
                  <p className="text-red-500">Wf = {Ff.toFixed(2)}×{distance} = <strong>{Wf.toFixed(2)} J</strong></p>
                  <p className={`font-bold text-base ${Wnet >= 0 ? "text-green-600" : "text-red-600"}`}>Wnet = <strong>{Wnet.toFixed(2)} J</strong></p>
                  <p className="text-slate-600">Final velocity: <strong>{display.vel.toFixed(2)} m/s</strong></p>
                </div>
              </div>
              <div className="mt-5 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-slate-700">
                <strong>Insight:</strong> Raising θ reduces normal force (less friction) but also reduces Fx. The box accelerates at <strong>{accel.toFixed(3)} m/s²</strong> and reaches <strong>{display.vel.toFixed(2)} m/s</strong> at {distance}m. Energy lost to heat: <span className="text-red-500 font-semibold">{Wf.toFixed(2)} J</span> ({W > 0 ? ((Wf / W) * 100).toFixed(1) : 0}%).
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-10 glass-panel rounded-xl p-6 border border-slate-200">
        <h3 className="font-heading font-bold text-lg text-slate-900 mb-4">Physics Concepts</h3>
        <div className="grid sm:grid-cols-4 gap-5 text-sm text-slate-600 leading-relaxed">
          <div><h4 className="font-semibold text-slate-800 mb-1">Applied Force (F)</h4><p>Only the horizontal component Fx does work against friction and accelerates the box forward.</p></div>
          <div><h4 className="font-semibold text-slate-800 mb-1">Pulling Angle (θ)</h4><p>Higher angles reduce the normal force — lowering friction — but also decrease Fx.</p></div>
          <div><h4 className="font-semibold text-slate-800 mb-1">Friction (Ff = μN)</h4><p>Kinetic friction opposes motion and converts work into heat. Lower μ means faster acceleration.</p></div>
          <div><h4 className="font-semibold text-slate-800 mb-1">Kinematics</h4><p>The box accelerates at a = Fnet/m. Velocity grows as v = at, and displacement as d = ½at².</p></div>
        </div>
      </div>
    </div>
  );
}