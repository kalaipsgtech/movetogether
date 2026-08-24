"use client";

import Link from "next/link";

export default function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-50">
      <div className="flex justify-around py-3 text-white">

        <Link href="/">
          🏆 Leaderboard
        </Link>

        <Link href="/">
          🔥 Streaks
        </Link>

        <Link href="/">
          📈 Stats
        </Link>

        <Link href="/">
          👨‍👩‍👧‍👦 Family
        </Link>

        <Link href="/">
          🏅 Challenge
        </Link>

      </div>
    </div>
  );
}
