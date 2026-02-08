import { useState, useEffect } from "react";
import { FiX, FiZap } from "react-icons/fi";

export function ImpactCoach({ role, stats, goals, isReady = false }) {
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't fetch if data isn't ready yet
    if (!isReady || !role) {
      return;
    }

    // Additional validation: ensure we have actual data, not just finished loading
    // This prevents sending empty stats/goals to the API
    const hasValidData = () => {
      if (role === "donor") {
        // For donors, we need listings data (even if 0, it should be a number, not undefined)
        return (
          stats &&
          typeof stats.activeListings === "number" &&
          typeof stats.totalListings === "number"
        );
      } else if (role === "recipient") {
        // For recipients, we need claims data
        return stats && typeof stats.claims === "number";
      }
      return false;
    };

    if (!hasValidData()) {
      console.log("Impact Coach: Waiting for data to populate...");
      return;
    }

    // Create a stable key for caching based on role
    const cacheKey = `impact_coach_${role}`;

    // Check cache first
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { message, timestamp } = JSON.parse(cached);
      const isFresh = Date.now() - timestamp < 4 * 60 * 60 * 1000; // 4 hours cache

      if (isFresh && message) {
        setMessage(message);
        setLoading(false);
        return;
      }
    }

    async function fetchMessage() {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_AI_SERVER_URL || "http://localhost:3001"
          }/api/coach/message`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role, stats, goals }),
          },
        );
        const data = await response.json();
        if (data.message) {
          setMessage(data.message);
          // Update cache
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              message: data.message,
              timestamp: Date.now(),
            }),
          );
        }
      } catch (err) {
        console.error("Failed to fetch coach message", err);
        setIsVisible(false); // Hide on error
      } finally {
        setLoading(false);
      }
    }

    fetchMessage();
    // We use JSON.stringify to create stable references for stats and goals
    // This ensures we re-fetch if the actual data changes (not just the object reference)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, isReady, JSON.stringify(stats), JSON.stringify(goals)]);

  if (!isVisible || (!message && !loading)) return null;

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl bg-white p-0.5 shadow-sm">
      {/* Gradient Border content */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20" />

      {/* Inner Content */}
      <div className="relative flex items-start gap-4 rounded-[10px] bg-white p-4">
        {/* Icon */}
        <div className="flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-2 text-white shadow-md">
          <FiZap size={20} className={loading ? "animate-pulse" : ""} />
        </div>

        {/* Text */}
        <div className="flex-1 pt-0.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">
            Impact Coach
          </h4>
          {loading ? (
            <div className="h-5 w-3/4 animate-pulse rounded bg-gray-100" />
          ) : (
            <p className="text-sm font-medium text-neutral-text leading-relaxed">
              {message}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <FiX size={18} />
        </button>
      </div>
    </div>
  );
}
