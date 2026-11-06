import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { gql, formatCents } from "../lib/api";

type Investment = {
  id: string;
  amountCents: string;
  property: { title: string; city: string; imageEmoji: string };
};

const PORTFOLIO = /* GraphQL */ `
  query Portfolio {
    portfolio {
      totalInvestedCents
      investments { id amountCents property { title city imageEmoji } }
    }
  }
`;

export default function PortfolioScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["portfolio"],
    queryFn: () =>
      gql<{
        portfolio: { totalInvestedCents: string; investments: Investment[] };
      }>(PORTFOLIO),
  });

  if (isLoading)
    return <ActivityIndicator style={{ marginTop: 40 }} color="#0a66c2" />;
  if (error)
    return (
      <Text style={styles.note}>
        Please use Demo login on a property first.
      </Text>
    );

  const pf = data!.portfolio;
  const total = Number(pf.totalInvestedCents) || 1;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.total}>
        Total invested: {formatCents(pf.totalInvestedCents)}
      </Text>
      {pf.investments.length === 0 ? (
        <Text style={styles.note}>No investments yet.</Text>
      ) : (
        pf.investments.map((inv) => {
          const pct = Math.round((Number(inv.amountCents) / total) * 100);
          return (
            <View key={inv.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.name}>
                  {inv.property.imageEmoji} {inv.property.title}
                </Text>
                <Text style={styles.amount}>
                  {formatCents(inv.amountCents)}
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct}%` }]} />
              </View>
              <Text style={styles.meta}>
                {pct}% of portfolio · {inv.property.city}
              </Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  total: { fontSize: 16, fontWeight: "700", color: "#0f2b4a", marginBottom: 12 },
  note: { color: "#64748b", padding: 24 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    marginBottom: 10,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  name: { fontWeight: "600", color: "#1e293b" },
  amount: { fontWeight: "700", color: "#0f172a" },
  barTrack: {
    height: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 999,
    marginTop: 8,
    overflow: "hidden",
  },
  barFill: { height: 8, backgroundColor: "#0a66c2", borderRadius: 999 },
  meta: { fontSize: 12, color: "#94a3b8", marginTop: 4 },
});
