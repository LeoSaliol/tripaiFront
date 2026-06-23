import type { Day } from "@/types";

const CATEGORY_ICONS: Record<string, string> = {
  landmark: "🏛️",
  food: "🍽️",
  museum: "🏛️",
  nature: "🌿",
  shopping: "🛍️",
};

interface FocusStop {
  dayIndex: number;
  stopIndex: number;
}

interface DayListProps {
  days: Day[];
  focusStop?: FocusStop | null;
  onStopClick?: (dayIndex: number, stopIndex: number) => void;
}

export default function DayList({ days, focusStop, onStopClick }: DayListProps) {
  return (
    <div className="space-y-4">
      {days.map((day, dayIndex) => (
        <details
          key={day.dayNumber}
          open={day.dayNumber === 1}
          className="group rounded-xl border border-white/5 bg-brand-surface overflow-hidden"
        >
          <summary className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-brand-dark/50 transition-colors [&::-webkit-details-marker]:hidden">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold/20 text-sm font-bold text-brand-gold">
                {day.dayNumber}
              </span>
              <div>
                <span className="text-sm font-semibold text-brand-light font-heading">
                  Día {day.dayNumber}
                </span>
                <p className="text-xs text-brand-muted">{day.title}</p>
              </div>
            </div>
            <svg
              className="h-5 w-5 text-brand-muted transition-transform group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>

          <div className="border-t border-white/5">
            {day.stops.map((stop, idx) => {
              const isActive = focusStop?.dayIndex === dayIndex && focusStop?.stopIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => onStopClick?.(dayIndex, idx)}
                  className={`flex w-full items-start gap-3 px-5 py-3 text-left transition-colors ${
                    isActive
                      ? "bg-brand-gold/15"
                      : "hover:bg-brand-dark/30"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-brand-gold text-brand-dark"
                        : "bg-brand-dark text-brand-muted"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{CATEGORY_ICONS[stop.category] || "📍"}</span>
                      <span className={`text-sm font-medium transition-colors ${
                        isActive ? "text-brand-gold" : "text-brand-light"
                      }`}>
                        {stop.name}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-brand-muted">
                      {stop.description}
                    </p>
                    {stop.suggestedTime && (
                      <span className="mt-1 inline-block text-xs text-brand-gold">
                        ⏱ {stop.suggestedTime}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </details>
      ))}
    </div>
  );
}
