import { useContext } from "react";
import { MyContext } from "../Context/MyContext";
import { X } from "lucide-react";

const NavigateToLogin = () => {
  const { setIsShowLoginNavigator, isShowLoginNavigator } =
    useContext(MyContext);
  if (!isShowLoginNavigator) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-100">
      <div className="p-5 bg-white rounded-lg z-200 w-80">
        <div className="flex justify-end">
          <button
            className="p-1 rounded-full hover:bg-gray-100 active:bg-gray-200 cursor-pointer"
            onClick={() => setIsShowLoginNavigator(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="my-3 text-center">
          <p>Bạn cần phải đăng nhập để dùng chức năng này</p>
        </div>
        <div className="flex justify-center">
          <a
            href="auth/login"
            className=" px-5 py-2 text-white bg-black hover:bg-gray-900 rounded-lg"
          >
            Đăng nhập ngay
          </a>
        </div>
      </div>
    </div>
  );
};

export default NavigateToLogin;
