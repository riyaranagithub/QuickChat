import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaChevronDown, FaPaperPlane } from "react-icons/fa";
import Picker from "emoji-picker-react"; // Install: npm install emoji-picker-react
import io from "socket.io-client"; // Import Socket.IO client

const Channel = () => {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [showChannels, setShowChannels] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [newChannel, setNewChannel] = useState({ name: "", description: "" });
  const userId = sessionStorage.getItem("userId");
  const senderName = sessionStorage.getItem("username");
  const socket = io(import.meta.env.VITE_BACKEND_URL); // Set up socket connection

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch all channels
  useEffect(() => {
    async function fetchChannels() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/channel/channels`
        );
        const data = await response.json();
        setChannels(data.channels || []);
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    }
    fetchChannels();
  }, []);

  // Fetch messages for the selected channel
  // Fetch messages for the selected channel
  useEffect(() => {
    if (selectedChannel) {
      // Emit to join the channel only once
      socket.emit("joinChannel", selectedChannel._id);

      // Fetch previous messages
      async function fetchMessages() {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/channel/messages/${
              selectedChannel._id
            }`
          );
          const data = await response.json();
          console.log("Fetched messages:", data.messages);
          setMessages(data.messages || []); // Set fetched messages
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
      fetchMessages();

      // Listen for new messages
      socket.on("message", (message) => {
        console.log("New message:", message);
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      console.log("Joined channel:", selectedChannel.name);
      //   console.log("Messages:", messages);

      // Cleanup on channel change or component unmount
      return () => {
        socket.emit("leaveChannel", selectedChannel._id); // Leave the channel when it's no longer selected
        socket.removeListener("message"); // Remove the listener to avoid duplicate listeners
      };
    }
  }, [selectedChannel]);

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/channel/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channelId: selectedChannel._id,
            senderId: userId,
            senderName: senderName,
            content: newMessage,
          }),
        }
      );
      const data = await response.json();
      socket.emit("sendMessage", data.message); // Emit the new message to all clients
      setNewMessage(""); // Clear input
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle creating a new channel
  const handleCreateChannel = async () => {
    if (!newChannel.name.trim()) return alert("Channel name is required");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/channel/channels`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ ...newChannel, createdBy: userId }),
        }
      );
      const data = await response.json();
      setChannels((prev) => [...prev, { _id: data.channelId, ...newChannel }]);
      setShowCreateChannelModal(false);
      setNewChannel({ name: "", description: "" });
    } catch (error) {
      console.error("Error creating channel:", error);
    }
  };

  return (
    <div className="flex h-500 dark:bg-gray-900 text-white bg-white  mt-16">
      {/* Sidebar */}
      <div className="w-1/4 dark:bg-gray-800 bg-gray-100 p-4">
        <h2 className="text-lg font-bold mb-4 font-Noto text-black dark:text-white">
          Channels
        </h2>
        <div className="mb-4">
          <button
            className="flex items-center text-blue-600 hover:text-blue-700"
            onClick={() => setShowCreateChannelModal(true)}
          >
            <FaPlus className="mr-2" /> Create a new channel
          </button>
        </div>
        <div>
          <button
            className="flex items-center justify-between w-full bg-gray-700 p-2 rounded hover:bg-gray-600"
            onClick={() => setShowChannels((prev) => !prev)}
          >
            <span>Channels</span>
            <FaChevronDown />
          </button>
          {showChannels && (
            <ul className="mt-2">
              {channels.map((channel) => (
                <li
                  key={channel._id}
                  className={`p-2 hover:bg-blue-100 cursor-pointer text-black dark:text-white dark:hover:bg-gray-900 ${
                    selectedChannel?._id === channel._id
                      ? "bg-blue-100 dark:bg-gray-900"
                      : ""
                  }`}
                  onClick={() => setSelectedChannel(channel)}
                >
                  {channel.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="w-3/4 flex flex-col">
        {/* Channel Header */}
        <div className="dark:bg-gray-800 bg-gray-600 p-4 shadow">
          <h2 className="text-xl font-bold">
            {selectedChannel ? selectedChannel.name : "Select a Channel"}
          </h2>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-scroll dark:bg-gray-900 bg-gray-100">
          {messages.map((message, index) => (
            <div
              key={index}
              className="flex items-start mb-4 p-3 rounded shadow"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white text-lg font-bold mr-4">
                {message.senderName ? message.senderName[0].toUpperCase() : "?"}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-blue-400">
                    {message.senderName || "Unknown Sender"}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {new Date(message.createdAt).toLocaleDateString()}{" "}
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-black dark:text-white">
                  {message.content || "No Content"}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} /> {/* Scroll to this element */}
        </div>

        {/* Message Input */}
        <div className="dark:bg-gray-800 bg-gray-100 border border-gray-300 p-4 flex items-center">
          <input
            type="text"
            className="flex-1 p-2 rounded dark:bg-gray-700 dark:text-white text-black border border-gray-300"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button
            className="ml-2 bg-blue-500 hover:bg-blue-600 p-2 rounded text-white"
            onClick={handleSendMessage}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>

      {/* Create Channel Modal */}
      {showCreateChannelModal && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center ">
          <div className="dark:bg-gray-800 bg-gray-600  p-6 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-4">Create a New Channel</h2>
            <input
              type="text"
              placeholder="Channel Name"
              value={newChannel.name}
              onChange={(e) =>
                setNewChannel({ ...newChannel, name: e.target.value })
              }
              className="w-full p-2 mb-4 rounded dark:bg-gray-700 bg-gray-50 dark:text-white text-black outline-none"
            />
            <textarea
              placeholder="Channel Description"
              value={newChannel.description}
              onChange={(e) =>
                setNewChannel({ ...newChannel, description: e.target.value })
              }
              className="w-full p-2 mb-4 rounded dark:bg-gray-700 bg-gray-50 dark:text-white text-black outline-none"
            />
            <div className="flex justify-end">
              <button
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded mr-2"
                onClick={() => setShowCreateChannelModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                onClick={handleCreateChannel}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Channel;
