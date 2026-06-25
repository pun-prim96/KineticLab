import React from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";

const WORK_IMG = "https://media.base44.com/images/public/6a3d3a422e67993e4dbef095/c07e0e1d9_generated_a5b7c329.png";
const ENERGY_IMG = "https://media.base44.com/images/public/6a3d3a422e67993e4dbef095/cf8d4621a_generated_08b35eb3.png";
const POWER_IMG = "https://media.base44.com/images/public/6a3d3a422e67993e4dbef095/722fff55b_generated_f0bc461c.png";

const concepts = [
  {
    title: "Work",
    formula: "W = F × d",
    description: "Work is the energy transferred when a force moves an object through a distance. It is measured in Joules (J).",
    color: "blue",
    border: "border-blue-200 hover:border-blue-400",
    badge: "bg-blue-50 text-blue-700",
    img: WORK_IMG,
  },
  {
    title: "Energy",
    formula: "E = mgh  |  E = ½mv²",
    description: "Energy is the capacity to do work. Potential energy is stored energy due to position, while kinetic energy is the energy of motion.",
    color: "amber",
    border: "border-amber-200 hover:border-amber-400",
    badge: "bg-amber-50 text-amber-700",
    img: ENERGY_IMG,
  },
  {
    title: "Power",
    formula: "P = W / t",
    description: "Power is the rate of doing work — how fast energy is transferred. It is measured in Watts (W), where 1 Watt = 1 Joule per second.",
    color: "violet",
    border: "border-violet-200 hover:border-violet-400",
    badge: "bg-violet-50 text-violet-700",
    img: POWER_IMG,
  },
];

export default function ConceptCards() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-14">
        <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 mb-3">
          The Three Pillars of Mechanics
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Work, Energy, and Power are interconnected concepts that describe how forces
          interact with objects and how energy flows through physical systems.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {concepts.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className={`group rounded-2xl border bg-white overflow-hidden transition-all duration-300 ${c.border}`}
          >
            <div className="h-44 overflow-hidden">
              <img
                src={c.img}
                alt={`${c.title} concept illustration`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6">
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 ${c.badge}`}>
                {c.title}
              </div>
              <p className="formula-mono text-sm font-medium text-slate-700 mb-3">{c.formula}</p>
              <p className="text-slate-500 text-sm leading-relaxed">{c.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}