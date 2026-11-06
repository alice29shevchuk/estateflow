"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Locale = "en" | "ar";

const STORE_KEY = "estateflow_locale";

type Dict = Record<string, string>;

const en: Dict = {
  "nav.properties": "Properties",
  "nav.dashboard": "Portfolio",
  "nav.wallet": "Wallet",
  "lang.switch": "العربية",
  "account.verified": "Verified",
  "account.unverified": "Unverified",
  "account.login": "Demo login",
  "home.title": "Invest in real estate, one fraction at a time",
  "home.subtitle": "Browse vetted properties and build a diversified portfolio.",
  "home.loading": "Loading properties…",
  "home.error": "Could not load properties. Is the API running on port 4000?",
  "home.from": "From",
  "home.funded": "funded",
  "card.yield": "yield",
  "property.loading": "Loading…",
  "property.notFound": "Property not found.",
  "property.assetValue": "Asset value",
  "property.annualYield": "Annual yield",
  "property.minimum": "Minimum",
  "property.funded": "Funded",
  "property.invest": "Invest",
  "property.amount": "Amount (USD)",
  "property.investNow": "Invest now",
  "property.processing": "Processing…",
  "property.demoLogin": "Demo login to invest",
  "property.signedIn": "Signed in. You can now verify and invest.",
  "property.recorded": "Investment confirmed! See your Portfolio.",
  "property.projected": "Projected annual income",
  "property.walletBalance": "Wallet balance",
  "property.needVerify": "Verify your identity to invest.",
  "property.needFunds": "Add funds to invest.",
  "property.verifyCta": "Verify identity",
  "property.addFundsCta": "Add funds",
  "verify.title": "Verify your identity",
  "verify.subtitle": "Confirm your details to unlock investing (demo KYC).",
  "verify.fullName": "Full name",
  "verify.idNumber": "ID / passport number",
  "verify.submit": "Verify identity",
  "verify.done": "Your identity is verified. You can now invest.",
  "verify.already": "Your account is already verified.",
  "verify.needLogin": "Please demo-login from a property page first.",
  "wallet.title": "Wallet",
  "wallet.balance": "Available balance",
  "wallet.add": "Add funds",
  "wallet.amount": "Amount (USD)",
  "wallet.deposit": "Deposit",
  "wallet.transactions": "Transactions",
  "wallet.noTx": "No transactions yet.",
  "wallet.needLogin": "Please demo-login from a property page to use your wallet.",
  "tx.DEPOSIT": "Deposit",
  "tx.INVESTMENT": "Investment",
  "dashboard.title": "Your portfolio",
  "dashboard.invested": "Total invested",
  "dashboard.projected": "Projected annual income",
  "dashboard.yield": "Blended yield",
  "dashboard.empty": "No investments yet. Pick a property and invest to see it here.",
  "dashboard.signin": "Please sign in from a property page (Demo login) to see your investments.",
  "dashboard.browse": "Browse properties",
  "dashboard.ofPortfolio": "of portfolio",
  "dashboard.loading": "Loading portfolio…",
  "dashboard.error": "Could not load portfolio.",
  "dashboard.perYear": "/ yr",
  "app.footer": "EstateFlow — demo portfolio project. Amounts are illustrative.",
};

const ar: Dict = {
  "nav.properties": "العقارات",
  "nav.dashboard": "المحفظة",
  "nav.wallet": "الرصيد",
  "lang.switch": "English",
  "account.verified": "موثّق",
  "account.unverified": "غير موثّق",
  "account.login": "دخول تجريبي",
  "home.title": "استثمر في العقارات، جزءاً تلو الآخر",
  "home.subtitle": "تصفّح عقارات موثوقة وكوّن محفظة متنوعة.",
  "home.loading": "جارٍ تحميل العقارات…",
  "home.error": "تعذّر تحميل العقارات. تأكد من تشغيل الخادم على المنفذ 4000.",
  "home.from": "من",
  "home.funded": "مموّل",
  "card.yield": "عائد",
  "property.loading": "جارٍ التحميل…",
  "property.notFound": "العقار غير موجود.",
  "property.assetValue": "قيمة الأصل",
  "property.annualYield": "العائد السنوي",
  "property.minimum": "الحد الأدنى",
  "property.funded": "مموّل",
  "property.invest": "استثمر",
  "property.amount": "المبلغ (دولار)",
  "property.investNow": "استثمر الآن",
  "property.processing": "جارٍ المعالجة…",
  "property.demoLogin": "دخول تجريبي للاستثمار",
  "property.signedIn": "تم تسجيل الدخول. يمكنك الآن التوثيق والاستثمار.",
  "property.recorded": "تم تأكيد الاستثمار! راجع محفظتك.",
  "property.projected": "الدخل السنوي المتوقع",
  "property.walletBalance": "رصيد المحفظة",
  "property.needVerify": "وثّق هويتك للاستثمار.",
  "property.needFunds": "أضف أموالاً للاستثمار.",
  "property.verifyCta": "توثيق الهوية",
  "property.addFundsCta": "إضافة أموال",
  "verify.title": "وثّق هويتك",
  "verify.subtitle": "أكّد بياناتك لتفعيل الاستثمار (توثيق تجريبي).",
  "verify.fullName": "الاسم الكامل",
  "verify.idNumber": "رقم الهوية / الجواز",
  "verify.submit": "توثيق الهوية",
  "verify.done": "تم توثيق هويتك. يمكنك الآن الاستثمار.",
  "verify.already": "حسابك موثّق بالفعل.",
  "verify.needLogin": "يرجى تسجيل الدخول التجريبي من صفحة عقار أولاً.",
  "wallet.title": "المحفظة النقدية",
  "wallet.balance": "الرصيد المتاح",
  "wallet.add": "إضافة أموال",
  "wallet.amount": "المبلغ (دولار)",
  "wallet.deposit": "إيداع",
  "wallet.transactions": "المعاملات",
  "wallet.noTx": "لا توجد معاملات بعد.",
  "wallet.needLogin": "يرجى تسجيل الدخول التجريبي من صفحة عقار لاستخدام محفظتك.",
  "tx.DEPOSIT": "إيداع",
  "tx.INVESTMENT": "استثمار",
  "dashboard.title": "محفظتك",
  "dashboard.invested": "إجمالي الاستثمار",
  "dashboard.projected": "الدخل السنوي المتوقع",
  "dashboard.yield": "متوسط العائد",
  "dashboard.empty": "لا توجد استثمارات بعد. اختر عقاراً واستثمر لتراه هنا.",
  "dashboard.signin": "يرجى تسجيل الدخول من صفحة عقار (دخول تجريبي) لعرض استثماراتك.",
  "dashboard.browse": "تصفّح العقارات",
  "dashboard.ofPortfolio": "من المحفظة",
  "dashboard.loading": "جارٍ تحميل المحفظة…",
  "dashboard.error": "تعذّر تحميل المحفظة.",
  "dashboard.perYear": "/ سنة",
  "app.footer": "إستيت فلو — مشروع تجريبي. المبالغ توضيحية.",
};

const DICTS: Record<Locale, Dict> = { en, ar };

type I18nValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (l: Locale) => void;
  toggle: () => void;
  t: (key: keyof typeof en) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORE_KEY) as Locale | null;
      if (saved === "en" || saved === "ar") setLocaleState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", locale);
    try {
      localStorage.setItem(STORE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);
  const toggle = useCallback(
    () => setLocaleState((l) => (l === "en" ? "ar" : "en")),
    []
  );
  const t = useCallback(
    (key: keyof typeof en) => DICTS[locale][key] ?? en[key] ?? String(key),
    [locale]
  );

  return (
    <I18nContext.Provider
      value={{
        locale,
        dir: locale === "ar" ? "rtl" : "ltr",
        setLocale,
        toggle,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
