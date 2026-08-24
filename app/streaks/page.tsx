import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL"
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

type AthleteRow = {
  athlete_id: number;
  firstname?: string | null;
  lastname?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  athlete_name?: string | null;
  name?: string | null;
};

type ActivityRow = {
  athlete_id: number;
  activity_date: string;
  activity_type?: string | null;
};

type StreakRow = {
  athleteId: number;
  athleteName: string;
  streak: number;
  activeToday: boolean;
};

/*
  Convert a date into YYYY-MM-DD using India time.
  This prevents UTC from moving late-night or
  early-morning activities to the wrong day.
*/
function getIndiaDateKey(
  dateValue: string | Date
) {
  const date =
    dateValue instanceof Date
      ? dateValue
      : new Date(dateValue);

  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).formatToParts(date);

  const year =
    parts.find(
      (part) => part.type === "year"
    )?.value;

  const month =
    parts.find(
      (part) => part.type === "month"
    )?.value;

  const day =
    parts.find(
      (part) => part.type === "day"
    )?.value;

  return `${year}-${month}-${day}`;
}

/*
  Move backwards by a whole calendar day.

  Noon UTC is used to avoid boundary issues while
  converting between UTC and India time.
*/
function getPreviousDateKey(
  indiaDateKey: string
) {
  const [year, month, day] =
    indiaDateKey
      .split("-")
      .map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      12,
      0,
      0
    )
  );

  date.setUTCDate(
    date.getUTCDate() - 1
  );

  return getIndiaDateKey(date);
}

function getAthleteName(
  athlete: AthleteRow
) {
  if (
    athlete.athlete_name &&
    athlete.athlete_name.trim()
  ) {
    return athlete.athlete_name.trim();
  }

  if (
    athlete.name &&
    athlete.name.trim()
  ) {
    return athlete.name.trim();
  }

  const firstName =
    athlete.firstname ||
    athlete.first_name ||
    "";

  const lastName =
    athlete.lastname ||
    athlete.last_name ||
    "";

  const fullName =
    `${firstName} ${lastName}`.trim();

  if (fullName) {
    return fullName;
  }

  return `Athlete ${athlete.athlete_id}`;
}

function calculateCurrentStreak(
  activeDateKeys: Set<string>,
  todayKey: string
) {
  let streak = 0;

  const hasToday =
    activeDateKeys.has(todayKey);

  let dateToCheck = hasToday
    ? todayKey
    : getPreviousDateKey(todayKey);

  while (
    activeDateKeys.has(dateToCheck)
  ) {
    streak += 1;

    dateToCheck =
      getPreviousDateKey(dateToCheck);
  }

  return streak;
}

export default async function StreaksPage() {
  const [
    athletesResult,
    activitiesResult,
  ] = await Promise.all([
    supabase
      .from("athletes")
      .select("*"),

    supabase
      .from("Activities")
      .select(
        "athlete_id, activity_date, activity_type"
      ),
  ]);

  if (athletesResult.error) {
    return (
      <main className="min-h-screen bg-rose-50 px-4 pb-28 pt-6">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-red-700">
            Unable to load athletes
          </h1>

          <p className="mt-3 text-sm text-red-600">
            {athletesResult.error.message}
          </p>
        </div>
      </main>
    );
  }

  if (activitiesResult.error) {
    return (
      <main className="min-h-screen bg-rose-50 px-4 pb-28 pt-6">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-red-700">
            Unable to load activities
          </h1>

          <p className="mt-3 text-sm text-red-600">
            {activitiesResult.error.message}
          </p>
        </div>
      </main>
    );
  }

  const athletes =
    (athletesResult.data ||
      []) as AthleteRow[];

  const activities =
    (activitiesResult.data ||
      []) as ActivityRow[];

  const todayKey =
    getIndiaDateKey(new Date());

  /*
    Store the distinct active dates of every
    athlete. Multiple activities on the same
    day still represent one active day.
  */
  const datesByAthlete =
    new Map<number, Set<string>>();

  for (const activity of activities) {
    if (
      !activity.athlete_id ||
      !activity.activity_date
    ) {
      continue;
    }

    const activityType =
      activity.activity_type || "";

    const supportedTypes = [
      "Walk",
      "Run",
      "Ride",
    ];

    if (
      activityType &&
      !supportedTypes.includes(
        activityType
      )
    ) {
      continue;
    }

    const dateKey =
      getIndiaDateKey(
        activity.activity_date
      );

    if (
      !datesByAthlete.has(
        activity.athlete_id
      )
    ) {
      datesByAthlete.set(
        activity.athlete_id,
        new Set<string>()
      );
    }

    datesByAthlete
      .get(activity.athlete_id)
      ?.add(dateKey);
  }

  const streakRows: StreakRow[] =
    athletes.map((athlete) => {
      const activeDateKeys =
        datesByAthlete.get(
          athlete.athlete_id
        ) || new Set<string>();

      return {
        athleteId:
          athlete.athlete_id,

        athleteName:
          getAthleteName(athlete),

        streak:
          calculateCurrentStreak(
            activeDateKeys,
            todayKey
          ),

        activeToday:
          activeDateKeys.has(todayKey),
      };
    });

  streakRows.sort((a, b) => {
    if (b.streak !== a.streak) {
      return b.streak - a.streak;
    }

    return a.athleteName.localeCompare(
      b.athleteName
    );
  });

  const displayDate =
    new Intl.DateTimeFormat(
      "en-IN",
      {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    ).format(new Date());

  return (
    <main className="min-h-screen bg-rose-50 px-4 pb-28 pt-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <div className="text-5xl">
            🔥
          </div>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Current Streaks
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Consecutive active days as of{" "}
            {displayDate}
          </p>
        </div>

        {streakRows.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center shadow">
            <p className="text-slate-600">
              No athletes were found.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {streakRows.map(
              (athlete, index) => (
                <div
                  key={athlete.athleteId}
                  className="flex items-center justify-between rounded-2xl border border-rose-100 bg-white px-4 py-4 shadow-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {athlete.athleteName}
                      </p>

                      <p className="text-xs text-slate-500">
                        {athlete.activeToday
                          ? "Active today"
                          : "No activity today"}
                      </p>
                    </div>
                  </div>

                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    <span className="text-2xl">
                      {athlete.streak > 0
                        ? "🔥"
                        : "➖"}
                    </span>

                    <div className="text-right">
                      <p className="text-xl font-bold text-orange-600">
                        {athlete.streak}
                      </p>

                      <p className="text-xs text-slate-500">
                        {athlete.streak === 1
                          ? "day"
                          : "days"}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        <div className="mt-5 rounded-xl bg-orange-100 p-4 text-sm text-orange-900">
          A streak continues only when an
          athlete records at least one Walk,
          Run, or Ride on every consecutive
          day, including today.
        </div>
      </div>
    </main>
  );
}
