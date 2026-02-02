import { PageHeader } from "../../components/PageHeader";
import { ListingCard } from "../../components/ListingCard";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { FiPlus, FiArchive } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useListings } from "../../hooks/useListings";
import { useAuth } from "../../hooks/useAuth";

export function MyListingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { listings, loading } = useListings({ donor_id: user?.id });

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
    distance: listing.location,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Listings"
        description="Manage the food you have shared."
      >
        <Button
          onClick={() => navigate("/dashboard/add")}
          className="flex items-center gap-2"
        >
          <FiPlus size={18} />
          Post New Listing
        </Button>
      </PageHeader>

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
              onAction={() => alert("Edit feature coming soon")}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No active listings"
          description="You haven't listed any food yet."
          actionLabel="List Food Now"
          onAction={() => navigate("/dashboard/add")}
          icon={FiArchive}
        />
      )}
    </div>
  );
}
