import { test } from "node:test";
import assert from "node:assert/strict";

import { resolvers } from "./resolvers.js";
import { db } from "./data.js";

const user = db.users[0];
const ctx = { user };
const anon = { user: null };

test("properties: returns the seeded list", () => {
  const list = resolvers.Query.properties();
  assert.ok(list.length >= 4);
});

test("login: succeeds with valid credentials", () => {
  const res = resolvers.Mutation.login(null, {
    email: "investor@estateflow.dev",
    password: "demo1234",
  });
  assert.ok(res.token);
  assert.equal(res.user.verified, false);
});

test("login: fails with wrong password", () => {
  assert.throws(
    () =>
      resolvers.Mutation.login(null, {
        email: "investor@estateflow.dev",
        password: "wrong",
      }),
    /Invalid email or password/
  );
});

test("invest: blocked before identity verification", () => {
  user.verified = false;
  assert.throws(
    () =>
      resolvers.Mutation.invest(
        null,
        { propertyId: "p1", amountCents: 50000 },
        ctx
      ),
    /verification required/
  );
});

test("verifyIdentity: marks the account verified", () => {
  const res = resolvers.Mutation.verifyIdentity(
    null,
    { fullName: "Demo Investor", idNumber: "AB12345" },
    ctx
  );
  assert.equal(res.verified, true);
});

test("invest: blocked without enough wallet balance", () => {
  user.walletBalanceCents = 0;
  assert.throws(
    () =>
      resolvers.Mutation.invest(
        null,
        { propertyId: "p1", amountCents: 50000 },
        ctx
      ),
    /Insufficient wallet balance/
  );
});

test("deposit: increases wallet balance and records a transaction", () => {
  const res = resolvers.Mutation.deposit(null, { amountCents: 500000 }, ctx);
  assert.equal(res.walletBalanceCents, 500000);
  const txs = resolvers.Query.transactions(null, null, ctx);
  assert.equal(txs[0].type, "DEPOSIT");
});

test("invest: rejects amounts below the minimum", () => {
  assert.throws(
    () =>
      resolvers.Mutation.invest(
        null,
        { propertyId: "p1", amountCents: 1 },
        ctx
      ),
    /Minimum investment/
  );
});

test("invest: succeeds, deducts wallet, and updates the portfolio", () => {
  const walletBefore = user.walletBalanceCents;
  resolvers.Mutation.invest(
    null,
    { propertyId: "p1", amountCents: 50000 },
    ctx
  );
  assert.equal(user.walletBalanceCents, walletBefore - 50000);
  const pf = resolvers.Query.portfolio(null, null, ctx);
  assert.equal(pf.totalInvestedCents, 50000);
  // 8.20% of 50000 = 4100
  assert.equal(pf.projectedAnnualIncomeCents, 4100);
  assert.ok(pf.investments.some((i) => i.propertyId === "p1"));
});

test("invest: requires authentication", () => {
  assert.throws(
    () =>
      resolvers.Mutation.invest(
        null,
        { propertyId: "p1", amountCents: 50000 },
        anon
      ),
    /Not authenticated/
  );
});

test("Property.fundingPct: never exceeds 100", () => {
  const p1 = db.properties.find((p) => p.id === "p1");
  const pct = resolvers.Property.fundingPct(p1);
  assert.ok(pct >= 0 && pct <= 100);
});
