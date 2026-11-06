import bcrypt from "bcryptjs";
import { db, nextId } from "./data.js";
import { signToken, requireUser } from "./auth.js";

const investedForProperty = (propertyId) =>
  db.investments
    .filter((i) => i.propertyId === propertyId)
    .reduce((sum, i) => sum + i.amountCents, 0);

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  verified: u.verified,
  walletBalanceCents: u.walletBalanceCents,
});

export const resolvers = {
  Query: {
    properties: () => db.properties,
    property: (_, { id }) => db.properties.find((p) => p.id === id) || null,
    me: (_, __, ctx) => (ctx.user ? publicUser(ctx.user) : null),

    portfolio: (_, __, ctx) => {
      const user = requireUser(ctx);
      const investments = db.investments.filter((i) => i.userId === user.id);
      const totalInvested = investments.reduce((s, i) => s + i.amountCents, 0);
      const projected = investments.reduce((s, i) => {
        const prop = db.properties.find((p) => p.id === i.propertyId);
        return s + Math.round((i.amountCents * (prop?.yieldBps ?? 0)) / 10000);
      }, 0);
      const blendedYieldBps =
        totalInvested > 0 ? Math.round((projected / totalInvested) * 10000) : 0;
      return {
        totalInvestedCents: totalInvested,
        projectedAnnualIncomeCents: projected,
        blendedYieldBps,
        investments,
      };
    },

    transactions: (_, __, ctx) => {
      const user = requireUser(ctx);
      return db.transactions
        .filter((t) => t.userId === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
  },

  Mutation: {
    register: (_, { name, email, password }) => {
      const exists = db.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (exists) throw new Error("Email already registered");
      if (password.length < 6)
        throw new Error("Password must be at least 6 characters");
      const user = {
        id: nextId("u"),
        name,
        email,
        passwordHash: bcrypt.hashSync(password, 8),
        verified: false,
        walletBalanceCents: 0,
      };
      db.users.push(user);
      return { token: signToken(user), user: publicUser(user) };
    },

    login: (_, { email, password }) => {
      const user = db.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (!user || !bcrypt.compareSync(password, user.passwordHash))
        throw new Error("Invalid email or password");
      return { token: signToken(user), user: publicUser(user) };
    },

    // Mock KYC: accept any non-empty details and mark the account verified.
    verifyIdentity: (_, { fullName, idNumber }, ctx) => {
      const user = requireUser(ctx);
      if (!fullName.trim() || idNumber.trim().length < 4)
        throw new Error("Please provide a full name and a valid ID number");
      user.verified = true;
      return publicUser(user);
    },

    deposit: (_, { amountCents }, ctx) => {
      const user = requireUser(ctx);
      if (!Number.isInteger(amountCents) || amountCents <= 0)
        throw new Error("Deposit must be a positive amount");
      user.walletBalanceCents += amountCents;
      db.transactions.push({
        id: nextId("tx"),
        userId: user.id,
        type: "DEPOSIT",
        amountCents,
        status: "COMPLETED",
        note: "Wallet top-up",
        createdAt: new Date().toISOString(),
      });
      return publicUser(user);
    },

    invest: (_, { propertyId, amountCents }, ctx) => {
      const user = requireUser(ctx);
      if (!user.verified)
        throw new Error("Identity verification required before investing");
      const property = db.properties.find((p) => p.id === propertyId);
      if (!property) throw new Error("Property not found");
      if (!Number.isInteger(amountCents) || amountCents <= 0)
        throw new Error("Amount must be a positive integer (in cents)");
      if (amountCents < property.minInvestmentCents)
        throw new Error(
          `Minimum investment is ${property.minInvestmentCents} cents`
        );
      if (amountCents > user.walletBalanceCents)
        throw new Error("Insufficient wallet balance — add funds first");

      user.walletBalanceCents -= amountCents;
      const investment = {
        id: nextId("inv"),
        userId: user.id,
        propertyId,
        amountCents,
        status: "COMPLETED",
        createdAt: new Date().toISOString(),
      };
      db.investments.push(investment);
      db.transactions.push({
        id: nextId("tx"),
        userId: user.id,
        type: "INVESTMENT",
        amountCents,
        status: "COMPLETED",
        note: `Invested in ${property.title}`,
        createdAt: new Date().toISOString(),
      });
      return investment;
    },
  },

  Property: {
    fundedCents: (p) => investedForProperty(p.id),
    fundingPct: (p) =>
      Math.min(100, Math.round((investedForProperty(p.id) / p.priceCents) * 100)),
  },

  Investment: {
    property: (inv) => db.properties.find((p) => p.id === inv.propertyId),
    projectedAnnualIncomeCents: (inv) => {
      const prop = db.properties.find((p) => p.id === inv.propertyId);
      return Math.round((inv.amountCents * (prop?.yieldBps ?? 0)) / 10000);
    },
  },
};
