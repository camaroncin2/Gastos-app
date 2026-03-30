"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  accentColor?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  accentColor = "orange",
}: StatCardProps) {
  const trendColors = {
    up: "text-green-500 bg-green-50 dark:bg-green-500/10",
    down: "text-red-500 bg-red-50 dark:bg-red-500/10",
    neutral: "text-gray-500 bg-gray-50 dark:bg-gray-500/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 md:p-6 relative overflow-hidden transition-colors"
    >
      <div className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 translate-x-6 md:translate-x-8 -translate-y-6 md:-translate-y-8 rounded-full bg-orange-50 dark:bg-orange-500/5 opacity-50" />
      
      <div className="flex items-start justify-between relative">
        <div className="space-y-3">
          <span className="text-[10px] md:text-sm font-medium text-gray-400 uppercase tracking-wide">
            {title}
          </span>
          <div>
            <p className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          {trend && trendValue && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${trendColors[trend]}`}
            >
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}{" "}
              {trendValue}
            </span>
          )}
        </div>
        <div
          className={`p-2 md:p-3 rounded-xl ${
            accentColor === "orange"
              ? "bg-orange-50 dark:bg-orange-500/10 text-orange-400"
              : accentColor === "green"
              ? "bg-green-50 dark:bg-green-500/10 text-green-500"
              : accentColor === "red"
              ? "bg-red-50 dark:bg-red-500/10 text-red-500"
              : "bg-gray-50 dark:bg-gray-500/10 text-gray-500"
          }`}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
