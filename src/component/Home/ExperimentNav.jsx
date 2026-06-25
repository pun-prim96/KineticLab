import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FlaskConical, Zap, Gauge, ArrowRight } from "lucide-react";

const experiments = [
  {
    number: "01",
    title: "The Work Engine",
    subtitle: "Box Pulling Simulation",
    description: "Discover how pulling force and distance combine to produce work. Adjust variables and see real-time calculations.",
    path: "/experiment/work",
    icon: FlaskConical,
    gradient: "from-blue-500 to-blue-700",
    border: "border-blue-200 hover:border-blue-400",
    accent: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    number: "02",
    title: "The Energy Flux",
    subtitle: "Ramp & Ball Experiment",
    description: "Watch potential energy transform into kinetic energy as a ball rolls down a ramp from different heights.",
    path: "/experiment/energy",
    icon: Zap,
    gradient: "from-amber-500 to-amber-700",
    border: "border-amber-200 hover:border-amber-400",
    accent: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    number: "03",
    title: "The Power Profiler",
    subtitle: "Stair Climbing Experiment",
    description: "Compare walking vs running up stairs and see why climbing faster produces dramatically higher power output.",
    path: "/experiment/power",
    icon: Gauge,
    gradient: "from-violet-500 to-violet-700",
    border: "border-violet-200 hover:border-violet-400",
    accent: "text-violet-600",
    bg: "bg-violet-50",
  },
];

export default function ExperimentNav() {
  return (
    <section id="experiments" className="py-20 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 mb-3">
            Select Your Experiment
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Each experiment is a fully interactive simulation. Adjust the variables, run the test, and observe the physics in action.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {experiments.map((exp, i) => (
            <motion.div
              key={exp.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
            >
              <Link
                to={exp.path}
                className={`block rounded-2xl border bg-white p-6 transition-all duration-300 group ${exp.border}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${exp.bg} flex items-center justify-center`}>
                    <exp.icon className={`w-5 h-5 ${exp.accent}`} />
                  </div>
                  <span className="formula-mono text-xs text-slate-400 font-semibold">EXP. {exp.number}</span>
                </div>

                <h3 className="font-heading font-bold text-xl text-slate-900 mb-1">{exp.title}</h3>
                <p className={`text-sm font-medium ${exp.accent} mb-3`}>{exp.subtitle}</p>
                <p className="text-slate-500 text-sm leading-relaxed mb-5">{exp.description}</p>

                <div className={`inline-flex items-center gap-1.5 text-sm font-semibold ${exp.accent} group-hover:gap-3 transition-all`}>
                  Launch Experiment <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}