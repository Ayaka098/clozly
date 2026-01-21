"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

function initials(name?: string | null) {
  if (!name) return "";
  return name.trim().split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export default function AuthBar() {
  const { data } = useSession();
  const label = initials(data?.user?.name);

  return (
    <Link
      href="/account"
      className="auth-circle"
      data-logged-in={Boolean(data?.user)}
      aria-label="アカウント"
    >
      {label || ""}
    </Link>
  );
}
