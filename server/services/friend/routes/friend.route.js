// routes/friend.route.js
import express from "express";
import FriendController from "../controllers/friend.controller.js";
import checkAuth from "../middlewares/checkAuth.js";

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(checkAuth);

// Friend management
router.post("/request", FriendController.sendFriendRequest);
router.post("/accept", FriendController.acceptFriendRequest);
router.post("/decline", FriendController.declineFriendRequest);
router.delete("/unfriend", FriendController.unfriend);
router.post("/block", FriendController.blockUser);

// Friend lists
router.get("/list", FriendController.getFriendsList);
router.get("/requests/received", FriendController.getReceivedFriendRequests);
router.get("/requests/sent", FriendController.getSentFriendRequests);
router.get("/suggestions", FriendController.getSuggestedFriends);

// Friend status
router.get("/status/:targetUserId", FriendController.getFriendshipStatus);
router.get("/mutual/:targetUserId", FriendController.getMutualFriends);

export default router;
