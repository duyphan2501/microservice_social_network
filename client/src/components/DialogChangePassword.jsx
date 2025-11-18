import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import useUserStore from "../stores/useUserStore";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const DialogChangePassword = ({
  openModal,
  handleCloseModal,
  setOpenModal,
}) => {
  const isLoading = useUserStore((s) => s.isLoading);
  const changePassword = useUserStore((s) => s.changePassword);
  const user = useUserStore((s) => s.user);
  const axiosPrivate = useAxiosPrivate();

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // toggle show/hide
  const handleChangeShow = (key) => {
    setShowPassword((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  useEffect(() => {
    setFormData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }, [openModal]);

  const handleSave = async () => {
    if (
      JSON.stringify(formData) ===
      JSON.stringify({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    ) {
      return;
    }

    const newFormData = { ...formData, userId: user?.id };

    console.log(newFormData);
    await changePassword(newFormData, axiosPrivate);

    setOpenModal(false);
  };

  return (
    <Dialog
      open={openModal}
      onClose={handleCloseModal}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "12px" } }}
    >
      <DialogTitle sx={{ paddingBottom: 1 }}>
        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold">Đổi Mật Khẩu</span>
          <IconButton
            size="small"
            onClick={handleCloseModal}
            sx={{ color: "gray" }}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent>
        <div className="flex flex-col gap-5 pt-2">
          {/* Mật khẩu cũ */}
          <TextField
            fullWidth
            label="Old password"
            type={showPassword.oldPassword ? "text" : "password"}
            value={formData.oldPassword}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                oldPassword: e.target.value,
              }))
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleChangeShow("oldPassword")}>
                    {showPassword.oldPassword ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Mật khẩu mới */}
          <TextField
            fullWidth
            label="New password"
            type={showPassword.newPassword ? "text" : "password"}
            value={formData.newPassword}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                newPassword: e.target.value,
              }))
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => handleChangeShow("newPassword")}>
                    {showPassword.newPassword ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Xác nhận mật khẩu */}
          <TextField
            fullWidth
            label="Confirm new password"
            type={showPassword.confirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleChangeShow("confirmPassword")}
                  >
                    {showPassword.confirmPassword ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>
      </DialogContent>

      <DialogActions sx={{ padding: "16px 24px" }}>
        <Button
          onClick={handleCloseModal}
          variant="outlined"
          disabled={isLoading.change}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            borderColor: "#E5E7EB",
            color: "#6B7280",
            "&:hover": {
              borderColor: "#D1D5DB",
              backgroundColor: "#F9FAFB",
            },
          }}
        >
          Hủy
        </Button>

        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isLoading.change}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            backgroundColor: "#000000ff",
            "&:hover": {
              backgroundColor: "#1b1b1bff",
            },
          }}
        >
          {isLoading.change ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            "Change"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogChangePassword;
