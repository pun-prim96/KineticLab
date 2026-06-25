import React from "react";
import { Link } from "react-router-dom";
import { Atom, FlaskConical, Zap, Gauge, BookOpen, Calculator } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 via-violet-500 to-amber-400 flex items-center justify-center">
                <Atom className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-lg tracking-tight">
                Kinetic<span className="text-blue-400">Lab</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              An interactive physics learning platform helping students master Work, Energy, and Power through hands-on virtual experiments.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">Experiments</h4>
            <div className="space-y-2.5">
              <Link to="/experiment/work" className="flex items-center gap-2 text-slate-400 hover:text-blue-400 text-sm transition-colors">
                <FlaskConical className="w-4 h-4" /> Work — Box Pulling
              </Link>
              <Link to="/experiment/energy" className="flex items-center gap-2 text-slate-400 hover:text-amber-400 text-sm transition-colors">
                <Zap className="w-4 h-4" /> Energy — Ramp Experiment
              </Link>
              <Link to="/experiment/power" className="flex items-center gap-2 text-slate-400 hover:text-violet-400 text-sm transition-colors">
                <Gauge className="w-4 h-4" /> Power — Stair Climbing
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">Resources</h4>
            <div className="space-y-2.5">
              <Link to="/formulas" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
                <BookOpen className="w-4 h-4" /> Formula Reference
              </Link>
              <Link to="/calculators" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
                <Calculator className="w-4 h-4" /> Interactive Calculators
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} Kinetic Laboratory. Built for curious minds.
          </p>
        </div>
      </div>
    </footer>
  );
}