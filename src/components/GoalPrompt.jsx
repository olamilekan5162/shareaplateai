import { useState } from "react";
import { FiX, FiTarget } from "react-icons/fi";
import { useGoals } from "../hooks/useGoals";
import { useAuth } from "../hooks/useAuth";

export function GoalPrompt({ onClose, onComplete }) {
  const { user } = useAuth();
  const { createGoal } = useGoals();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    goal_type: "",
    target_value: "",
    timeframe: "weekly",
  });

  const donorGoalOptions = [
    { value: "donate_times", label: "Donate food X times per week/month" },
    {
      value: "prevent_items",
      label: "Prevent X food items from expiring per week/month",
    },
  ];

  const recipientGoalOptions = [
    {
      value: "claim_speed",
      label: "Claim food within X minutes of notification",
    },
    { value: "serve_meals", label: "Serve X meals per week/month" },
  ];

  const goalOptions =
    user?.role === "donor" ? donorGoalOptions : recipientGoalOptions;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.goal_type || !formData.target_value) return;

    setLoading(true);
    try {
      await createGoal({
        role: user.role,
        goal_type: formData.goal_type,
        target_value: parseInt(formData.target_value),
        timeframe: formData.timeframe,
      });
      onComplete?.();
      onClose();
    } catch (err) {
      console.error("Failed to create goal:", err);
      alert("Failed to create goal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-muted hover:text-neutral-text"
        >
          <FiX size={24} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <FiTarget size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-text">
              Set Your Goal
            </h2>
            <p className="text-sm text-neutral-muted">
              Track your progress and stay motivated
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              Goal Type
            </label>
            <select
              value={formData.goal_type}
              onChange={(e) =>
                setFormData({ ...formData, goal_type: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select a goal...</option>
              {goalOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              Target Value
            </label>
            <input
              type="number"
              min="1"
              value={formData.target_value}
              onChange={(e) =>
                setFormData({ ...formData, target_value: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter a number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-text mb-2">
              Timeframe
            </label>
            <div className="flex gap-3">
              <label className="flex-1">
                <input
                  type="radio"
                  name="timeframe"
                  value="weekly"
                  checked={formData.timeframe === "weekly"}
                  onChange={(e) =>
                    setFormData({ ...formData, timeframe: e.target.value })
                  }
                  className="sr-only peer"
                />
                <div className="px-4 py-2 border-2 border-gray-200 rounded-lg text-center cursor-pointer peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-colors">
                  Weekly
                </div>
              </label>
              <label className="flex-1">
                <input
                  type="radio"
                  name="timeframe"
                  value="monthly"
                  checked={formData.timeframe === "monthly"}
                  onChange={(e) =>
                    setFormData({ ...formData, timeframe: e.target.value })
                  }
                  className="sr-only peer"
                />
                <div className="px-4 py-2 border-2 border-gray-200 rounded-lg text-center cursor-pointer peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-colors">
                  Monthly
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-neutral-text hover:bg-gray-50 transition-colors"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Set Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
