import Sidebar from "./Layout/Sidebar";
import ChatPage from "./pages/ChatPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import CommentPage from "./pages/CommentPage";
import Search from "./pages/Search";
import Profile from "./pages/Profile";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Sidebar />}>
            <Route index element={<Home />} />
            <Route path="inbox" element={<ChatPage />} />
            <Route path="/post/:postId/comments" element={<CommentPage />} />
            <Route path="search" element={<Search />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
