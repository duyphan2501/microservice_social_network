import React, { useState, useEffect } from "react";
import EditProfileModal from "../components/EditProfile";
import ThreadPost from "../components/ThreadPost";
import NewThreadModal from "../Components/NewThreadModal";

// Component ProfileHeader
const ProfileHeader = ({ profile, onEditClick }) => {
  return (
    <div className="bg-white rounded-t-2xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        {/* Left side - Profile Info */}
        <div className="flex-1">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold mb-1 break-words">
                {profile.name}
              </h1>
              <p className="text-gray-600 mb-3">@{profile.username}</p>
              {profile.bio && (
                <p className="text-sm md:text-base text-gray-700 mb-3 whitespace-pre-line">
                  {profile.bio}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">
                  <span className="font-semibold text-black">
                    {profile.followers}
                  </span>{" "}
                  followers
                </span>
                <span className="text-gray-600">
                  <span className="font-semibold text-black">
                    {profile.following}
                  </span>{" "}
                  following
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Social Links */}
        <div className="flex items-center gap-3 justify-center md:justify-start">
          {profile.socialLinks?.instagram && (
            <a
              href={profile.socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          )}
          {profile.socialLinks?.website && (
            <a
              href={profile.socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </a>
          )}
        </div>
      </div>

      <button
        onClick={onEditClick}
        className="w-full mt-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition"
      >
        Edit profile
      </button>
    </div>
  );
};

// Component ProfileTabs
const ProfileTabs = ({ activeTab, onTabChange }) => {
  const tabs = ["Threads", "Replies", "Media", "Reposts"];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab.toLowerCase())}
            className={`flex-1 py-4 text-sm md:text-base font-semibold transition relative ${
              activeTab === tab.toLowerCase()
                ? "text-black"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab}
            {activeTab === tab.toLowerCase() && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-t-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Component NewPostBox (simplified trigger button)
const NewPostBox = ({ onOpenModal }) => {
  return (
    <div
      className="bg-white p-4 md:p-6 border-b border-gray-200 cursor-pointer"
      onClick={onOpenModal}
    >
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex-shrink-0" />
        <div className="flex-1">
          <div className="text-gray-400 text-base py-2">What's new?</div>
        </div>
        <button className="px-6 py-2 bg-black text-white rounded-full font-semibold text-sm">
          Post
        </button>
      </div>
    </div>
  );
};

// Mock API Service
const ProfileAPI = {
  getProfile: async (userId) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      id: userId,
      name: "Duc Do",
      username: "ducx3452025",
      bio: "Passionate developer 💻 | Tech enthusiast 🚀 | Coffee lover ☕",
      followers: 1234,
      following: 567,
      interests: "Technology, Design, Coffee",
      instagramBadge: true,
      privacy: "public",
      socialLinks: {
        instagram: "https://instagram.com",
        website: "https://example.com",
      },
    };
  },

  getPosts: async (userId, tab = "threads") => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const posts = [
      {
        id: 1,
        username: "ducx3452025",
        time: "2h",
        content:
          "Just finished building an awesome React component with Tailwind CSS! 🎉 The responsiveness is looking great on all devices.",
        likes: 42,
        comments: 8,
        reposts: 3,
        shares: 1,
        media: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
          },
        ],
      },
      {
        id: 2,
        username: "ducx3452025",
        time: "5h",
        content:
          "Working on API integration today. Here are some tips for handling async operations in React:\n\n1. Always use try-catch blocks\n2. Show loading states\n3. Handle errors gracefully\n4. Use proper state management",
        likes: 89,
        comments: 15,
        reposts: 7,
        shares: 4,
        media: [],
      },
      {
        id: 3,
        username: "ducx3452025",
        time: "1d",
        content:
          "Beautiful sunset coding session 🌅 Multiple monitors setup for maximum productivity!",
        likes: 156,
        comments: 23,
        reposts: 12,
        shares: 8,
        media: [
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
          },
          {
            type: "image",
            url: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800",
          },
        ],
      },
    ];

    return posts;
  },

  createPost: async (content) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      id: Date.now(),
      username: "ducx3452025",
      time: "now",
      content,
      likes: 0,
      comments: 0,
      reposts: 0,
      shares: 0,
      media: [],
    };
  },

  updateProfile: async (profileData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true, data: profileData };
  },
};

// Main Profile Component
const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("threads");
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewThreadModalOpen, setIsNewThreadModalOpen] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    loadPosts(activeTab);
  }, [activeTab]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const profileData = await ProfileAPI.getProfile("ducx3452025");
      setProfile(profileData);
      const postsData = await ProfileAPI.getPosts("ducx3452025", "threads");
      setPosts(postsData);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async (tab) => {
    try {
      const postsData = await ProfileAPI.getPosts("ducx3452025", tab);
      setPosts(postsData);
    } catch (error) {
      console.error("Error loading posts:", error);
    }
  };

  const handleNewPost = async (postData) => {
    try {
      const newPost = await ProfileAPI.createPost(postData.content);
      setPosts([newPost, ...posts]);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleSaveProfile = async (updatedProfile) => {
    try {
      await ProfileAPI.updateProfile(updatedProfile);
      setProfile({ ...profile, ...updatedProfile });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleNavigate = (url) => {
    console.log("Navigate to:", url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between">
        <h1 className="text-xl font-bold">Profile</h1>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {profile && (
            <ProfileHeader
              profile={profile}
              onEditClick={() => setIsEditModalOpen(true)}
            />
          )}

          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "threads" && (
            <>
              <NewPostBox onOpenModal={() => setIsNewThreadModalOpen(true)} />
              {posts.length > 0 ? (
                posts.map((post) => (
                  <ThreadPost
                    key={post.id}
                    post={post}
                    onNavigate={handleNavigate}
                  />
                ))
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <p>No posts yet</p>
                </div>
              )}
            </>
          )}

          {activeTab !== "threads" && (
            <div className="p-12 text-center text-gray-500">
              <p>No {activeTab} yet</p>
            </div>
          )}
        </div>
      </main>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />

      {/* New Thread Modal */}
      <NewThreadModal
        isOpen={isNewThreadModalOpen}
        onClose={() => setIsNewThreadModalOpen(false)}
        onPost={handleNewPost}
      />
    </div>
  );
};

export default ProfilePage;
