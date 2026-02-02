import { GoogleGenAI } from "@google/genai";
import { trackGemini } from "opik-gemini";
import { createClient } from "@supabase/supabase-js";
import { notifyRecipientOfMatch } from "../utils/emailNotifications.js";

const genAI = trackGemini(
  new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  }),
);

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

/**
 * Food Matching Agent
 * Analyzes a food listing and ranks potential recipients
 * Automatically saves recommendations and notifies recipients
 */
export async function matchFood(req, res) {
  try {
    const { listing, recipients } = req.body;

    if (!listing || !recipients || recipients.length === 0) {
      return res.status(400).json({ error: "Missing listing or recipients" });
    }

    // Build the prompt for the AI agent
    const prompt = buildMatchingPrompt(listing, recipients);

    // Prepare Opik metadata for evaluation
    const opikMetadata = {
      strategy_used: "proximity_priority",
      food_listing_id: listing.id,
      location: listing.location,
      donor_id: listing.donor_id,
      recipient_count: recipients.length,
      prompt_version: "v2_location_emphasis",
    };

    // Call Gemini with Opik tracking and metadata
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      metadata: opikMetadata, // Attach metadata for Opik
    });

    // Flush Opik logs
    await genAI.flush();

    // Parse the AI response
    const recommendations = parseRecommendations(result.text, recipients);

    // Create AI outcome record for evaluation
    const { data: outcomeRecord } = await supabase
      .from("ai_outcomes")
      .insert([
        {
          food_listing_id: listing.id,
          strategy_used: opikMetadata.strategy_used,
          notified_count: 0, // Will be updated below
        },
      ])
      .select()
      .single();

    // ============================================
    // AUTONOMOUS SYSTEM: Save and Notify
    // ============================================
    let savedRecommendations = [];
    let notifiedCount = 0;

    if (recommendations.length > 0) {
      // 1. Save all recommendations to database
      const { data: savedRecs, error: recError } = await supabase
        .from("ai_recommendations")
        .insert(
          recommendations.map((rec) => ({
            listing_id: listing.id,
            recipient_id: rec.recipient_id,
            rank: rec.rank,
            match_score: rec.match_score,
            reasoning: rec.reasoning,
            status: "pending",
          })),
        )
        .select();

      if (recError) {
        console.error("Failed to save recommendations:", recError);
      } else {
        savedRecommendations = savedRecs || [];
      }

      // 2. Create in-app notifications for high-quality matches (score > 0.7)
      const topMatches = recommendations.filter((r) => r.match_score > 0.7);

      if (topMatches.length > 0 && savedRecommendations.length > 0) {
        const notificationsToInsert = topMatches.map((rec, index) => {
          const savedRec = savedRecommendations.find(
            (sr) => sr.recipient_id === rec.recipient_id,
          );
          return {
            recipient_id: rec.recipient_id,
            listing_id: listing.id,
            recommendation_id: savedRec?.id,
            type: "recommendation",
            title: `New Food Match: ${listing.title}`,
            message: `🍽️ You were recommended for a nearby food listing! ${Math.round(rec.match_score * 100)}% match. ${rec.reasoning}`,
            is_read: false,
          };
        });

        const { error: notifError } = await supabase
          .from("notifications")
          .insert(notificationsToInsert);

        if (notifError) {
          console.error("Failed to create notifications:", notifError);
        } else {
          notifiedCount = notificationsToInsert.length;

          // Update outcome record with notified count
          if (outcomeRecord) {
            await supabase
              .from("ai_outcomes")
              .update({ notified_count: notifiedCount })
              .eq("id", outcomeRecord.id);
          }

          // 3. Update recommendation status to 'notified'
          const notifiedIds = savedRecommendations
            .filter((sr) =>
              topMatches.some((tm) => tm.recipient_id === sr.recipient_id),
            )
            .map((sr) => sr.id);

          await supabase
            .from("ai_recommendations")
            .update({
              status: "notified",
              notified_at: new Date().toISOString(),
            })
            .in("id", notifiedIds);

          // 4. Send email notifications (placeholder)
          for (const rec of topMatches) {
            const recipient = recipients.find((r) => r.id === rec.recipient_id);
            if (recipient) {
              await notifyRecipientOfMatch({
                recipient,
                listing,
                matchScore: rec.match_score,
                reasoning: rec.reasoning,
              });
            }
          }
        }
      }
    }

    res.json({
      success: true,
      recommendations: savedRecommendations,
      notifiedCount,
      message: `AI matching complete. ${notifiedCount} recipients notified.`,
    });
  } catch (err) {
    console.error("Food matching error:", err);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
}

/**
 * Build the prompt for food matching
 */
function buildMatchingPrompt(listing, recipients) {
  const expiryDate = new Date(listing.expiry_date);
  const now = new Date();
  const hoursUntilExpiry = Math.round((expiryDate - now) / (1000 * 60 * 60));

  return `You are a food matching expert for a community food rescue platform in Lagos, Nigeria. Analyze this food donation and recommend the best recipients based on proximity and other factors.

**Food Donation Details:**
- Title: ${listing.title}
- Type: ${listing.food_type}
- Quantity: ${listing.quantity}
- Expires in: ${hoursUntilExpiry} hours
- Location: ${listing.location}
- Dietary tags: ${listing.dietary_tags?.join(", ") || "None"}
- Description: ${listing.description || "N/A"}

**Available Recipients:**
${recipients
  .map(
    (r, i) => `
${i + 1}. ${r.name}
   - Location: ${r.location || "Not specified"}
   - Role: ${r.role}
   - ID: ${r.id}
`,
  )
  .join("\n")}

**Task:**
Rank the top 3 recipients and explain why each is a good match.

**Matching Criteria (in order of importance):**
1. **Location Proximity** (HIGHEST PRIORITY): Recipients in the EXACT SAME location should get significantly higher scores (0.9+). Recipients in different locations should get lower scores (0.6-0.8 max). This is critical for fast pickup.
2. **Urgency**: Food expires in ${hoursUntilExpiry} hours - prioritize recipients who can pick up quickly
3. **Dietary Compatibility**: Match dietary tags if specified
4. **Recipient Type**: NGOs/shelters may handle larger quantities better

**Scoring Guidelines:**
- Same location + good fit: 0.90-0.95
- Same location + perfect fit: 0.95-1.00
- Different location + excellent fit: 0.70-0.85
- Different location + good fit: 0.60-0.75

**Output Format (JSON):**
{
  "recommendations": [
    {
      "recipient_id": "uuid",
      "rank": 1,
      "match_score": 0.95,
      "reasoning": "Same location (${
        listing.location
      }) - can pick up immediately. [Additional reasoning]"
    }
  ]
}

Provide exactly 3 recommendations, ranked from best to worst. ALWAYS mention location proximity first in your reasoning. Be concise but specific.`;
}

/**
 * Parse AI response into structured recommendations
 */
function parseRecommendations(aiResponse, recipients) {
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch =
      aiResponse.match(/```json\n([\s\S]*?)\n```/) ||
      aiResponse.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.warn("Could not parse JSON from AI response");
      return [];
    }

    const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);

    // Validate and enrich recommendations
    return parsed.recommendations
      .filter((rec) => recipients.some((r) => r.id === rec.recipient_id)) // Ensure recipient exists
      .map((rec) => {
        const recipient = recipients.find((r) => r.id === rec.recipient_id);
        return {
          ...rec,
          recipient_name: recipient?.name || "Unknown",
          recipient_location: recipient?.location || "Unknown",
        };
      });
  } catch (err) {
    console.error("Failed to parse recommendations:", err);
    return [];
  }
}

/**
 * Log match outcome for Opik evaluation
 */
export async function logMatchOutcome(req, res) {
  try {
    const { recommendation_id, outcome, time_to_action } = req.body;

    // This would typically save to database
    // For now, just log it
    console.log("Match outcome:", {
      recommendation_id,
      outcome,
      time_to_action,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to log outcome:", err);
    res.status(500).json({ error: "Failed to log outcome" });
  }
}
