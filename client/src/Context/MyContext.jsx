import { createContext, useState } from "react";

const MyContext = createContext();

const ContextProvider = ({ children }) => {
  const [persist, setPersist] = useState(
    JSON.parse(localStorage.getItem("persist")) || false
  );
  const [isShowLoginNavigator, setIsShowLoginNavigator] = useState(false);
  const [verifyUser, setVerifyUser] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const values = {
    persist,
    setPersist,
    verifyUser,
    setVerifyUser,
    chatUser,
    setChatUser,
    isShowLoginNavigator,
    setIsShowLoginNavigator,
  };
  return <MyContext.Provider value={values}>{children}</MyContext.Provider>;
};

export { ContextProvider, MyContext };
