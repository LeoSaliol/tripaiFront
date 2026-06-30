"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  return (
    <div className="flex flex-1 flex-col">
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-brand-gold animate-pulse" />
            <span className="text-sm font-medium text-brand-gold">
              Viajes inteligentes con IA
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-brand-light sm:text-5xl md:text-6xl font-heading">
            Tu próximo viaje,
            <br />
            <span className="text-brand-gold">diseñado por IA</span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-brand-muted sm:text-xl">
            TripAI genera itinerarios personalizados al instante.
            Contanos tus preferencias y recibí un plan de viaje completo
            con mapa interactivo, paradas recomendadas y tiempos sugeridos.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/generate"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand-gold px-8 text-base font-semibold text-brand-dark shadow-lg shadow-brand-gold/25 hover:brightness-110 transition-all sm:w-auto"
            >
              Crear mi itinerario
            </Link>
            {!isLoading && isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-brand-muted/40 px-8 text-base font-semibold text-brand-light hover:border-brand-muted hover:text-brand-gold transition-all sm:w-auto"
              >
                Ver mis viajes
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-brand-muted/40 px-8 text-base font-semibold text-brand-light hover:border-brand-muted hover:text-brand-gold transition-all sm:w-auto"
              >
                Crear cuenta gratis
              </Link>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-brand-surface py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <a
            href="https://github.com/LeoSaliol"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brand-muted hover:text-brand-gold transition-colors"
          >
            Hecho por Leonel M Saliol
          </a>
        </div>
      </footer>
    </div>
  );
}
