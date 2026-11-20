
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout gagal");
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`group flex items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-[12.5px] font-medium text-inkFaint transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-60 ${className}`}
      title="Keluar"
    >
      <svg
        className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>

      <span>{loading ? "Keluar..." : "Keluar"}</span>
    </button>
  );
}
