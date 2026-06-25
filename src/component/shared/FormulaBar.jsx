import React from "react";
import { motion } from "framer-motion";

export default function FormulaBar({ formula, result, color = "blue" }) {
  const colorMap = {
    blue: "from-blue-600 to-blue-700 cobalt-glow",
    amber: "from-amber-500 to-amber-600 amber-glow",
    violet: "from-violet-600 to-violet-700 violet-glow",
  };

  return (
    <motion.div
      layout
      className={`rounded-xl bg-gradient-to-r ${colorMap[color]} text-white px-5 py-3 flex items-center justify-between gap-4 flex-wrap`}
    >
      <span className="formula-mono text-sm sm:text-base font-medium opacity-90">{formula}</span>
      {result !== undefined && (
        <motion.span
          key={result}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="formula-mono text-lg sm:text-xl font-bold"
        >
          = {result}
        </motion.span>
      )}
    </motion.div>
  );
}