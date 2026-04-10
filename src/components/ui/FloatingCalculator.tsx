"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, X } from "lucide-react";

interface Props {
  open: boolean;
  onToggle: () => void;
}

const BUTTONS = [
  ["C", "±", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "⌫", "="],
];

export default function FloatingCalculator({ open, onToggle }: Props) {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<string | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [waitNext, setWaitNext] = useState(false);

  const handleButton = (val: string) => {
    if (val === "C") {
      setDisplay("0");
      setPrev(null);
      setOp(null);
      setWaitNext(false);
      return;
    }

    if (val === "⌫") {
      setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : "0"));
      return;
    }

    if (val === "±") {
      setDisplay((d) => String(parseFloat(d) * -1));
      return;
    }

    if (val === "%") {
      setDisplay((d) => String(parseFloat(d) / 100));
      return;
    }

    if (["÷", "×", "−", "+"].includes(val)) {
      setPrev(display);
      setOp(val);
      setWaitNext(true);
      return;
    }

    if (val === "=") {
      if (op && prev !== null) {
        const a = parseFloat(prev);
        const b = parseFloat(display);
        let result = 0;
        if (op === "+") result = a + b;
        if (op === "−") result = a - b;
        if (op === "×") result = a * b;
        if (op === "÷") result = b !== 0 ? a / b : 0;
        const str = String(parseFloat(result.toFixed(10)));
        setDisplay(str);
        setPrev(null);
        setOp(null);
        setWaitNext(false);
      }
      return;
    }

    if (val === ".") {
      if (waitNext) {
        setDisplay("0.");
        setWaitNext(false);
        return;
      }
      if (!display.includes(".")) setDisplay((d) => d + ".");
      return;
    }

    if (waitNext) {
      setDisplay(val);
      setWaitNext(false);
    } else {
      setDisplay((d) => (d === "0" ? val : d + val));
    }
  };

  const isOperator = (v: string) => ["÷", "×", "−", "+"].includes(v);
  const isEqual = (v: string) => v === "=";

  const formatDisplay = (val: string) => {
    if (val === "" || val === "-") return val;
    const parts = val.split(".");
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.length > 1 ? `${intPart},${parts[1]}` : intPart;
  };

  const formatPrev = (val: string) => formatDisplay(val);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white shadow-lg shadow-orange-500/40 flex items-center justify-center transition-all duration-200"
        aria-label="Calculadora"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span
              key="calc"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Calculator size={22} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Calculator panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-24 right-3 z-50 w-[calc(100vw-1.5rem)] max-w-72 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card"
          >
            {/* Display */}
            <div className="px-5 pt-5 pb-3 bg-gray-50 dark:bg-dark-surface">
              {op && prev !== null && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-right h-4 truncate">
                  {formatPrev(prev)} {op}
                </p>
              )}
              {!(op && prev !== null) && <p className="h-4" />}
              <p className="text-right text-3xl font-light text-gray-800 dark:text-gray-100 truncate mt-1">
                {formatDisplay(display)}
              </p>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-4 gap-px bg-gray-200 dark:bg-dark-border p-px">
              {BUTTONS.flat().map((btn, i) => (
                <button
                  key={i}
                  onClick={() => handleButton(btn)}
                  className={[
                    "h-12 md:h-16 text-base md:text-lg font-medium flex items-center justify-center transition-all active:scale-95",
                    btn === "0" ? "" : "",
                    isEqual(btn)
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : isOperator(btn)
                      ? "bg-orange-100 hover:bg-orange-200 text-orange-600 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 dark:text-orange-400"
                      : btn === "C"
                      ? "bg-red-50 hover:bg-red-100 text-red-500 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400"
                      : "bg-white hover:bg-gray-50 text-gray-700 dark:bg-dark-card dark:hover:bg-dark-surface dark:text-gray-200",
                  ].join(" ")}
                >
                  {btn}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
