import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { I18nManager } from "react-native";
import * as SecureStore from "expo-secure-store";

export type Locale = "en" | "ar";
const STORE_KEY = "estateflow_locale";

type Dict = Record<string, string>;

const en: Dict = {
  "app.title": "EstateFlow",
  "home.heading": "Invest in real estate",
  "home.portfolio": "View my portfolio",
  "home.loading.error":
    "Could not reach the API. Set extra.apiUrl to your machine's LAN IP.",
  "card.yield": "yield",
  "home.from": "From",
  "property.invest": "Invest",
  "property.amount": "Amount (USD)",
  "property.investNow": "Invest now",
  "property.processing": "Processing…",
  "property.demoLogin": "Demo login to invest",
  "property.assetValue": "Asset value",
  "property.yield": "Yield",
  "property.minimum": "Minimum",
  "property.funded": "Funded",
  "portfolio.total": "Total invested",
  "portfolio.ofPortfolio": "of portfolio",
  "portfolio.empty": "No investments yet.",
  "portfolio.signin": "Please use Demo login on a property first.",
  "lang.switch": "العربية",
};

const ar: Dict = {
  "app.title": "إستيت فلو",
  "home.heading": "استثمر في العقارات",
  "home.portfolio": "عرض محفظتي",
  "home.loading.error":
    "تعذّر الوصول إلى الخادم. اضبط extra.apiUrl على عنوان جهازك في الشبكة.",
  "card.yield": "عائد",
  "home.from": "من",
  "property.invest": "استثمر",
  "property.amount": "المبلغ (دولار)",
  "property.investNow": "استثمر الآن",
  "property.processing": "جارٍ المعالجة…",
  "property.demoLogin": "دخول تجريبي للاستثمار",
  "property.assetValue": "قيمة الأصل",
  "property.yield": "العائد",
  "property.minimum": "الحد الأدنى",
  "property.funded": "مموّل",
  "portfolio.total": "إجمالي الاستثمار",
  "portfolio.ofPortfolio": "من المحفظة",
  "portfolio.empty": "لا توجد استثمارات بعد.",
  "portfolio.signin": "يرجى استخدام الدخول التجريبي في صفحة عقار أولاً.",
  "lang.switch": "English",
};

const DICTS: Record<Locale, Dict> = { en, ar };

type I18nValue = {
  locale: Locale;
  toggle: () => void;
  t: (key: keyof typeof en) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    SecureStore.getItemAsync(STORE_KEY).then((saved) => {
      if (saved === "en" || saved === "ar") setLocale(saved);
    });
  }, []);

  useEffect(() => {
    const rtl = locale === "ar";
    // RTL takes full effect after an app reload; see README.
    if (I18nManager.isRTL !== rtl) {
      I18nManager.allowRTL(rtl);
      I18nManager.forceRTL(rtl);
    }
    SecureStore.setItemAsync(STORE_KEY, locale).catch(() => {});
  }, [locale]);

  const toggle = useCallback(
    () => setLocale((l) => (l === "en" ? "ar" : "en")),
    []
  );
  const t = useCallback(
    (key: keyof typeof en) => DICTS[locale][key] ?? en[key] ?? String(key),
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, toggle, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
