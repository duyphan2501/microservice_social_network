import { useContext, useEffect } from "react";
import useSocketStore from "../../stores/useSocketStore";
import { formatRelativeTime } from "../../utils/DateFormat";
import { MyContext } from "../../Context/MyContext";

const ChatHeader = ({ isChatUserOnline }) => {
  const { mainSocket } = useSocketStore();
  const { chatUser, setChatUser } = useContext(MyContext);

  useEffect(() => {
    if (!mainSocket) return;

    mainSocket.on("user_last_active_updates", (data) => {
      if (chatUser.id === data.userId) {
        setChatUser((prev) => ({ ...prev, last_active_at: data.timestamp }));
      }
    });

    return () => {
      mainSocket.off("user_last_active_updates");
    };
  }, [mainSocket]);

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
                  chatUser.avatar_url ||
                  "https://img.daisyui.com/images/profile/demo/gordon@192.webp"
                }
              />
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-center">
            <p className="font-medium ">{chatUser.full_name}</p>
            <div className="text-xs text-gray-600">
              {isChatUserOnline ? (
                <p>Online</p>
              ) : (
                <p>
                  Online {formatRelativeTime(chatUser.last_active_at, true)}
                </p>
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
