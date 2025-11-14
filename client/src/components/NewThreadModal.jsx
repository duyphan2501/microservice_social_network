import React, { useState } from "react";
import { MoreHorizontal, Image, Smile, MapPin, AlignLeft } from "lucide-react";
import MediaUpload from "./MediaUpload";
import useUserStore from "../stores/useUserStore.js";
import usePostStore from "../stores/usePostStore.js";
import useAxiosPrivate from "../hooks/useAxiosPrivate.js";
import BiLoader from "./Biloader.jsx";
import { toast } from "react-toastify";

// Component: NewThreadModal
const NewThreadModal = ({ isOpen, onClose }) => {
  const [content, setContent] = useState("");
  const user = useUserStore((state) => state.user);
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { uploadPostMedia, createNewPost } = usePostStore();
  const axiosPrivate = useAxiosPrivate();
  if (!isOpen) return null;

  const handlePost = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (!content.trim() && media.length === 0) {
        setIsLoading(false);
        return;
      }

      let uploadedMedia = [];
      if (media.length > 0) {
        const formData = new FormData();
        media.forEach((item) => {
          formData.append("mediaFiles", item.file);
        });

        uploadedMedia = await uploadPostMedia(formData, axiosPrivate);
        console.log(uploadedMedia)
      }

      await createNewPost(content, uploadedMedia, user.id, axiosPrivate);

      toast.success("Bài viết đã được đăng thành công!");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Đã xảy ra lỗi khi tạo bài viết."
      );
    } finally {
      setIsLoading(false);
      setContent("");
      setMedia([]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button className="w-16"></button>
          <h2 className="text-lg font-semibold">New thread</h2>
          <button
            onClick={onClose}
            className="text-gray-900 font-medium hover:bg-gray-100 cursor-pointer active:bg-gray-200 p-1 rounded"
          >
            Cancel
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                <img src={user?.avatar_url} alt="" />
              </div>
              <div className="w-0.5 bg-gray-200 flex-grow my-2" />
            </div>

            <div className="flex-grow">
              <div className="mb-4">
                <div className="font-semibold mb-2">{user.username}</div>

                {/* {topic && (
                  <div className="text-sm text-gray-500 mb-2">{topic}</div>
                )}

                <input
                  type="text"
                  placeholder="Add a topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="text-sm text-gray-400 mb-3 w-full outline-none"
                /> */}

                <textarea
                  placeholder="What's new?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full outline-none resize-none text-[15px] min-h-[100px]"
                  autoFocus
                />

                <MediaUpload onMediaChange={setMedia} />
              </div>

              {/* <div className="flex items-center gap-2 text-gray-400">
                <div className="w-6 h-6 rounded-full bg-gray-200" />
                <span className="text-sm">Add to thread</span>
              </div> */}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end">
          <button
            onClick={handlePost}
            disabled={!content.trim() && media.length === 0}
            className="px-6 py-2 bg-black text-white rounded-lg font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800 transition"
          >
            {isLoading ? <BiLoader size={20} /> : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewThreadModal;
