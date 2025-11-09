import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const MessageItem = ({ message, currentUser }) => {
  const isMe = message.sender_id === currentUser.id;
  const [selectedIndex, setSelectedIndex] = useState(null);

  const formatTime = (timeStr) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const openModal = (index) => setSelectedIndex(index);
  const closeModal = () => setSelectedIndex(null);
  const prevImage = () => {
    if (selectedIndex !== null)
      setSelectedIndex(
        (selectedIndex - 1 + message.images.length) % message.images.length
      );
  };
  const nextImage = () => {
    if (selectedIndex !== null)
      setSelectedIndex((selectedIndex + 1) % message.images.length);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };

  const displayedImages = message.images?.slice(0, 6) || [];

  return (
    <>
      <div className={`chat ${isMe ? "chat-end" : "chat-start"} mb-3`}>
        {!isMe && <div className="chat-image avatar">
          <div className="w-8 rounded-full">
            <img src={"https://img.daisyui.com/images/profile/demo/gordon@192.webp"} alt="" />
          </div>
        </div>}
        <div
          className={`chat-bubble rounded-t-2xl flex flex-col gap-2 ${
            isMe
              ? "chat-bubble-neutral rounded-bl-2xl"
              : "chat-bubble rounded-br-2xl"
          } max-w-xs sm:max-w-sm md:max-w-md`}
        >
          {message.content && <p>{message.content}</p>}

          {displayedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 relative">
              {displayedImages.map((img, i) => {
                const isLastAndMore = i === 5 && message.images.length > 6;
                return (
                  <div key={i} className="relative">
                    <img
                      src={img}
                      alt={`img-${i}`}
                      className="max-w-[150px] max-h-[150px] sm:max-w-[200px] sm:max-h-[200px] object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-80"
                      onClick={() => openModal(i)}
                    />
                    {isLastAndMore && (
                      <div
                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xl font-bold rounded-lg cursor-pointer"
                        onClick={() => openModal(i)}
                      >
                        +{message.images.length - 6}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="chat-footer opacity-70 text-xs mt-1">
          {formatTime(message.sent_at)}
        </div>
      </div>

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
            {/* Nút prev nằm sát bên trái màn hình (trong container giới hạn max-w) */}
            {message.images.length > 1 && (
              <button
                className="p-2 bg-white text-black bg-opacity-50 rounded-full hover:bg-opacity-80 z-10 cursor-pointer hover:bg-gray-200 active:bg-gray-300"
                onClick={prevImage}
              >
                <ChevronLeft size={32} />
              </button>
            )}

            {/* Ảnh - linh hoạt hơn, sử dụng max-w-full và max-h-[90vh] để đảm bảo vừa màn hình */}
            <div className="flex-1 flex justify-center w-[90vw]">
              <img
                src={message.images[selectedIndex]}
                alt="preview"
                className="max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-lg mx-4"
              />
            </div>

            {/* Nút next nằm sát bên phải màn hình (trong container giới hạn max-w) */}
            {message.images.length > 1 && (
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
