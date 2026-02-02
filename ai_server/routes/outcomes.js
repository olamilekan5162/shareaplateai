import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

/**
 * Record AI outcome when food is claimed
 */
export async function recordClaim(req, res) {
  try {
    const { food_listing_id, claim_time } = req.body;

    if (!food_listing_id) {
      return res.status(400).json({ error: "Missing food_listing_id" });
    }

    // Get the listing to calculate time_to_claim
    const { data: listing } = await supabase
      .from("food_listings")
      .select("created_at")
      .eq("id", food_listing_id)
      .single();

    let timeToClaimMinutes = null;
    if (listing && claim_time) {
      const listingTime = new Date(listing.created_at);
      const claimTimeDate = new Date(claim_time);
      timeToClaimMinutes = Math.round(
        (claimTimeDate - listingTime) / (1000 * 60),
      );
    }

    // Check if outcome already exists
    const { data: existing } = await supabase
      .from("ai_outcomes")
      .select("id")
      .eq("food_listing_id", food_listing_id)
      .single();

    if (existing) {
      // Update existing outcome
      const { data, error } = await supabase
        .from("ai_outcomes")
        .update({
          claimed: true,
          time_to_claim: timeToClaimMinutes,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, outcome: data });
    }

    // Create new outcome
    const { data, error } = await supabase
      .from("ai_outcomes")
      .insert([
        {
          food_listing_id,
          claimed: true,
          time_to_claim: timeToClaimMinutes,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, outcome: data });
  } catch (err) {
    console.error("Record claim error:", err);
    res.status(500).json({ error: "Failed to record claim" });
  }
}

/**
 * Record AI outcome when food expires
 */
export async function recordExpiration(req, res) {
  try {
    const { food_listing_id } = req.body;

    if (!food_listing_id) {
      return res.status(400).json({ error: "Missing food_listing_id" });
    }

    // Check if outcome already exists
    const { data: existing } = await supabase
      .from("ai_outcomes")
      .select("id")
      .eq("food_listing_id", food_listing_id)
      .single();

    if (existing) {
      // Update existing outcome
      const { data, error } = await supabase
        .from("ai_outcomes")
        .update({ expired: true })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, outcome: data });
    }

    // Create new outcome
    const { data, error } = await supabase
      .from("ai_outcomes")
      .insert([
        {
          food_listing_id,
          expired: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, outcome: data });
  } catch (err) {
    console.error("Record expiration error:", err);
    res.status(500).json({ error: "Failed to record expiration" });
  }
}

/**
 * Get evaluation metrics
 */
export async function getMetrics(req, res) {
  try {
    const { timeframe = "month" } = req.query;

    const now = new Date();
    let startDate;

    if (timeframe === "week") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (timeframe === "month") {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate = new Date(0); // All time
    }

    // Get outcomes in timeframe
    const { data: outcomes, error } = await supabase
      .from("ai_outcomes")
      .select("*")
      .gte("created_at", startDate.toISOString());

    if (error) throw error;

    // Calculate metrics
    const totalOutcomes = outcomes?.length || 0;
    const claimed = outcomes?.filter((o) => o.claimed).length || 0;
    const expired = outcomes?.filter((o) => o.expired).length || 0;
    const avgTimeToClaimMinutes =
      outcomes
        ?.filter((o) => o.time_to_claim)
        .reduce((sum, o) => sum + o.time_to_claim, 0) /
        (outcomes?.filter((o) => o.time_to_claim).length || 1) || 0;

    const claimRate = totalOutcomes > 0 ? (claimed / totalOutcomes) * 100 : 0;

    res.json({
      success: true,
      metrics: {
        total_outcomes: totalOutcomes,
        claimed,
        expired,
        claim_rate: Math.round(claimRate),
        avg_time_to_claim_minutes: Math.round(avgTimeToClaimMinutes),
      },
    });
  } catch (err) {
    console.error("Get metrics error:", err);
    res.status(500).json({ error: "Failed to get metrics" });
  }
}
