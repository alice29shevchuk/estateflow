import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { gql, formatCents, formatBps } from "../lib/api";
import { useI18n } from "../lib/i18n";

type Property = {
  id: string;
  title: string;
  city: string;
  country: string;
  minInvestmentCents: string;
  yieldBps: number;
  imageEmoji: string;
};

const PROPERTIES = /* GraphQL */ `
  query Properties {
    properties { id title city country minInvestmentCents yieldBps imageEmoji }
  }
`;

export default function Listings() {
  const { t, locale, toggle } = useI18n();
  const { data, isLoading, error } = useQuery({
    queryKey: ["properties"],
    queryFn: () => gql<{ properties: Property[] }>(PROPERTIES),
  });

  if (isLoading)
    return <ActivityIndicator style={{ marginTop: 40 }} color="#0a66c2" />;
  if (error)
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{t("home.loading.error")}</Text>
      </View>
    );

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={data?.properties ?? []}
      keyExtractor={(p) => p.id}
      ListHeaderComponent={
        <View style={{ gap: 10 }}>
          <Pressable style={styles.langBtn} onPress={toggle}>
            <Text style={styles.langBtnText}>{t("lang.switch")}</Text>
          </Pressable>
          <Link href="/portfolio" asChild>
            <Pressable style={styles.portfolioBtn}>
              <Text style={styles.portfolioBtnText}>{t("home.portfolio")}</Text>
            </Pressable>
          </Link>
        </View>
      }
      renderItem={({ item }) => (
        <Link href={`/property/${item.id}`} asChild>
          <Pressable style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.emoji}>{item.imageEmoji}</Text>
              <Text style={styles.badge}>
                {formatBps(item.yieldBps)} {t("card.yield")}
              </Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.sub}>
              {item.city}, {item.country}
            </Text>
            <Text style={styles.from}>
              {t("home.from")} {formatCents(item.minInvestmentCents, "USD", locale)}
            </Text>
          </Pressable>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  error: { color: "#b91c1c", textAlign: "center" },
  portfolioBtn: {
    backgroundColor: "#0a66c2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
  },
  portfolioBtnText: { color: "#fff", fontWeight: "700", textAlign: "center" },
  langBtn: {
    alignSelf: "flex-end",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  langBtnText: { color: "#334155", fontWeight: "700", fontSize: 13 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  emoji: { fontSize: 30 },
  badge: { color: "#0a66c2", fontWeight: "700", fontSize: 12 },
  title: { fontSize: 17, fontWeight: "700", marginTop: 6, color: "#0f172a" },
  sub: { color: "#64748b", marginTop: 2 },
  from: { marginTop: 8, fontWeight: "600", color: "#334155" },
});
