import { Card, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { ClaimStatusBadge } from "../components/ClaimStatusBadge";
import { FiCheck, FiX, FiCheckCircle } from "react-icons/fi";
import { useClaims } from "../hooks/useClaims";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function PendingClaimsSection() {
  const { user } = useAuth();
  const { claims, loading, approveClaim, rejectClaim, completeClaim } =
    useClaims();
  const [pendingClaims, setPendingClaims] = useState([]);
  const [confirmedClaims, setConfirmedClaims] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (claims && claims.length > 0) {
      // Filter claims for listings owned by this donor
      const donorClaims = claims.filter(
        (claim) => claim.listing?.donor_id === user?.id
      );

      setPendingClaims(donorClaims.filter((c) => c.status === "pending"));
      setConfirmedClaims(donorClaims.filter((c) => c.status === "confirmed"));
    }
  }, [claims, user]);

  const handleApprove = async (claimId) => {
    setActionLoading(claimId);
    try {
      await toast.promise(approveClaim(claimId), {
        loading: "Approving claim...",
        success: "Claim approved successfully!",
        error: (err) => `Failed to approve: ${err.message}`,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (claimId) => {
    if (confirm("Are you sure you want to reject this claim?")) {
      setActionLoading(claimId);
      try {
        await toast.promise(rejectClaim(claimId), {
          loading: "Rejecting claim...",
          success: "Claim rejected. Listing is now available for others.",
          error: (err) => `Failed to reject: ${err.message}`,
        });
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleComplete = async (claimId) => {
    if (
      confirm(
        "Mark this claim as completed? This confirms the food was picked up."
      )
    ) {
      setActionLoading(claimId);
      try {
        await toast.promise(completeClaim(claimId), {
          loading: "Completing claim...",
          success: "Claim marked as completed!",
          error: (err) => `Failed to complete: ${err.message}`,
        });
      } finally {
        setActionLoading(null);
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (pendingClaims.length === 0 && confirmedClaims.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Pending Claims */}
      {pendingClaims.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-neutral-text mb-3">
            Pending Claims ({pendingClaims.length})
          </h3>
          <div className="space-y-3">
            {pendingClaims.map((claim) => (
              <Card key={claim.id} className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-neutral-text">
                            {claim.listing?.title}
                          </h4>
                          <p className="text-sm text-neutral-muted">
                            Claimed by: {claim.recipient?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-neutral-muted mt-1">
                            {formatDate(claim.created_at)}
                          </p>
                        </div>
                        <ClaimStatusBadge status={claim.status} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(claim.id)}
                        disabled={actionLoading === claim.id}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading === claim.id ? (
                          <span className="animate-spin text-white">⏳</span>
                        ) : (
                          <FiCheck size={16} />
                        )}
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(claim.id)}
                        disabled={actionLoading === claim.id}
                        className="flex items-center gap-1"
                      >
                        <FiX size={16} />
                        Reject
                      </Button>
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
          <h3 className="text-lg font-bold text-neutral-text mb-3">
            Confirmed Claims ({confirmedClaims.length})
          </h3>
          <div className="space-y-3">
            {confirmedClaims.map((claim) => (
              <Card key={claim.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-neutral-text">
                            {claim.listing?.title}
                          </h4>
                          <p className="text-sm text-neutral-muted">
                            Recipient: {claim.recipient?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-neutral-muted mt-1">
                            Confirmed: {formatDate(claim.updated_at)}
                          </p>
                        </div>
                        <ClaimStatusBadge status={claim.status} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleComplete(claim.id)}
                        disabled={actionLoading === claim.id}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading === claim.id ? (
                          <span className="animate-spin text-white">⏳</span>
                        ) : (
                          <FiCheckCircle size={16} />
                        )}
                        Mark Completed
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(claim.id)}
                        disabled={actionLoading === claim.id}
                        className="flex items-center gap-1"
                      >
                        <FiX size={16} />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
