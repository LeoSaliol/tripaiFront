"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "@/components/AuthProvider";
import { trips } from "@/lib/api";
import DayList from "@/components/DayList";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";
import type { Trip } from "@/types";

const budgetLabels: Record<string, string> = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
};

const TripMap = dynamic(() => import("@/components/TripMap"), { ssr: false });

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState(false);
  const [focusStop, setFocusStop] = useState<{ dayIndex: number; stopIndex: number } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function fetchTrip() {
      try {
        const data = await trips.get(id);
        setTrip(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar el viaje");
      } finally {
        setLoading(false);
      }
    }
    fetchTrip();
  }, [id]);

  async function handleDelete() {
    if (!trip) return;
    setDeleting(true);
    try {
      await trips.remove(trip._id);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  async function toggleVisibility() {
    if (!trip) return;
    setToggling(true);
    try {
      const updated = await trips.update(trip._id, { isPublic: !trip.isPublic });
      setTrip(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setToggling(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-muted/30 border-t-brand-gold" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex text-sm text-brand-gold hover:text-brand-gold transition-colors"
        >
          ← Volver a mis viajes
        </Link>
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/trip/${trip._id}`
    : "";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-brand-muted hover:text-brand-gold transition-colors"
        >
          ← Mis viajes
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-light font-heading">
            {trip.destination}
          </h1>
          <p className="mt-1 text-sm text-brand-muted">
            {trip.durationDays} {trip.durationDays === 1 ? "día" : "días"} · Presupuesto: {budgetLabels[trip.preferences.budget] || trip.preferences.budget}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {trip.isPublic && (
            <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-brand-surface px-3 py-2">
              <input
                readOnly
                value={shareUrl}
                onClick={(e) => e.currentTarget.select()}
                className="w-64 bg-transparent text-xs text-brand-muted outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  setShowCopyToast(true);
                }}
                className="text-brand-muted hover:text-brand-gold transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          )}

          {isAuthenticated && (
            <>
              <button
                onClick={toggleVisibility}
                disabled={toggling}
                className={`inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  trip.isPublic
                    ? "border-brand-muted/30 text-brand-muted hover:border-brand-muted/50 hover:text-brand-light"
                    : "border-brand-gold text-brand-gold hover:bg-brand-gold/20"
                }`}
              >
                {toggling
                  ? "Cambiando..."
                  : trip.isPublic
                    ? "Público"
                    : "Hacer público"}
              </button>
              <button
                onClick={() => setDeleteOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-600/50 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-600/20 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>

      <Toast open={showCopyToast} onClose={() => setShowCopyToast(false)}>
        ¡Link copiado al portapapeles!
      </Toast>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar itinerario"
        confirmLabel="Eliminar"
        loading={deleting}
      >
        ¿Estás seguro de que querés eliminar el itinerario de{" "}
        <strong className="text-brand-light">{trip.destination}</strong>?
        Esta acción no se puede deshacer.
      </Modal>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <DayList
            days={trip.days}
            focusStop={focusStop}
            onStopClick={(dayIndex, stopIndex) => setFocusStop({ dayIndex, stopIndex })}
          />
        </div>
        <div className="lg:col-span-3">
          <div className="sticky top-20 rounded-xl border border-white/5 bg-brand-surface overflow-hidden">
            <TripMap days={trip.days} focusStop={focusStop} />
          </div>
        </div>
      </div>
    </div>
  );
}
