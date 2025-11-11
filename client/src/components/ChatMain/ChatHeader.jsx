import { formatRelativeTime } from "../../utils/DateFormat";

const ChatHeader = ({ user, isChatUserOnline }) => {
  return (
    <div className="p-4 border-b border-gray-200 ">
      <div className="flex">
        {/*  */}
        <div className="flex gap-3">
          <div
            className={`avatar ${
              isChatUserOnline ? "avatar-online" : "avatar-offline"
            }`}
          >
            <div className="w-12 rounded-full">
              <img
                src={
                  user.avatar_url ||
                  "https://img.daisyui.com/images/profile/demo/gordon@192.webp"
                }
              />
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-center">
            <p className="font-medium ">{user.full_name}</p>
            <div className="text-xs text-gray-600">
              {isChatUserOnline ? (
                <p>Đang hoạt động</p>
              ) : (
                <p>Hoạt động {formatRelativeTime(user.last_active_at)}</p>
              )}
            </div>
          </div>
        </div>
        {/*  */}
      </div>
    </div>
  );
};

export default ChatHeader;
