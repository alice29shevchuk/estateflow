"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useMe } from "@/lib/account";
import { formatCents } from "@/lib/api";

export function Chrome({ children }: { children: React.ReactNode }) {
  const { t, toggle, locale } = useI18n();
  const { data } = useMe();
  const me = data?.me;

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-y-2 px-4 py-3">
          <Link href="/" className="text-lg font-bold text-brand-dark">
            Estate<span className="text-brand">Flow</span>
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-brand">
              {t("nav.properties")}
            </Link>
            <Link href="/dashboard" className="hover:text-brand">
              {t("nav.dashboard")}
            </Link>
            <Link href="/wallet" className="hover:text-brand">
              {t("nav.wallet")}
            </Link>

            {me && (
              <>
                <Link
                  href="/wallet"
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  {formatCents(me.walletBalanceCents, "USD", locale)}
                </Link>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    me.verified
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {me.verified ? "✓ " : "• "}
                  {me.verified ? t("account.verified") : t("account.unverified")}
                </span>
              </>
            )}

            <button
              onClick={toggle}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-brand hover:text-brand"
            >
              {t("lang.switch")}
            </button>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      <footer className="mx-auto max-w-5xl px-4 py-8 text-center text-xs text-slate-400">
        {t("app.footer")}
      </footer>
    </>
  );
}
