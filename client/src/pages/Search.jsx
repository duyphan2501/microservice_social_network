import React, { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  MoreHorizontal,
  Users,
  UserPlus,
  UserCheck,
  Clock,
  X,
} from "lucide-react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

// UserCard Component
const UserCard = ({ user, onAction, loading }) => {
  const getButtonConfig = () => {
    switch (user.friendshipStatus) {
      case "accepted":
      case "friend":
        return {
          text: "Friends",
          icon: <UserCheck size={16} />,
          className: "bg-gray-200 text-gray-700 hover:bg-gray-300",
          action: "unfriend",
        };
      case "request_sent":
      case "pending":
        return {
          text: "Pending",
          icon: <Clock size={16} />,
          className: "bg-gray-200 text-gray-700 cursor-not-allowed",
          action: null,
        };
      case "request_received":
        return {
          text: "Accept",
          icon: <UserCheck size={16} />,
          className: "bg-blue-500 text-white hover:bg-blue-600",
          action: "accept",
        };
      default:
        return {
          text: "Add friend",
          icon: <UserPlus size={16} />,
          className: "bg-black text-white hover:bg-gray-800",
          action: "send",
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <img
          src={
            user.avatar_url ||
            user.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
          }
          alt={user.full_name || user.displayName}
          className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-900 truncate">
              {user.username}
            </span>
          </div>
          <p className="text-gray-500 text-sm truncate">
            {user.full_name || user.displayName}
          </p>
          {user.mutualFriendsCount > 0 && (
            <p className="text-gray-400 text-sm">
              {user.mutualFriendsCount} mutual friend
              {user.mutualFriendsCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
      {buttonConfig.action && (
        <button
          onClick={() => onAction(user, buttonConfig.action)}
          disabled={loading || !buttonConfig.action}
          className={`px-6 py-2 rounded-full font-semibold transition-colors flex-shrink-0 flex items-center gap-2 ${
            buttonConfig.className
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          ) : (
            <>
              {buttonConfig.icon}
              {buttonConfig.text}
            </>
          )}
        </button>
      )}
      {!buttonConfig.action && (
        <span
          className={`px-6 py-2 rounded-full font-semibold flex items-center gap-2 ${buttonConfig.className}`}
        >
          {buttonConfig.icon}
          {buttonConfig.text}
        </span>
      )}
    </div>
  );
};

// FriendCard Component (cho danh sách bạn bè)
const FriendCard = ({ friend, onUnfriend, loading }) => {
  return (
    <div className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <img
          src={
            friend.user?.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.user?.username}`
          }
          alt={friend.user?.full_name}
          className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-900 truncate">
              {friend.user?.username}
            </span>
          </div>
          <p className="text-gray-500 text-sm truncate">
            {friend.user?.full_name}
          </p>
          <p className="text-gray-400 text-xs">
            Friends since {new Date(friend.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <button
        onClick={() => onUnfriend(friend.friend_id)}
        disabled={loading}
        className={`px-6 py-2 rounded-full font-semibold transition-colors flex-shrink-0 bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-600 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "..." : "Unfriend"}
      </button>
    </div>
  );
};

// SearchBar Component
const SearchBar = ({ value, onChange }) => {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        <Search size={20} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search users..."
        className="w-full pl-12 pr-12 py-3 bg-gray-100 rounded-full border-none outline-none focus:ring-2 focus:ring-gray-300 transition-all"
      />
      <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        <SlidersHorizontal size={20} />
      </button>
    </div>
  );
};

// Friends List Modal Component
const FriendsListModal = ({
  isOpen,
  onClose,
  friends,
  loading,
  onUnfriend,
  loadingUnfriend,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">My Friends ({friends.length})</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : friends.length > 0 ? (
            <div className="divide-y">
              {friends.map((friend) => (
                <FriendCard
                  key={friend.friend_id}
                  friend={friend}
                  onUnfriend={onUnfriend}
                  loading={loadingUnfriend}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              You don't have any friends yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App Component
function SearchPage() {
  const axiosPrivate = useAxiosPrivate();

  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Friends list modal states
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [unfriendLoading, setUnfriendLoading] = useState(false);

  useEffect(() => {
    loadUsers(searchQuery);
  }, [searchQuery]);

  // Load users or suggestions
  const loadUsers = async (query) => {
    setLoading(true);
    setError(null);

    try {
      if (query.trim()) {
        // Search users
        const response = await axiosPrivate.get(
          `/api/v1/friend/search/users?query=${encodeURIComponent(
            query
          )}&limit=20`
        );
        setUsers(response.data.data.users || []);
      } else {
        // Load suggestions
        const response = await axiosPrivate.get(
          "/api/v1/friend/search/suggestions?limit=20"
        );
        setUsers(response.data.data.suggestions || []);
      }
    } catch (err) {
      console.error("Error loading users:", err);
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Handle user actions (send, accept, unfriend)
  const handleUserAction = async (user, action) => {
    setActionLoading(true);

    try {
      let response;

      switch (action) {
        case "send":
          // Send friend request
          response = await axiosPrivate.post("/api/v1/friend/friends/request", {
            targetUserId: user.id,
          });

          // Update user status in list
          setUsers((prev) =>
            prev.map((u) =>
              u.id === user.id ? { ...u, friendshipStatus: "request_sent" } : u
            )
          );
          break;

        case "accept":
          // Accept friend request
          response = await axiosPrivate.post("/api/v1/friend/friends/accept", {
            fromUserId: user.id,
          });

          // Update user status in list
          setUsers((prev) =>
            prev.map((u) =>
              u.id === user.id ? { ...u, friendshipStatus: "accepted" } : u
            )
          );
          break;

        case "unfriend":
          // Unfriend
          if (window.confirm(`Unfriend ${user.username}?`)) {
            response = await axiosPrivate.delete(
              "/api/v1/friend/friends/unfriend",
              {
                data: { friendUserId: user.id },
              }
            );

            // Update user status in list
            setUsers((prev) =>
              prev.map((u) =>
                u.id === user.id ? { ...u, friendshipStatus: "none" } : u
              )
            );
          }
          break;
      }

      console.log("Action response:", response?.data);
    } catch (err) {
      console.error(`Error ${action}:`, err);
      alert(err.response?.data?.message || `Failed to ${action}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Load friends list
  const loadFriendsList = async () => {
    setShowFriendsList(true);
    setFriendsLoading(true);

    try {
      const response = await axiosPrivate.get(
        "/api/v1/friend/friends/list?limit=100"
      );
      setFriends(response.data.data.friends || []);
    } catch (err) {
      console.error("Error loading friends:", err);
      alert(err.response?.data?.message || "Failed to load friends list");
    } finally {
      setFriendsLoading(false);
    }
  };

  // Handle unfriend from friends list
  const handleUnfriend = async (friendUserId) => {
    if (!window.confirm("Are you sure you want to unfriend this user?")) {
      return;
    }

    setUnfriendLoading(true);

    try {
      await axiosPrivate.delete("/api/v1/friend/friends/unfriend", {
        data: { friendUserId },
      });

      // Remove from friends list
      setFriends((prev) => prev.filter((f) => f.friend_id !== friendUserId));

      // Update in search results if exists
      setUsers((prev) =>
        prev.map((u) =>
          u.id === friendUserId ? { ...u, friendshipStatus: "none" } : u
        )
      );
    } catch (err) {
      console.error("Error unfriending:", err);
      alert(err.response?.data?.message || "Failed to unfriend");
    } finally {
      setUnfriendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h1 className="text-xl font-bold">Search</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={loadFriendsList}
              className="p-2 hover:bg-gray-100 rounded-full flex items-center gap-2 px-3"
              title="My Friends"
            >
              <Users size={20} />
              <span className="text-sm font-medium">Friends</span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* Results Section */}
        <div className="border-t">
          <h2 className="px-4 py-3 text-gray-500 font-semibold">
            {searchQuery ? "Search Results" : "Follow Suggestions"}
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : users.length > 0 ? (
            <div className="divide-y">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onAction={handleUserAction}
                  loading={actionLoading}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? "No users found" : "No suggestions available"}
            </div>
          )}
        </div>
      </div>

      {/* Friends List Modal */}
      <FriendsListModal
        isOpen={showFriendsList}
        onClose={() => setShowFriendsList(false)}
        friends={friends}
        loading={friendsLoading}
        onUnfriend={handleUnfriend}
        loadingUnfriend={unfriendLoading}
      />
    </div>
  );
}

export default SearchPage;
