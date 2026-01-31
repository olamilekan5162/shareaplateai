import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

export function useListings(filters = {}) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchListings();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("food_listings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "food_listings" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setListings((current) => [payload.new, ...current]);
          } else if (payload.eventType === "UPDATE") {
            setListings((current) =>
              current.map((listing) =>
                listing.id === payload.new.id ? payload.new : listing
              )
            );
          } else if (payload.eventType === "DELETE") {
            setListings((current) =>
              current.filter((listing) => listing.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters.status, filters.food_type]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("food_listings")
        .select(
          `
          *,
          donor:profiles!donor_id(name, location)
        `
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.food_type) {
        query = query.eq("food_type", filters.food_type);
      }
      if (filters.donor_id) {
        query = query.eq("donor_id", filters.donor_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setListings(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createListing = async (listingData) => {
    try {
      const { data, error } = await supabase
        .from("food_listings")
        .insert([
          {
            ...listingData,
            donor_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  };

  const updateListing = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from("food_listings")
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

  const deleteListing = async (id) => {
    try {
      const { error } = await supabase
        .from("food_listings")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err.message };
    }
  };

  return {
    listings,
    loading,
    error,
    createListing,
    updateListing,
    deleteListing,
    refetch: fetchListings,
  };
}
