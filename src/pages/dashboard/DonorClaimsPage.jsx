import { PageHeader } from "../../components/PageHeader";
import { Card, CardContent } from "../../components/Card";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { ClaimStatusBadge } from "../../components/ClaimStatusBadge";
import { FiPackage, FiCheck, FiX, FiCheckCircle } from "react-icons/fi";
import { useDonorClaims } from "../../hooks/useDonorClaims";

export function DonorClaimsPage() {
  const { claims, loading, approveClaim, rejectClaim, completeClaim } =
    useDonorClaims();

  const handleApprove = async (claimId) => {
    const { error } = await approveClaim(claimId);
    if (error) {
      alert(`Failed to approve: ${error}`);
    } else {
      alert("Claim approved successfully!");
    }
  };

  const handleReject = async (claimId) => {
    if (
      confirm(
        "Are you sure you want to reject this claim? The listing will become available for others.",
      )
    ) {
      const { error } = await rejectClaim(claimId);
      if (error) {
        alert(`Failed to reject: ${error}`);
      } else {
        alert("Claim rejected. Listing is now available.");
      }
    }
  };

  const handleComplete = async (claimId) => {
    if (
      confirm(
        "Mark this claim as completed? This confirms the food was picked up.",
      )
    ) {
      const { error } = await completeClaim(claimId);
      if (error) {
        alert(`Failed to complete: ${error}`);
      } else {
        alert("Claim marked as completed!");
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Group claims by status
  const pendingClaims = claims.filter((c) => c.status === "pending");
  const confirmedClaims = claims.filter((c) => c.status === "confirmed");
  const completedClaims = claims.filter((c) => c.status === "completed");
  const cancelledClaims = claims.filter((c) => c.status === "cancelled");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Claim Requests"
        description="Manage claims for your food donations."
      />

      {loading ? (
        <div className="text-center py-12 text-neutral-muted">
          Loading claims...
        </div>
      ) : claims.length > 0 ? (
        <div className="space-y-8">
          {/* Pending Claims */}
          {pendingClaims.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-neutral-text mb-4">
                Pending Approval ({pendingClaims.length})
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {pendingClaims.map((claim) => (
                  <Card
                    key={claim.id}
                    className="border-l-4 border-l-yellow-500"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-bold text-lg text-neutral-text mb-1">
                                {claim.listing?.title}
                              </h4>
                              <p className="text-sm text-neutral-muted">
                                Claimed by:{" "}
                                <strong>
                                  {claim.recipient?.name || "Unknown"}
                                </strong>
                              </p>
                              <p className="text-xs text-neutral-muted mt-1">
                                Claimed: {formatDate(claim.created_at)}
                              </p>
                            </div>
                            <ClaimStatusBadge status={claim.status} />
                          </div>
                          <div className="text-sm text-neutral-muted">
                            <p>Quantity: {claim.listing?.quantity}</p>
                            <p>Location: {claim.listing?.location}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(claim.id)}
                              className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                            >
                              <FiCheck size={16} />
                              Approve
                            </Button>
                          </div>
                          <div>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleReject(claim.id)}
                              className="flex items-center gap-1"
                            >
                              <FiX size={16} />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Confirmed Claims */}
          {confirmedClaims.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-neutral-text mb-4">
                Confirmed - Awaiting Pickup ({confirmedClaims.length})
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {confirmedClaims.map((claim) => (
                  <Card key={claim.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-bold text-lg text-neutral-text mb-1">
                                {claim.listing?.title}
                              </h4>
                              <p className="text-sm text-neutral-muted">
                                Recipient:{" "}
                                <strong>
                                  {claim.recipient?.name || "Unknown"}
                                </strong>
                              </p>
                              <p className="text-xs text-neutral-muted mt-1">
                                Confirmed: {formatDate(claim.updated_at)}
                              </p>
                            </div>
                            <ClaimStatusBadge status={claim.status} />
                          </div>
                          <div className="text-sm text-neutral-muted">
                            <p>Quantity: {claim.listing?.quantity}</p>
                            <p>Location: {claim.listing?.location}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div>
                            <Button
                              size="sm"
                              onClick={() => handleComplete(claim.id)}
                              className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                            >
                              <FiCheckCircle size={16} />
                              Mark Completed
                            </Button>
                          </div>
                          <div>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleReject(claim.id)}
                              className="flex items-center gap-1"
                            >
                              <FiX size={16} />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Completed Claims */}
          {completedClaims.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-neutral-text mb-4">
                Completed ({completedClaims.length})
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {completedClaims.map((claim) => (
                  <Card
                    key={claim.id}
                    className="border-l-4 border-l-green-500"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-bold text-lg text-neutral-text mb-1">
                                {claim.listing?.title}
                              </h4>
                              <p className="text-sm text-neutral-muted">
                                Recipient:{" "}
                                <strong>
                                  {claim.recipient?.name || "Unknown"}
                                </strong>
                              </p>
                              <p className="text-xs text-neutral-muted mt-1">
                                Completed: {formatDate(claim.updated_at)}
                              </p>
                            </div>
                            <ClaimStatusBadge status={claim.status} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Cancelled Claims */}
          {cancelledClaims.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-neutral-text mb-4">
                Cancelled ({cancelledClaims.length})
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {cancelledClaims.map((claim) => (
                  <Card key={claim.id} className="border-l-4 border-l-gray-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-bold text-lg text-neutral-text mb-1">
                                {claim.listing?.title}
                              </h4>
                              <p className="text-sm text-neutral-muted">
                                Recipient:{" "}
                                <strong>
                                  {claim.recipient?.name || "Unknown"}
                                </strong>
                              </p>
                              <p className="text-xs text-neutral-muted mt-1">
                                Cancelled: {formatDate(claim.updated_at)}
                              </p>
                            </div>
                            <ClaimStatusBadge status={claim.status} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No claims yet"
          description="When recipients claim your food donations, they will appear here."
          icon={FiPackage}
        />
      )}
    </div>
  );
}
