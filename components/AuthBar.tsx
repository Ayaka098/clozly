"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export default function AuthBar() {
  const { data } = useSession();
  const isLoggedIn = Boolean(data?.user);

  return (
    isLoggedIn ? (
      <Link
        href="/account"
        className="auth-tab"
        aria-label="マイページ"
      >
        <span className="auth-tab-icon" aria-hidden="true">
          <span className="auth-tab-head" />
          <span className="auth-tab-body" />
        </span>
        マイページ
      </Link>
    ) : (
      <button className="auth-login" onClick={() => signIn("google")} type="button">
        ログイン
      </button>
    )
  );
}
