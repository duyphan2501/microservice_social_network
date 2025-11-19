import { createContext, useState } from "react";

const MyContext = createContext();

const ContextProvider = ({ children }) => {
  const [persist, setPersist] = useState(
    JSON.parse(localStorage.getItem("persist")) || false
  );
  const [isShowLoginNavigator, setIsShowLoginNavigator] = useState(false);
  const [isOpenNewMessage, setIsOpenNewMessage] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [verifyUser, setVerifyUser] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const [notificationQueue, setNotificationQueue] = useState([]);
  const values = {
    persist,
    setPersist,
    verifyUser,
    setVerifyUser,
    chatUser,
    setChatUser,
    isShowLoginNavigator,
    setIsShowLoginNavigator,
    notificationQueue,
    setNotificationQueue,
    isOpenNewMessage,
    setIsOpenNewMessage,
    selectedConversationId,
    setSelectedConversationId,
  };
  return <MyContext.Provider value={values}>{children}</MyContext.Provider>;
};

export { ContextProvider, MyContext };
