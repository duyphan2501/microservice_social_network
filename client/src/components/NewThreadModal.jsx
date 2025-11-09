import React, { useState } from "react";
import { MoreHorizontal, Image, Smile, MapPin, AlignLeft } from "lucide-react";

// Component: NewThreadModal
const NewThreadModal = ({ isOpen, onClose, onPost }) => {
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");

  if (!isOpen) return null;

  const handlePost = () => {
    if (content.trim()) {
      onPost({ content, topic, timestamp: new Date() });
      setContent("");
      setTopic("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button onClick={onClose} className="text-gray-900 font-medium">
            Cancel
          </button>
          <h2 className="text-lg font-semibold">New thread</h2>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <AlignLeft className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0" />
              <div className="w-0.5 bg-gray-200 flex-grow my-2" />
            </div>

            <div className="flex-grow">
              <div className="mb-4">
                <div className="font-semibold mb-2">ducx3452025</div>

                {topic && (
                  <div className="text-sm text-gray-500 mb-2">{topic}</div>
                )}

                <input
                  type="text"
                  placeholder="Add a topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="text-sm text-gray-400 mb-3 w-full outline-none"
                />

                <textarea
                  placeholder="What's new?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full outline-none resize-none text-[15px] min-h-[100px]"
                  autoFocus
                />

                <div className="flex gap-3 mt-3">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Image className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <span className="text-gray-400 text-lg">GIF</span>
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Smile className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <AlignLeft className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-6 h-6 rounded-full bg-gray-200" />
                <span className="text-sm">Add to thread</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button className="flex items-center gap-2 text-gray-500">
            <AlignLeft className="w-5 h-5" />
            <span className="text-sm">Reply options</span>
          </button>
          <button
            onClick={handlePost}
            disabled={!content.trim()}
            className="px-6 py-2 bg-black text-white rounded-lg font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800 transition"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewThreadModal;
