export const typeDefs = /* GraphQL */ `
  # Monetary amounts are integer minor units (cents) serialized as strings,
  # so values beyond 32-bit GraphQL Int stay exact (no float precision loss).

  type User {
    id: ID!
    name: String!
    email: String!
    verified: Boolean!
    walletBalanceCents: String!
  }

  type Property {
    id: ID!
    title: String!
    city: String!
    country: String!
    description: String!
    priceCents: String!
    minInvestmentCents: String!
    yieldBps: Int!
    imageEmoji: String!
    fundedCents: String!
    fundingPct: Int!
  }

  enum TxType {
    DEPOSIT
    INVESTMENT
  }

  type Transaction {
    id: ID!
    type: TxType!
    amountCents: String!
    status: String!
    note: String!
    createdAt: String!
  }

  type Investment {
    id: ID!
    property: Property!
    amountCents: String!
    status: String!
    createdAt: String!
    # projected annual income from this holding, in cents
    projectedAnnualIncomeCents: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Portfolio {
    totalInvestedCents: String!
    projectedAnnualIncomeCents: String!
    blendedYieldBps: Int!
    investments: [Investment!]!
  }

  type Query {
    properties: [Property!]!
    property(id: ID!): Property
    me: User
    portfolio: Portfolio!
    transactions: [Transaction!]!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    verifyIdentity(fullName: String!, idNumber: String!): User!
    deposit(amountCents: Int!): User!
    invest(propertyId: ID!, amountCents: Int!): Investment!
  }
`;
