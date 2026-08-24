"use client";

import Link from "next/link";

export default function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-50">
      <div className="flex justify-around py-3 text-white">

        /points-dashboard
          🏆 Leaderboard
        </Link>

        /streaks
          🔥 Streaks
        </Link>

        /stats
          📈 Stats
        </Link>

        <Linkly
          👨‍👩‍👧‍👦 Family
        </Link>

        /challenge
          🏅 Challenge
        </Link>

      </div>
    </div>
  );
}
