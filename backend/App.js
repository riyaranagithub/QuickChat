import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import connectDB from "./config/database.js";
import { User, Message } from "./models/user.js";
import userAuth from "./middleware/userAuth.js";
import multer from "multer";
import path from "path";
import bcrypt from "bcrypt";
import { fileURLToPath } from "url";

import cookieParser from "cookie-parser";

import cors from "cors";

const upload = multer({ dest: "uploads/" });
const app = express();
const server = createServer(app); // Use Express app with HTTP server
const io = new Server(server); // Initialize Socket.IO with HTTP server

// CORS Configuration
app.use(cors({
  origin: "http://localhost:5173", // Explicitly allow frontend origin
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // Allow cookies to be sent with the request
}));

app.options('http://localhost:5173', cors());
// Optionally handle preflight (OPTIONS) requests explicitly if needed
app.use('*', (req, res,next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if(req.method  === 'OPTIONS'){
    return res.status(200).send();
  }
 next()
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Socket.IO Setup ---
io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Parse incoming JSON and cookies
app.use(express.json());
app.use(cookieParser());

// --- Routes ---

// User Signup
app.post("/signup", upload.single("profileImage"), async (req, res) => {
  try {
    console.log("Sign up data:", req.body); // Check form fields
    console.log("Uploaded file:", req.file); // Check uploaded file data

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create new user with hashed password and file path
    const user = new User({
      ...req.body,
      password: hashedPassword,
      profileImage: req.file?.path, // Use `req.file.path` if file exists
    });

    await user.save();
    console.log("user id, signup", user._id);

    // Generate JWT token for the newly created user
    const token = user.getJwt();

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      sameSite: "strict",
    });

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
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) throw new Error("Invalid credentials");
    console.log("user id , login", user._id);

    const token = await user.getJwt();

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      sameSite: "lax",
    });

    res.status(200).send({ message: "Login successful", user, token });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// Get All Users
app.get("/userall", async (req, res) => {
  try {
    const users = await User.find();
    if (!users || users.length === 0)
      return res.status(404).json({ message: "No users found" });
    res.status(200).json({ message: "Fetched all users", users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Messages
app.get("/messageall", async (req, res) => {
  try {
    const messages = await Message.find();
    if (!messages || messages.length === 0)
      return res.status(404).json({ message: "No messages found" });
    res.status(200).json({ message: "Fetched all messages", messages });
  } catch (error) {
    res.status(400).send({ message: "Error fetching messages" });
  }
});

// Save Message
app.post("/", async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;
    if (!content || !sender || !receiver) {
      return res
        .status(400)
        .send({
          message: "Content, sender, or receiver is missing or invalid",
        });
    }
    const message = new Message({ sender, receiver, content });
    await message.save();
    res
      .status(200)
      .send({ message: "Message saved successfully", messageData: message });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error saving message", error: error.message });
  }
});

// User Logout
app.post("/logout", (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Error during logout" });
  }
});

// Protected Route
app.get("/profile", userAuth, async (req, res) => {
  try {
    console.log("id", req.user);
    const { _id } = req.user;
    const loggedUser = await User.findById(_id);
    if (!loggedUser) return res.status(404).json({ message: "No user found" });
    res.status(200).json({ message: "User logged in", user: loggedUser });
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
});

//updateProfile

app.patch("/updateProfile", async (req, res) => {
  const { _id, ...data } = req.body;

  try {
    const user = await User.findByIdAndUpdate(_id, data, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ message: "User updated", user });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(400).json({ error: "Error: User profile is not updated" });
  }
});

// --- Database Connection and Server Start ---
connectDB()
  .then(() => {
    console.log("Database connected successfully");
    server.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.log("Database connection failed:", err);
  });
