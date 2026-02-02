import { PageHeader } from "../../components/PageHeader";
import { Card, CardContent } from "../../components/Card";
import { useNotifications } from "../../hooks/useNotifications";
import { FiCheck, FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } =
    useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    // Navigate if there's a link (e.g., to a listing)
    // For now, listing details are not fully implemented, but we can go to dashboard
    // if (notification.listing_id) {
    //   navigate("/dashboard");
    // }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Notifications"
          description="Updates about your food matches and claims."
        />
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg transition-colors"
          >
            <FiCheck size={16} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-neutral-muted">
            Loading notifications...
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md cursor-pointer border-l-4 ${
                !notification.is_read
                  ? "border-l-primary bg-primary/5"
                  : "border-l-transparent"
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4 sm:p-6 flex gap-4">
                <div
                  className={`mt-1 p-2 rounded-full flex-shrink-0 ${
                    !notification.is_read
                      ? "bg-white text-primary"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <FiBell size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3
                      className={`font-semibold text-lg ${
                        !notification.is_read
                          ? "text-primary-dark"
                          : "text-neutral-text"
                      }`}
                    >
                      {notification.title}
                    </h3>
                    <span className="text-xs text-neutral-muted whitespace-nowrap">
                      {formatTime(notification.created_at)}
                    </span>
                  </div>
                  <p className="text-neutral-text leading-relaxed">
                    {notification.message}
                  </p>
                  {notification.listing && (
                    <div className="mt-3 flex items-center gap-3 text-sm text-neutral-muted bg-white/50 p-2 rounded-lg border border-black/5">
                      <img
                        src={
                          notification.listing.image_url ||
                          "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop"
                        }
                        alt="Food"
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-neutral-text">
                          {notification.listing.title}
                        </p>
                        <p className="text-xs">
                          {notification.listing.location}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <FiBell size={32} />
            </div>
            <h3 className="text-lg font-medium text-neutral-text mb-2">
              No notifications yet
            </h3>
            <p className="text-neutral-muted max-w-sm mx-auto">
              We'll let you know when there's surplus food available nearby
              matching your preferences.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
