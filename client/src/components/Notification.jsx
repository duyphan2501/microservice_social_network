import { useState } from "react";
import useNotificationStore from "../stores/useNotificationStore";
import { useEffect } from "react";
import useUserStore from "../stores/useUserStore";
import usePostStore from "../stores/usePostStore";

const NotificationItem = ({ notification }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
      <div className="w-11 h-11 overflow-hidden bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 text-2xl">
        <img className="w-full h-full" src={notification?.avatar} alt="" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-gray-900 text-sm">
          <span className="font-semibold">{notification?.sender_name}</span>
          {notification?.others && (
            <span className="text-gray-600">
              {" "}
              + {notification.others} others
            </span>
          )}
          {notification.content && (
            <span
              className={`text-gray-600 ${
                notification.is_read ? "" : "font-bold"
              }`}
            >
              {" "}
              {notification.content}
            </span>
          )}
          {notification.created_at && (
            <span className="text-gray-500"> {notification.createdAt}</span>
          )}
        </p>
      </div>

      {notification.post.media.length !== 0 && (
        <div className="w-11 h-11 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 text-xl">
          {notification.thumbnail}
          <img src={notification.post.media[0].media_url} alt="" />
        </div>
      )}

      {notification.type === "follow" && (
        <button
          onClick={() => setIsFollowing(!isFollowing)}
          className={`px-6 py-1.5 rounded-lg font-semibold text-sm transition-colors flex-shrink-0 ${
            isFollowing
              ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isFollowing ? "Bạn bè" : "Add friend"}
        </button>
      )}

      {notification?.type === "followRequest" && !isConfirmed && (
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setIsConfirmed(true)}
            className="px-5 py-1.5 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors"
          >
            Accept
          </button>
          <button className="px-5 py-1.5 bg-gray-200 text-gray-900 rounded-lg font-semibold text-sm hover:bg-gray-300 transition-colors">
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const NotificationSection = ({ title, notifications, hasBlueIndicator }) => (
  <div className="mb-2">
    <div className="flex items-center gap-2 px-4 py-2">
      <h3 className="text-gray-900 font-bold text-base">{title}</h3>
      {hasBlueIndicator && (
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      )}
    </div>
    {notifications.map((notif) => (
      <NotificationItem key={notif.id} notification={notif} />
    ))}
  </div>
);

//Ham ho tro group theo ngay
const groupByDate = (items) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - todayStart.getDay()); // Chủ nhật đầu tuần
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const grouped = {
    new: [],
    today: [],
    thisWeek: [],
    thisMonth: [],
    older: [],
  };

  items.forEach((item) => {
    const createdAt = new Date(item.created_at);

    if (!item.is_read) {
      grouped.new.push({ ...item, createdAt: formatTime(item.created_at) });
    } else if (createdAt >= todayStart) {
      grouped.today.push({ ...item, createdAt: formatTime(item.created_at) });
    } else if (createdAt >= weekStart) {
      grouped.thisWeek.push({
        ...item,
        createdAt: formatTime(item.created_at),
      });
    } else if (createdAt >= monthStart) {
      grouped.thisMonth.push({
        ...item,
        createdAt: formatTime(item.created_at),
      });
    } else {
      grouped.older.push({ ...item, createdAt: formatTime(item.created_at) });
    }
  });

  return grouped;
};

//Chuyen ngay sang kieu de doc
export function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  const diff = now - date; // milliseconds
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 30) return "now";
  if (seconds < 60) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  if (weeks < 4) return `${weeks}w`;
  if (months < 12) return `${months}m`;
  return `${years}y`;
}

const Notification = () => {
  const notifications = useNotificationStore((s) => s.notifications);
  const getNotifications = useNotificationStore((s) => s.getNotifications);
  const viewNotifications = useNotificationStore((s) => s.viewNotifications);
  const [loading, setloading] = useState(false);

  const user = useUserStore((s) => s.user);
  const fetchUserIfNeeded = useUserStore((s) => s.fetchUserIfNeeded);

  const fetchPostIfNeeded = usePostStore((s) => s.fetchPostIfNeeded);

  const [notificationsData, setNotificationsData] = useState([]);

  useEffect(() => {
    const fetchNotificationData = async () => {
      if (!user?.id) return;

      setloading(true);
      const notifications = await getNotifications(user?.id);

      const notificationsWithData = await Promise.all(
        notifications.map(async (n) => {
          const userInfo = await fetchUserIfNeeded(n.sender_id);
          const postInfo = await fetchPostIfNeeded(n.entity_id);
          return {
            ...n,
            sender_name: userInfo?.username || "Anonymous",
            avatar: userInfo?.avatar_url || "",
            post: postInfo || null,
          };
        })
      );

      setNotificationsData(groupByDate(notificationsWithData));
      setloading(false);

      await viewNotifications(user?.id);
    };

    fetchNotificationData();

    return async () => {
      await getNotifications(user?.id);
    };
  }, [user]);

  // Skeleton khi notifications chưa load
  if (loading) {
    return (
      <div className="h-full p-4 space-y-4 bg-white">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-300 h-12 w-12"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Khi có dữ liệu, render bình thường
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Notification</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* {notifications.followRequests?.length > 0 && (
          <NotificationSection
            title="Friend request"
            notifications={notifications.followRequests}
          />
        )} */}
        {notificationsData.new?.length > 0 && (
          <NotificationSection
            title="New"
            notifications={notificationsData.new}
            hasBlueIndicator={true}
          />
        )}
        {notificationsData.today?.length > 0 && (
          <NotificationSection
            title="Today"
            notifications={notificationsData.today}
          />
        )}
        {notificationsData.yesterday?.length > 0 && (
          <NotificationSection
            title="Yesterday"
            notifications={notificationsData.yesterday}
          />
        )}
        {notificationsData.thisWeek?.length > 0 && (
          <NotificationSection
            title="This week"
            notifications={notificationsData.thisWeek}
          />
        )}
      </div>
    </div>
  );
};

export default Notification;
