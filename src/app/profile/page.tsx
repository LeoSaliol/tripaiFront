"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { auth } from "@/lib/api";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, login, logout } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [authLoading, isAuthenticated, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const body: { name?: string; email?: string; currentPassword?: string; newPassword?: string } = {};
      if (name !== user?.name) body.name = name;
      if (email !== user?.email) body.email = email;
      if (newPassword) {
        if (!currentPassword) { setError("Ingresá tu contraseña actual"); setSaving(false); return; }
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      if (Object.keys(body).length === 0) {
        setSuccess("No hay cambios para guardar");
        setTimeout(() => setSuccess(""), 3000);
        return;
      }
      const data = await auth.updateProfile(body);
      if (data.user) {
        login(data.user);
      }
      setSuccess("Perfil actualizado correctamente");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletePassword) {
      setDeleteError("Ingresá tu contraseña para confirmar");
      return;
    }
    setDeleteError("");
    setDeleting(true);
    try {
      await auth.deleteAccount({ password: deletePassword });
      logout();
      router.push("/");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Error al eliminar la cuenta");
    } finally {
      setDeleting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-muted/30 border-t-brand-gold" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-start justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/dashboard"
          className="inline-flex text-sm text-brand-muted hover:text-brand-gold transition-colors mb-6"
        >
          ← Mis viajes
        </Link>

        <h1 className="text-2xl font-bold text-brand-light font-heading">
          Editar perfil
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          Actualizá tus datos personales
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm text-green-400">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-brand-muted">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-brand-muted/30 bg-brand-dark px-4 py-2.5 text-brand-light placeholder-brand-muted/50 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold transition-colors"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-brand-muted/30 bg-brand-dark px-4 py-2.5 text-brand-light placeholder-brand-muted/50 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold transition-colors"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-brand-muted">
              Contraseña actual
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-brand-muted/30 bg-brand-dark px-4 py-2.5 text-brand-light placeholder-brand-muted/50 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold transition-colors"
              placeholder="Tu contraseña actual"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-brand-muted">
              Nueva contraseña
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              minLength={6}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-brand-muted/30 bg-brand-dark px-4 py-2.5 text-brand-light placeholder-brand-muted/50 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold transition-colors"
              placeholder="Dejalo vacío si no querés cambiarla"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center rounded-lg bg-brand-gold px-4 py-2.5 text-sm font-semibold text-brand-dark hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>

        <div className="mt-12 border-t border-white/5 pt-8">
          <h2 className="text-lg font-semibold text-red-400 font-heading">
            Zona peligrosa
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            Eliminá tu cuenta y todos tus datos. Esta acción no se puede deshacer.
          </p>
          <button
            onClick={() => setDeleteOpen(true)}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-red-600/50 px-5 py-2.5 text-sm font-medium text-red-400 hover:bg-red-600/20 transition-colors"
          >
            Eliminar cuenta
          </button>
        </div>

        {deleteOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60"
            onClick={(e) => { if (e.target === e.currentTarget) { setDeleteOpen(false); setDeleteError(""); setDeletePassword(""); } }}
          >
            <div className="w-full max-w-sm rounded-xl border border-white/10 bg-brand-surface p-6 shadow-2xl">
              <h2 className="text-lg font-semibold text-brand-light font-heading">
                ¿Eliminar tu cuenta?
              </h2>
              <p className="mt-3 text-sm text-brand-muted">
                Esta acción eliminará permanentemente tu cuenta y todos tus viajes guardados. No se puede deshacer.
              </p>

              {deleteError && (
                <div className="mt-3 rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-2 text-sm text-red-400">
                  {deleteError}
                </div>
              )}

              <div className="mt-4">
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Ingresá tu contraseña para confirmar"
                  className="block w-full rounded-lg border border-brand-muted/30 bg-brand-dark px-4 py-2.5 text-brand-light placeholder-brand-muted/50 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold transition-colors"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => { setDeleteOpen(false); setDeleteError(""); setDeletePassword(""); }}
                  disabled={deleting}
                  className="rounded-lg border border-brand-muted/30 px-4 py-2 text-sm font-medium text-brand-muted hover:border-brand-muted/50 hover:text-brand-light transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
                >
                  {deleting ? "Eliminando..." : "Sí, eliminar mi cuenta"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
