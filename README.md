# TripAI — Frontend

Aplicación web para generar y gestionar itinerarios de viaje con inteligencia artificial.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS 4
- **Mapas:** Leaflet + React-Leaflet
- **Drag & drop:** @dnd-kit
- **Fuentes:** Syne (títulos) + Inter (texto)

## Requisitos

- Node.js 18+
- El backend corriendo en `http://localhost:4000`

## Uso

```bash
npm install
npm run dev        # servidor de desarrollo en :3000
npm run build      # producción
npm run lint       # ESLint
```

## Estructura

```
src/
  app/              – Páginas (App Router)
    layout.tsx       – Layout raíz con AuthProvider y Navbar
    page.tsx         – Landing page
    login/           – Inicio de sesión
    register/        – Registro
    dashboard/       – Lista de viajes guardados
    generate/        – Generar itinerario con IA
    trip/[id]/       – Detalle del viaje con mapa
    profile/         – Editar perfil
  components/       – Componentes reutilizables
    AuthProvider.tsx  – Contexto de autenticación
    Navbar.tsx        – Barra de navegación
    TripCard.tsx      – Card de resumen de viaje
    DayList.tsx       – Lista de días con stops (drag & drop)
    TripMap.tsx       – Mapa Leaflet con marcadores
    LocationAutocomplete.tsx – Autocompletado de ubicaciones
    Modal.tsx, Toast.tsx      – Componentes de UI
  lib/api.ts        – Cliente HTTP para el backend
  types/            – Tipos compartidos
```

## Funcionalidades

- **Autenticación** con cookies HTTP-only, verificación de sesión al cargar la página
- **Generación de itinerarios** vía IA con formulario de destino, duración, intereses y presupuesto
- **Mapa interactivo** con marcadores numerados y color por día, popups con info, zoom al hacer clic
- **Drag & drop** para reordenar paradas dentro de un día
- **Itinerarios públicos/compartidos** con enlace para compartir

## Proxy de API

En desarrollo, las llamadas a `/api/*` se redirigen automáticamente al backend en `:4000` mediante `next.config.ts`:

```ts
async rewrites() {
  return [
    { source: "/api/:path*", destination: "http://localhost:4000/:path*" },
  ];
}
```
