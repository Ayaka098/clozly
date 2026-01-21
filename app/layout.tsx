import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import TopNav from "@/components/TopNav";
import AuthBar from "@/components/AuthBar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Clozly | どれにする？手軽に服選び",
  description:
    "欲しい服を自由に入力すると、Clozlyが編集して提案。検索や比較の手間を減らし、納得できる服選びを手軽に。",
  icons: {
    icon: "/Clozly_ロゴ_文字入り.png"
  },
  openGraph: {
    title: "Clozly | どれにする？手軽に服選び",
    description:
      "欲しい服を自由に入力すると、Clozlyが編集して提案。検索や比較の手間を減らし、納得できる服選びを手軽に。"
  }
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
                  <Link className="logo" href="/search">
                    <img
                      className="logo-mark"
                      src="/Clozly_ロゴ_ハンガーのみ.png"
                      alt=""
                      aria-hidden="true"
                    />
                    <span className="logo-text">Clozly</span>
                  </Link>
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
