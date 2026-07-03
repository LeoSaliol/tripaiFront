# TripAI — Frontend

Aplicación web moderna para generar y gestionar itinerarios de viaje personalizados mediante inteligencia artificial. Construida con **Next.js 16**, **TypeScript** y **Tailwind CSS 4**, ofrece una experiencia interactiva con mapas dinámicos, edición drag & drop y autenticación segura.

## Funcionalidades

- **Autenticación segura** — Registro e inicio de sesión con JWT almacenado en cookies HTTP-only. Sesión persistente recuperada automáticamente.
- **Generación con IA** — Formulario con autocompletado de destinos, selección de intereses (Cultura, Comida, Naturaleza, Aventura, Compras) y presupuesto. El backend genera un itinerario día por día con paradas, descripciones y coordenadas.
- **Mapa interactivo** — Visualización con Leaflet y OpenStreetMap. Marcadores numerados con codificación cromática por día, popups con información y animación `flyTo` al seleccionar una parada.
- **Drag & drop** — Reordenamiento de paradas dentro de cada día mediante `@dnd-kit`, con estado de cambios pendientes y botón para guardar.
- **Itinerarios compartibles** — Cada viaje puede hacerse público para compartir mediante enlace.
- **Perfil de usuario** — Edición de nombre y email, cambio de contraseña, y eliminación de cuenta con confirmación.
- **Dashboard** — Panel con todos los viajes guardados en grilla responsive, con skeleton loader y estado vacío.

## Stack tecnológico

| Categoría | Tecnología |
|---|---|
| **Framework** | Next.js 16 (App Router) con React Compiler |
| **Lenguaje** | TypeScript 5 |
| **Estilos** | Tailwind CSS 4 con tema oscuro personalizado |
| **Mapas** | Leaflet + OpenStreetMap |
| **Drag & drop** | @dnd-kit/core, @dnd-kit/sortable |
| **Fuentes** | Syne (títulos), Inter (cuerpo) — Google Fonts |
| **Linting** | ESLint 9 con eslint-config-next |
| **HTTP client** | Fetch nativo con tipado genérico |

## Requisitos previos

- Node.js 18+
- Backend de TripAI corriendo en `http://localhost:4000`

## Inicio rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot-reload |
| `npm run build` | Compilación para producción |
| `npm run start` | Iniciar servidor de producción |
| `npm run lint` | Ejecutar ESLint |

## Proxy de API

Durante el desarrollo, todas las solicitudes a `/api/*` se redirigen automáticamente al backend mediante `next.config.ts`, eliminando problemas de CORS:

```ts
// next.config.ts
async rewrites() {
  return [
    { source: "/api/:path*", destination: "http://localhost:4000/:path*" },
  ];
}
```

## Estructura del proyecto

```
src/
├── app/                        # Páginas (App Router)
│   ├── layout.tsx              # Layout raíz (fuentes, AuthProvider, Navbar)
│   ├── page.tsx                # Landing page
│   ├── login/page.tsx          # Inicio de sesión
│   ├── register/page.tsx       # Registro
│   ├── dashboard/page.tsx      # Dashboard de viajes
│   ├── generate/page.tsx       # Generador de itinerarios
│   ├── trip/[id]/page.tsx      # Detalle del viaje con mapa
│   └── profile/page.tsx        # Edición de perfil
├── components/                 # Componentes reutilizables
│   ├── AuthProvider.tsx        # Contexto de autenticación (useAuth)
│   ├── Navbar.tsx              # Barra de navegación con dropdown de usuario
│   ├── TripCard.tsx            # Tarjeta de resumen de viaje
│   ├── DayList.tsx             # Lista expandible de días con drag & drop
│   ├── TripMap.tsx             # Mapa Leaflet con marcadores (client-side)
│   ├── LocationAutocomplete.tsx # Autocompletado de ubicaciones (Nominatim)
│   ├── Modal.tsx               # Modal de confirmación
│   └── Toast.tsx               # Notificación auto-dismissible
├── lib/
│   └── api.ts                  # Cliente HTTP tipado (auth, trips)
└── types/
    └── index.ts                # Interfaces compartidas (Stop, Day, Trip, User)
```

## Páginas principales

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Público | Landing page con hero y llamada a la acción |
| `/login` | Público | Inicio de sesión |
| `/register` | Público | Registro de nuevo usuario |
| `/dashboard` | Privado | Lista de viajes guardados del usuario |
| `/generate` | Privado | Formulario de generación con IA |
| `/trip/[id]` | Público (si es público) / Privado | Detalle del viaje con mapa interactivo |
| `/profile` | Privado | Edición de perfil, cambio de contraseña, eliminar cuenta |

## Arquitectura

El frontend se comunica con la API REST del backend mediante un cliente HTTP genérico (`src/lib/api.ts`) que utiliza `credentials: "include"` para autenticación basada en cookies. Todas las rutas privadas redirigen a `/login` si el usuario no está autenticado, verificado a través del contexto `AuthProvider` que consulta `GET /auth/me` al cargar la aplicación.

Los mapas se renderizan exclusivamente en cliente mediante `next/dynamic` con `ssr: false` para evitar errores de hidratación con Leaflet.
