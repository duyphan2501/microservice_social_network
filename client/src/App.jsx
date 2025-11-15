import AuthLayout from "./Layout/AuthLayout";
import Sidebar from "./Layout/Sidebar";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Verification from "./pages/Auth/Verification";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ChatPage from "./pages/ChatPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";

import CommentPage from "./pages/CommentPage";
import Search from "./pages/Search";
import Profile from "./pages/Profile";

import ResetPassword from "./pages/Auth/ResetPassword";
import { ToastContainer } from "react-toastify";
import NavigateToLogin from "./components/NavigateToLogin";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthLayout />}>
            <Route path={"login"} element={<Login />} />
            <Route path={"sign-up"} element={<Signup />} />
            <Route path={"verify-account"} element={<Verification />} />
            <Route path={"forgot-password"} element={<ForgotPassword />} />
            <Route path={"reset-password/:token"} element={<ResetPassword />} />
          </Route>
          <Route path="/" element={<Sidebar />}>
            <Route index element={<Home />} />
            <Route path="inbox" element={<ChatPage />} />
            <Route path="/post/:postId/comments" element={<CommentPage />} />
            <Route path="search" element={<Search />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path={"inbox"} element={<ChatPage />} />
        </Routes>
        <NavigateToLogin />
      </BrowserRouter>
      <ToastContainer
        autoClose={3000}
        pauseOnHover={true}
        position="top-center"
      />
    </>
  );
}

export default App;
