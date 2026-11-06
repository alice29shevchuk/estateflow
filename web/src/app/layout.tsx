import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Chrome } from "./chrome";

export const metadata: Metadata = {
  title: "EstateFlow — Fractional Real-Estate Investing",
  description:
    "Browse properties, invest in fractions, and track your portfolio.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Chrome>{children}</Chrome>
        </Providers>
      </body>
    </html>
  );
}
