import { useState, useRef, useEffect } from "react";
import ChatFooter from "./ChatFooter";
import ChatHeader from "./ChatHeader";
import MessageItem from "../MessageItem";
import { MessageCircleMore } from "lucide-react";
import useUserStore from "../../stores/useUserStore";

// Dữ liệu tin nhắn giả lập
const mockMessages = [
  {
    id: 1,
    sender_id: 1,
    content: "Chào bạn, mình là user 1 (bạn).",
    sent_at: new Date(Date.now() - 60000).toISOString(),
    images: [],
  },
  {
    id: 2,
    sender_id: 2,
    content: "Chào user 1, mình là Nguyễn Văn A.",
    sent_at: new Date(Date.now() - 50000).toISOString(),
    images: [
      "https://images.unsplash.com/photo-1761839257658-23502c67f6d5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8&auto=format&fit=crop&q=60&w=600",
      "https://images.unsplash.com/photo-1761839257658-23502c67f6d5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8&auto=format&fit=crop&q=60&w=600",
    ],
  },
  {
    id: 3,
    sender_id: 1,
    content: "Hôm nay bạn thế nào?",
    sent_at: new Date(Date.now() - 40000).toISOString(),
    images: [],
  },
  {
    id: 4,
    sender_id: 2,
    content: "Mình ổn, cảm ơn nhé. Còn bạn?",
    sent_at: new Date(Date.now() - 30000).toISOString(),
    images: [],
  },
  {
    id: 5,
    sender_id: 1,
    content: "Mình cũng ổn. Có gì mới không?",
    sent_at: new Date(Date.now() - 10000).toISOString(),
    images: [],
  },
];

const ChatMain = ({ chatUser }) => {
  const user = useUserStore((state) => state.user);

  const [messages, setMessages] = useState(mockMessages);
  const messagesEndRef = useRef(null);

  // Cuộn xuống cuối danh sách tin nhắn khi có tin nhắn mới hoặc khi chatUser thay đổi
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    // Khi chatUser thay đổi, có thể bạn sẽ fetch tin nhắn mới tại đây
    // setMessages(fetchedMessages);
  }, [chatUser, messages]); // messages được thêm vào để cuộn xuống khi gửi tin nhắn mới

  // Hàm giả lập gửi tin nhắn mới
  const handleSendMessage = (e, content, images) => {
    e.preventDefault();

    if (!content.trim() && images.length === 0) return;

    // Nếu ảnh là file (chưa upload), tạo URL xem trước tạm thời
    const imageUrls = images.map((file) =>
      file.preview ? file.preview : URL.createObjectURL(file)
    );

    const newMessage = {
      id: Date.now(),
      sender_id: 1, // ID người gửi (tạm)
      content: content.trim(),
      sent_at: new Date().toISOString(),
      images: imageUrls,
    };
    
    setMessages((prev) => [...prev, newMessage]);

    // Giả sử bạn có API, tại đây bạn sẽ:
    // await api.post("/messages", formData)
  };

  return (
    <section className="h-full">
      {chatUser ? (
          <section className="h-full flex flex-col">
            <div className="">
              <ChatHeader user={chatUser} />
            </div>

            {/* Phần hiển thị tin nhắn */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 ">
              {messages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  currentUser={user}
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
          <section className="h-full flex justify-center items-center">
            <div className="flex flex-col justify-center items-center gap-1">
              <div className="p-4 rounded-full bg-black text-white size-20">
                <MessageCircleMore size={50} />
              </div>
              <h5 className="font-medium text-lg">Tin nhắn của bạn</h5>
              <p>Gửi ảnh hoặc tin nhắn cho bạn bè</p>
              <button className="bg-black py-1 px-2  rounded-lg text-white cursor-pointer hover:bg-gray-700 active:bg-gray-800">Gửi tin nhắn</button>
            </div>
          </section>
      )}
    </section>
  );
};

export default ChatMain;
