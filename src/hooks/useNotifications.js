import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Subscribe to real-time notifications
      const channel = supabase
        .channel("notifications_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `recipient_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setNotifications((current) => [payload.new, ...current]);
              if (!payload.new.is_read) {
                setUnreadCount((count) => count + 1);
              }
            } else if (payload.eventType === "UPDATE") {
              setNotifications((current) =>
                current.map((notif) =>
                  notif.id === payload.new.id ? payload.new : notif
                )
              );
              // Recalculate unread count
              fetchNotifications();
            } else if (payload.eventType === "DELETE") {
              setNotifications((current) =>
                current.filter((notif) => notif.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
          *,
          listing:food_listings(title, quantity, location, image_url)
        `
        )
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications((current) =>
        current.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("recipient_id", user.id)
        .eq("is_read", false);

      if (error) throw error;

      setNotifications((current) =>
        current.map((notif) => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
