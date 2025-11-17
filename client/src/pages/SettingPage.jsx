import React, { useState } from "react";
import { List, ListItem, ListItemText, ListItemIcon, Box } from "@mui/material";
import {
  ChevronRight as ChevronRightIcon,
  Facebook as FacebookIcon,
} from "@mui/icons-material";
import DialogChangePassword from "../components/DialogChangePassword";

const SettingPage = () => {
  const [openModal, setOpenModal] = useState(false);

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between">
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <DialogChangePassword
        openModal={openModal}
        handleCloseModal={handleCloseModal}
        setOpenModal={setOpenModal}
      />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="border border-gray-200 rounded-xl">
          <List sx={{ padding: 0 }} className="p-0">
            <React.Fragment>
              <ListItem
                button
                onClick={() => setOpenModal(true)}
                className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer px-6 py-4"
              >
                <ListItemText
                  primary={"Change Password"}
                  primaryTypographyProps={{
                    className: "text-gray-800 font-normal text-base",
                  }}
                />
                <div className="flex items-center gap-2">
                  <ChevronRightIcon className="text-gray-400 w-5 h-5" />
                </div>
              </ListItem>
            </React.Fragment>
          </List>
        </div>
      </main>
    </div>
  );
};

export default SettingPage;
