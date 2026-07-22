# trip2gether ✈️

Planea viajes en grupo: invita a las personas que viajan contigo y coordinen la
agenda día a día. Cada día tiene actividades con **hora, título, ubicación,
descripción y comentarios** de cada participante. **Solo las personas invitadas
a un viaje pueden verlo.**

> Estado actual: conectado a **Supabase** (auth + Postgres con RLS). El
> esquema vive en [`supabase/migrations`](supabase/migrations); para
> desarrollo local usa `supabase start` (ver sección Desarrollo).

## Funcionalidades

- **Registro/login sin contraseña (OTP por email)**: cualquiera puede crear
  una cuenta con su correo, sin invitación previa. Se pide el email →
  Supabase envía un código de 6 dígitos → se verifica. En el primer ingreso
  se completa el registro (nombre). Flujo real: `supabase.auth.signInWithOtp({
  email })` + `verifyOtp({ email, token, type: 'email' })`. Ver o entrar a un
  viaje específico sigue siendo solo por invitación (el organizador te agrega
  como miembro).
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

Los tipos viven en [`src/lib/types.ts`](src/lib/types.ts). El esquema real
(tablas + RLS) está en [`supabase/migrations`](supabase/migrations).
[`src/lib/store.tsx`](src/lib/store.tsx) solo maneja sesión/auth
(`requestOtp`, `verifyOtp`, `completeRegistration`, `signOut`); el resto de
los datos se lee/escribe con las funciones de
[`src/lib/supabase/queries.ts`](src/lib/supabase/queries.ts) (`fetchVisibleTrips`,
`fetchTrip`, `insertActivity`, `insertComment`, `setMemberCanEdit`, …), casi
siempre a través de los hooks de [`src/lib/hooks.ts`](src/lib/hooks.ts).
El control de acceso lo aplica Postgres vía Row Level Security, no el cliente.

Modelo: `profiles` (mirror de `auth.users`) → `trips` → `trip_members` (rol +
`can_edit`) → `activities` → `comments`.

## Ideas futuras

- Presupuesto compartido y división de gastos.
- Votación de propuestas de actividades.
- Mapa con ubicaciones y clima por día.
- Checklist de equipaje/documentos.
- Adjuntar reservas (vuelos, hoteles) y exportar a PDF / calendario `.ics`.
- Notificaciones de cambios en el itinerario.

## Desarrollo

Requiere [Docker](https://docs.docker.com/get-docker/) y la
[Supabase CLI](https://supabase.com/docs/guides/cli) para levantar el backend
local (Postgres + Auth + Studio):

```bash
npx supabase start           # levanta el stack local (primera vez tarda un poco)
npx supabase status -o env   # imprime las variables para .env.local

cp .env.example .env.local   # completa NEXT_PUBLIC_SUPABASE_* con lo anterior

npm install
npm run dev    # http://localhost:3000
npm run lint
npm run build
```

Los correos (código OTP de acceso) no se envían de verdad en local: quedan
capturados en Mailpit, `http://127.0.0.1:54324`.
