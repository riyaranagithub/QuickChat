import express from 'express';
import {Message} from '../models/user.js';
const messageRoutes = express.Router();

// Get All Messages
messageRoutes.get("/messageall", async (req, res) => {
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
  messageRoutes.post("/savemessage", async (req, res) => {
    try {
      const { senderId, receiverId, content } = req.body;
      if (!content || !senderId || !receiverId) {
        return res.status(400).send({
          message: "Content, sender, or receiver is missing or invalid",
        });
      }
      const message = new Message({ senderId, receiverId, content });
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

export default messageRoutes;