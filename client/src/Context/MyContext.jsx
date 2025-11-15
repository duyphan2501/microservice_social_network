import { createContext, useState } from "react";

const MyContext = createContext();

const ContextProvider = ({ children }) => {
  const [persist, setPersist] = useState(
    JSON.parse(localStorage.getItem("persist")) || false
  );

  const [verifyUser, setVerifyUser] = useState(null);
  const [chatUser, setChatUser] = useState(null)
  const values = {
    persist,
    setPersist,
    verifyUser,
    setVerifyUser,
    chatUser,
    setChatUser,
  };
  return <MyContext.Provider value={values}>{children}</MyContext.Provider>;
};

export { ContextProvider, MyContext };
