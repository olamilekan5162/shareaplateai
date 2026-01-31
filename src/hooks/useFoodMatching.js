import { useState } from "react";

const AI_SERVER_URL =
  import.meta.env.VITE_AI_SERVER_URL || "http://localhost:3001";

export function useFoodMatching() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Get AI-powered recommendations for a food listing
   * @param {Object} listing - The food listing object
   * @param {Array} recipients - Array of potential recipient profiles
   * @returns {Promise<Array>} - Array of ranked recommendations
   */
  const getRecommendations = async (listing, recipients) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${AI_SERVER_URL}/api/match/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listing,
          recipients,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get recommendations");
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (err) {
      setError(err.message);
      console.error("Food matching error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log the outcome of a match recommendation
   * @param {string} recommendationId - UUID of the recommendation
   * @param {string} outcome - 'claimed', 'expired', or 'ignored'
   * @param {number} timeToAction - Time in seconds from recommendation to action
   */
  const logMatchOutcome = async (
    recommendationId,
    outcome,
    timeToAction = null
  ) => {
    try {
      await fetch(`${AI_SERVER_URL}/api/match/outcome`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recommendation_id: recommendationId,
          outcome,
          time_to_action: timeToAction,
        }),
      });
    } catch (err) {
      console.error("Failed to log match outcome:", err);
    }
  };

  return {
    getRecommendations,
    logMatchOutcome,
    loading,
    error,
  };
}
