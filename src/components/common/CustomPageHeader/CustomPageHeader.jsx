import React from "react";

const accentMap = {
  blue: "text-blue-600 bg-blue-100",
  emerald: "text-emerald-600 bg-emerald-100",
  amber: "text-amber-600 bg-amber-100",
  rose: "text-rose-600 bg-rose-100",
  violet: "text-violet-600 bg-violet-100",
  slate: "text-slate-600 bg-slate-200",
};

export default function CustomPageHeader({
  title,
  subtitle,
  icon,
  statValue,
  statLabel,
  statSecondaryValue,
  statSecondaryLabel,
  actionButton,
  color = "blue",
}) {
  const actionButtons = Array.isArray(actionButton)
    ? actionButton
    : actionButton
    ? [actionButton]
    : [];

  const accent = accentMap[color] || accentMap.amber;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 md:p-6 mb-6">

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        {/* Left side */}
        <div className="flex items-center gap-4">

          <div className={`p-3 rounded-xl ${accent}`}>
            {icon}
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
              {title}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex flex-wrap items-center gap-3">

          {actionButtons.map((btn, i) => (
            <div key={i}>{btn}</div>
          ))}

          {statSecondaryValue !== undefined && (
            <div className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-center">
              <div className="text-lg font-semibold text-gray-900">
                {statSecondaryValue}
              </div>
              <div className="text-xs text-gray-500">
                {statSecondaryLabel}
              </div>
            </div>
          )}

          <div className="px-5 py-2 rounded-xl bg-gray-900 text-white shadow-sm text-center">
            <div className="text-2xl font-bold leading-tight">
              {statValue}
            </div>
            <div className="text-xs opacity-80">
              {statLabel}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
