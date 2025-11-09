import { formatRelativeTime } from "../../utils/DateFormat";

const ChatHeader = ({ user }) => {
  return (
    <div className="p-4 border-b border-gray-200 ">
      <div className="flex">
        {/*  */}
        <div className="flex gap-3">
          <div className="avatar avatar-online">
            <div className="w-12 rounded-full">
              <img src="https://img.daisyui.com/images/profile/demo/gordon@192.webp" />
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-center">
            <p className="font-medium ">{user.full_name}</p>
            <p className="text-xs text-gray-600">
              Hoạt động {formatRelativeTime(user.last_active_at)}
            </p>
          </div>
        </div>
        {/*  */}
      </div>
    </div>
  );
};



export default ChatHeader;
