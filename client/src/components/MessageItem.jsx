import { X, ChevronLeft, ChevronRight, Check, CheckCheck, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { useState } from "react";

const MessageItem = ({ message, currentUser, chatUser, onResendMessage }) => {
  const isMe = message.sender_id === currentUser.id;

  const [selectedIndex, setSelectedIndex] = useState(null);
  const images =
    message.media?.filter((item) => item.media_file_type === "image") || [];
  
  // Hàm định dạng thời gian  
  const formatTime = (timeStr) => {
    // Handle cases where sent_at might be missing during 'sending' state
    if (!timeStr) return "Just now"; 
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderStatusIcon = () => {
    if (!isMe || !message.status) return null;
    let icon;
    let text = message.status;
    
    switch (message.status) {
      case "read":
        icon = <CheckCheck size={14} className="text-blue-500 ml-1" />;
        break;
      case "delivered":
        icon = <CheckCheck size={14} className="text-gray-400 ml-1" />;
        break;
      case "sent":
        icon = <Check size={14} className="text-gray-400 ml-1" />;
        break;
      case "sending":
        // Use a spinning loader icon for sending state
        icon = <Loader2 size={14} className="text-gray-400 ml-1 animate-spin" />;
        text = "sending...";
        break;
      case "error":
        // Use an alert triangle for error state
        icon = <AlertTriangle size={14} className="text-red-500 ml-1" />;
        text = "Failed to send";
        break;
      default:
        icon = <Check size={14} className="text-gray-400 ml-1" />;
    }
    
    return (
      <div className="flex items-center gap-1">
        {icon}
        <p className="capitalize">{text}</p>
      </div>
    );
  };

  // Các hàm xử lý modal xem ảnh
  const openModal = (index) => setSelectedIndex(index);
  const closeModal = () => setSelectedIndex(null);
  const prevImage = () => {
    if (selectedIndex !== null)
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
  };
  const nextImage = () => {
    if (selectedIndex !== null)
      setSelectedIndex((selectedIndex + 1) % images.length);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };

  // Chỉ hiển thị tối đa 6 ảnh trong khung chat
  const displayedImages = images.slice(0, 6);

  return (
    <>
      <div className={`chat ${isMe ? "chat-end" : "chat-start"} mb-3`}>
        {/* Avatar của người gửi */}
        {!isMe && (
          <div className="chat-image avatar">
            <div className="w-8 rounded-full">
              <img
                src={
                  // Sử dụng avatar_url nếu có, nếu không thì dùng ảnh mặc định
                  chatUser.avatar_url && chatUser.avatar_url !== ""
                    ? chatUser.avatar_url
                    : "https://img.daisyui.com/images/profile/demo/gordon@192.webp"
                }
                alt=""
              />
            </div>
          </div>
        )}

        {/* Bong bóng chat */}
        <div
          className={`chat-bubble rounded-t-2xl flex flex-col gap-2 ${
            isMe
              ? "chat-bubble-neutral rounded-bl-2xl" // Màu cho tin nhắn của mình
              : "chat-bubble rounded-br-2xl" // Màu cho tin nhắn của người khác
          } max-w-xs sm:max-w-sm md:max-w-md`}
        >
          {/* Nội dung tin nhắn (text) */}
          {message.content && <p>{message.content}</p>}

          {/* Hiển thị ảnh nếu có */}
          {displayedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 relative">
              {displayedImages.map((img, i) => {
                const isLastAndMore = i === 5 && images.length > 6;
                return (
                  // Added loading visualization for images
                  <div 
                    key={i} 
                    className="relative bg-gray-100 flex items-center justify-center rounded-lg"
                    style={{ minWidth: '100px', minHeight: '100px' }}
                  >
                    <img
                      src={img.media_url}
                      alt={`img-${i}`}
                      className="max-w-[150px] max-h-[150px] sm:max-w-[200px] sm:max-h-[200px] object-cover border border-gray-300 cursor-pointer hover:opacity-80 rounded-lg"
                      onClick={() => openModal(i)} // Mở modal khi click
                      // Simple text loading indicator
                      onLoad={(e) => e.target.parentElement.classList.remove('bg-gray-100')} 
                      onError={(e) => e.target.parentElement.innerText = 'Error loading image'}
                    />
                    {/* Overlay hiển thị số lượng ảnh còn lại nếu nhiều hơn 6 */}
                    {isLastAndMore && (
                      <div
                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xl font-bold cursor-pointer rounded-lg"
                        onClick={() => openModal(i)}
                      >
                        +{images.length - 6}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Thời gian gửi và Trạng thái */}
        <div className="chat-footer opacity-70 text-xs mt-1 flex items-center">
          {formatTime(message.sent_at)}
          {renderStatusIcon()}
          {/* Optional: Add a resend button for error status */}
          {isMe && message.status === "error" && onResendMessage && (
             <button 
                onClick={() => onResendMessage(message)} 
                className="ml-2 text-red-500 hover:text-red-700 transition"
                title="Resend message"
             >
                <RefreshCw size={14} />
             </button>
          )}
        </div>
      </div>

      {/* Modal xem ảnh full màn hình */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={handleOverlayClick}
        >
          {/* Nút đóng modal ở góc trên bên phải */}
          <button
            className="absolute hover:bg-gray-200 active:bg-gray-300 top-4 right-4 p-2 bg-white text-black bg-opacity-50 rounded-full hover:bg-opacity-80 z-10 cursor-pointer"
            onClick={closeModal}
          >
            <X size={25} />
          </button>

          <div className="relative flex items-center justify-between w-full mx-auto">
            {/* Nút prev */}
            {images.length > 1 && (
              <button
                className="p-2 bg-white text-black bg-opacity-50 rounded-full hover:bg-opacity-80 z-10 cursor-pointer hover:bg-gray-200 active:bg-gray-300"
                onClick={prevImage}
              >
                <ChevronLeft size={32} />
              </button>
            )}

            {/* Ảnh đang xem */}
            <div className="flex-1 flex justify-center w-[90vw]">
              <img
                src={images[selectedIndex].media_url}
                alt="preview"
                className="max-h-[90vh] w-auto h-auto object-contain shadow-lg mx-4 rounded-lg"
              />
            </div>

            {/* Nút next */}
            {images.length > 1 && (
              <button
                className="p-2 bg-white text-black bg-opacity-50 rounded-full hover:bg-opacity-80 z-10 cursor-pointer hover:bg-gray-200 active:bg-gray-300"
                onClick={nextImage}
              >
                <ChevronRight size={32} />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MessageItem;
