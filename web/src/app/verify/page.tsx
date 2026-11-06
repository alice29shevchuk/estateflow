"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gql, getToken } from "@/lib/api";
import { useMe } from "@/lib/account";
import { useI18n } from "@/lib/i18n";

const VERIFY = /* GraphQL */ `
  mutation Verify($fullName: String!, $idNumber: String!) {
    verifyIdentity(fullName: $fullName, idNumber: $idNumber) { id verified }
  }
`;

export default function VerifyPage() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const { data } = useMe();
  const me = data?.me;
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  const verify = useMutation({
    mutationFn: () => gql(VERIFY, { fullName, idNumber }),
    onSuccess: () => {
      setError(null);
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  if (typeof window !== "undefined" && !getToken()) {
    return (
      <Prompt>
        {t("verify.needLogin")}{" "}
        <Link href="/" className="text-brand hover:underline">
          {t("dashboard.browse")}
        </Link>
      </Prompt>
    );
  }

  if (me?.verified || verify.isSuccess) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="text-4xl">✅</div>
        <h1 className="mt-3 text-xl font-bold text-emerald-800">
          {t("verify.done")}
        </h1>
        <Link
          href="/"
          className="mt-4 inline-block font-semibold text-brand hover:underline"
        >
          {t("dashboard.browse")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-brand-dark">{t("verify.title")}</h1>
      <p className="mt-1 text-slate-600">{t("verify.subtitle")}</p>

      <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <Field
          label={t("verify.fullName")}
          value={fullName}
          onChange={setFullName}
          placeholder="Alex Morgan"
        />
        <Field
          label={t("verify.idNumber")}
          value={idNumber}
          onChange={setIdNumber}
          placeholder="AB1234567"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={() => verify.mutate()}
          disabled={verify.isPending || !fullName || idNumber.length < 4}
          className="w-full rounded-lg bg-brand py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
        >
          {t("verify.submit")}
        </button>
        <p className="text-xs text-slate-400">
          🔒 Demo only — no real identity data is collected or stored.
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm text-slate-600">
      {label}
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
      />
    </label>
  );
}

function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
      {children}
    </div>
  );
}
