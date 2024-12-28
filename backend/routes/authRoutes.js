import express from "express";
import {User} from '../models/user.js';
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
const authRoutes = express.Router();
// User Signup
authRoutes.post("/signup", async (req, res) => {
  try {
    const { username, email, password, about } = req.body;

    if (!username || !email || !password) {
      return res.status(400).send({ message: "All fields are required except 'about'." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Replace empty 'about' with undefined to apply default
    const user = new User({
      username,
      email,
      password: hashedPassword,
      about: about && about.trim() ? about : undefined,
    });

    await user.save();
    console.log("user id, signup", user._id);

    // Generate JWT token
    const token = user.getJwt();

    res.status(200).send({ message: "Signup successful", user, token });
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