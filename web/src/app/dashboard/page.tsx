"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { gql, formatCents, formatBps, getToken } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

type Investment = {
  id: string;
  amountCents: string;
  projectedAnnualIncomeCents: string;
  property: { id: string; title: string; city: string; imageEmoji: string };
};

type Portfolio = {
  portfolio: {
    totalInvestedCents: string;
    projectedAnnualIncomeCents: string;
    blendedYieldBps: number;
    investments: Investment[];
  };
};

const PORTFOLIO = /* GraphQL */ `
  query Portfolio {
    portfolio {
      totalInvestedCents
      projectedAnnualIncomeCents
      blendedYieldBps
      investments {
        id amountCents projectedAnnualIncomeCents
        property { id title city imageEmoji }
      }
    }
  }
`;

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const hasToken = typeof window !== "undefined" && getToken();

  const { data, isLoading, error } = useQuery({
    queryKey: ["portfolio"],
    queryFn: () => gql<Portfolio>(PORTFOLIO),
    enabled: !!hasToken,
  });

  if (!hasToken) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-bold text-brand-dark">
          {t("dashboard.title")}
        </h1>
        <p className="mt-2 text-slate-600">{t("dashboard.signin")}</p>
        <Link href="/" className="mt-4 inline-block text-brand hover:underline">
          {t("dashboard.browse")} {locale === "ar" ? "←" : "→"}
        </Link>
      </div>
    );
  }

  if (isLoading)
    return <p className="text-slate-500">{t("dashboard.loading")}</p>;
  if (error) return <p className="text-red-600">{t("dashboard.error")}</p>;

  const pf = data!.portfolio;
  const total = Number(pf.totalInvestedCents) || 1;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">
        {t("dashboard.title")}
      </h1>

      {/* summary tiles */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Tile
          label={t("dashboard.invested")}
          value={formatCents(pf.totalInvestedCents, "USD", locale)}
        />
        <Tile
          label={t("dashboard.projected")}
          value={`${formatCents(pf.projectedAnnualIncomeCents, "USD", locale)} ${t(
            "dashboard.perYear"
          )}`}
          accent
        />
        <Tile label={t("dashboard.yield")} value={formatBps(pf.blendedYieldBps)} />
      </div>

      {pf.investments.length === 0 ? (
        <p className="mt-6 text-slate-500">{t("dashboard.empty")}</p>
      ) : (
        <div className="mt-6 space-y-3">
          {pf.investments.map((inv) => {
            const pct = Math.round((Number(inv.amountCents) / total) * 100);
            return (
              <div
                key={inv.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">
                    {inv.property.imageEmoji} {inv.property.title}
                  </span>
                  <span className="font-semibold text-slate-900">
                    {formatCents(inv.amountCents, "USD", locale)}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-slate-400">
                  <span>
                    {pct}% {t("dashboard.ofPortfolio")} · {inv.property.city}
                  </span>
                  <span className="text-emerald-600">
                    +{formatCents(inv.projectedAnnualIncomeCents, "USD", locale)}{" "}
                    {t("dashboard.perYear")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Tile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p
        className={`mt-1 text-xl font-extrabold ${
          accent ? "text-emerald-700" : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
