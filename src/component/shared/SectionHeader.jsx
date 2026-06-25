import React from "react";

export default function SectionHeader({ icon: Icon, title, subtitle, color = "blue" }) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50 border-blue-200",
    amber: "text-amber-600 bg-amber-50 border-amber-200",
    violet: "text-violet-600 bg-violet-50 border-violet-200",
    slate: "text-slate-700 bg-slate-50 border-slate-200",
  };

  const textColor = {
    blue: "text-blue-600",
    amber: "text-amber-600",
    violet: "text-violet-600",
    slate: "text-slate-700",
  };

  return (
    <div className="flex items-start gap-4 mb-8">
      {Icon && (
        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
          <Icon className={`w-6 h-6 ${textColor[color]}`} />
        </div>
      )}
      <div>
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900">{title}</h2>
        {subtitle && <p className="text-slate-500 mt-1 text-base">{subtitle}</p>}
      </div>
    </div>
  );
}