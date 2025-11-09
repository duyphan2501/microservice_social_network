import { useContext, useState } from "react";
import TextField from "@mui/material/TextField";
import PasswordTextField from "../../components/PasswordTextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { MyContext } from "../../Context/MyContext";
import BiLoader from "../../components/Biloader";
import useUserStore from "../../stores/useUserStore";
 
const Login = () => {
  const [user, setUser] = useState({
    account: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  const { login, isLoading } = useUserStore();
  const { setVerifyUser, setPersist } = useContext(MyContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading.login) return;
    const { loginUser, success } = await login(user);
    if (success) navigate("/");
    else {
      if (loginUser && !loginUser?.isVerified) {
        setVerifyUser(loginUser);
        navigate("/verify-account");
      }
    }
  };

  const onPersistChange = (e) => {
    const checked = e.target.checked;
    setPersist(checked);
    localStorage.setItem("persist", JSON.stringify(checked));
  };

  return (
    <div className="rounded-xl shadow border-gray-100 bg-white z-10 w-100 overflow-hidden">
      <form className="p-5" onSubmit={handleLogin}>
        <h3 className="font-bold text-center mb-5 text-3xl uppercase title">
          Đăng nhập tài khoản
        </h3>
        <div className="flex gap-5 flex-col">
          <TextField
            id="outlined-basic"
            label="Email hoặc username"
            variant="outlined"
            value={user.account}
            onChange={(e) => handleChange("account", e.target.value)}
          />
          <PasswordTextField
            size={"medium"}
            value={user.password}
            handleChange={(value) => handleChange("password", value)}
            label="Mật khẩu"
          />
        </div>
        <div className=" flex items-center justify-between mt-3">
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked
                onChange={onPersistChange}
                sx={{
                  color: "black", // màu viền khi chưa chọn
                  "&.Mui-checked": {
                    color: "black", // màu tick khi được chọn
                  },
                  "&:hover": {
                    backgroundColor: "rgba(0, 43, 91, 0.08)", // hiệu ứng hover nhẹ
                  },
                }}
              />
            }
            label="Ghi nhớ đăng nhập"
            className="remember-me"
          />
          <a
            href="/forgot-password"
            className="text-sm font-semibold italic text-gray-600 hover:underline"
          >
            Quên mật khẩu?
          </a>
        </div>
        <Button
          className="!bg-gray-700 !text-white !min-h-10 !font-bold !uppercase gap-2 items-center !w-full !mt-3"
          type="submit"
        >
          {!isLoading.login ? "Đăng nhập" : <BiLoader size={20} />}
        </Button>
      </form>
      <div className="bg-gray-800 text-center py-2 text-white text-sm">
        Chưa có tài khoản?{" "}
        <a href="sign-up" className="italic hover:underline">
          Đăng ký ngay
        </a>
      </div>
    </div>
  );
};

export default Login;
