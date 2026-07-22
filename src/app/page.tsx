"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";

const FEATURES = [
  {
    tag: "Itinerario",
    title: "La agenda, día a día",
    body: "Cada jornada del viaje con sus actividades, horas y lugares. Se acabó el documento suelto que nadie actualiza.",
  },
  {
    tag: "Decisiones",
    title: "Decidan juntos",
    body: "Comenta cada actividad y lleguen a acuerdos donde importa, sin perderlos en una cadena infinita de mensajes.",
  },
  {
    tag: "Privacidad",
    title: "Solo tu grupo",
    body: "Cada viaje es privado: entra únicamente quien fue invitado, con permisos de lectura o edición que controla el organizador.",
  },
  {
    tag: "Premium",
    title: "URL corta y memorable",
    body: "Comparte /trips/japon-2026 en vez de un enlace imposible de dictar. Disponible con el plan de pago.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Crea tu cuenta",
    body: "Regístrate con tu correo en segundos. Sin formularios largos ni invitación previa.",
  },
  {
    n: "02",
    title: "Entra sin contraseña",
    body: "Te enviamos un código de un solo uso a tu correo. Lo escribes y listo, ya estás dentro.",
  },
  {
    n: "03",
    title: "Planeen juntos",
    body: "Agrega actividades con un toque, comenta las de los demás y arma el plan perfecto en equipo.",
  },
];

const PREVIEW_ROWS = [
  { time: "09:00", title: "Tren bala a Kioto", sub: "Estación de Tokio" },
  { time: "15:00", title: "Fushimi Inari", sub: "Mil toriis al atardecer" },
  { time: "20:30", title: "Cena izakaya", sub: "Callejón Pontocho" },
];

export default function LandingPage() {
  const { currentUser, authReady } = useStore();
  const signedIn = authReady && !!currentUser;

  const primaryBtn =
    "rounded-full bg-ink px-6 py-3 text-sm font-bold text-paper transition hover:bg-ink/85";
  const secondaryBtn =
    "rounded-full border border-ink px-6 py-3 text-sm font-bold text-ink transition hover:bg-ink hover:text-paper";

  return (
    <div className="space-y-24 pb-12">
      {/* Hero */}
      <section className="grid items-center gap-12 pt-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="eyebrow text-clay">Planificación de viajes en grupo</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.02] tracking-tight text-ink sm:text-6xl">
            El itinerario lo armamos{" "}
            <span className="italic text-clay">entre todos</span>.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
            trip2gether reúne a tu grupo en un solo lugar: agenda por día,
            actividades con hora y lugar, comentarios para ponerse de acuerdo y
            permisos para que nadie rompa el plan.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {signedIn ? (
              <Link href="/trips" className={primaryBtn}>
                Ir a mis viajes →
              </Link>
            ) : (
              <>
                <Link href="/login" className={primaryBtn}>
                  Crear mi cuenta
                </Link>
                <Link href="/login" className={secondaryBtn}>
                  Ya tengo cuenta
                </Link>
              </>
            )}
          </div>
          {!signedIn && (
            <p className="mt-4 text-xs text-muted">
              Sin contraseñas: entras con un código de un solo uso enviado a tu
              correo.
            </p>
          )}
        </div>

        {/* Itinerary preview (decorative) */}
        <div aria-hidden className="relative hidden sm:block">
          <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-2 rounded-xl border border-line bg-clay-soft/50" />
          <div className="relative rounded-xl border border-line bg-paper-raised p-5 shadow-[0_24px_60px_-30px_rgba(25,20,16,0.4)]">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <p className="eyebrow text-muted">Día 2 · Kioto</p>
              <div className="flex -space-x-1.5">
                {["#f97316", "#3b82f6", "#10b981"].map((c) => (
                  <span
                    key={c}
                    className="h-6 w-6 rounded-full ring-2 ring-paper-raised"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            {PREVIEW_ROWS.map((r) => (
              <div
                key={r.time}
                className="flex gap-4 border-b border-line py-3 last:border-0"
              >
                <span className="w-12 shrink-0 pt-0.5 font-mono text-xs text-muted">
                  {r.time}
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">{r.title}</p>
                  <p className="text-xs text-muted">{r.sub}</p>
                </div>
              </div>
            ))}
            <div className="mt-3 rounded-lg bg-clay-soft/60 px-3 py-2 text-xs text-ink-soft">
              <span className="font-bold text-clay">Ana:</span> ¿Reservamos los
              asientos del lado del monte Fuji?
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="space-y-8">
        <div className="max-w-xl">
          <p className="eyebrow text-clay">Por qué trip2gether</p>
          <h2 className="mt-3 font-display text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
            Menos caos de chat, más viaje.
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-line bg-paper-raised p-6"
            >
              <p className="eyebrow text-clay">{f.tag}</p>
              <h3 className="mt-2 font-display text-xl text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="space-y-8">
        <div className="max-w-xl">
          <p className="eyebrow text-clay">Cómo funciona</p>
          <h2 className="mt-3 font-display text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
            Del correo al itinerario en tres pasos.
          </h2>
        </div>
        <ol className="grid gap-5 sm:grid-cols-3">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="rounded-lg border border-line bg-paper-raised p-6"
            >
              <span className="font-display text-3xl text-clay">{s.n}</span>
              <h3 className="mt-3 font-display text-lg text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Final CTA */}
      <section className="rounded-xl bg-ink px-8 py-14 text-center sm:px-12">
        <h2 className="mx-auto max-w-2xl font-display text-3xl leading-tight tracking-tight text-paper sm:text-4xl">
          El próximo viaje se planea mejor{" "}
          <span className="italic text-clay-soft">acompañado</span>.
        </h2>
        <Link
          href={signedIn ? "/trips" : "/login"}
          className="mt-8 inline-block rounded-full bg-clay px-8 py-3 text-sm font-bold text-white transition hover:bg-clay/90"
        >
          {signedIn ? "Ir a mis viajes" : "Empezar ahora"}
        </Link>
        <p className="mt-4 text-xs text-paper/60">
          Gratis para empezar · URL personalizada con el plan de pago
        </p>
      </section>
    </div>
  );
}
