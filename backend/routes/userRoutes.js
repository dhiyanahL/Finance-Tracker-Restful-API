import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { registerUser, loginUser } from "../controllers/authController.js";
import {
    getUser,
    createUser,
    updateUser,
    deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

//Public routes (No auth required)
router.post("/register", registerUser);
router.post("/login", loginUser);

//Protected routes (Auth required)
router.get("/", protect, admin, getUser); // Only admin can get all users
router.post("/", protect, admin, createUser); // Only admin can create a user
router.put("/:id", protect, updateUser); //User can update their profile
router.delete("/:id", protect, admin, deleteUser); // Only admin can delete users

// Protected route to get user profile
router.get("/profile", protect, (req, res) => {
    res.json(req.user);
});

// Admin-only route
router.get("/admin", protect, admin, (req, res) => {
    res.json({ message: "Admin Access Granted" });
});

export default router;
