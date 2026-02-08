import { StatCard } from "../../components/StatCard";
import { ListingCard } from "../../components/ListingCard";
import { PageHeader } from "../../components/PageHeader";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { FiPlus, FiArchive, FiCheckCircle, FiTrendingUp } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useListings } from "../../hooks/useListings";
import { useAuth } from "../../hooks/useAuth";
import { GoalProgress } from "../../components/GoalProgress";
import { GoalPrompt } from "../../components/GoalPrompt";
import { useGoals } from "../../hooks/useGoals";
import { useState, useEffect } from "react";
import { ImpactCoach } from "../../components/ImpactCoach";

export function DonorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { listings, loading } = useListings({
    donor_id: user?.id,
    status: "available",
  });
  const { goals, loading: goalsLoading } = useGoals();
  const [showGoalPrompt, setShowGoalPrompt] = useState(false);

  // Show goal prompt if user has no goals (after loading completes)
  useEffect(() => {
    if (!goalsLoading && goals.length === 0) {
      // Delay showing the prompt slightly for better UX
      const timer = setTimeout(() => {
        setShowGoalPrompt(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [goalsLoading, goals]);

  // Calculate stats from real data
  const activeListings = listings.filter(
    (l) => l.status === "available",
  ).length;

  const formatExpiry = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "expired";
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "tomorrow";
    return `in ${diffDays} days`;
  };

  const transformListing = (listing) => ({
    ...listing,
    expiry: formatExpiry(listing.expiry_date),
    tags: listing.dietary_tags || [],
    distance: listing.donor?.location || listing.location,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Donor Dashboard"
        description="Manage your donations and track your impact."
      >
        <Button
          onClick={() => navigate("/dashboard/add")}
          className="flex items-center gap-2"
        >
          <FiPlus size={18} />
          List Food
        </Button>
      </PageHeader>

      <ImpactCoach
        role="donor"
        stats={{
          activeListings,
          totalListings: listings.length,
        }}
        goals={goals}
        isReady={!loading && !goalsLoading}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Listings"
          value={activeListings.toString()}
          icon={FiArchive}
          className="border-green-100"
        />
        <StatCard
          title="Total Listings"
          value={listings.length.toString()}
          icon={FiCheckCircle}
          className="border-blue-100"
        />
        <StatCard
          title="Impact Score"
          value="980"
          icon={FiTrendingUp}
          className="border-purple-100"
        />
      </div>

      {/* Goal Progress */}
      <div>
        <h3 className="text-lg font-bold text-neutral-text mb-4 mt-8">
          Your Goals
        </h3>
        <GoalProgress />
      </div>

      {/* Listings Section */}
      <div>
        <h3 className="text-lg font-bold text-neutral-text mb-4 mt-8">
          Your Active Listings
        </h3>
        {loading ? (
          <div className="text-center py-12 text-neutral-muted">
            Loading your listings...
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={transformListing(listing)}
                isDonor={true}
                onAction={() => navigate(`/dashboard/listings/${listing.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No active listings"
            description="You haven't listed any food yet. Start sharing to make an impact!"
            actionLabel="List Food Now"
            onAction={() => navigate("/dashboard/add")}
            icon={FiArchive}
          />
        )}
      </div>

      {/* Goal Prompt Modal */}
      {showGoalPrompt && (
        <GoalPrompt
          onClose={() => setShowGoalPrompt(false)}
          onComplete={() => setShowGoalPrompt(false)}
        />
      )}
    </div>
  );
}
