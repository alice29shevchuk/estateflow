// In-memory data store with seed data.
// All monetary values are integer minor units (cents) — never floats.
// Swap this module for a real database (Postgres/SQLite) without touching resolvers.

import bcrypt from "bcryptjs";

export const db = {
  users: [
    {
      id: "u1",
      name: "Demo Investor",
      email: "investor@estateflow.dev",
      passwordHash: bcrypt.hashSync("demo1234", 8), // password: demo1234
      verified: false, // KYC status
      walletBalanceCents: 0,
    },
  ],
  properties: [
    {
      id: "p1",
      title: "Marina Bay Residence",
      city: "Dubai",
      country: "UAE",
      description:
        "Waterfront apartment block with stable rental demand and strong occupancy.",
      priceCents: 42_000_000_00,
      minInvestmentCents: 500_00,
      yieldBps: 820, // 8.20% annual yield (basis points)
      imageEmoji: "🏙️",
    },
    {
      id: "p2",
      title: "Old Town Lofts",
      city: "Tallinn",
      country: "Estonia",
      description:
        "Renovated lofts in the historic center, popular with long-term tenants.",
      priceCents: 9_500_000_00,
      minInvestmentCents: 250_00,
      yieldBps: 640,
      imageEmoji: "🏛️",
    },
    {
      id: "p3",
      title: "Riverside Office Park",
      city: "Kyiv",
      country: "Ukraine",
      description:
        "Grade-A office space with multi-year corporate leases in place.",
      priceCents: 18_750_000_00,
      minInvestmentCents: 1_000_00,
      yieldBps: 910,
      imageEmoji: "🏢",
    },
    {
      id: "p4",
      title: "Sunset Villas",
      city: "Lisbon",
      country: "Portugal",
      description:
        "Short-term rental villas with seasonal peaks and a solid management partner.",
      priceCents: 6_200_000_00,
      minInvestmentCents: 300_00,
      yieldBps: 570,
      imageEmoji: "🏖️",
    },
  ],
  investments: [], // { id, userId, propertyId, amountCents, status, createdAt }
  transactions: [], // { id, userId, type, amountCents, status, note, createdAt }
};

export function nextId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
