import { formatRelativeTime } from "../utils/DateFormat";

const ConversationItem = ({ user, last_message, isYou = false }) => {
  return (
    <div className="flex gap-3 p-2 bg-gray-50 text-xs hover:bg-gray-200 cursor-pointer active:bg-gray-300">
      <div className="avatar avatar-online">
        <div className="w-13 rounded-full">
          <img src="https://img.daisyui.com/images/profile/demo/gordon@192.webp" />
        </div>
      </div>
      <div className="md:flex flex-1 flex-col justify-center gap-1 hidden ">
        <p className="font-medium text-sm">{user.full_name}</p>
        <div className="flex items-center gap-2 text-nowrap">
          <p className="text-gray-500 line-clamp-1">
            {isYou && "You:"} {last_message.content}
          </p>
          <p className="text-gray-500">{formatRelativeTime(last_message.sent_at)}</p>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
