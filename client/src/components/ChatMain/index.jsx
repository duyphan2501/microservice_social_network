import { useState, useRef, useEffect, useCallback } from "react";
import ChatFooter from "./ChatFooter";
import ChatHeader from "./ChatHeader";
import MessageItem from "../MessageItem";
import { MessageCircleMore } from "lucide-react";
import useUserStore from "../../stores/useUserStore";
import useConversationStore from "../../stores/useConversationStore";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useSocketStore from "../../stores/useSocketStore";

const ChatMain = ({ chatUser, conservationId }) => {
  const user = useUserStore((state) => state.user); // currentUser
  const { getConversationMessages } = useConversationStore();
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
      if (!newMessage.status) newMessage.status = 'sent'
      if (chatUser.id !== newMessage.sender_id && newMessage.sender_id !== user.id) return;
      setMessages((prev) => [...prev, newMessage]);
      // Nếu tin nhắn không phải của mình, gửi xác nhận đã DELIVERED
      if (newMessage.sender_id !== user.id) {
        chatSocket.emit("update_message_status", {
          conversationId: conservationId,
          messageId: newMessage.id,
          userId: user.id, // ID người nhận (mình)
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

  const handleSendMessage = (e, content, images) => {
    e.preventDefault();

    if (!content.trim() && images.length === 0) return;

    // TODO: Implement image upload logic here (use axiosPrivate)
    // Sau khi upload xong, bạn sẽ có imageUrls thực tế từ server.
    const imageUrls = images.map((f) => f.preview || f.url); // Tạm dùng preview

    // Dữ liệu chuẩn bị gửi lên Socket.IO Server
    const messageData = {
      conversationId: conservationId,
      senderId: user.id,
      content: content.trim(),
      type: images.length > 0 ? "image" : "text",
      // Giả định backend cần list URLs để lưu vào DB
      mediaUrls: imageUrls,
    };

    // Gửi sự kiện 'send_message' lên Backend Socket Server
    if (chatSocket) {
      chatSocket.emit("send_message", messageData);
    }

    // TẠM THỜI thêm tin nhắn vào state để hiển thị ngay lập tức (UI/UX tốt hơn)
    // Backend sẽ gửi lại tin nhắn chuẩn (có ID DB, sent_at chuẩn) sau đó
    // và chúng ta sẽ cần logic để thay thế tin nhắn tạm này bằng tin nhắn thật.
    // Cách xử lý này hơi nâng cao, bạn có thể bỏ qua bước thêm tạm nếu muốn đơn giản.
    // const tempMessage = {
    //     id: Date.now(), // ID tạm
    //     sender_id: user.id,
    //     content: content.trim(),
    //     sent_at: new Date().toISOString(),
    //     media: imageUrls.map(url => ({ media_url: url, media_file_type: messageData.type })),
    //     status: 'sent'
    // };
    // setMessages((prev) => [...prev, tempMessage]);
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
