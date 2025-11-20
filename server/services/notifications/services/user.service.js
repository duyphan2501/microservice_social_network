import axios from "axios";
const getSenderInfo = async (userId) => {
  try {
    const res = await axios.get(`http://localhost:3001/get-info/${userId}`);
    return res.data.user;
  } catch (error) {
    console.log("Can't get sender info");
  }
};

export { getSenderInfo };
