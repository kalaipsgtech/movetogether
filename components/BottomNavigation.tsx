"use client";

import Link from "next/link";

export default function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-50">
      <div className="flex justify-around py-3 text-white">

        <Link href="/points-dashboard">
          🏆 Leaderboard
        </Link>

       <Link href="/streaks">
          🔥 Streaks
        </Link>

       <Link href="/stats">
          📈 Stats
        </Link>

       <Link href="/family">
          👨‍👩‍👧‍👦 Family
        </Link>

       <Link href="/challenge">
          🏅 Challenge
        </Link>

      </div>
    </div>
  );
}
