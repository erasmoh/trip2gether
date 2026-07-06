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
    <header className="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5 text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-full border border-ink font-display text-base italic leading-none text-ink">
            t
          </span>
          <span className="font-display text-xl leading-none tracking-tight">
            trip<span className="italic text-clay">2</span>gether
          </span>
        </Link>

        {currentUser && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-line bg-paper-raised py-1 pl-1 pr-3 transition hover:border-ink/30"
            >
              <Avatar user={currentUser} size="sm" />
              <span className="hidden text-sm font-medium text-ink-soft sm:inline">
                {currentUser.fullName}
              </span>
              <span className="text-xs text-muted">▾</span>
            </button>

            {open && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpen(false)}
                  aria-hidden
                />
                <div className="absolute right-0 z-20 mt-2 w-60 rounded-xl border border-line bg-paper-raised p-2 shadow-[0_12px_40px_-12px_rgba(25,20,16,0.25)]">
                  <div className="flex items-center gap-3 px-2 py-2">
                    <Avatar user={currentUser} size="md" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">
                        {currentUser.fullName}
                      </span>
                      <span className="block truncate text-xs text-muted">
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
                    className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-clay transition hover:bg-clay-soft"
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
