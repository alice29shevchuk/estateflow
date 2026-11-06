"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gql, getToken, formatCents } from "@/lib/api";
import { useMe } from "@/lib/account";
import { useI18n } from "@/lib/i18n";

type Tx = {
  id: string;
  type: "DEPOSIT" | "INVESTMENT";
  amountCents: string;
  status: string;
  note: string;
  createdAt: string;
};

const TXS = /* GraphQL */ `
  query Transactions {
    transactions { id type amountCents status note createdAt }
  }
`;
const DEPOSIT = /* GraphQL */ `
  mutation Deposit($amountCents: Int!) {
    deposit(amountCents: $amountCents) { id walletBalanceCents }
  }
`;

const PRESETS = [1000, 5000, 10000];

export default function WalletPage() {
  const { t, locale } = useI18n();
  const qc = useQueryClient();
  const { data: meData } = useMe();
  const me = meData?.me;
  const [amount, setAmount] = useState("1000");

  const loggedIn = typeof window !== "undefined" && !!getToken();

  const { data: txData } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => gql<{ transactions: Tx[] }>(TXS),
    enabled: loggedIn,
  });

  const deposit = useMutation({
    mutationFn: () =>
      gql(DEPOSIT, { amountCents: Math.round(parseFloat(amount || "0") * 100) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
        {t("wallet.needLogin")}{" "}
        <Link href="/" className="text-brand hover:underline">
          {t("dashboard.browse")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
      <div>
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-brand to-brand-dark p-6 text-white">
          <p className="text-sm opacity-80">{t("wallet.balance")}</p>
          <p className="mt-1 text-4xl font-extrabold">
            {formatCents(me?.walletBalanceCents ?? "0", "USD", locale)}
          </p>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">{t("wallet.add")}</h2>
          <div className="mt-3 flex gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                className={`flex-1 rounded-lg border px-2 py-2 text-sm font-semibold ${
                  amount === String(p)
                    ? "border-brand bg-brand/5 text-brand"
                    : "border-slate-300 text-slate-600"
                }`}
              >
                ${p.toLocaleString()}
              </button>
            ))}
          </div>
          <label className="mt-3 block text-sm text-slate-600">
            {t("wallet.amount")}
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <button
            onClick={() => deposit.mutate()}
            disabled={deposit.isPending}
            className="mt-4 w-full rounded-lg bg-brand py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
          >
            {t("wallet.deposit")}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-brand-dark">
          {t("wallet.transactions")}
        </h2>
        <div className="mt-3 space-y-2">
          {txData?.transactions.length === 0 && (
            <p className="text-slate-500">{t("wallet.noTx")}</p>
          )}
          {txData?.transactions.map((tx) => {
            const isDeposit = tx.type === "DEPOSIT";
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${
                      isDeposit
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {isDeposit ? "↓" : "↑"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {t(`tx.${tx.type}` as "tx.DEPOSIT")}
                    </p>
                    <p className="text-xs text-slate-400">{tx.note}</p>
                  </div>
                </div>
                <span
                  className={`font-semibold ${
                    isDeposit ? "text-emerald-600" : "text-slate-800"
                  }`}
                >
                  {isDeposit ? "+" : "−"}
                  {formatCents(tx.amountCents, "USD", locale)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
