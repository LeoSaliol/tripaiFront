"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Trip } from "@/types";

const budgetLabels: Record<string, string> = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
};

interface TripCardProps {
  trip: Trip;
}

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export default function TripCard({ trip }: TripCardProps) {
  const [date, setDate] = useState("");

  useEffect(() => {
    const d = new Date(trip.createdAt);
    setDate(`${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`);
  }, [trip.createdAt]);

  return (
    <div className="rounded-xl border border-white/5 bg-brand-surface p-5 hover:border-brand-muted/20 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-brand-light font-heading">
          {trip.destination}
        </h3>
        {trip.isPublic && (
          <span className="rounded-full bg-brand-gold/20 px-2.5 py-0.5 text-xs font-medium text-brand-gold">
            Público
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-sm text-brand-muted">
        <span>🗓️ {trip.durationDays} {trip.durationDays === 1 ? "día" : "días"}</span>
        <span>💰 {budgetLabels[trip.preferences.budget] || trip.preferences.budget}</span>
        <span>📅 {date}</span>
      </div>

      {trip.preferences.interests.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {trip.preferences.interests.map((interest) => (
            <span
              key={interest}
              className="rounded-md bg-brand-dark px-2 py-0.5 text-xs text-brand-muted"
            >
              {interest}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4">
        <Link
          href={`/trip/${trip._id}`}
          className="inline-flex items-center gap-1 rounded-lg bg-brand-gold px-4 py-2 text-sm font-medium text-brand-dark hover:brightness-110 transition-all"
        >
          Ver itinerario
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
