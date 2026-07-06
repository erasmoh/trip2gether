"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Avatar } from "./Avatar";

export function Header() {
  const { currentUser, signOut } = useStore();
  const router = useRouter();
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

        {currentUser && (
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
                <div className="absolute right-0 z-20 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                  <div className="flex items-center gap-3 px-2 py-2">
                    <Avatar user={currentUser} size="md" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-800">
                        {currentUser.fullName}
                      </span>
                      <span className="block truncate text-xs text-slate-400">
                        {currentUser.email}
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      signOut();
                      router.replace("/login");
                    }}
                    className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
