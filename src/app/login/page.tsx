"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

type Step = "email" | "code" | "register";

export default function LoginPage() {
  const { currentUser, authReady, requestOtp, verifyOtp, completeRegistration } =
    useStore();
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in → go to the trips list.
  useEffect(() => {
    if (authReady && currentUser) router.replace("/trips");
  }, [authReady, currentUser, router]);

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await requestOtp(email);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "No pudimos enviar el código.");
      return;
    }
    setCode("");
    setStep("code");
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await verifyOtp(email, code);
    setSubmitting(false);
    if (res.status === "error") {
      setError(res.error ?? "Código incorrecto.");
      return;
    }
    if (res.status === "needs_registration") {
      setStep("register");
      return;
    }
    router.replace("/trips");
  }

  async function submitRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await completeRegistration(fullName);
    setSubmitting(false);
    if (res.status === "error") {
      setError(res.error ?? "No pudimos completar el registro.");
      return;
    }
    router.replace("/trips");
  }

  const field =
    "w-full rounded-lg border border-line bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-clay focus:ring-1 focus:ring-clay";
  const primaryBtn =
    "w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink/85 disabled:opacity-40";

  return (
    <div className="mx-auto max-w-sm py-14">
      <p className="eyebrow text-clay">Crea tu cuenta gratis</p>
      <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-ink">
        Entra a trip<span className="italic text-clay">2</span>gether
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        Sin contraseñas. Te enviamos un código de un solo uso a tu correo.
      </p>

      <div className="mt-8 rounded-lg border border-line bg-paper-raised p-6">
        {error && (
          <p className="mb-4 border-l-2 border-clay bg-clay-soft/60 px-3 py-2 text-sm text-ink-soft">
            {error}
          </p>
        )}

        {step === "email" && (
          <form onSubmit={submitEmail} className="space-y-3">
            <label className="block eyebrow text-muted">
              Correo electrónico
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@example.com"
                className={`${field} mt-1`}
              />
            </label>
            <button type="submit" disabled={submitting} className={primaryBtn}>
              {submitting ? "Enviando…" : "Enviar código"}
            </button>
            <p className="text-center text-xs text-muted">
              Usa cualquier correo: te enviamos un código de acceso, sin
              necesidad de invitación previa.
            </p>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={submitCode} className="space-y-3">
            <p className="text-sm text-ink-soft">
              Enviamos un código de 6 dígitos a <strong className="text-ink">{email}</strong>.
            </p>
            <label className="block eyebrow text-muted">
              Código
              <input
                inputMode="numeric"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className={`${field} mt-1 text-center font-mono text-lg tracking-widest`}
              />
            </label>
            <button type="submit" disabled={submitting} className={primaryBtn}>
              {submitting ? "Verificando…" : "Verificar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setError(null);
              }}
              className="eyebrow w-full text-center text-muted transition hover:text-ink"
            >
              ← Usar otro correo
            </button>
          </form>
        )}

        {step === "register" && (
          <form onSubmit={submitRegister} className="space-y-3">
            <p className="text-sm text-ink-soft">
              ¡Bienvenido/a! Es tu primer ingreso. Completa tu registro.
            </p>
            <label className="block eyebrow text-muted">
              Nombre completo
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre"
                className={`${field} mt-1`}
              />
            </label>
            <button type="submit" disabled={submitting} className={primaryBtn}>
              {submitting ? "Creando cuenta…" : "Crear cuenta y entrar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
