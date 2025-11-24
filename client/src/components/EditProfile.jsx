import React, { useState, useEffect, useRef } from "react";
import Drawer from "@mui/material/Drawer";

const EditProfileModal = ({ isOpen, onClose, profile, onSave, Loading }) => {
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    bio: "",
    avatarFile: null,
  });
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false); // track avatar bị xóa
  const [isOpenImage, setOpenImage] = useState(false);

  const fileInputRef = useRef(null);

  // Upload image
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatarFile: file }));
      setPreviewAvatar(URL.createObjectURL(file));
      setRemoveAvatar(false); // nếu chọn ảnh mới, không xóa nữa
    }
  };

  // Remove avatar
  const handleRemoveAvatar = () => {
    setPreviewAvatar(null);
    setFormData((prev) => ({ ...prev, avatarFile: null }));
    setRemoveAvatar(true);
  };

  // Load profile data khi modal mở
  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        fullname: profile?.full_name || "",
        username: profile?.username || "",
        bio: profile?.bio || "",
        avatarFile: null,
        base_avatar_url: profile?.avatar_url || "",
      });
      setPreviewAvatar(null);
      setRemoveAvatar(false);
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ ...formData, removeAvatar }); // gửi luôn removeAvatar về server
  };

  // Logic hiển thị avatar
  const renderAvatar = () => {
    if (previewAvatar) {
      return (
        <div className="bg-gray-300 rounded-full w-40 h-40 flex justify-center items-center overflow-hidden">
          <img
            src={previewAvatar}
            alt="avatar preview"
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else if (!removeAvatar && profile.avatar_url) {
      return (
        <div className="bg-gray-300 rounded-full w-40 h-40 flex justify-center items-center overflow-hidden">
          <img
            src={profile.avatar_url}
            alt="avatar preview"
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else {
      return (
        <div className="relative overflow-hidden bg-gray-300 rounded-full w-40 h-40 flex justify-center items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="180px"
            viewBox="0 -960 960 960"
            width="180px"
            fill="#797979ff"
            className="absolute top-3"
          >
            <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z" />
          </svg>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      {/* Drawer cho upload/remove */}
      <Drawer
        anchor="top"
        open={isOpenImage}
        onClose={() => setOpenImage(false)}
        PaperProps={{
          sx: {
            width: 800,
            marginX: "auto",
            marginY: "100px",
            borderRadius: "16px",
          },
        }}
      >
        <div className="flex pt-3 pb-3 flex-col items-center justify-center space-y-3">
          <span className="capitalize mb-5 mt-2 text-xl">
            Change profile photo
          </span>
          <div className="w-full border border-gray-200"></div>

          <span
            onClick={handleUploadClick}
            className="capitalize w-full text-center font-bold text-blue-700 hover:text-blue-400 cursor-pointer"
          >
            Upload photo
          </span>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-full border border-gray-200"></div>

          {!removeAvatar && (profile.avatar_url || previewAvatar) && (
            <>
              <span
                onClick={handleRemoveAvatar}
                className="capitalize w-full text-center font-bold text-red-700 hover:text-red-400 cursor-pointer"
              >
                Remove current photo
              </span>
              <div className="w-full border border-gray-200"></div>
            </>
          )}

          <span
            onClick={() => setOpenImage(false)}
            className="capitalize w-full text-center cursor-pointer"
          >
            Cancel
          </span>
        </div>
      </Drawer>

      {/* Modal chính */}
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
          {/* Avatar */}
          <div
            onClick={() => setOpenImage(true)}
            className=" w-full flex justify-center cursor-pointer"
          >
            {renderAvatar()}
          </div>

          {/* Full name */}
          <div>
            <label className="block text-base font-semibold mb-3">
              Full name
            </label>
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
                value={formData.fullname}
                onChange={(e) =>
                  setFormData({ ...formData, fullname: e.target.value })
                }
                placeholder="Full name"
                className="flex-1 bg-transparent outline-none text-gray-900"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-base font-semibold mb-3">
              Username
            </label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              @
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Username"
                className="flex-1 bg-transparent outline-none text-gray-900"
              />
            </div>
          </div>

          {/* Bio */}
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
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition"
            disabled={Loading}
          >
            {Loading ? (
              <div className="size-full flex justify-center items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              "Done"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
