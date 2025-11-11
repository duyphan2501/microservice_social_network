import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, MoreHorizontal } from "lucide-react";

// API Service
const api = {
  searchUsers: async (query) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockUsers = [
      {
        id: 1,
        username: "oliviaoftroye",
        displayName: "Olivia of Troye",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia",
        followers: "109K",
      },
      {
        id: 2,
        username: "joyce_white_vance",
        displayName: "Joyce Vance",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joyce",
        followers: "271K",
      },
      {
        id: 3,
        username: "andrewjweinstein",
        displayName: "Andrew Weinstein",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Andrew",
        followers: "120K",
      },
      {
        id: 4,
        username: "hillaryclinton",
        displayName: "Hillary Clinton",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hillary",
        followers: "2.1M",
      },
    ];

    return query
      ? mockUsers.filter(
          (u) =>
            u.username.toLowerCase().includes(query.toLowerCase()) ||
            u.displayName.toLowerCase().includes(query.toLowerCase())
        )
      : mockUsers;
  },
};

// UserCard Component
const UserCard = ({ user, onAddFriend }) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleClick = () => {
    setIsAdded(!isAdded);
    onAddFriend(user.id);
  };

  return (
    <div className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <img
          src={user.avatar}
          alt={user.displayName}
          className="w-12 h-12 rounded-full flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-900 truncate">
              {user.username}
            </span>
          </div>
          <p className="text-gray-500 text-sm">{user.displayName}</p>
          <p className="text-gray-400 text-sm">{user.followers} followers</p>
        </div>
      </div>
      <button
        onClick={handleClick}
        className={`px-6 py-2 rounded-full font-semibold transition-colors flex-shrink-0 ${
          isAdded
            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
            : "bg-black text-white hover:bg-gray-800"
        }`}
      >
        {isAdded ? "Added" : "Add friend"}
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
        placeholder="Search"
        className="w-full pl-12 pr-12 py-3 bg-gray-100 rounded-full border-none outline-none focus:ring-2 focus:ring-gray-300 transition-all"
      />
      <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        <SlidersHorizontal size={20} />
      </button>
    </div>
  );
};

// Main App Component
function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers(searchQuery);
  }, [searchQuery]);

  const loadUsers = async (query) => {
    setLoading(true);
    try {
      const data = await api.searchUsers(query);
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = (userId) => {
    console.log("Add friend:", userId);
    // Handle add friend logic here
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold">Search</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Follow Suggestions */}
        <div className="border-t">
          <h2 className="px-4 py-3 text-gray-500 font-semibold">
            Follow suggestions
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
                  onAddFriend={handleAddFriend}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No users found</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
