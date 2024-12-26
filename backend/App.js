import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import connectDB from "./config/database.js";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();


const app = express();
const server = createServer(app); // Use Express app with HTTP server
const io = new Server(server); // Initialize Socket.IO with HTTP server

const port = process.env.PORT || 3000;

// Parse incoming JSON and cookies
app.use(express.json());
app.use(cookieParser());
// Explicitly handle OPTIONS requests
app.options("*", (req, res) => {
  console.log("Middleware running");
  console.log("Preflight request");
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.status(200).send();
});



// Handle CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// --- Routes --
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/message", messageRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(process.env.UPLOAD_DIR , express.static(path.join(__dirname, "uploads")));

// --- Socket.IO Setup ---
const activeUsers = new Map(); // Map to store userId and socketId

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Store userId and socketId when a user connects
  socket.on("register", (userId) => {
    activeUsers.set(userId, socket.id);
    console.log("Registered user:", userId, "Socket ID:", socket.id);
  });

  // Handle private messages
  socket.on("private message", (msg) => {
    const receiverSocketId = activeUsers.get(msg.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("private message", msg);
    }
  });

  // Remove user from activeUsers when they disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        break;
      }
    }
  });
});





// --- Database Connection and Server Start ---
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
