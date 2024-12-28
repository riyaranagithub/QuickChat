import express from "express";
import {User} from '../models/user.js';
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
const authRoutes = express.Router();
// User Signup
authRoutes.post("/signup", async (req, res) => {
  try {
    console.log("Sign up data:", req.body); // Check form fields
    console.log("Uploaded file:", req.file); // Check uploaded file data

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create new user with hashed password and file path
    const user = new User({
      ...req.body,
      password: hashedPassword,
     
    });

    await user.save();
    console.log("user id, signup", user._id);

    // Generate JWT token for the newly created user
    const token = user.getJwt();

    // Send response with user and token
    res
      .status(200)
      .send({ message: "Signup successful, user logged in", user, token });
  } catch (error) {
    console.error("Error during signup:", error.message);
    res.status(400).send({ message: error.message });
  }
});

// User Login
authRoutes.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) throw new Error("Invalid credentials");
    console.log("user id , login", user._id);

    const token = await user.getJwt();

    res.status(200).send({ message: "Login successful", user, token });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});



export default authRoutes;