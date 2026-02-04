import { FiTarget, FiTrendingUp, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { useGoals } from "../hooks/useGoals";
import { useState } from "react";
import toast from "react-hot-toast";

export function GoalProgress() {
  const { progress, loading, updateGoal, deleteGoal } = useGoals();
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    target_value: "",
    timeframe: "",
  });

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      target_value: goal.target_value.toString(),
      timeframe: goal.timeframe,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const updatePromise = updateGoal(editingGoal.id, {
      target_value: parseInt(formData.target_value),
      timeframe: formData.timeframe,
    });

    await toast.promise(updatePromise, {
      loading: "Updating goal...",
      success: "Goal updated successfully",
      error: "Failed to update goal",
    });

    setEditingGoal(null);
  };

  const handleDelete = async (goalId) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      const deletePromise = deleteGoal(goalId);
      await toast.promise(deletePromise, {
        loading: "Deleting goal...",
        success: "Goal deleted successfully",
        error: "Failed to delete goal",
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!progress || progress.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-4">
        {progress.map((goal) => {
          const isComplete = goal.current_value >= goal.target_value;
          const progressPercentage = Math.min(100, goal.progress_percentage);

          return (
            <div
              key={goal.id}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:border-primary/30 transition-colors"
            >
              {/* Header: Title and Actions */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${isComplete ? "bg-green-100" : "bg-gray-50 text-gray-400"}`}
                  >
                    {isComplete ? (
                      <FiTrendingUp size={20} className="text-green-600" />
                    ) : (
                      <FiTarget size={20} className="" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-text">
                      {formatGoalType(goal.goal_type)}
                    </h3>
                    <p className="text-sm text-neutral-muted capitalize">
                      {goal.timeframe} goal
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Edit goal"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete goal"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-neutral-text">
                    {goal.current_value} / {goal.target_value}
                  </span>
                  <span className="text-neutral-muted">
                    {progressPercentage}%
                  </span>
                </div>
                <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                      isComplete ? "bg-green-500" : "bg-primary"
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {isComplete && (
                <div className="text-sm text-green-600 font-medium flex items-center gap-1.5">
                  <span>🎉</span> Goal achieved!
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-neutral-text">Edit Goal</h3>
              <button
                onClick={() => setEditingGoal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Goal Type
                </label>
                <p className="text-sm text-neutral-muted capitalize">
                  {formatGoalType(editingGoal.goal_type)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Target Value
                </label>
                <input
                  type="number"
                  value={formData.target_value}
                  onChange={(e) =>
                    setFormData({ ...formData, target_value: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-text mb-2">
                  Timeframe
                </label>
                <select
                  value={formData.timeframe}
                  onChange={(e) =>
                    setFormData({ ...formData, timeframe: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Update Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function formatGoalType(goalType) {
  const formats = {
    donate_times: "Donate food regularly",
    prevent_items: "Prevent food waste",
    claim_speed: "Quick claim response",
    serve_meals: "Serve meals",
  };
  return formats[goalType] || goalType;
}
