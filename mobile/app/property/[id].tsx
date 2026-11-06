import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { gql, formatCents, formatBps, setToken, getToken } from "../../lib/api";

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
  fundedCents: string;
};

const PROPERTY = /* GraphQL */ `
  query Property($id: ID!) {
    property(id: $id) {
      id title city country description
      priceCents minInvestmentCents yieldBps imageEmoji fundedCents
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

export default function PropertyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const [amount, setAmount] = useState("500");
  const [message, setMessage] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => gql<{ property: Property }>(PROPERTY, { id }),
  });

  // reflect existing token on mount
  getToken().then((t) => setAuthed(!!t));

  const demoLogin = useMutation({
    mutationFn: () =>
      gql<{ login: { token: string } }>(LOGIN, {
        email: "investor@estateflow.dev",
        password: "demo1234",
      }),
    onSuccess: async (d) => {
      await setToken(d.login.token);
      setAuthed(true);
      setMessage("Signed in as Demo Investor.");
    },
  });

  const invest = useMutation({
    mutationFn: () =>
      gql(INVEST, {
        propertyId: id,
        amountCents: Math.round(parseFloat(amount || "0") * 100),
      }),
    onSuccess: () => {
      setMessage("Investment recorded! See your portfolio.");
      qc.invalidateQueries({ queryKey: ["property", id] });
      qc.invalidateQueries({ queryKey: ["portfolio"] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  if (isLoading)
    return <ActivityIndicator style={{ marginTop: 40 }} color="#0a66c2" />;
  const p = data?.property;
  if (!p) return <Text style={styles.error}>Property not found.</Text>;

  const funded = Math.min(
    100,
    Math.round((Number(p.fundedCents) / Number(p.priceCents)) * 100)
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.emoji}>{p.imageEmoji}</Text>
      <Text style={styles.title}>{p.title}</Text>
      <Text style={styles.sub}>
        {p.city}, {p.country}
      </Text>
      <Text style={styles.desc}>{p.description}</Text>

      <View style={styles.stats}>
        <Stat label="Asset value" value={formatCents(p.priceCents)} />
        <Stat label="Yield" value={formatBps(p.yieldBps)} />
        <Stat label="Minimum" value={formatCents(p.minInvestmentCents)} />
        <Stat label="Funded" value={`${funded}%`} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Invest</Text>
        <Text style={styles.label}>Amount (USD)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        {authed ? (
          <Pressable
            style={styles.primaryBtn}
            onPress={() => invest.mutate()}
            disabled={invest.isPending}
          >
            <Text style={styles.primaryBtnText}>
              {invest.isPending ? "Processing…" : "Invest now"}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.secondaryBtn}
            onPress={() => demoLogin.mutate()}
          >
            <Text style={styles.secondaryBtnText}>Demo login to invest</Text>
          </Pressable>
        )}
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  emoji: { fontSize: 44 },
  title: { fontSize: 22, fontWeight: "800", color: "#0f2b4a", marginTop: 6 },
  sub: { color: "#64748b", marginTop: 2 },
  desc: { color: "#334155", marginTop: 12, lineHeight: 20 },
  error: { color: "#b91c1c", padding: 24 },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  stat: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 12,
    width: "47%",
  },
  statLabel: { fontSize: 11, color: "#94a3b8", textTransform: "uppercase" },
  statValue: { fontWeight: "700", color: "#1e293b", marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    marginTop: 20,
  },
  cardTitle: { fontSize: 17, fontWeight: "700" },
  label: { color: "#475569", marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  primaryBtn: {
    backgroundColor: "#0a66c2",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 14,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", textAlign: "center" },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#0a66c2",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 14,
  },
  secondaryBtnText: { color: "#0a66c2", fontWeight: "700", textAlign: "center" },
  message: { color: "#475569", marginTop: 12 },
});
