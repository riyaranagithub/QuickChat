import express from "express";
import {User} from '../models/user.js';
import userAuth from "../middleware/userAuth.js";
const profileRoutes = express.Router();

// Protected Route
profileRoutes.post("/profile",  async (req, res) => {
  try {
    console.log("id", req.body);
    const loggedUser = await User.findById(
      req.body.userId
    );
    if (!loggedUser) return res.status(404).json({ message: "No user found" });
    res.status(200).json({ message: "User logged in", user: loggedUser });
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
});

// Get All Users
profileRoutes.get("/userall", async (req, res) => {
  try {
    const users = await User.find();
    if (!users || users.length === 0)
      return res.status(404).json({ message: "No users found" });
    res.status(200).json({ message: "Fetched all users", users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//updateProfile

profileRoutes.put("/updateProfile", async (req, res) => {
  console.log("Received PATCH request to update profile", req.body); // Log here
  const { _id, ...data } = req.body;

  try {
    console.log("update data", req.body);
    const user = await User.findByIdAndUpdate(_id, data, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ message: "User updated", user });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(400).json({ error: "Error: User profile is not updated" });
  }
});

export default profileRoutes;
