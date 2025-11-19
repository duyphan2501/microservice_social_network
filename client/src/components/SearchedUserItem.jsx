const SearchedUserItem = ({ user, isCheck = false }) => {
  if (!user) return null;
  return (
    <div className="flex p-2 hover:bg-gray-100 cursor-pointer active:bg-gray-200 justify-between">
      <label className="flex gap-3 cursor-pointer">
        <div>
          <div className="w-12 rounded-full overflow-hidden">
            <img
              src={
                user.avatar_url ||
                "https://img.daisyui.com/images/profile/demo/gordon@192.webp"
              }
              alt={user.full_name}
            />
          </div>
        </div>
        <div className="md:flex flex-1 text-sm flex-col justify-center hidden ">
          <p className="font-medium">{user.full_name}</p>
          <p className="font-light">{user.username}</p>
        </div>
      </label>
      <div className=" flex flex-col justify-center">
        <input
          type="radio"
          name="radio-chat-user"
          className="radio"
          checked={isCheck}
        />
      </div>
    </div>
  );
};

export default SearchedUserItem;
