import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { MyContext } from "../Context/MyContext";
import useSocketStore from "../stores/useSocketStore";
import useUserStore from "../stores/useUserStore";

export default function ChatNotification() {
  const mainSocket = useSocketStore((s) => s.mainSocket);
  const user = useUserStore((s) => s.user);
  const getUserInfo = useUserStore((s) => s.getUserInfo);

  // messageQueue là array nhận từ context
  const { notificationQueue, setNotificationQueue } = useContext(MyContext);
  const location = useLocation();
  const notAllowRoute = ["/inbox"];

  //Context dieu khien state

  const [current, setCurrent] = useState(null);
  const [exiting, setExiting] = useState(false);

  // Khi queue thay đổi và chưa có notification hiện tại
  useEffect(() => {
    if (!current && notificationQueue.length > 0) {
      setCurrent(notificationQueue[0]);
      setNotificationQueue((prev) => prev.slice(3));
    }
  }, [notificationQueue, current]);

  // Khi notification hiện tại hiển thị, set timeout 3s để trượt ra
  useEffect(() => {
    if (current) {
      const timer = setTimeout(() => setExiting(true), 3000); // 3s hiện
      return () => clearTimeout(timer);
    }
  }, [current]);

  // Khi animation kết thúc và đang trượt ra, reset current
  const handleAnimationEnd = () => {
    if (exiting) {
      setCurrent(null);
      setExiting(false);
    }
  };

  //Lắng nghe tin nhắn từ socket
  useEffect(() => {
    const handleReceiveMessage = async (newMessage) => {
      const sender = await getUserInfo(newMessage.sender_id);

      const messageWithSenderData = {
        ...newMessage,
        name: sender.username,
        avatar_url: sender.avatar_url,
      };

      setNotificationQueue((prevMessage) => [
        ...prevMessage,
        messageWithSenderData,
      ]);
    };

    if (!mainSocket) return;

    mainSocket?.on("chat_notification", handleReceiveMessage);

    return () => {
      mainSocket?.off("chat_notification", handleReceiveMessage);
    };
  }, [mainSocket, user]);

  if (notAllowRoute.some((route) => location.pathname.includes(route)))
    return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {current && (
        <div
          className={`w-80 bg-white shadow-lg rounded-lg p-4 flex items-start space-x-3 border border-gray-200 
            ${exiting ? "animate-slideOut" : "animate-slideIn"}`}
          onAnimationEnd={handleAnimationEnd}
        >
          <img
            className="w-12 h-12 rounded-full"
            src={current.avatar_url}
            alt={current.sender_id}
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{current.name}</p>
            <p className="text-gray-700 text-sm">{current.content}</p>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes slideIn {
            0% { transform: translateX(100%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }

          @keyframes slideOut {
            0% { transform: translateX(0); opacity: 1; }
            100% { transform: translateX(100%); opacity: 0; }
          }

          .animate-slideIn {
            animation: slideIn 0.3s ease forwards;
          }

          .animate-slideOut {
            animation: slideOut 0.3s ease forwards;
          }
        `}
      </style>
    </div>
  );
}
