import { Image, Send, X } from "lucide-react";
import { useRef, useState } from "react";

const ChatFooter = ({ onSendMessage }) => {
  const [inputMessage, setInputMessage] = useState("");
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  // Khi chọn ảnh
  const handleImageChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);

      setImages((prevImages) => {
        // Lọc bỏ file trùng (theo name + size + lastModified)
        const existingKeys = new Set(
          prevImages.map((img) => `${img.name}-${img.size}-${img.lastModified}`)
        );

        const uniqueNewImages = newFiles
          .filter(
            (file) =>
              !existingKeys.has(
                `${file.name}-${file.size}-${file.lastModified}`
              )
          )
          .map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            })
          );

        return [...prevImages, ...uniqueNewImages];
      });

      // Reset input để có thể chọn lại cùng file (nhưng vẫn không thêm trùng)
      event.target.value = null;
    }
  };

  // Gỡ bỏ ảnh khỏi danh sách
  const handleRemoveImage = (rmIndex) => {
    setImages((prev) => {
      // Thu hồi bộ nhớ URL cũ
      URL.revokeObjectURL(prev[rmIndex].preview);
      return prev.filter((_, index) => rmIndex !== index);
    });
  };

  // Mở chọn file ảnh
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Gửi tin nhắn (text + ảnh)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() && images.length === 0) return;

    // Gửi dữ liệu cho cha xử lý (vd: upload ảnh + gửi socket)
    onSendMessage(e, inputMessage.trim(), images);

    // Xóa input
    setInputMessage("");
    setImages([]);
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      {/* Hiển thị ảnh xem trước */}
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {images.map((img, index) => (
            <div className="size-20 relative" key={index}>
              <img
                src={img.preview}
                alt="preview"
                className="size-full object-cover rounded-lg border border-gray-300"
              />
              <span
                onClick={() => handleRemoveImage(index)}
                className="rounded-full p-1 text-white bg-red-500 absolute -top-1 -right-1 cursor-pointer hover:bg-red-600 active:bg-red-700"
              >
                <X size={14} />
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Form nhập tin nhắn */}
      <form className="flex items-center gap-3" onSubmit={handleSubmit}>
        <div className="flex-1 flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg">
          <input
            type="text"
            className="focus:outline-none w-full"
            placeholder="Nhắn tin..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />

          {/* Input file ẩn */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />

          {/* Nút chọn ảnh */}
          <div
            className="hover:text-gray-700 active:text-gray-800 cursor-pointer ml-2"
            onClick={triggerFileInput}
          >
            <Image />
          </div>
        </div>

        {/* Nút gửi */}
        <button
          type="submit"
          className="p-2 px-3 bg-black text-white rounded-lg cursor-pointer hover:bg-gray-700 active:bg-gray-800"
        >
          <Send />
        </button>
      </form>
    </div>
  );
};

export default ChatFooter;
