import { useState, useEffect } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useUserStore from "../stores/useUserStore";
import { formatRelativeTime } from "../utils/DateFormat";

const ConversationItem = ({
  conversation,
  isYou,
  isChatUserOnline,
  setChatUser,
}) => {
  const { getUserInfo } = useUserStore();
  const axiosPrivate = useAxiosPrivate();

  const [otherUser, setOtherUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChatUser = async () => {
      try {
        setIsLoading(true);
        const userInfo = await getUserInfo(
          conversation.other_user_id,
          axiosPrivate
        );
        setOtherUser(userInfo);
      } catch (error) {
        console.error("Failed to fetch chat user info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatUser();
  }, [conversation.other_user_id, axiosPrivate, getUserInfo]);

  if (isLoading || !otherUser) {
    return (
      <div className="flex gap-3 p-2 bg-gray-50 text-xs hover:bg-gray-200 cursor-pointer animate-pulse">
        {/* Placeholder UI khi đang tải */}
        <div className="avatar">
          <div className="w-13 rounded-full bg-gray-300"></div>
        </div>
        <div className="md:flex flex-1 flex-col justify-center gap-1 hidden">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex gap-3 p-2 bg-gray-100 text-xs hover:bg-gray-200 cursor-pointer active:bg-gray-300"
      onClick={() => setChatUser(otherUser)}
    >
      <div
        className={`avatar ${
          isChatUserOnline ? "avatar-online" : "avatar-offline"
        }`}
      >
        <div className="w-13 rounded-full">
          <img
            src={
              otherUser.avatar_url ||
              "https://img.daisyui.com/images/profile/demo/gordon@192.webp"
            }
            alt={otherUser.full_name}
          />
        </div>
      </div>
      <div className="md:flex flex-1 flex-col justify-center gap-1 hidden ">
        <p className="font-medium text-sm">{otherUser.full_name}</p>
        <div className="flex items-center gap-2 text-nowrap">
          <p className="text-gray-500 line-clamp-1">
            {isYou && "You:"} {conversation.content}
          </p>
          <p className="text-gray-500">
            {formatRelativeTime(conversation.sent_at)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
