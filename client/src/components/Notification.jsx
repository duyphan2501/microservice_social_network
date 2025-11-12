import { useState } from "react";

// Fake API Data
const notificationsData = {
  followRequests: [{ id: 1, username: "anhmazina", others: 8, avatar: "👤" }],
  new: [
    {
      id: 2,
      username: "bst.phen",
      action: "đã gửi lời mời kết bạn",
      time: "10h",
      avatar: "👤",
      type: "follow",
    },
  ],
  today: [
    {
      id: 3,
      username: "bst.a7.fgnaoh.s",
      action: "đã thích ảnh của bạn",
      time: "22h",
      avatar: "👤",
      thumbnail: "🖼️",
      type: "like",
    },
  ],
  yesterday: [
    {
      id: 4,
      username: "flyer.bedeo",
      action: "đã thích bình luận của bạn: sao e comment 2 lần dạ",
      time: "1d",
      avatar: "👤",
      type: "like",
    },
  ],
  thisWeek: [
    {
      id: 5,
      username: "anhmazina",
      action: "đã gửi lời mời kết bạn",
      time: "2d",
      avatar: "👤",
      type: "followRequest",
    },
    {
      id: 6,
      username: "minhthong_minh",
      action: "đã thích ảnh của bạn",
      time: "3d",
      avatar: "👤",
      thumbnail: "🖼️",
      type: "like",
    },
  ],
};

const NotificationItem = ({ notification }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
      <div className="w-11 h-11 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 text-2xl">
        {notification.avatar}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-gray-900 text-sm">
          <span className="font-semibold">{notification.username}</span>
          {notification.others && (
            <span className="text-gray-600">
              {" "}
              + {notification.others} others
            </span>
          )}
          {notification.action && (
            <span className="text-gray-600"> {notification.action}</span>
          )}
          {notification.time && (
            <span className="text-gray-500"> {notification.time}</span>
          )}
        </p>
      </div>

      {notification.thumbnail && (
        <div className="w-11 h-11 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 text-xl">
          {notification.thumbnail}
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

      {notification.type === "followRequest" && !isConfirmed && (
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

const Notification = () => {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Notification</h2>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notificationsData.followRequests.length > 0 && (
          <NotificationSection
            title="Friend request"
            notifications={notificationsData.followRequests}
          />
        )}

        {notificationsData.new.length > 0 && (
          <NotificationSection
            title="New"
            notifications={notificationsData.new}
            hasBlueIndicator={true}
          />
        )}

        {notificationsData.today.length > 0 && (
          <NotificationSection
            title="Today"
            notifications={notificationsData.today}
          />
        )}

        {notificationsData.yesterday.length > 0 && (
          <NotificationSection
            title="Yesterday"
            notifications={notificationsData.yesterday}
          />
        )}

        {notificationsData.thisWeek.length > 0 && (
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
