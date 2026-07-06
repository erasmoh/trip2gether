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
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Already signed in → go home.
  useEffect(() => {
    if (authReady && currentUser) router.replace("/");
  }, [authReady, currentUser, router]);

  function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = requestOtp(email);
    if (!res.ok) {
      setError(res.error ?? "No pudimos enviar el código.");
      return;
    }
    setDevCode(res.devCode ?? null);
    setCode("");
    setStep("code");
  }

  function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = verifyOtp(email, code);
    if (res.status === "error") {
      setError(res.error ?? "Código incorrecto.");
      return;
    }
    if (res.status === "needs_registration") {
      setStep("register");
      return;
    }
    router.replace("/");
  }

  function submitRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = completeRegistration(email, fullName);
    if (res.status === "error") {
      setError(res.error ?? "No pudimos completar el registro.");
      return;
    }
    router.replace("/");
  }

  const field =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400";
  const primaryBtn =
    "w-full rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-40";

  return (
    <div className="mx-auto max-w-sm py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">
          Entra a trip<span className="text-sky-500">2</span>gether
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Acceso sin contraseña. Te enviamos un código de un solo uso a tu
          correo (solo para personas invitadas).
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {step === "email" && (
          <form onSubmit={submitEmail} className="mt-5 space-y-3">
            <label className="block text-sm font-medium text-slate-600">
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
            <button type="submit" className={primaryBtn}>
              Enviar código
            </button>
            <p className="text-center text-xs text-slate-400">
              Prueba con ana@example.com (registrada) o carla@example.com (alta
              nueva).
            </p>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={submitCode} className="mt-5 space-y-3">
            {devCode && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Modo demo (sin email real): tu código es{" "}
                <span className="font-mono font-bold">{devCode}</span>
              </p>
            )}
            <p className="text-sm text-slate-500">
              Enviamos un código de 6 dígitos a <strong>{email}</strong>.
            </p>
            <label className="block text-sm font-medium text-slate-600">
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
            <button type="submit" className={primaryBtn}>
              Verificar
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setError(null);
              }}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-600"
            >
              ← Usar otro correo
            </button>
          </form>
        )}

        {step === "register" && (
          <form onSubmit={submitRegister} className="mt-5 space-y-3">
            <p className="text-sm text-slate-500">
              ¡Bienvenido/a! Es tu primer ingreso. Completa tu registro.
            </p>
            <label className="block text-sm font-medium text-slate-600">
              Nombre completo
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre"
                className={`${field} mt-1`}
              />
            </label>
            <button type="submit" className={primaryBtn}>
              Crear cuenta y entrar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
