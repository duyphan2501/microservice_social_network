import { useState, useEffect, useCallback } from "react";
import ConversationItem from "../components/ConversationItem";
import { SquarePen } from "lucide-react";
import ChatMain from "../components/ChatMain";
import useUserStore from "../stores/useUserStore";
import useConversationStore from "../stores/useConversationStore";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useSocketStore from "../stores/useSocketStore";

// Bọc ConversationItem bằng memo để tối ưu hiệu suất
import { memo } from "react";
const MemoizedConversationItem = memo(ConversationItem);

const ChatPage = () => {
  const user = useUserStore((state) => state.user);
  const [conversationsWithUsers, setConversationsWithUsers] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const chatSocket = useSocketStore((state) => state.chatSocket);
  const { getUserInfo } = useUserStore();
  const { getConversations } = useConversationStore();
  const axiosPrivate = useAxiosPrivate();
  const onlineUsers = useSocketStore((state) => state.onlineUsers);
  const [isLoading, setIsLoading] = useState(false);

  const processConversations = async (conversationsData) => {
    if (!conversationsData || conversationsData.length === 0) return [];
    const fetchPromises = conversationsData.map(async (item) => {
      const otherUser = await getUserInfo(item.other_user_id, axiosPrivate);
      return {
        ...item,
        otherUser: otherUser,
      };
    });
    const conversationsWithUsersData = await Promise.all(fetchPromises);

    return conversationsWithUsersData;
  };

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const rawConversationsData = await getConversations(
        user.id,
        axiosPrivate
      );
      const finalData = await processConversations(rawConversationsData);
      setConversationsWithUsers(finalData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user, getConversations, axiosPrivate, getUserInfo]);

  const handleClick = (user, conversationId) => {
    setChatUser(user);
    setSelectedConversationId(conversationId);
  };

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Giả định state của bạn được khai báo như thế này:
  // const [conversationsWithUsers, setConversationsWithUsers] = useState([]);
  // const { user } = useAuth(); // Giả định lấy user từ context/hook

  // Sửa hàm updateStatus:
  const updateMessageStatusInState = useCallback(
    ({ messageId, status }) => {
      setConversationsWithUsers((prevConversations) => {
        return prevConversations.map((conversation) => {
          if (conversation.message_id == messageId) {
            const newConversation = { ...conversation, message_status: status }
            return newConversation;
          }
          return conversation;
        });
      });
    },
    [setConversationsWithUsers]
  ); // Thêm setter vào dependency array (nếu cần)

  // 2. Lắng nghe tin nhắn mới
  const handleReceiveMessage = useCallback(
    (newMessage) => {
      setConversationsWithUsers((prevConversations) => {
        // Tạo bản sao mới của mảng
        return prevConversations.map((conversation) => {
          // Nếu tìm thấy cuộc hội thoại cần cập nhật tin nhắn mới
          if (conversation.conversation_id == newMessage.conversation_id) {
            // Tạo bản sao của object conversation và cập nhật tất cả các trường
            const newConversation = {
              ...conversation,
              message_id: newMessage.id, 
              content: newMessage.content,
              message_type: newMessage.type,
              message_status: newMessage.status || 'sent',
              sender_id: newMessage.sender_id,
              sent_at: newMessage.sent_at,
            }
            return newConversation;
          }
          // Nếu không phải, giữ nguyên object cũ
          return conversation;
        });
      });
    },
    [setConversationsWithUsers]
  );

  useEffect(() => {
    if (!chatSocket) return;
    chatSocket?.on("receive_message", handleReceiveMessage);
    chatSocket?.on("status_updated", updateMessageStatusInState);
    return () => {
      chatSocket?.off("receive_message", handleReceiveMessage);
      chatSocket?.off("status_updated", updateMessageStatusInState);
    };
  }, [chatSocket, user.id, updateMessageStatusInState, handleReceiveMessage]);

  if (!user) return;

  return (
    <div className="flex h-[calc(100vh-64px)] lg:h-screen max-h-screen">
      <section className="md:w-90 border-r border-gray-300 ">
        <div className="flex flex-col gap-2 p-5">
          <div className="mt-5 flex justify-between items-center">
            <h5 className="font-semibold text-2xl hidden md:block">
              {user.username}
            </h5>
            <span className="hover:-translate-y-[0.5px] cursor-pointer">
              <SquarePen />
            </span>
          </div>
          <div className="hidden md:block">
            <input
              type="text"
              className="focus:outline-0 bg-gray-100 rounded-lg p-2 w-full"
              placeholder="Tìm kiếm"
            />
          </div>
          <div className="tabs tabs-box hidden md:block">
            <input
              type="radio"
              name="my_tabs_1"
              className="tab w-1/2 checked:bg-gray-100 checked:font-semibold"
              aria-label="Tin nhắn"
            />
            <input
              type="radio"
              name="my_tabs_1"
              className="tab w-1/2 checked:bg-gray-100 checked:font-semibold"
              aria-label="Chưa đọc"
              defaultChecked
            />
          </div>
        </div>

        <div className="">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                className="flex gap-3 p-2 bg-gray-50 text-xs hover:bg-gray-200 cursor-pointer animate-pulse"
                key={index}
              >
                {/* Placeholder UI khi đang tải */}
                <div className="avatar">
                  <div className="w-13 rounded-full bg-gray-300"></div>
                </div>
                <div className="md:flex flex-1 flex-col justify-center gap-1 hidden">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : (
            <>
              {conversationsWithUsers.map((item) => (
                <div
                  className="cursor-pointer"
                  key={item.conversation_id}
                  onClick={() =>
                    handleClick(item.otherUser, item.conversation_id)
                  }
                >
                  <MemoizedConversationItem // Sử dụng phiên bản memo
                    conversation={item}
                    isYou={item.sender_id === user.id}
                    isChatUserOnline={onlineUsers.includes(
                      item.other_user_id.toString()
                    )}
                    otherUser={item.otherUser}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </section>
      {/* right */}
      <section className="flex-1">
        <ChatMain chatUser={chatUser} conservationId={selectedConversationId} />
      </section>
    </div>
  );
};

export default ChatPage;
