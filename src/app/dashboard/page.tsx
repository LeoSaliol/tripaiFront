"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { trips } from "@/lib/api";
import TripCard from "@/components/TripCard";
import type { Trip } from "@/types";

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [tripList, setTripList] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    async function fetchTrips() {
      try {
        const data = await trips.list();
        setTripList(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar viajes");
      } finally {
        setLoading(false);
      }
    }

    fetchTrips();
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-muted/30 border-t-brand-gold" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-light font-heading">
            Mis viajes
          </h1>
          <p className="mt-1 text-sm text-brand-muted">
            {tripList.length} {tripList.length === 1 ? "itinerario guardado" : "itinerarios guardados"}
          </p>
        </div>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-gold px-5 py-2.5 text-sm font-semibold text-brand-dark hover:brightness-110 transition-all"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo itinerario
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-brand-surface p-5 animate-pulse">
              <div className="h-5 w-2/3 rounded bg-brand-dark" />
              <div className="mt-3 flex flex-wrap gap-4">
                <div className="h-4 w-20 rounded bg-brand-dark" />
                <div className="h-4 w-16 rounded bg-brand-dark" />
                <div className="h-4 w-24 rounded bg-brand-dark" />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <div className="h-5 w-16 rounded-md bg-brand-dark" />
                <div className="h-5 w-20 rounded-md bg-brand-dark" />
              </div>
              <div className="mt-4">
                <div className="h-9 w-28 rounded-lg bg-brand-dark" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-8 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      ) : tripList.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <span className="text-4xl">🗺️</span>
          <h2 className="mt-4 text-lg font-semibold text-brand-light font-heading">
            No tenés viajes guardados
          </h2>
          <p className="mt-2 text-sm text-brand-muted">
            Generá tu primer itinerario con IA
          </p>
          <Link
            href="/generate"
            className="mt-6 rounded-lg bg-brand-gold px-6 py-2.5 text-sm font-semibold text-brand-dark hover:brightness-110 transition-all"
          >
            Crear itinerario
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tripList.map((trip) => (
            <TripCard key={trip._id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
