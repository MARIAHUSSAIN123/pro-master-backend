import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BellDot, Check } from "lucide-react";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../api/notificationApi";

// Small "X minutes/hours/days ago" formatter — good enough for a
// notifications feed, no extra date library needed.
function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyNotifications({ limit: 8 });
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkAsRead = async (id) => {
    // Optimistic update — flip it locally first, then confirm with the server.
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await markNotificationAsRead(id);
    } catch (err) {
      load(); // out of sync with the server — just refetch
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark all as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white text-2xl font-bold flex items-center gap-2">
          Notifications
          {unreadCount > 0 && (
            <span className="text-xs font-semibold bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </h2>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
            >
              Mark all as read
            </button>
          )}
          <BellDot className="text-cyan-400" />
        </div>
      </div>

      <div className="space-y-4">
        {loading && (
          <p className="text-slate-500 text-sm">Loading notifications...</p>
        )}

        {!loading && error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {!loading && !error && notifications.length === 0 && (
          <p className="text-slate-500 text-sm">You're all caught up — no notifications.</p>
        )}

        {!loading &&
          !error &&
          notifications.map((item) => (
            <button
              key={item._id}
              onClick={() => !item.isRead && handleMarkAsRead(item._id)}
              className="w-full flex gap-3 items-start bg-slate-900 p-4 rounded-xl hover:bg-slate-800 duration-300 text-left"
            >
              <div
                className={`w-3 h-3 rounded-full mt-2 shrink-0 ${
                  item.isRead ? "bg-slate-700" : "bg-cyan-400"
                }`}
              ></div>

              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-sm font-medium">{item.title}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{item.body}</p>
                <p className="text-slate-600 text-xs mt-1">{timeAgo(item.createdAt)}</p>
              </div>

              {item.isRead && <Check size={16} className="text-slate-600 shrink-0" />}
            </button>
          ))}
      </div>
    </motion.div>
  );
}
