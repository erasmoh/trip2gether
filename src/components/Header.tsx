"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Avatar } from "./Avatar";

export function Header() {
  const { currentUser, users, setCurrentUser } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-white">
            ✈
          </span>
          <span className="text-lg tracking-tight">
            trip<span className="text-sky-500">2</span>gether
          </span>
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 transition hover:bg-slate-50"
          >
            <Avatar user={currentUser} size="sm" />
            <span className="hidden text-sm font-medium text-slate-700 sm:inline">
              {currentUser.fullName}
            </span>
            <span className="text-xs text-slate-400">▾</span>
          </button>

          {open && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpen(false)}
                aria-hidden
              />
              <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Ver la app como
                </p>
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setCurrentUser(u.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${
                      u.id === currentUser.id ? "bg-slate-50" : ""
                    }`}
                  >
                    <Avatar user={u} size="sm" />
                    <span className="flex-1">
                      <span className="block font-medium text-slate-800">
                        {u.fullName}
                      </span>
                      <span className="block text-xs text-slate-400">{u.email}</span>
                    </span>
                    {u.id === currentUser.id && (
                      <span className="text-sky-500">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
