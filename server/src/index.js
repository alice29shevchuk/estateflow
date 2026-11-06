import { initSentry, captureError } from "./sentry.js";
initSentry(); // must run before other imports that may throw at startup

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";

import { typeDefs } from "./schema.js";
import { resolvers } from "./resolvers.js";
import { buildContext } from "./auth.js";

const PORT = process.env.PORT || 4000;

async function main() {
  const app = express();
  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    // Report unexpected (non-GraphQL-validation) errors to Sentry.
    formatError: (formatted, error) => {
      captureError(error);
      return formatted;
    },
  });
  await apollo.start();

  app.use(
    "/graphql",
    cors(),
    bodyParser.json(),
    expressMiddleware(apollo, {
      context: async ({ req }) => buildContext({ req }),
    })
  );

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.listen(PORT, () => {
    console.log(`EstateFlow API ready at http://localhost:${PORT}/graphql`);
  });
}

main().catch((err) => {
  captureError(err);
  console.error(err);
  process.exit(1);
});
