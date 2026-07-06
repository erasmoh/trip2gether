# trip2gether ✈️

Planea viajes en grupo: invita a las personas que viajan contigo y coordinen la
agenda día a día. Cada día tiene actividades con **hora, título, ubicación,
descripción y comentarios** de cada participante. **Solo las personas invitadas
a un viaje pueden verlo.**

> Estado actual: front-end en **Next.js** con **datos mockeados**. La base de
> datos en **Supabase todavía no está conectada**; el esquema previsto (con
> políticas RLS de acceso) está en [`supabase/schema.sql`](supabase/schema.sql).

## Funcionalidades

- **Registro/login sin contraseña (OTP por email)**: solo los correos invitados
  pueden entrar. Se pide el email → se "envía" un código de 6 dígitos → se
  verifica. En el primer ingreso se completa el registro (nombre). El flujo
  refleja `supabase.auth.signInWithOtp({ email })` + `verifyOtp({ email, token,
  type: 'email' })`; como aún no hay backend de email, el código se muestra en
  pantalla (modo demo).
- **Lista de viajes** filtrada por membresía: solo ves los viajes a los que te
  invitaron.
- **Itinerario por día** con pestañas por cada día del viaje.
- **Actividades** con hora de inicio/fin, ubicación y descripción.
- **Comentarios por actividad** de cada participante.
- **Permisos de edición**: el organizador puede dar o quitar el privilegio de
  edición a cada invitado. Solo quienes tienen edición pueden crear/editar
  actividades; el resto tiene acceso de solo lectura.
- **Sesión persistente** (localStorage) con cierre de sesión desde el menú del
  header. Cambia de usuario cerrando sesión e ingresando con otro correo
  invitado para ver cómo cambian el acceso y los permisos.

## Arquitectura de datos

Los tipos viven en [`src/lib/types.ts`](src/lib/types.ts) y los datos de ejemplo
en [`src/lib/mock-data.ts`](src/lib/mock-data.ts). El estado y la lógica de
acceso están en el store cliente [`src/lib/store.tsx`](src/lib/store.tsx), cuyas
funciones (`requestOtp`, `verifyOtp`, `completeRegistration`, `signOut`,
`visibleTrips`, `canAccessTrip`, `canEditTrip`, `setMemberCanEdit`,
`addActivity`, `addComment`, …) mapean 1:1 a Supabase Auth y a futuras
consultas de la base.

Modelo: `users` → `trips` → `trip_members` (rol + `can_edit`) → `activities` →
`comments`.

## Ideas futuras

- Presupuesto compartido y división de gastos.
- Votación de propuestas de actividades.
- Mapa con ubicaciones y clima por día.
- Checklist de equipaje/documentos.
- Adjuntar reservas (vuelos, hoteles) y exportar a PDF / calendario `.ics`.
- Notificaciones de cambios en el itinerario.

## Desarrollo

```bash
npm install
npm run dev    # http://localhost:3000
npm run lint
npm run build
```
