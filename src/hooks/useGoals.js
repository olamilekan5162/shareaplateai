import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AI_SERVER_URL =
  import.meta.env.VITE_AI_SERVER_URL || "http://localhost:3001";

export function useGoals() {
  const [goals, setGoals] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current user
  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  };

  // Fetch user goals
  const fetchGoals = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) return;

      const response = await fetch(`${AI_SERVER_URL}/api/goals/${user.id}`);
      const data = await response.json();

      if (data.success) {
        setGoals(data.goals || []);
      }
    } catch (err) {
      console.error("Failed to fetch goals:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch goal progress
  const fetchProgress = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const response = await fetch(
        `${AI_SERVER_URL}/api/goals/${user.id}/progress`,
      );
      const data = await response.json();
      console.log("progress", data);

      if (data.success) {
        setProgress(data.progress || []);
      }
    } catch (err) {
      console.error("Failed to fetch progress:", err);
    }
  };

  // Create a new goal
  const createGoal = async (goalData) => {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error("Not authenticated");

      const response = await fetch(`${AI_SERVER_URL}/api/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          ...goalData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchGoals();
        await fetchProgress();
        return data.goal;
      } else {
        throw new Error(data.error || "Failed to create goal");
      }
    } catch (err) {
      console.error("Failed to create goal:", err);
      throw err;
    }
  };

  // Update a goal
  const updateGoal = async (goalId, updates) => {
    try {
      const response = await fetch(`${AI_SERVER_URL}/api/goals/${goalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        await fetchGoals();
        await fetchProgress();
        return data.goal;
      } else {
        throw new Error(data.error || "Failed to update goal");
      }
    } catch (err) {
      console.error("Failed to update goal:", err);
      throw err;
    }
  };

  // Delete a goal
  const deleteGoal = async (goalId) => {
    try {
      const response = await fetch(`${AI_SERVER_URL}/api/goals/${goalId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        await fetchGoals();
        await fetchProgress();
      } else {
        throw new Error(data.error || "Failed to delete goal");
      }
    } catch (err) {
      console.error("Failed to delete goal:", err);
      throw err;
    }
  };

  // Load goals on mount
  useEffect(() => {
    fetchGoals();
    fetchProgress();
  }, []);

  // Refresh progress periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProgress();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  return {
    goals,
    progress,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    refreshProgress: fetchProgress,
  };
}
