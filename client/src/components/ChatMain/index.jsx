import { useState, useRef, useEffect, useCallback } from "react";
import ChatFooter from "./ChatFooter";
import ChatHeader from "./ChatHeader";
import MessageItem from "../MessageItem";
import { MessageCircleMore } from "lucide-react";
import useUserStore from "../../stores/useUserStore";
import useConversationStore from "../../stores/useConversationStore";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useSocketStore from "../../stores/useSocketStore";
import useMessageStore from "../../stores/useMessageStore";

const ChatMain = ({ chatUser, conservationId }) => {
  const user = useUserStore((state) => state.user); // currentUser
  const { getConversationMessages } = useConversationStore();
  const { uploadMessageImages } = useMessageStore();
  const axiosPrivate = useAxiosPrivate();
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  // Lấy instance chatSocket từ store
  const chatSocket = useSocketStore((state) => state.chatSocket);
  const onlineUsers = useSocketStore((state) => state.onlineUsers);

  // Cuộn xuống cuối danh sách tin nhắn khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Tải tin nhắn từ API ban đầu
  const fetchedMessages = async (limit = 20, beforeId = undefined) => {
    const data = await getConversationMessages(
      conservationId,
      limit,
      beforeId,
      axiosPrivate
    );
    // Data từ API đã có sẵn trường 'status'
    setMessages(data);
  };

  // Hàm cập nhật state tin nhắn khi có sự kiện chatSocket
  const updateMessageStatusInState = useCallback(({ messageId, status }) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, status: status } : msg
      )
    );
  }, []);

  useEffect(() => {
    // 1. Kết nối và tham gia phòng chat khi conservationId thay đổi
    if (chatSocket && conservationId) {
      chatSocket.emit("join_conversation", conservationId);
    }

    // 2. Lắng nghe tin nhắn mới
    const handleReceiveMessage = (newMessage) => {
      if (!newMessage.status) newMessage.status = "sent";
      if (newMessage.conversation_id !== conservationId) {
        return;
      }
      if (newMessage.sender_id === user.id) {
        setMessages((prevMessages) => {
          // Tìm tin nhắn tạm thời dựa trên tempId
          const index = prevMessages.findIndex(
            (msg) =>
              msg.id === newMessage.tempId || msg.tempId === newMessage.tempId
          );

          if (index !== -1) {
            // Nếu tìm thấy, thay thế tin nhắn tạm bằng tin nhắn chính thức
            const updatedMessages = [...prevMessages];
            updatedMessages[index] = {
              ...updatedMessages[index],
              id: newMessage.id, // Gán ID thật
              status: "sent",
            };
            return updatedMessages;
          } else {
            return [...prevMessages, newMessage];
          }
        });
      } else {
        setMessages((prev) => [...prev, newMessage]);

        chatSocket.emit("update_message_status", {
          conversationId: conservationId,
          messageId: newMessage.id,
          userId: user.id,
          status: "delivered",
        });
      }
    };

    // 3. Lắng nghe cập nhật trạng thái (dấu tích)
    // Dùng useCallback bên trên để đảm bảo useEffect chạy mượt mà
    chatSocket?.on("receive_message", handleReceiveMessage);
    chatSocket?.on("status_updated", updateMessageStatusInState);

    return () => {
      // Dọn dẹp listener khi component unmount hoặc conservationId thay đổi
      chatSocket?.off("receive_message", handleReceiveMessage);
      chatSocket?.off("status_updated", updateMessageStatusInState);
    };
  }, [conservationId, chatSocket, user.id, updateMessageStatusInState]);

  // Effect cho việc cuộn trang và fetch API ban đầu
  useEffect(() => {
    scrollToBottom();
    // Đảm bảo fetch lại messages khi đổi conversation/chatUser
    if (conservationId) {
      fetchedMessages();
    }
  }, [chatUser, conservationId]);

  useEffect(() => {
    scrollToBottom();
  }, [chatUser, messages]);

  const addTempMessageToUI = (tempMessage) => {
    setMessages((prev) => [...prev, tempMessage]);
  };

  const handleSendMessage = async (e, content, images) => {
    e.preventDefault();

    if (!content.trim() && images.length === 0) return;
    // Tạo một ID tạm thời (ví dụ dùng UUID library)
    const tempId = Date.now().toString();

    // Tạo đối tượng tin nhắn giả định để hiển thị ngay lập tức
    const tempMessage = {
      id: tempId,
      conversation_id: conservationId,
      sender_id: user.id,
      content: content,
      type: images.length > 0 ? "image" : "text",
      sent_at: new Date().toISOString(),
      status: "sending",
      media: images.map((file) => ({
        media_url: file.preview,
        media_file_type: "image",
      })),
    };

    addTempMessageToUI(tempMessage);
    try {
      const formData = new FormData();
      images.forEach((file) => {
        formData.append("message_images", file);
      });

      const uploadedImages = await uploadMessageImages(formData, axiosPrivate);
      console.log("uploaded", uploadedImages)

      // Dữ liệu chuẩn bị gửi lên Socket.IO Server
      const messageData = {
        conversationId: conservationId,
        senderId: user.id,
        content: content.trim(),
        type: images.length > 0 ? "image" : "text",
        // Giả định backend cần list URLs để lưu vào DB
        media: uploadedImages,
      };

      // Gửi sự kiện 'send_message' lên Backend Socket Server
      if (chatSocket) {
        chatSocket.emit("send_message", { ...messageData, tempId });
      }
    } catch (error) {
      const lastIndex = messages.length - 1;
      const updatedMessages = [...messages];
      updatedMessages[lastIndex] = {
        ...updatedMessages[lastIndex],
        status: "error",
      };
      setMessages(updatedMessages);
    }
  };

  const markChatAsRead = () => {
    if (!chatSocket || !user.id || !conservationId || messages.length === 0)
      return;

    const lastMessage = messages[messages.length - 1];
    // Nếu tin nhắn cuối cùng là của người khác và chưa được đọc
    if (lastMessage.sender_id !== user.id && lastMessage.status !== "read") {
      chatSocket.emit("update_message_status", {
        conversationId: conservationId,
        messageId: lastMessage.id,
        userId: user.id, // ID người nhận (mình)
        status: "read",
      });
    }
  };

  return (
    <section className="h-full">
      {chatUser ? (
        <section className="h-full flex flex-col">
          <div className="">
            <ChatHeader
              user={chatUser}
              isChatUserOnline={onlineUsers.includes(chatUser.id.toString())}
            />
          </div>

          {/* Phần hiển thị tin nhắn - Thêm onClick để bắt sự kiện người dùng tương tác */}
          <div
            className="flex-1 overflow-y-auto p-4 bg-gray-50"
            onClick={markChatAsRead} // Đánh dấu đã đọc khi click vào khung chat
            onScroll={markChatAsRead} // Hoặc khi cuộn (tùy UX bạn chọn)
          >
            {messages &&
              messages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  currentUser={user}
                  chatUser={chatUser}
                />
              ))}
            {/* Element neo để cuộn xuống */}
            <div ref={messagesEndRef} />
          </div>

          {/* Phần nhập liệu */}
          <div className="">
            <ChatFooter onSendMessage={handleSendMessage} />
          </div>
        </section>
      ) : (
        // ... (Phần UI khi chưa chọn chatUser) ...
        <section className="h-full flex justify-center items-center">
          <div className="flex flex-col justify-center items-center gap-1">
            <div className="p-4 rounded-full bg-black text-white size-20">
              <MessageCircleMore size={50} />
            </div>
            <h5 className="font-medium text-lg">Tin nhắn của bạn</h5>
            <p>Gửi ảnh hoặc tin nhắn cho bạn bè</p>
            <button className="bg-black py-1 px-2  rounded-lg text-white cursor-pointer hover:bg-gray-700 active:bg-gray-800">
              Gửi tin nhắn
            </button>
          </div>
        </section>
      )}
    </section>
  );
};

export default ChatMain;
