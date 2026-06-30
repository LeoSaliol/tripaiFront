"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/components/AuthProvider";
import { trips } from "@/lib/api";
import DayList from "@/components/DayList";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import type { Trip } from "@/types";

const TripMap = dynamic(() => import("@/components/TripMap"), { ssr: false });

const INTERESTS = [
  { value: "cultura", label: "Cultura" },
  { value: "comida", label: "Comida" },
  { value: "naturaleza", label: "Naturaleza" },
  { value: "aventura", label: "Aventura" },
  { value: "compras", label: "Compras" },
];

const BUDGETS = [
  { value: "low", label: "Bajo" },
  { value: "medium", label: "Medio" },
  { value: "high", label: "Alto" },
];

export default function GeneratePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [destination, setDestination] = useState("");
  const [durationDays, setDurationDays] = useState(3);
  const [interests, setInterests] = useState<string[]>([]);
  const [budget, setBudget] = useState("medium");
  const [generatedTrip, setGeneratedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [focusStop, setFocusStop] = useState<{ dayIndex: number; stopIndex: number } | null>(null);
  const [msgIndex, setMsgIndex] = useState(0);

  const loadingMessages = [
    "Consultando la inteligencia artificial...",
    "Eligiendo los mejores lugares para vos...",
    "Geocodificando las ubicaciones en el mapa...",
    "Armando tu itinerario personalizado...",
    "Casi listo, últimos detalles...",
  ];

  useEffect(() => {
    if (!loading) {
      setMsgIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-muted/30 border-t-brand-gold" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  function toggleInterest(value: string) {
    setInterests((prev) =>
      prev.includes(value)
        ? prev.filter((i) => i !== value)
        : [...prev, value]
    );
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setGeneratedTrip(null);
    try {
      const data = await trips.generate({
        destination,
        durationDays,
        interests,
        budget,
      });
      setGeneratedTrip(data as unknown as Trip);
    } catch (err) {
      const apiErr = err as any;
      if (apiErr.status === 503) {
        setError(apiErr.message);
      } else {
        setError("Hay problemas con el servidor, intentelo nuevamente en 1 minuto");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!generatedTrip) return;
    setSaving(true);
    try {
      await trips.save(generatedTrip as unknown as Trip);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el itinerario");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-brand-light font-heading">
        Generar itinerario
      </h1>
      <p className="mt-1 text-sm text-brand-muted">
        Completá los datos y la IA armará tu plan de viaje personalizado.
      </p>

      <form onSubmit={handleGenerate} className="mt-6 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-brand-muted">
              Destino
            </label>
            <LocationAutocomplete
              value={destination}
              onChange={setDestination}
              placeholder="Ej: Buenos Aires, Argentina"
            />
          </div>

          <div>
            <label htmlFor="days" className="block text-sm font-medium text-brand-muted">
              Duración (días)
            </label>
            <select
              id="days"
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="mt-1 block w-full rounded-lg border border-brand-muted/30 bg-brand-dark px-4 py-2.5 text-brand-light focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold transition-colors"
            >
              {Array.from({ length: 14 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "día" : "días"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-muted">
              Intereses
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest.value}
                  type="button"
                  onClick={() => toggleInterest(interest.value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    interests.includes(interest.value)
                      ? "border-brand-gold bg-brand-gold/20 text-brand-gold"
                      : "border-brand-muted/30 bg-brand-dark text-brand-muted hover:border-brand-muted/50"
                  }`}
                >
                  {interest.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-muted">
              Presupuesto
            </label>
            <div className="mt-2 flex gap-2">
              {BUDGETS.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => setBudget(b.value)}
                  className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    budget === b.value
                      ? "border-brand-gold bg-brand-gold/20 text-brand-gold"
                      : "border-brand-muted/30 bg-brand-dark text-brand-muted hover:border-brand-muted/50"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-gold px-6 py-2.5 text-sm font-semibold text-brand-dark hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-dark border-t-transparent" />
              Generando itinerario...
            </>
          ) : (
            "Generar itinerario"
          )}
        </button>
      </form>

      {generatedTrip && (
        <div className="mt-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-brand-light font-heading">
              {generatedTrip.destination}
            </h2>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-gold px-6 py-2.5 text-sm font-semibold text-brand-dark hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? "Guardando..." : "Guardar itinerario"}
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <DayList
                days={generatedTrip.days}
                focusStop={focusStop}
                onStopClick={(dayIndex, stopIndex) => setFocusStop({ dayIndex, stopIndex })}
              />
            </div>
            <div className="lg:col-span-3">
              <div className="sticky top-20 rounded-xl border border-white/5 bg-brand-surface overflow-hidden">
                <TripMap days={generatedTrip.days} focusStop={focusStop} />
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="w-12 h-12 border-4 border-brand-surface border-t-brand-gold rounded-full animate-spin" />
          <p className="text-brand-light text-lg font-medium text-center transition-all duration-500">
            {loadingMessages[msgIndex]}
          </p>
          <div className="w-64 h-1 bg-brand-surface rounded-full overflow-hidden">
            <div className="h-full bg-brand-gold rounded-full animate-pulse w-3/4" />
          </div>
          <p className="text-brand-muted text-sm">Esto puede tardar hasta 20 segundos</p>
        </div>
      )}
    </div>
  );
}
