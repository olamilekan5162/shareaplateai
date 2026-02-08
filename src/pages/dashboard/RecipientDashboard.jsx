import { PageHeader } from "../../components/PageHeader";
import { ListingCard } from "../../components/ListingCard";
import { Select } from "../../components/Select";
import { EmptyState } from "../../components/EmptyState";
import { FiSearch, FiStar } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useListings } from "../../hooks/useListings";
import { useClaims } from "../../hooks/useClaims";
import { useFoodMatching } from "../../hooks/useFoodMatching";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { GoalProgress } from "../../components/GoalProgress";
import { GoalPrompt } from "../../components/GoalPrompt";
import { useGoals } from "../../hooks/useGoals";
import toast from "react-hot-toast";
import { ImpactCoach } from "../../components/ImpactCoach";

export function RecipientDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const { user } = useAuth();
  const { listings, loading } = useListings({ status: "available" });
  const { createClaim, claims, loading: claimsLoading } = useClaims();
  const { getRecommendations } = useFoodMatching();
  const [claiming, setClaiming] = useState(null);
  const [recommendedListings, setRecommendedListings] = useState([]);
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

  const formatExpiry = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    if (diffTime < 0) return "expired";
    if (diffHours < 24) return `in ${diffHours} hours`;
    if (diffDays === 1) return "tomorrow";
    return `in ${diffDays} days`;
  };

  const transformListing = (listing) => ({
    ...listing,
    expiry: formatExpiry(listing.expiry_date),
    tags: listing.dietary_tags || [],
    distance: listing.donor?.location || listing.location,
  });

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      category === "all" || listing.food_type === category;
    return matchesSearch && matchesCategory;
  });

  const handleClaim = async (listing) => {
    // Check if listing is still available
    if (listing.status !== "available") {
      alert("This item is no longer available.");
      return;
    }

    // Check if current user has an active claim on this listing
    const userActiveClaim = claims?.find(
      (claim) =>
        claim.listing_id === listing.id && claim.status !== "cancelled",
    );

    if (userActiveClaim) {
      alert("You have already claimed this item!");
      return;
    }

    setClaiming(listing.id);
    const claimPromise = createClaim(listing.id);

    try {
      await toast.promise(claimPromise, {
        loading: "Claiming food...",
        success:
          "Food claimed successfully! Check 'My Claims' for pickup details.",
        error: (err) => `Failed to claim: ${err.message}`,
      });
    } catch (err) {
      // Error handled by toast
    } finally {
      setClaiming(null);
    }
  };

  const isListingClaimed = (listing) => {
    // Check if listing status is claimed or if currently claiming
    return listing.status === "claimed" || claiming === listing.id;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Browse Food"
        description="Find and claim available food across your community."
      />

      <ImpactCoach
        role="recipient"
        stats={{
          claims: claims?.length || 0,
        }}
        goals={goals}
        isReady={!loading && !goalsLoading && !claimsLoading}
      />

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by food name or location..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: "all", label: "All Categories" },
              { value: "produce", label: "Fresh Produce" },
              { value: "bakery", label: "Bakery" },
              { value: "meals", label: "Prepared Meals" },
              { value: "canned", label: "Canned Goods" },
              { value: "dairy", label: "Dairy Products" },
            ]}
          />
        </div>
      </div>

      {/* Goal Progress */}
      <div>
        <h3 className="text-lg font-bold text-neutral-text mb-4">Your Goals</h3>
        <GoalProgress />
      </div>

      {/* AI Recommended for You */}
      {recommendedListings.length > 0 && (
        <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 p-6 rounded-xl border border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <FiStar className="text-primary" size={20} />
            <h3 className="text-lg font-bold text-neutral-text">
              Recommended for You
            </h3>
            <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
              AI Powered
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedListings.map((listing) => (
              <div key={listing.id} className="relative">
                <div className="absolute -top-2 -right-2 z-10 bg-primary text-white text-xs px-2 py-1 rounded-full shadow-lg">
                  {Math.round(listing.aiScore * 100)}% match
                </div>
                <ListingCard
                  listing={transformListing(listing)}
                  onAction={() => handleClaim(listing)}
                  isDonor={false}
                  actionDisabled={isListingClaimed(listing)}
                  isLoading={claiming === listing.id}
                  actionLabel={
                    isListingClaimed(listing) ? "Claimed" : "Claim Food"
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Listings Grid */}
      {loading ? (
        <div className="text-center py-12 text-neutral-muted">
          Loading available food...
        </div>
      ) : filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={transformListing(listing)}
              onAction={() => handleClaim(listing)}
              isDonor={false}
              actionDisabled={isListingClaimed(listing)}
              isLoading={claiming === listing.id}
              actionLabel={isListingClaimed(listing) ? "Claimed" : "Claim Food"}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No listings found"
          description={
            searchTerm || category !== "all"
              ? "Try adjusting your search terms or filters."
              : "No food available at the moment. Check back soon!"
          }
        />
      )}

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
