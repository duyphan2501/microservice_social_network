import { Button, TextField } from "@mui/material";
import { useState } from "react";
import { X } from "lucide-react";
import BiLoader from "./Biloader";
import useUserStore from "../stores/useUserStore";

const VerificationEmailDialog = ({closeDialog}) => {
  const [email, setEmail] = useState("");
  const { sendVerificationEmail, isLoading } = useUserStore();
    
  const handleSendEmail = async (e) => {
    e.preventDefault();
    const success = await sendVerificationEmail(email);
    if (success) closeDialog();
  };

  return (
    <div>
      <div className="fixed inset-0 bg-black/40 z-100"></div>
      <div className="fixed inset-0 z-200 flex items-center justify-center">
        <div className="rounded-md bg-white p-5 relative shadow-lg">
          <form className="" onSubmit={handleSendEmail}>
            <h5 className="mb-5 font-bold text-lg">Vui lòng nhập email cần xác thực</h5>
            <TextField
              id="outlined-basic"
              label="Email"
              variant="outlined"
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
            <Button
              className="!bg-gray-700 !text-white !min-h-10 !font-bold !uppercase gap-2 items-center !w-full !mt-5 hover:!bg-gray-900"
              type="submit"
            >
              {!isLoading.resend ? "Gửi mã xác thực" : <BiLoader size={20} />}
            </Button>
          </form>
          <div
            className="absolute p-1 bg-white hover:bg-gray-300 rounded-full top-2 right-2 cursor-pointer"
            onClick={closeDialog}
          >
            <X  size={22} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationEmailDialog;
