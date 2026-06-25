import React from "react";
import { motion } from "framer-motion";
import { BookOpen, FlaskConical, Zap, Gauge, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeader from "@/components/shared/SectionHeader";

const sections = [
  {
    title: "Work",
    icon: FlaskConical,
    color: "blue",
    border: "border-blue-200",
    bg: "bg-blue-50",
    accent: "text-blue-600",
    link: "/experiment/work",
    formulas: [
      { name: "Work", formula: "W = F × d", description: "Work equals force multiplied by displacement in the direction of the force.", vars: ["W = Work (Joules, J)", "F = Force (Newtons, N)", "d = Displacement (meters, m)"] },
      { name: "Work (with angle)", formula: "W = F × d × cos(θ)", description: "When force is applied at an angle θ to the direction of motion.", vars: ["θ = Angle between force and displacement"] },
      { name: "Net Work", formula: "W_net = ΔKE", description: "The net work done on an object equals its change in kinetic energy (Work-Energy Theorem).", vars: ["ΔKE = Change in kinetic energy"] },
    ],
  },
  {
    title: "Energy",
    icon: Zap,
    color: "amber",
    border: "border-amber-200",
    bg: "bg-amber-50",
    accent: "text-amber-600",
    link: "/experiment/energy",
    formulas: [
      { name: "Kinetic Energy", formula: "Ek = ½ × m × v²", description: "The energy of an object in motion.", vars: ["m = Mass (kg)", "v = Velocity (m/s)"] },
      { name: "Gravitational PE", formula: "Ep = m × g × h", description: "The energy stored due to an object's height above a reference point.", vars: ["m = Mass (kg)", "g = 9.8 m/s²", "h = Height (m)"] },
      { name: "Elastic PE", formula: "Ep = ½ × k × x²", description: "Energy stored in a compressed or stretched spring.", vars: ["k = Spring constant (N/m)", "x = Displacement from rest (m)"] },
      { name: "Conservation", formula: "Ep₁ + Ek₁ = Ep₂ + Ek₂", description: "In a closed system, total mechanical energy is conserved.", vars: ["Subscripts 1 and 2 denote initial and final states"] },
    ],
  },
  {
    title: "Power",
    icon: Gauge,
    color: "violet",
    border: "border-violet-200",
    bg: "bg-violet-50",
    accent: "text-violet-600",
    link: "/experiment/power",
    formulas: [
      { name: "Power", formula: "P = W / t", description: "Power is the rate at which work is done or energy is transferred.", vars: ["P = Power (Watts, W)", "W = Work (Joules, J)", "t = Time (seconds, s)"] },
      { name: "Power (force)", formula: "P = F × v", description: "Power can also be calculated as force multiplied by velocity.", vars: ["F = Force (N)", "v = Velocity (m/s)"] },
      { name: "Efficiency", formula: "η = (P_out / P_in) × 100%", description: "The ratio of useful power output to total power input.", vars: ["η = Efficiency (%)", "P_out = Output power", "P_in = Input power"] },
    ],
  },
];

export default function Formulas() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <SectionHeader
        icon={BookOpen}
        title="Physics Formula Reference"
        subtitle="All key formulas for Work, Energy, and Power in one place"
        color="slate"
      />

      <div className="space-y-10">
        {sections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: si * 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${section.bg} flex items-center justify-center`}>
                  <section.icon className={`w-5 h-5 ${section.accent}`} />
                </div>
                <h3 className="font-heading font-bold text-xl text-slate-900">{section.title}</h3>
              </div>
              <Link to={section.link} className={`text-sm font-medium ${section.accent} flex items-center gap-1 hover:gap-2 transition-all`}>
                Try Experiment <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.formulas.map((f) => (
                <div key={f.name} className={`glass-panel rounded-xl p-5 border ${section.border}`}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{f.name}</p>
                  <p className={`formula-mono text-lg font-bold ${section.accent} mb-3`}>{f.formula}</p>
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">{f.description}</p>
                  <div className="space-y-1">
                    {f.vars.map((v) => (
                      <p key={v} className="formula-mono text-xs text-slate-400">{v}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}