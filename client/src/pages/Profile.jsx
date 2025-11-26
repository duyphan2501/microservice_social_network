import { useState, useEffect } from "react";
import EditProfileModal from "../components/EditProfile.jsx";
import ThreadPost from "../components/ThreadPost.jsx";
import useUserStore from "../stores/useUserStore.js";
import useFriendStore from "../stores/useFriendStore.js";
import useAxiosPrivate from "../hooks/useAxiosPrivate.js";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import usePostStore from "../stores/usePostStore.js";
import { useRef } from "react";
import ProfileHeader from "../components/ProfileHeader.jsx";
import API from "../API/axiosInstance.js";
import { useNavigate } from "react-router-dom";

// Main Profile Component
const ProfilePage = () => {
  const username = useParams().username;

  const axiosPrivate = useAxiosPrivate();
  const loaderRef = useRef(null);

  const [user, setUser] = useState();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const { getUserByUsername, refreshUserInfo } = useUserStore();
  const countFriends = useFriendStore((s) => s.countFriends);

  const { posts, hasMore, fetchPosts, resetPosts } = usePostStore();

  const navigator = useNavigate();

  const getProfile = async (userId) => {
    if (!userId) return;
    const friendCount = await countFriends(userId, axiosPrivate);
    setProfile({ ...user, friends: friendCount });
  };

  const loadPosts = async () => {
    if (!user?.id) return;
    if (loading) return;
    if (!hasMore) return;
    console.log("Loading more posts for user:", user.id);
    setLoading(true);
    try {
      await fetchPosts(axiosPrivate, user.id);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore && posts.length > 0) {
          loadPosts();
        }
      },
      { threshold: 1 }
    );

    const node = loaderRef.current;
    if (node) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [user?.id, loading, hasMore]);

  useEffect(() => {
    return () => {
      resetPosts();
    };
  }, [resetPosts]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await getUserByUsername(username, axiosPrivate);
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("The system is under maintenance. Please try again later.")
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [username]);

  useEffect(() => {
    if (!user?.id) return;

    getProfile(user.id);
    resetPosts();
  }, [user]);

  const handleSaveProfile = async (updatedProfile) => {
    try {
      const formData = new FormData();
      formData.append("userId", user?.id);

      for (const key in updatedProfile) {
        if (updatedProfile[key] !== null)
          console.log(`key ${key}: ${updatedProfile[key]}`);
        formData.append(key, updatedProfile[key]);
      }

      setLoadingEdit(true);
      const res = await axiosPrivate.put("/users/update-info", formData);

      if (res.data.success) {
        toast.success("Update successfully!");
        const newUser = res.data.user;
        setUser(newUser);
        navigator(`/profile/${newUser.username}`);
        await refreshUserInfo(user.id, axiosPrivate);
      }

    } catch (error) {
      const message = error?.response?.data?.message || "Update failed!";
      toast.error(message);
    } finally {
      setLoadingEdit(false);
    }
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (loading && posts.length === 0 && !profile) {
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
      <h1 className="font-medium text-lg subtitle text-center py-2">
        Profile Page
      </h1>

      <main className="max-w-2xl mx-auto px-4 pb-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* PROFILE HEADER */}
          <ProfileHeader
            profile={profile}
            onEditClick={() => setIsEditModalOpen(true)}
          />

          <h5 className="flex justify-center uppercase font-bold border-y p-2 border-gray-200">
            Posts by {profile?.full_name || profile?.username}
          </h5>
          {/* POSTS LIST */}
          {posts.length > 0 ? (
            posts.map((post) => (
              <div className="border-b border-gray-200" key={post.id}>
                <ThreadPost postAuthor={profile} post={post} />
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p>No posts yet</p>
            </div>
          )}

          {/* LOADING MORE */}
          {loading && (
            <div className="py-4 text-center text-gray-500">Loading...</div>
          )}

          {/* OBSERVER TARGET */}
          <div ref={loaderRef} className="" />

          {!hasMore && posts.length > 0 && (
            <div className="py-4 text-center text-gray-400 text-sm">
              No more posts
            </div>
          )}
        </div>
      </main>

      {/* EDIT MODAL */}
      <EditProfileModal
        Loading={loadingEdit}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default ProfilePage;
