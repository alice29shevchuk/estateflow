"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gql, formatCents, formatBps, setToken, getToken } from "@/lib/api";
import { useMe } from "@/lib/account";
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

const PROPERTY = /* GraphQL */ `
  query Property($id: ID!) {
    property(id: $id) {
      id title city country description
      priceCents minInvestmentCents yieldBps imageEmoji fundingPct
    }
  }
`;
const LOGIN = /* GraphQL */ `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) { token }
  }
`;
const INVEST = /* GraphQL */ `
  mutation Invest($propertyId: ID!, $amountCents: Int!) {
    invest(propertyId: $propertyId, amountCents: $amountCents) { id amountCents }
  }
`;

export default function PropertyPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { t, locale } = useI18n();
  const qc = useQueryClient();
  const { data: meData } = useMe();
  const me = meData?.me;
  const [amount, setAmount] = useState("500");
  const [message, setMessage] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => gql<{ property: Property }>(PROPERTY, { id }),
  });

  const demoLogin = useMutation({
    mutationFn: () =>
      gql<{ login: { token: string } }>(LOGIN, {
        email: "investor@estateflow.dev",
        password: "demo1234",
      }),
    onSuccess: (d) => {
      setToken(d.login.token);
      setMessage(t("property.signedIn"));
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const invest = useMutation({
    mutationFn: () =>
      gql(INVEST, {
        propertyId: id,
        amountCents: Math.round(parseFloat(amount || "0") * 100),
      }),
    onSuccess: () => {
      setMessage(t("property.recorded"));
      qc.invalidateQueries({ queryKey: ["property", id] });
      qc.invalidateQueries({ queryKey: ["portfolio"] });
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  if (isLoading)
    return <p className="text-slate-500">{t("property.loading")}</p>;
  const p = data?.property;
  if (!p) return <p className="text-red-600">{t("property.notFound")}</p>;

  const amountCents = Math.round(parseFloat(amount || "0") * 100);
  const projected = Math.round((amountCents * p.yieldBps) / 10000);
  const loggedIn = typeof window !== "undefined" && !!getToken();
  const walletCents = Number(me?.walletBalanceCents ?? "0");
  const needVerify = loggedIn && me && !me.verified;
  const needFunds =
    loggedIn && me?.verified && amountCents > walletCents;

  return (
    <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
      <div>
        <div className="mb-3 text-5xl">{p.imageEmoji}</div>
        <h1 className="text-2xl font-bold text-brand-dark">{p.title}</h1>
        <p className="text-slate-500">
          {p.city}, {p.country}
        </p>
        <p className="mt-4 text-slate-700">{p.description}</p>

        {/* funding progress */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-slate-500">
            <span>{t("property.funded")}</span>
            <span className="font-semibold text-slate-700">{p.fundingPct}%</span>
          </div>
          <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${Math.max(2, p.fundingPct)}%` }}
            />
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <Stat
            label={t("property.assetValue")}
            value={formatCents(p.priceCents, "USD", locale)}
          />
          <Stat label={t("property.annualYield")} value={formatBps(p.yieldBps)} />
          <Stat
            label={t("property.minimum")}
            value={formatCents(p.minInvestmentCents, "USD", locale)}
          />
          <Stat
            label={t("property.projected")}
            value={`${formatCents(projected, "USD", locale)} ${t(
              "dashboard.perYear"
            )}`}
          />
        </dl>
      </div>

      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">{t("property.invest")}</h2>

        {me && (
          <p className="mt-1 text-xs text-slate-500">
            {t("property.walletBalance")}:{" "}
            <span className="font-semibold text-slate-700">
              {formatCents(me.walletBalanceCents, "USD", locale)}
            </span>
          </p>
        )}

        <label className="mt-3 block text-sm text-slate-600">
          {t("property.amount")}
          <input
            type="number"
            min={Number(p.minInvestmentCents) / 100}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        {amountCents > 0 && (
          <p className="mt-2 text-xs text-slate-500">
            {t("property.projected")}:{" "}
            <span className="font-semibold text-emerald-600">
              {formatCents(projected, "USD", locale)} {t("dashboard.perYear")}
            </span>
          </p>
        )}

        {!loggedIn && (
          <button
            onClick={() => demoLogin.mutate()}
            className="mt-4 w-full rounded-lg border border-brand py-2 font-semibold text-brand transition hover:bg-brand/5"
          >
            {t("property.demoLogin")}
          </button>
        )}

        {needVerify && (
          <Link
            href="/verify"
            className="mt-4 block w-full rounded-lg bg-amber-500 py-2 text-center font-semibold text-white transition hover:bg-amber-600"
          >
            {t("property.verifyCta")}
          </Link>
        )}

        {needFunds && (
          <Link
            href="/wallet"
            className="mt-4 block w-full rounded-lg bg-amber-500 py-2 text-center font-semibold text-white transition hover:bg-amber-600"
          >
            {t("property.addFundsCta")}
          </Link>
        )}

        {loggedIn && me?.verified && !needFunds && (
          <button
            onClick={() => invest.mutate()}
            disabled={invest.isPending}
            className="mt-4 w-full rounded-lg bg-brand py-2 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
          >
            {invest.isPending
              ? t("property.processing")
              : t("property.investNow")}
          </button>
        )}

        {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-800">{value}</dd>
    </div>
  );
}
