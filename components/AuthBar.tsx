"use client";

import { signIn, signOut, useSession } from "next-auth/react";

function initials(name?: string | null) {
  if (!name) return "C";
  return name.trim().split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export default function AuthBar() {
  const { data } = useSession();

  if (data?.user) {
    return (
      <div className="auth-bar">
        <div className="auth-circle">{initials(data.user.name)}</div>
        <button className="btn btn-secondary" onClick={() => signOut()}>
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <div className="auth-bar">
      <button className="btn" onClick={() => signIn("google")}>
        Googleでログイン
      </button>
    </div>
  );
}
