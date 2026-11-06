import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { initSentry } from "../lib/sentry";
import { I18nProvider } from "../lib/i18n";

initSentry();

export default function RootLayout() {
  const [client] = useState(() => new QueryClient());
  return (
    <I18nProvider>
    <QueryClientProvider client={client}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0f2b4a" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "EstateFlow" }} />
        <Stack.Screen name="property/[id]" options={{ title: "Property" }} />
        <Stack.Screen name="portfolio" options={{ title: "My Portfolio" }} />
      </Stack>
    </QueryClientProvider>
    </I18nProvider>
  );
}
