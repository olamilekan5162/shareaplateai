import { GoogleGenAI } from "@google/genai";
import { trackGemini } from "opik-gemini";

const genAI = trackGemini(
  new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  })
);

/**
 * Generate a short, context-aware coaching message
 */
export async function generateCoachMessage(req, res) {
  try {
    const { role, stats, goals } = req.body;

    if (!role) {
      return res.status(400).json({ error: "Missing user role" });
    }

    const opikMetadata = {
      feature: "impact_coach",
      user_role: role,
      has_goals: goals && goals.length > 0,
    };

    const prompt = buildCoachPrompt(role, stats, goals);

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      metadata: opikMetadata,
    });

    await genAI.flush();

    res.json({
      message: result.text.trim(),
    });
  } catch (err) {
    console.error("Coach message error:", err);
    res.status(500).json({ error: "Failed to generate message" });
  }
}

function buildCoachPrompt(role, stats, goals) {
  const goalContext =
    goals && goals.length > 0
      ? `User's current goals: ${goals
          .map(
            (g) =>
              `- ${g.goal_type}: ${g.current_value}/${g.target_value} (${g.timeframe})`
          )
          .join("\n")}`
      : "User has no active goals set.";

  let statsContext = "";
  if (role === "donor") {
    statsContext = `Stats: ${stats.activeListings} active listings, ${stats.totalListings} total listings.`;
  } else {
    statsContext = `Stats: ${stats.claims} claims made.`;
  }

  return `You are a motivating Impact Coach for a food rescue app.
User Role: ${role}
${statsContext}
${goalContext}

Task: Generate a SINGLE, short, punchy, and motivating sentence (max 15 words) to encourage the user.
- If they are close to a goal, mention it (e.g., "You're only 1 donation away from your weekly goal!").
- If they have no goals, give a general stat-based fact or encouragement (e.g., "Donors like you have saved 500 meals this month!").
- Do NOT use emojis in the text (the UI handles that).
- Do NOT include quotation marks.
- Be specific where possible.`;
}
