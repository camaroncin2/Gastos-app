"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-300 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 max-w-xs mb-6">{description}</p>
      {action}
    </motion.div>
  );
}
