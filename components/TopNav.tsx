"use client";

import { usePathname, useRouter } from "next/navigation";

const tabs = [
  { href: "/search", label: "検索" },
  { href: "/latest", label: "検索結果" },
  { href: "/tryon", label: "試着" },
  { href: "/quiz", label: "タイプ診断" }
];

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="tabs" role="tablist" aria-label="メインタブ">
      {tabs.map((tab) => (
        <button
          key={tab.href}
          className="tab"
          data-active={pathname === tab.href}
          role="tab"
          aria-selected={pathname === tab.href}
          onClick={() => router.push(tab.href)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
