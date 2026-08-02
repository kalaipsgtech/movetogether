const { data: activities } = await supabase
  .from("Activities")
  .select(
    "athlete_id, activity_type, points"
  );

const { data: athletes } = await supabase
  .from("athletes")
  .select(
    "athlete_id, first_name, last_name"
  );
