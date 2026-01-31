import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

/**
 * Hook for fetching claims for donor's listings
 */
export function useDonorClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDonorClaims();

      // Subscribe to real-time changes
      const channel = supabase
        .channel("donor_claims_changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "claims" },
          () => {
            // Refetch when any claim changes
            fetchDonorClaims();
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchDonorClaims = async () => {
    try {
      setLoading(true);

      // Get all claims for listings owned by this donor
      const { data, error } = await supabase
        .from("claims")
        .select(
          `
          *,
          listing:food_listings!inner(
            *,
            donor:profiles!donor_id(name, location)
          ),
          recipient:profiles!recipient_id(name, location)
        `,
        )
        .eq("listing.donor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (err) {
      console.error("Error fetching donor claims:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const approveClaim = async (id) => {
    try {
      const { data, error } = await supabase
        .from("claims")
        .update({ status: "confirmed" })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  };

  const rejectClaim = async (id) => {
    try {
      // Get the claim to find the listing
      const { data: claim } = await supabase
        .from("claims")
        .select("listing_id")
        .eq("id", id)
        .single();

      // Update claim status to cancelled
      const { error: claimError } = await supabase
        .from("claims")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (claimError) throw claimError;

      // Update listing back to available so others can claim
      if (claim) {
        await supabase
          .from("food_listings")
          .update({ status: "available" })
          .eq("id", claim.listing_id);
      }

      return { error: null };
    } catch (err) {
      return { error: err.message };
    }
  };

  const completeClaim = async (id) => {
    try {
      const { data, error } = await supabase
        .from("claims")
        .update({ status: "completed" })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  };

  return {
    claims,
    loading,
    error,
    approveClaim,
    rejectClaim,
    completeClaim,
    refetch: fetchDonorClaims,
  };
}
