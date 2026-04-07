"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  open: boolean;
  onToggle: () => void;
  calcOpen: boolean;
}

type View = "day" | "month" | "year";

const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const DAYS_SHORT = ["Lu","Ma","Mi","Ju","Vi","Sá","Do"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  // 0=Sun..6=Sat -> convert to Mon=0
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7;
}

export default function FloatingCalendar({ open, onToggle, calcOpen }: Props) {
  const today = new Date();
  const [view, setView] = useState<View>("day");
  const [curYear, setCurYear] = useState(today.getFullYear());
  const [curMonth, setCurMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<Date>(today);
  const [yearRangeStart, setYearRangeStart] = useState(
    Math.floor(today.getFullYear() / 12) * 12
  );

  // ── DAY VIEW ──────────────────────────────────────────────
  const daysInMonth = getDaysInMonth(curYear, curMonth);
  const firstDay = getFirstDayOfMonth(curYear, curMonth);

  const prevMonth = () => {
    if (curMonth === 0) { setCurMonth(11); setCurYear(y => y - 1); }
    else setCurMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (curMonth === 11) { setCurMonth(0); setCurYear(y => y + 1); }
    else setCurMonth(m => m + 1);
  };

  const isToday = (d: number) =>
    d === today.getDate() && curMonth === today.getMonth() && curYear === today.getFullYear();
  const isSelected = (d: number) =>
    d === selected.getDate() && curMonth === selected.getMonth() && curYear === selected.getFullYear();

  // ── YEAR RANGE VIEW ───────────────────────────────────────
  const years = Array.from({ length: 12 }, (_, i) => yearRangeStart + i);

  return (
    <>
      {/* Floating button — sits to the left of the calculator button */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-[5rem] z-50 w-14 h-14 rounded-full bg-sky-500 hover:bg-sky-600 active:scale-95 text-white shadow-lg shadow-sky-500/40 flex items-center justify-center transition-all duration-200"
        aria-label="Calendario"
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
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </motion.span>
          ) : (
            <motion.span
              key="cal"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <CalendarDays size={22} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Calendar panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`fixed z-50 w-[calc(100vw-1.5rem)] max-w-80 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card select-none transition-all duration-300 ${calcOpen ? "bottom-[30rem] right-3 md:bottom-24 md:right-[21rem]" : "bottom-24 right-3"}`}
          >
            {/* View toggle tabs */}
            <div className="flex border-b border-gray-100 dark:border-dark-border">
              {(["day", "month", "year"] as View[]).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={[
                    "flex-1 py-2.5 text-sm font-medium transition-colors",
                    view === v
                      ? "text-sky-500 border-b-2 border-sky-500"
                      : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300",
                  ].join(" ")}
                >
                  {v === "day" ? "Día" : v === "month" ? "Mes" : "Año"}
                </button>
              ))}
            </div>

            {/* ── DAY VIEW ── */}
            {view === "day" && (
              <div className="p-4">
                {/* Month/year header */}
                <div className="flex items-center justify-between mb-3">
                  <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface text-gray-500 dark:text-gray-400 transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setView("month")}
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                  >
                    {MONTHS[curMonth]} {curYear}
                  </button>
                  <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface text-gray-500 dark:text-gray-400 transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 mb-1">
                  {DAYS_SHORT.map(d => (
                    <div key={d} className="text-center text-xs text-gray-400 dark:text-gray-500 font-medium py-1">{d}</div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-y-1">
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                    <button
                      key={d}
                      onClick={() => setSelected(new Date(curYear, curMonth, d))}
                      className={[
                        "mx-auto w-8 h-8 rounded-full text-sm flex items-center justify-center transition-colors",
                        isSelected(d)
                          ? "bg-sky-500 text-white font-semibold"
                          : isToday(d)
                          ? "border-2 border-sky-400 text-sky-500 dark:text-sky-400 font-semibold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface",
                      ].join(" ")}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                {/* Selected date label */}
                <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
                  {selected.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            )}

            {/* ── MONTH VIEW ── */}
            {view === "month" && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setCurYear(y => y - 1)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface text-gray-500 dark:text-gray-400 transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setView("year")}
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                  >
                    {curYear}
                  </button>
                  <button onClick={() => setCurYear(y => y + 1)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface text-gray-500 dark:text-gray-400 transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {MONTHS.map((m, i) => (
                    <button
                      key={m}
                      onClick={() => { setCurMonth(i); setView("day"); }}
                      className={[
                        "py-2.5 rounded-xl text-sm font-medium transition-colors",
                        i === curMonth && curYear === today.getFullYear()
                          ? "bg-sky-500 text-white"
                          : i === today.getMonth() && curYear === today.getFullYear()
                          ? "border-2 border-sky-400 text-sky-500 dark:text-sky-400"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface",
                      ].join(" ")}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── YEAR VIEW ── */}
            {view === "year" && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setYearRangeStart(y => y - 12)}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface text-gray-500 dark:text-gray-400 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {yearRangeStart} – {yearRangeStart + 11}
                  </span>
                  <button
                    onClick={() => setYearRangeStart(y => y + 12)}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface text-gray-500 dark:text-gray-400 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {years.map(y => (
                    <button
                      key={y}
                      onClick={() => { setCurYear(y); setView("month"); }}
                      className={[
                        "py-2.5 rounded-xl text-sm font-medium transition-colors",
                        y === curYear
                          ? "bg-sky-500 text-white"
                          : y === today.getFullYear()
                          ? "border-2 border-sky-400 text-sky-500 dark:text-sky-400"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface",
                      ].join(" ")}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
