import User from "../models/user.js";
import asyncHandler from "express-async-handler";

//Register User
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password,role } = req.body;

    //Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    //Create User
    const user = await User.create({
        name,
        email,
        password,
        role: role || "user", // ✅ Ensure role is assigned properly
    });

    if (user) {
        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: user.generateToken(),
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

//Login User
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    //Check if user exists
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: user.generateToken(),
        });
    } else {
        res.status(400);
        throw new Error("Invalid credentials");
    }
});