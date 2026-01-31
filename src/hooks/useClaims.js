import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

export function useClaims(listingId = null) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchClaims();

      // Subscribe to real-time changes
      const channel = supabase
        .channel("claims_changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "claims" },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setClaims((current) => [payload.new, ...current]);
            } else if (payload.eventType === "UPDATE") {
              setClaims((current) =>
                current.map((claim) =>
                  claim.id === payload.new.id ? payload.new : claim,
                ),
              );
            } else if (payload.eventType === "DELETE") {
              setClaims((current) =>
                current.filter((claim) => claim.id !== payload.old.id),
              );
            }
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, listingId]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("claims")
        .select(
          `
          *,
          listing:food_listings(*),
          recipient:profiles!recipient_id(name, location)
        `,
        )
        .order("created_at", { ascending: false });

      if (listingId) {
        query = query.eq("listing_id", listingId);
      } else {
        // Get claims for current user (as recipient)
        query = query.eq("recipient_id", user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setClaims(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createClaim = async (listingId, pickupTime = null, notes = "") => {
    try {
      // First, update the listing status to claimed
      const { error: updateError } = await supabase
        .from("food_listings")
        .update({ status: "claimed" })
        .eq("id", listingId);

      if (updateError) throw updateError;

      // Then create the claim
      const { data, error } = await supabase
        .from("claims")
        .insert([
          {
            listing_id: listingId,
            recipient_id: user.id,
            pickup_time: pickupTime,
            notes: notes,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Record outcome for AI evaluation and goal tracking
      try {
        const AI_SERVER_URL =
          import.meta.env.VITE_AI_SERVER_URL || "http://localhost:3001";
        await fetch(`${AI_SERVER_URL}/api/outcomes/claim`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            food_listing_id: listingId,
            claim_time: new Date().toISOString(),
          }),
        });
      } catch (outcomeError) {
        console.error("Failed to record outcome:", outcomeError);
        // Don't fail the claim if outcome recording fails
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  };

  const updateClaim = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from("claims")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  };

  const cancelClaim = async (id) => {
    try {
      // Get the claim to find the listing
      const { data: claim } = await supabase
        .from("claims")
        .select("listing_id")
        .eq("id", id)
        .single();

      // Update claim status
      const { error: claimError } = await supabase
        .from("claims")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (claimError) throw claimError;

      // Update listing back to available
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
    createClaim,
    updateClaim,
    cancelClaim,
    approveClaim,
    rejectClaim,
    completeClaim,
    refetch: fetchClaims,
  };
}
