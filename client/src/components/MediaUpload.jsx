import React, { useState } from "react";
import { X, Image, Film } from "lucide-react";

// Media Upload Component
const MediaUpload = ({ onMediaChange, maxFiles = 10 }) => {
  const [mediaPreviews, setMediaPreviews] = useState([]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (mediaPreviews.length + files.length > maxFiles) {
      alert(`Bạn chỉ có thể tải lên tối đa ${maxFiles} file`);
      return;
    }

    const newPreviews = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));

    const updated = [...mediaPreviews, ...newPreviews];
    setMediaPreviews(updated);
    onMediaChange(updated);
  };

  const removeMedia = (id) => {
    const updated = mediaPreviews.filter((m) => m.id !== id);
    setMediaPreviews(updated);
    onMediaChange(updated);
  };

  return (
    <div>
      {mediaPreviews.length > 0 && (
        <div
          className={`grid gap-2 mb-3 ${
            mediaPreviews.length === 1
              ? "grid-cols-1"
              : mediaPreviews.length === 2
              ? "grid-cols-2"
              : mediaPreviews.length === 3
              ? "grid-cols-3"
              : "grid-cols-2"
          }`}
        >
          {mediaPreviews.map((media, index) => (
            <div
              key={media.id}
              className={`relative rounded-2xl overflow-hidden bg-gray-100 ${
                mediaPreviews.length === 1
                  ? "max-h-[600px]"
                  : mediaPreviews.length === 3 && index === 0
                  ? "col-span-3 max-h-[400px]"
                  : "aspect-square"
              }`}
            >
              {media.type === "video" ? (
                <video
                  src={media.url}
                  className="w-full h-full object-cover"
                  controls
                />
              ) : (
                <img
                  src={media.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
              <button
                onClick={() => removeMedia(media.id)}
                className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-70 hover:bg-opacity-90 rounded-full transition"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {mediaPreviews.length < maxFiles && (
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
            <Image className="w-5 h-5" />
            <Film className="w-5 h-5" />
            <span className="text-sm">Add photos/videos</span>
          </div>
        </label>
      )}
    </div>
  );
};

export default MediaUpload;
