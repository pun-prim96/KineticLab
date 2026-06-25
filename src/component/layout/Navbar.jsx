import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Atom, FlaskConical, Zap, Gauge, BookOpen, Calculator } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { path: "/", label: "Discovery Hub", icon: Atom },
  { path: "/experiment/work", label: "Work", icon: FlaskConical, color: "text-blue-600" },
  { path: "/experiment/energy", label: "Energy", icon: Zap, color: "text-amber-600" },
  { path: "/experiment/power", label: "Power", icon: Gauge, color: "text-violet-600" },
  { path: "/formulas", label: "Formulas", icon: BookOpen },
  { path: "/calculators", label: "Calculators", icon: Calculator },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 via-violet-600 to-amber-500 flex items-center justify-center">
              <Atom className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-lg tracking-tight text-slate-900">
              Kinetic<span className="text-blue-600">Lab</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <link.icon className={`w-4 h-4 ${active ? "text-white" : link.color || ""}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 bg-white"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => {
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <link.icon className={`w-4 h-4 ${active ? "text-white" : link.color || ""}`} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}