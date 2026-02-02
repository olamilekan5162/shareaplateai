import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

/**
 * Get user's goals
 */
export async function getUserGoals(req, res) {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("user_goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ success: true, goals: data || [] });
  } catch (err) {
    console.error("Get goals error:", err);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
}

/**
 * Create a new goal
 */
export async function createGoal(req, res) {
  try {
    const { user_id, role, goal_type, target_value, timeframe } = req.body;

    if (!user_id || !role || !goal_type || !target_value || !timeframe) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("user_goals")
      .insert([{ user_id, role, goal_type, target_value, timeframe }])
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, goal: data });
  } catch (err) {
    console.error("Create goal error:", err);
    res.status(500).json({ error: "Failed to create goal" });
  }
}

/**
 * Update a goal
 */
export async function updateGoal(req, res) {
  try {
    const { goalId } = req.params;
    const { goal_type, target_value, timeframe } = req.body;

    const updates = {};
    if (goal_type) updates.goal_type = goal_type;
    if (target_value) updates.target_value = target_value;
    if (timeframe) updates.timeframe = timeframe;

    const { data, error } = await supabase
      .from("user_goals")
      .update(updates)
      .eq("id", goalId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, goal: data });
  } catch (err) {
    console.error("Update goal error:", err);
    res.status(500).json({ error: "Failed to update goal" });
  }
}

/**
 * Delete a goal
 */
export async function deleteGoal(req, res) {
  try {
    const { goalId } = req.params;

    const { error } = await supabase
      .from("user_goals")
      .delete()
      .eq("id", goalId);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error("Delete goal error:", err);
    res.status(500).json({ error: "Failed to delete goal" });
  }
}

/**
 * Calculate goal progress
 */
export async function getGoalProgress(req, res) {
  try {
    const { userId } = req.params;

    // Get user's goals
    const { data: goals, error: goalsError } = await supabase
      .from("user_goals")
      .select("*")
      .eq("user_id", userId);

    if (goalsError) throw goalsError;

    if (!goals || goals.length === 0) {
      return res.json({ success: true, progress: [] });
    }

    // Calculate progress for each goal
    const progress = await Promise.all(
      goals.map(async (goal) => {
        let currentValue = 0;
        const now = new Date();
        let startDate;

        // Calculate timeframe start date
        if (goal.timeframe === "weekly") {
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
        } else if (goal.timeframe === "monthly") {
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
        }

        // Calculate based on role and goal type
        if (goal.role === "donor") {
          if (goal.goal_type.includes("times")) {
            // Count donations in timeframe
            const { count } = await supabase
              .from("food_listings")
              .select("*", { count: "exact", head: true })
              .eq("donor_id", userId)
              .gte("created_at", startDate.toISOString());

            currentValue = count || 0;
          } else if (goal.goal_type.includes("items")) {
            // Count total items donated
            const { data: listings } = await supabase
              .from("food_listings")
              .select("quantity")
              .eq("donor_id", userId)
              .gte("created_at", startDate.toISOString());

            currentValue = listings?.length || 0;
          }
        } else if (goal.role === "recipient") {
          if (goal.goal_type.includes("minutes")) {
            // Average claim time (simplified)
            const { data: claims } = await supabase
              .from("claims")
              .select("created_at, food_listings(created_at)")
              .eq("recipient_id", userId)
              .gte("created_at", startDate.toISOString());

            if (claims && claims.length > 0) {
              const avgMinutes =
                claims.reduce((sum, claim) => {
                  const claimTime = new Date(claim.created_at);
                  const listingTime = new Date(claim.food_listings?.created_at);
                  const diffMinutes = (claimTime - listingTime) / (1000 * 60);
                  return sum + diffMinutes;
                }, 0) / claims.length;

              currentValue = Math.round(avgMinutes);
            }
          } else if (goal.goal_type.includes("meals")) {
            // Count confirmed or completed claims in timeframe (not pending)
            const { count } = await supabase
              .from("claims")
              .select("*", { count: "exact", head: true })
              .eq("recipient_id", userId)
              .in("status", ["confirmed", "completed"])
              .gte("created_at", startDate.toISOString());

            currentValue = count || 0;
          }
        }

        return {
          ...goal,
          current_value: currentValue,
          progress_percentage: Math.min(
            100,
            Math.round((currentValue / goal.target_value) * 100),
          ),
        };
      }),
    );

    res.json({ success: true, progress });
  } catch (err) {
    console.error("Get goal progress error:", err);
    res.status(500).json({ error: "Failed to calculate progress" });
  }
}
