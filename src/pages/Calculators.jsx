import React, { useState } from "react";
import { Calculator, FlaskConical, Zap, Gauge } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SectionHeader from "@/components/shared/SectionHeader";
import DataCard from "@/components/shared/DataCard";

function WorkCalc() {
  const [force, setForce] = useState("");
  const [distance, setDistance] = useState("");
  const f = parseFloat(force) || 0;
  const d = parseFloat(distance) || 0;
  const work = f * d;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Force (N)</Label>
          <Input type="number" value={force} onChange={(e) => setForce(e.target.value)} placeholder="Enter force in Newtons" className="formula-mono" />
        </div>
        <div>
          <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Distance (m)</Label>
          <Input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="Enter distance in meters" className="formula-mono" />
        </div>
      </div>

      {f > 0 && d > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <DataCard label="Force" value={f} unit="N" color="blue" />
            <DataCard label="Distance" value={d} unit="m" color="blue" />
            <DataCard label="Work" value={work} unit="J" color="blue" />
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="formula-mono text-sm text-blue-700">
              W = F × d = {f} × {d} = <strong>{work.toFixed(2)} Joules</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function EnergyCalc() {
  const [mode, setMode] = useState("potential");
  const [mass, setMass] = useState("");
  const [height, setHeight] = useState("");
  const [velocity, setVelocity] = useState("");

  const m = parseFloat(mass) || 0;
  const h = parseFloat(height) || 0;
  const v = parseFloat(velocity) || 0;
  const ep = m * 9.8 * h;
  const ek = 0.5 * m * v * v;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setMode("potential")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "potential" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100"}`}
        >
          Potential Energy
        </button>
        <button
          onClick={() => setMode("kinetic")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "kinetic" ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-700 hover:bg-violet-100"}`}
        >
          Kinetic Energy
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Mass (kg)</Label>
          <Input type="number" value={mass} onChange={(e) => setMass(e.target.value)} placeholder="Enter mass" className="formula-mono" />
        </div>
        {mode === "potential" ? (
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Height (m)</Label>
            <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Enter height" className="formula-mono" />
          </div>
        ) : (
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Velocity (m/s)</Label>
            <Input type="number" value={velocity} onChange={(e) => setVelocity(e.target.value)} placeholder="Enter velocity" className="formula-mono" />
          </div>
        )}
      </div>

      {m > 0 && ((mode === "potential" && h > 0) || (mode === "kinetic" && v > 0)) && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <DataCard label="Mass" value={m} unit="kg" color={mode === "potential" ? "amber" : "violet"} />
            <DataCard label={mode === "potential" ? "Height" : "Velocity"} value={mode === "potential" ? h : v} unit={mode === "potential" ? "m" : "m/s"} color={mode === "potential" ? "amber" : "violet"} />
            <DataCard label={mode === "potential" ? "Ep" : "Ek"} value={mode === "potential" ? ep : ek} unit="J" color={mode === "potential" ? "amber" : "violet"} />
          </div>
          <div className={`p-4 rounded-lg border ${mode === "potential" ? "bg-amber-50 border-amber-100" : "bg-violet-50 border-violet-100"}`}>
            <p className={`formula-mono text-sm ${mode === "potential" ? "text-amber-700" : "text-violet-700"}`}>
              {mode === "potential"
                ? `Ep = mgh = ${m} × 9.8 × ${h} = `
                : `Ek = ½mv² = 0.5 × ${m} × ${v}² = `}
              <strong>{(mode === "potential" ? ep : ek).toFixed(2)} Joules</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function PowerCalc() {
  const [work, setWork] = useState("");
  const [time, setTime] = useState("");
  const w = parseFloat(work) || 0;
  const t = parseFloat(time) || 0;
  const power = t > 0 ? w / t : 0;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Work (J)</Label>
          <Input type="number" value={work} onChange={(e) => setWork(e.target.value)} placeholder="Enter work in Joules" className="formula-mono" />
        </div>
        <div>
          <Label className="text-sm font-semibold text-slate-700 mb-1.5 block">Time (s)</Label>
          <Input type="number" value={time} onChange={(e) => setTime(e.target.value)} placeholder="Enter time in seconds" className="formula-mono" />
        </div>
      </div>

      {w > 0 && t > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <DataCard label="Work" value={w} unit="J" color="violet" />
            <DataCard label="Time" value={t} unit="s" color="violet" />
            <DataCard label="Power" value={power} unit="W" color="violet" />
          </div>
          <div className="p-4 bg-violet-50 rounded-lg border border-violet-100">
            <p className="formula-mono text-sm text-violet-700">
              P = W / t = {w} / {t} = <strong>{power.toFixed(2)} Watts</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Calculators() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <SectionHeader
        icon={Calculator}
        title="Interactive Calculators"
        subtitle="Quick calculations for Work, Energy, and Power"
        color="slate"
      />

      <Tabs defaultValue="work" className="mt-2">
        <TabsList className="grid grid-cols-3 h-auto p-1 bg-slate-100 rounded-xl">
          <TabsTrigger value="work" className="flex items-center gap-1.5 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg text-sm">
            <FlaskConical className="w-4 h-4" /> Work
          </TabsTrigger>
          <TabsTrigger value="energy" className="flex items-center gap-1.5 py-2.5 data-[state=active]:bg-amber-600 data-[state=active]:text-white rounded-lg text-sm">
            <Zap className="w-4 h-4" /> Energy
          </TabsTrigger>
          <TabsTrigger value="power" className="flex items-center gap-1.5 py-2.5 data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg text-sm">
            <Gauge className="w-4 h-4" /> Power
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 glass-panel rounded-xl p-6 border border-slate-200">
          <TabsContent value="work"><WorkCalc /></TabsContent>
          <TabsContent value="energy"><EnergyCalc /></TabsContent>
          <TabsContent value="power"><PowerCalc /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}