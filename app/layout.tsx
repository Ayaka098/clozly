import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import TopNav from "@/components/TopNav";
import AuthBar from "@/components/AuthBar";
import Link from "next/link";

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
          <div className="page">
            <header className="topbar">
              <div className="topbar-inner">
                <div className="topbar-left">
                  <Link className="logo" href="/search">Clozly</Link>
                  <TopNav />
                </div>
                <AuthBar />
              </div>
            </header>
            <main className="content">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
