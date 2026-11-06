"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { gql, formatCents, formatBps } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

type Property = {
  id: string;
  title: string;
  city: string;
  country: string;
  description: string;
  priceCents: string;
  minInvestmentCents: string;
  yieldBps: number;
  imageEmoji: string;
  fundingPct: number;
};

const PROPERTIES = /* GraphQL */ `
  query Properties {
    properties {
      id title city country description
      priceCents minInvestmentCents yieldBps imageEmoji fundingPct
    }
  }
`;

export default function HomePage() {
  const { t, locale } = useI18n();
  const { data, isLoading, error } = useQuery({
    queryKey: ["properties"],
    queryFn: () => gql<{ properties: Property[] }>(PROPERTIES),
  });

  return (
    <div>
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-brand-dark">{t("home.title")}</h1>
        <p className="mt-1 text-slate-600">{t("home.subtitle")}</p>
      </section>

      {isLoading && <p className="text-slate-500">{t("home.loading")}</p>}
      {error && <p className="text-red-600">{t("home.error")}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {data?.properties.map((p) => (
          <Link
            key={p.id}
            href={`/properties/${p.id}`}
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand hover:shadow-md"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-3xl">{p.imageEmoji}</span>
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                {formatBps(p.yieldBps)} {t("card.yield")}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{p.title}</h2>
            <p className="text-sm text-slate-500">
              {p.city}, {p.country}
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">
              {p.description}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">
                {t("home.from")}{" "}
                {formatCents(p.minInvestmentCents, "USD", locale)}
              </p>
              <p className="text-xs text-slate-400">
                {p.fundingPct}% {t("home.funded")}
              </p>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${Math.max(2, p.fundingPct)}%` }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
