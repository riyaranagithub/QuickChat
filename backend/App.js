import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import connectDB from "./config/database.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import channelRoutes from "./routes/channelRoutes.js"
import { User } from "./models/user.js";

dotenv.config();

const app = express();
const server = createServer(app); // Use Express app with HTTP server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // Allow your frontend URL
    methods: ["GET", "POST", "PATCH", "OPTIONS", "DELETE", "PUT"], // Specify allowed methods
    credentials: true, // Include cookies if necessary
  },
});

const port = process.env.PORT || 3000;

// Parse incoming JSON and cookies
app.use(express.json());
app.use(cookieParser());
// Explicitly handle OPTIONS requests
app.options(process.env.FRONTEND_URL, (req, res) => {
  console.log("Middleware running");
  console.log("Preflight request");
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS, PUT"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.status(200).send();
});

// Handle CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// --- Routes --
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/message", messageRoutes);
app.use("/channel",channelRoutes)

// --- Socket.IO Setup ---
const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("register", (userId) => {
    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, { status: "online", socketId: socket.id });
      console.log("Registered user:", userId, "Socket ID:", socket.id);
      console.log(
        "Active users after registration:",
        Array.from(activeUsers.entries())
      );
    } else {
      console.log("User already registered:", userId);
    }
  });

  socket.on("private message", (msg) => {
    const receiverUser = activeUsers.get(msg.receiverId);
    if (receiverUser) {
      console.log("Sending private message to:", msg.receiverId);
      console.log("MESSAGE", msg);
      io.to(receiverUser.socketId).emit("private message", msg);
    } else {
      console.log("Receiver socket ID not found for message:", msg);
    }
  });

  socket.on("userOnline", async (userId) => {
    try {
      console.log("socketId", socket.id);
      activeUsers.set(userId, { status: "online", socketId: socket.id });
      console.log(`${userId} is online`);
      await User.findByIdAndUpdate(userId, { status: "online" });
      io.emit("userStatusUpdate", { userId, status: "online" });
    } catch (err) {
      console.error("Error updating user status to online:", err);
    }
  });

  // Join a specific channel
  socket.on("joinChannel", (channelId) => {
    socket.join(channelId);
    console.log(`User joined channel: ${channelId}`);
  });

  // Leave a channel
  socket.on("leaveChannel", (channelId) => {
    socket.leave(channelId);
    console.log(`User left channel: ${channelId}`);
  });
 
    // Emit new messages to everyone in the channel
    socket.on("sendMessage", (message) => {
      io.to(message.channelId).emit("message", message); // Emit to specific channel room
    });

  socket.on("disconnect", async () => {
    console.log(`User disconnected with socket ID: ${socket.id}`);

    let userIdToDelete = null;

    // Find the user by their socket ID
    for (const [userId, value] of activeUsers.entries()) {
      if (value === socket.id || value.socketId === socket.id) {
        userIdToDelete = userId;
        break;
      }
    }

    if (userIdToDelete) {
      try {
        await User.findByIdAndUpdate(userIdToDelete, { status: "offline" });

        // Notify other users about the status update
        io.emit("userStatusUpdate", {
          userId: userIdToDelete,
          status: "offline",
        });

        // Remove the user from activeUsers
        activeUsers.delete(userIdToDelete);
        console.log(`User ${userIdToDelete} is now offline.`);
      } catch (err) {
        console.error("Error updating user status to offline:", err);
      }
    }

    console.log("Updated active users:", Array.from(activeUsers.entries()));
  });
});

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    server.listen(port, () => {
      console.log("Server is running on port 3000");
      console.log("Frontend URL:", process.env.FRONTEND_URL);
    });
  })
  .catch((err) => {
    console.log("Database connection failed:", err);
  });
