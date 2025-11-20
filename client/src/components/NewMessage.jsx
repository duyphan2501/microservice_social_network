import { X } from "lucide-react";
import { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "../Context/MyContext";
import SearchedUserItem from "./SearchedUserItem";
import useUserStore from "../stores/useUserStore";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useConversationStore from "../stores/useConversationStore";
import BiLoader from "./Biloader";

const NewMessage = () => {
  const {
    isOpenNewMessage,
    setIsOpenNewMessage,
    setSelectedConversationId,
    setChatUser,
  } = useContext(MyContext);

  const [searchedUsers, setSearchedUsers] = useState([]);
  const [term, setTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  const { getConversationByUser, isLoading } = useConversationStore();
  const handleChatClick = async () => {
    setChatUser(selectedUser);
    const fetchConversation = await getConversationByUser(
      selectedUser?.id,
      axiosPrivate
    );
    setSelectedConversationId(fetchConversation?.id);
    handleClose();
  };

  const handleClose = () => {
    setSelectedUser(null);
    setIsOpenNewMessage(false);
    setTerm("");
    setSearchedUsers([]);
  };

  const { searchUsers } = useUserStore();

  const timeoutRef = useRef(null);

  const handleTermChange = async (e) => {
    const newTerm = e.target.value;
    setTerm(newTerm);

    // Xóa timeout cũ nếu có
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Thiết lập timeout mới (ví dụ: 300ms)
    timeoutRef.current = setTimeout(async () => {
      if (newTerm.trim().length > 0) {
        setIsSearching(true);
        try {
          // Gọi hàm tìm kiếm từ store
          const users = await searchUsers(newTerm.trim());
          setSearchedUsers(users);
        } catch (error) {
          console.error("Error searching users:", error);
          // Có thể thêm logic xử lý lỗi tại đây
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchedUsers([]); // Xóa danh sách nếu input rỗng
      }
    }, 300);
  };

  // Clear timeout khi component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!isOpenNewMessage) return null;
  return (
    <div className="flex justify-center items-center fixed inset-0 bg-black/70 z-100">
      <div className="rounded-lg bg-white border border-gray-100 p-5 w-140 space-y-2">
        <div className="flex items-center justify-between">
          <p className="w-10"></p>
          <p className="font-semibold subtitle">New Message</p>
          <p
            className="p-1 rounded-full hover:bg-gray-100 active:bg-gray-200 cursor-pointer"
            onClick={handleClose}
          >
            <X />
          </p>
        </div>
        <div className="flex items-center gap-4 p-2 border-2 border-gray-300 rounded-lg text-[15px]">
          <label htmlFor="chat-user">To: </label>
          <input
            type="text"
            id="chat-user"
            placeholder="Search..."
            className="focus:outline-0 flex-1" 
            value={term}
            onChange={handleTermChange}
          />
        </div>
        <ul className="h-90 max-h-90 overflow-auto">
          {isSearching ? (
            <li className="p-4 text-center text-gray-500">Đang tìm kiếm...</li>
          ) : searchedUsers.length > 0 ? (
            searchedUsers.map((user) => (
              <li key={user?.id} onClick={() => setSelectedUser(user)}>
                <SearchedUserItem
                  user={user}
                  isCheck={selectedUser && user.id === selectedUser.id}
                />
              </li>
            ))
          ) : (
            term.length > 0 && (
              <li className="p-4 text-center text-gray-500">
                Không tìm thấy người dùng phù hợp.
              </li>
            )
          )}
        </ul>
        <div className="">
          <button
            className="w-full p-2 rounded-lg bg-black font-bold text-white subtitle hover:bg-gray-800 active:bg-gray-900 cursor-pointer"
            disabled={!selectedUser}
            onClick={handleChatClick}
          >
            {isLoading.getByUser ? <BiLoader size={20} /> : "Chat"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewMessage;
