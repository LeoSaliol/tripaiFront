"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Day, Stop } from "@/types";

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
  draggable?: boolean;
  onReorder?: (dayIndex: number, stops: Stop[]) => void;
  dirtyDays?: Set<number>;
  onSaveOrder?: () => void;
  savingOrder?: boolean;
  saveOrderError?: string;
}

interface SortableStopProps {
  stop: Stop;
  idx: number;
  isActive: boolean;
  onClick: () => void;
}

function SortableStop({ stop, idx, isActive, onClick }: SortableStopProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `stop-${idx}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex w-full items-start gap-3 px-5 py-3 text-left transition-colors ${
        isDragging ? "opacity-50" : ""
      } ${isActive ? "bg-brand-gold/15" : "hover:bg-brand-dark/30"}`}
    >
      <button
        onClick={onClick}
        className="flex w-full items-start gap-3 text-left flex-1 min-w-0"
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
          {(!stop.lat || !stop.lng) && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full mt-1">
              📍 Ubicación no disponible en el mapa
            </span>
          )}
        </div>
      </button>
      <button
        {...attributes}
        {...listeners}
        className="self-center flex h-8 w-8 shrink-0 cursor-grab items-center justify-center text-base text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity active:cursor-grabbing"
        aria-label="Arrastrar para reordenar"
      >
        ⠿
      </button>
    </div>
  );
}

export default function DayList({ days, focusStop, onStopClick, draggable, onReorder, dirtyDays, onSaveOrder, savingOrder, saveOrderError }: DayListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragEnd(event: DragEndEvent, dayIndex: number) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const stops = days[dayIndex].stops;
    const oldIdx = stops.findIndex((_, i) => `stop-${i}` === active.id);
    const newIdx = stops.findIndex((_, i) => `stop-${i}` === over.id);
    if (oldIdx === -1 || newIdx === -1) return;

    const reordered = arrayMove(stops, oldIdx, newIdx);
    onReorder?.(dayIndex, reordered);
  }

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
            {draggable ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleDragEnd(event, dayIndex)}
              >
                <SortableContext
                  items={day.stops.map((_, i) => `stop-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {day.stops.map((stop, idx) => {
                    const isActive = focusStop?.dayIndex === dayIndex && focusStop?.stopIndex === idx;
                    return (
                      <SortableStop
                        key={`stop-${idx}`}
                        stop={stop}
                        idx={idx}
                        isActive={isActive}
                        onClick={() => onStopClick?.(dayIndex, idx)}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
            ) : null}
            {draggable && dirtyDays?.has(dayIndex) ? (
              <div className="border-t border-white/5 px-5 py-3">
                <button
                  onClick={onSaveOrder}
                  disabled={savingOrder}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-2.5 text-sm font-semibold text-brand-dark hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {savingOrder ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-dark border-t-transparent" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar orden"
                  )}
                </button>
                {saveOrderError && dayIndex === days.length - 1 && (
                  <p className="mt-2 text-sm text-red-400">{saveOrderError}</p>
                )}
              </div>
            ) : null}
            {!draggable && day.stops.map((stop, idx) => {
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
                    {(!stop.lat || !stop.lng) && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full mt-1">
                        📍 Ubicación no disponible en el mapa
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
