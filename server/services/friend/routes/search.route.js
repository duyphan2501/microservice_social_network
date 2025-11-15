// routes/search.route.js
import express from "express";
import SearchController from "../controllers/search.controller.js";
import checkAuth from "../middlewares/checkAuth.js";

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(checkAuth);

// Search users và friends
router.get("/users", SearchController.searchUsers);
router.get("/friends", SearchController.searchFriends);
router.get("/suggestions", SearchController.getFollowSuggestions);

export default router;
