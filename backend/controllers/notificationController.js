import Notification from "../models/notifications.js";
import asyncHandler from "express-async-handler";

// ✅ Get all notifications for the logged-in user
export const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
});

// ✅ Mark a notification as read
export const markNotificationAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification || notification.user.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error("Notification not found");
    }

    notification.seen = true;
    await notification.save();
    res.json({ message: "Notification marked as read" });
});