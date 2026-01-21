"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.push("/search");
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <div className="splash-screen">
      <div className="splash-brand" aria-label="Clozly">
        <img
          className="splash-mark"
          src="/Clozly_ロゴ_ハンガーのみ.png"
          alt="Clozly"
        />
        <div className="splash-word">Clozly</div>
      </div>
    </div>
  );
}
