import { Button, TextField } from "@mui/material";
import { useState } from "react";
import BiLoader from "../../components/Biloader";
import useUserStore from "../../stores/useUserStore";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const { isLoading, sendForgotPasswordEmail } = useUserStore();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading.forgot) return;
    const success = await sendForgotPasswordEmail(email);
    setIsSuccess(success);
  };

  return (
    <div className="rounded-xl shadow border-gray-100 bg-white z-10 w-fit overflow-hidden">
      <div className="">
        {isSuccess ? (
          <>
            <div className="p-5 w-96 flex flex-col items-center">
              <h3 className="font-bold text-center text-3xl uppercase title mb-3">
                Yêu cầu thành công!
              </h3>
              <p className="text-center">
                Vui lòng kiểm tra email của bạn để nhận đường dẫn khôi phục mật
                khẩu.
              </p>
              <div className="bg-gray-800 text-center py-2 text-white text-sm px-3 rounded-lg mt-3">
                <a href="/auth/login" className="italic hover:underline">
                  Quay lại trang đăng nhập
                </a>
              </div>
            </div>
            <form
              className="bg-gray-800 text-center py-2 text-white text-sm"
              onSubmit={handleSubmit}
            >
              Chưa nhận được email?{" "}
              <button
                className="italic hover:underline cursor-pointer"
                type="submit"
              >
                {!isLoading.forgot ? "Gửi lại" : "Đang gửi..."}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="">
              <div className="w-100">
                <form className="p-5" onSubmit={handleSubmit}>
                  <h3 className="font-bold text-center text-3xl uppercase title mb-3">
                    Khôi phục mật khẩu
                  </h3>
                  <p className="text-center mb-5">
                    Nhập địa chỉ email và chúng tôi sẽ gửi đường dẫn khôi phục
                    mật khẩu đến bạn
                  </p>
                  <div className="flex gap-5 flex-col">
                    <TextField
                      id="outlined-basic"
                      label="Email"
                      variant="outlined"
                      value={email}
                      type="email"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <Button
                    className="!bg-gray-700 !text-white !min-h-10 !font-bold !uppercase gap-2 items-center !w-full !mt-5 hover:!bg-gray-900"
                    type="submit"
                  >
                    {!isLoading.forgot ? (
                      "Gửi đường dẫn"
                    ) : (
                      <BiLoader size={20} />
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
