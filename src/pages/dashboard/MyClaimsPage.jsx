import { PageHeader } from "../../components/PageHeader";
import { Card, CardContent } from "../../components/Card";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import {
  FiPackage,
  FiMapPin,
  FiClock,
  FiX,
  FiCheckCircle,
} from "react-icons/fi";
import { useClaims } from "../../hooks/useClaims";
import { ClaimStatusBadge } from "../../components/ClaimStatusBadge";

export function MyClaimsPage() {
  const { claims, loading, cancelClaim } = useClaims();

  const handleCancelClaim = async (claimId) => {
    if (confirm("Are you sure you want to cancel this claim?")) {
      const { error } = await cancelClaim(claimId);
      if (error) {
        alert(`Failed to cancel: ${error}`);
      } else {
        alert("Claim cancelled successfully");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Claims"
        description="Track your claimed food items and pickup details."
      />

      {loading ? (
        <div className="text-center py-12 text-neutral-muted">
          Loading your claims...
        </div>
      ) : claims.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {claims.map((claim) => (
            <Card key={claim.id} className="border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-neutral-text mb-2">
                          {claim.listing?.title || "Unknown Item"}
                        </h3>
                        <ClaimStatusBadge status={claim.status} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-neutral-muted">
                        <FiPackage className="text-primary" />
                        <span>
                          Quantity: {claim.listing?.quantity || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-muted">
                        <FiMapPin className="text-primary" />
                        <span>
                          {claim.listing?.location || "Location not set"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-muted">
                        <FiClock className="text-primary" />
                        <span>Pickup: {formatDate(claim.pickup_time)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-muted">
                        <FiClock className="text-primary" />
                        <span>Claimed: {formatDate(claim.created_at)}</span>
                      </div>
                    </div>

                    {claim.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-neutral-muted">
                          <strong>Notes:</strong> {claim.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {claim.status === "pending" && (
                    <div className="flex flex-col gap-2">
                      <div className="text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg mb-2">
                        ⏳ Waiting for donor approval
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelClaim(claim.id)}
                        className="flex items-center gap-2"
                      >
                        <FiX size={16} />
                        Cancel Claim
                      </Button>
                    </div>
                  )}
                  {claim.status === "confirmed" && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-2">
                        <FiCheckCircle size={16} /> Approved! Ready for pickup
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelClaim(claim.id)}
                        className="flex items-center gap-2"
                      >
                        <FiX size={16} />
                        Cancel Claim
                      </Button>
                    </div>
                  )}
                  {claim.status === "completed" && (
                    <div className="flex items-center gap-2 text-sm text-green-600 px-3 py-2 rounded-lg">
                      <FiCheckCircle size={16} /> Completed
                    </div>
                  )}
                  {claim.status === "cancelled" && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 px-3 py-2 rounded-lg">
                      <FiX size={16} /> Cancelled
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No claims yet"
          description="You haven't claimed any food items. Browse available listings to get started!"
          actionLabel="Browse Food"
          onAction={() => (window.location.href = "/dashboard")}
          icon={FiPackage}
        />
      )}
    </div>
  );
}
