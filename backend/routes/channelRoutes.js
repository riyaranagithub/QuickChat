import express from "express";
import { Channel, ChannelMessage } from "../models/user.js"; // Ensure correct imports
import dotenv from "dotenv";

dotenv.config();
const channelRoutes = express.Router();

// Create a channel
channelRoutes.post("/channels", async (req, res) => {
  const { name, description, createdBy } = req.body;

  if (!name || !createdBy) {
    return res.status(400).json({ error: "Name and createdBy are required" });
  }

  try {
    const newChannel = new Channel({
      name,
      description,
      createdBy,
      members: [createdBy],
      createdAt: new Date(),
    });
    await newChannel.save()

    res.status(201).json({ success: true, channelId: newChannel._id });
  } catch (error) {
    console.error("Error creating channel:", error);
    res.status(500).json({ error: "Failed to create channel" });
  }
});

// Fetch all channels
channelRoutes.get("/channels", async (req, res) => {
  try {
    const channels = await Channel.find().sort({ createdAt: -1 }); // Sort by newest
    res.json({ success: true, channels });
  } catch (error) {
    console.error("Error fetching channels:", error);
    res.status(500).json({ error: "Failed to fetch channels" });
  }
});

// Send messages in a channel
channelRoutes.post("/messages", async (req, res) => {
  const { channelId, senderId,senderName, content } = req.body;

  if (!channelId || !senderId ||!senderName|| !content) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const message = await ChannelMessage.create({
      channelId,
      senderId,
      senderName,
      content,
      createdAt: new Date(),
    });

    res.status(201).json({ success: true, message:message });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Fetch messages of a channel
channelRoutes.get("/messages/:channelId", async (req, res) => {
  const { channelId } = req.params;

  try {
    const messages = await ChannelMessage.find({ channelId })
      .sort({ createdAt: 1 }); // Sort by oldest first

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default channelRoutes;
