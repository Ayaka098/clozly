import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Clozly",
  description: "Curated clothing choices without the search fatigue."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <Providers>
          <div className="page">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
