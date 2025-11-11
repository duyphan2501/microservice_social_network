import React, { useState, useEffect } from "react";

// Component EditProfileModal
const EditProfileModal = ({ isOpen, onClose, profile, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    interests: "",
    instagramBadge: true,
    privacy: "public",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        interests: profile.interests || "",
        instagramBadge: profile.instagramBadge !== false,
        privacy: profile.privacy || "public",
      });
    }
  }, [profile]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button onClick={onClose} className="text-gray-900 font-medium">
            Cancel
          </button>
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <button className="w-16"></button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Name Section */}
          <div>
            <label className="block text-base font-semibold mb-3">Name</label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Name"
                className="flex-1 bg-transparent outline-none text-gray-900"
              />
              <button className="p-1.5 hover:bg-gray-200 rounded-full transition">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m6.36 6.36l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m6.36-6.36l4.24-4.24" />
                </svg>
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
              <span>
                {formData.name} (@{formData.username})
              </span>
            </div>
          </div>

          {/* Bio Section */}
          <div>
            <label className="block text-base font-semibold mb-3">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="+ Write bio"
              className="w-full p-3 bg-gray-50 rounded-lg outline-none resize-none text-gray-900 placeholder:text-gray-400 min-h-[80px]"
            />
          </div>

          {/* Interests Section */}
          <div>
            <label className="block text-base font-semibold mb-3">
              Interests
            </label>
            <input
              type="text"
              value={formData.interests}
              onChange={(e) =>
                setFormData({ ...formData, interests: e.target.value })
              }
              placeholder="Add interests"
              className="w-full p-3 bg-gray-50 rounded-lg outline-none text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Links Section */}
          <div className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 rounded-lg px-3 -mx-3">
            <span className="text-base font-semibold">Links</span>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>

          {/* Instagram Badge Toggle */}
          <div className="py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base font-semibold">
                Show Instagram badge
              </span>
              <button
                onClick={() =>
                  setFormData({
                    ...formData,
                    instagramBadge: !formData.instagramBadge,
                  })
                }
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  formData.instagramBadge ? "bg-black" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${
                    formData.instagramBadge ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              When turned off, the Threads badge on your Instagram profile will
              also disappear.
            </p>
          </div>

          {/* Profile Privacy Section */}
          <div className="py-3">
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg px-3 -mx-3 py-2">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-semibold">
                    Profile privacy
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 capitalize">
                      {formData.privacy}
                    </span>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  If you switch to private, only followers can see your threads.
                  Your replies will be visible to followers and individual
                  profiles you reply to.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
