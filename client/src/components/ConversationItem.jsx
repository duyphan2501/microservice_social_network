import { formatRelativeTime } from "../utils/DateFormat";

const ConversationItem = ({
  conversation,
  isYou,
  isChatUserOnline,
  otherUser,
}) => {
  return (
    <div className="flex gap-3 p-2 bg-gray-100 text-xs hover:bg-gray-200 cursor-pointer active:bg-gray-300">
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
        <div
          className={`flex items-center gap-2 text-nowrap text-gray-500 ${conversation.message_status != "read" && !isYou && "font-semibold !text-black"}`}
        >
          <p className=" line-clamp-1">
            {isYou && "You:"} {conversation.content}
          </p>
          <p className="">{formatRelativeTime(conversation.sent_at)}</p>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
