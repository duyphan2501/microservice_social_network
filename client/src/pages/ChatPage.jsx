import { useState } from "react";
import ConversationItem from "../components/ConversationItem";
import { SquarePen } from "lucide-react";
import ChatMain from "../components/ChatMain";
import useUserStore from "../stores/useUserStore";
import { useEffect } from "react";
import useConversationStore from "../stores/useConversationStore";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useSocketStore from "../stores/useSocketStore";

// const conversations = [
//   {
//     id: 1,
//     user: {
//       id: 2,
//       full_name: "Nguyễn Văn A",
//       avatar: "https://img.daisyui.com/images/profile/demo/gordon@192.webp",
//       last_active_at: new Date(),
//     },
//     last_message: {
//       content: "Xin chào, hôm nay bạn thế nào?",
//       user_id: 2,
//       sent_at: new Date(),
//     },
//   },
//   {
//     id: 2,
//     user: {
//       id: 1,
//       full_name: "Duc Do",
//       avatar: "https://img.daisyui.com/images/profile/demo/sarah@192.webp",
//       last_active_at: new Date(),
//     },
//     last_message: {
//       content: "Mình ổn, cảm ơn bạn nhé!",
//       user_id: 1,
//       sent_at: new Date(),
//     },
//     isYou: true,
//   },
//   {
//     id: 3,
//     user: {
//       id: 3,
//       full_name: "Lê Thị B",
//       avatar: "https://img.daisyui.com/images/profile/demo/tony@192.webp",
//       last_active_at: new Date(),
//     },
//     last_message: {
//       content: "Tối nay có rảnh không?",
//       user_id: 1,
//       sent_at: new Date(),
//     },
//     isYou: false,
//   },
// ];

const ChatPage = () => {
  const user = useUserStore((state) => state.user);
  const [conversations, setConversations] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const { isLoading, getConversations } = useConversationStore();
  const axiosPrivate = useAxiosPrivate()
  const onlineUsers = useSocketStore(state => state.onlineUsers)

  const fetchConversations = async () => {
    if (!user) return;
    const conversationsData = await getConversations(user.id, axiosPrivate);
    setConversations(conversationsData);
  };
  console.log(user)
  useEffect(() => {
    fetchConversations();
  }, [user]);
  if (!user) return;
  return (
    <div className="flex h-[calc(100vh-64px)] lg:h-screen max-h-screen">
      {/* left */}
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
          {/* name of each tab group should be unique */}
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
            <>
              <div className="flex items-center justify-center">
                <p>Đang tải...</p>
              </div>
            </>
          ) : (
            <>
              {conversations &&
                conversations.map((item) => (
                  <div
                    className=""
                    key={item.id}
                  >
                    <ConversationItem
                      conversation={item}
                      isYou={item.sender_id === user.id}
                      isChatUserOnline={onlineUsers.includes(item.other_user_id.toString())}
                      setChatUser={setChatUser}
                    />
                  </div>
                ))}
            </>
          )}
        </div>
      </section>
      {/* right */}
      <section className="flex-1">
        <ChatMain chatUser={chatUser} />
      </section>
    </div>
  );
};

export default ChatPage;
