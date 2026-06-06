'use client';

import React, { useEffect, useState } from 'react';

type ProgressChartProps = {
  budget: number;
  expenses: {
    living: number;
    investment: number;
    luxury: number;
  };
};

export default function ProgressChart({ budget, expenses }: ProgressChartProps) {
  const [mounted, setMounted] = useState(false);
  const [targetPacePct, setTargetPacePct] = useState(0);
  const [currentDay, setCurrentDay] = useState(1);
  const [daysInMonth, setDaysInMonth] = useState(30);

  useEffect(() => {
    const today = new Date();
    const current = today.getDate();
    const total = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    setCurrentDay(current);
    setDaysInMonth(total);
    setTargetPacePct((current / total) * 100);

    // Add a slight delay for the animation to trigger smoothly after mount
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const totalExpense = expenses.living + expenses.investment + expenses.luxury;
  const percentage = Math.min((totalExpense / budget) * 100, 100);
  const isOverBudget = totalExpense > budget;
  const allowedExpense = budget * (targetPacePct / 100);
  const consumptionSpeedPct = allowedExpense > 0 ? (totalExpense / allowedExpense) * 100 : 0;
  const isPaceOver = consumptionSpeedPct > 100 && mounted;

  // Circle properties
  const size = 240;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate segments (use relative proportion if over budget)
  const baseValue = isOverBudget ? totalExpense : budget;
  
  const livingPct = (expenses.living / baseValue) * 100;
  const investmentPct = (expenses.investment / baseValue) * 100;
  const luxuryPct = (expenses.luxury / baseValue) * 100;

  // Dash arrays
  const livingDash = (livingPct / 100) * circumference;
  const investmentDash = (investmentPct / 100) * circumference;
  const luxuryDash = (luxuryPct / 100) * circumference;

  // Offsets for stacking
  // In SVG, dashoffset moves the start of the dash. We draw segments by setting dasharray="length, circumference"
  // and dashoffset to shift the starting position. Negative offset shifts it forward along the stroke.
  const livingOffset = 0;
  const investmentOffset = -livingDash;
  const luxuryOffset = -(livingDash + investmentDash);

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-white/50 dark:bg-black/30 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/20 dark:border-white/10">
      <div className="relative w-60 h-60">
        <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-100 dark:text-gray-800 transition-colors duration-300"
          />

          {/* Living Expenses (Blue) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#3b82f6" // blue-500
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${livingDash} ${circumference}`}
            strokeDashoffset={mounted ? livingOffset : circumference}
            className="transition-all duration-1000 ease-out drop-shadow-md"
            style={{ opacity: mounted ? 1 : 0 }}
          />

          {/* Investment (Green) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#10b981" // emerald-500
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${investmentDash} ${circumference}`}
            strokeDashoffset={mounted ? investmentOffset : circumference}
            className="transition-all duration-1000 ease-out drop-shadow-md"
            style={{ opacity: mounted ? 1 : 0, transitionDelay: '300ms' }}
          />

          {/* Luxury (Red) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#ef4444" // red-500
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${luxuryDash} ${circumference}`}
            strokeDashoffset={mounted ? luxuryOffset : circumference}
            className="transition-all duration-1000 ease-out drop-shadow-md"
            style={{ opacity: mounted ? 1 : 0, transitionDelay: '600ms' }}
          />

          {/* Target Pace Marker */}
          {mounted && (
            <line
              x1={size / 2}
              y1={size / 2 - radius - 14}
              x2={size / 2}
              y2={size / 2 - radius + 14}
              stroke="#fbbf24" // amber-400
              strokeWidth="6"
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{
                transformOrigin: 'center',
                transform: `rotate(${(targetPacePct / 100) * 360 + 90}deg)`
              }}
            />
          )}
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            今月の支出
          </span>
          <span className={`text-3xl font-bold tracking-tight ${isOverBudget ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
            ¥{totalExpense.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex w-full justify-between mt-8 px-2 gap-2 text-sm font-medium">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
          <span className="text-gray-600 dark:text-gray-300">生活費</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div>
          <span className="text-gray-600 dark:text-gray-300">投資</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
          <span className="text-gray-600 dark:text-gray-300">贅沢費</span>
        </div>
      </div>
      
      {/* Pace Alert */}
      {mounted && (
        <div className={`mt-6 w-full py-3 px-4 rounded-2xl flex flex-col items-center justify-center text-sm font-bold border transition-colors ${
          isOverBudget 
            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800/30'
            : isPaceOver
              ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/30'
              : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30'
        }`}>
          <div className="flex flex-col items-center text-center">
            <span>消費スピード: {Math.round(consumptionSpeedPct)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
