import express from "express";
import {getNotifications, markNotificationAsRead} from "../controllers/notificationController.js"
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.put("/:id", protect, markNotificationAsRead);

export default router;