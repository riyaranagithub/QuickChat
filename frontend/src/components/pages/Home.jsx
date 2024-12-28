import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import Header from "../Header";
import { FaUserCircle } from "react-icons/fa";

function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const userId = sessionStorage.getItem("userId");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null); // Ref for auto-scroll

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    // Scroll to the bottom when the selected user changes
    scrollToBottom();
  }, [selectedUserId, messages]); // It will trigger whenever selectedUserId or messages change

  useEffect(() => {
    // Fetch users and messages
    const fetchUsers = async () => {
      try {
        const userResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/profile/userall`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (userResponse.ok) {
          const data = await userResponse.json();
          setUsers(data.users);
        } else {
          console.error("Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchMessages = async () => {
      try {
        const messageResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/message/messageall`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (messageResponse.ok) {
          const data = await messageResponse.json();
          setMessages(data.messages);
        } else {
          console.error("Failed to fetch messages");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchUsers();
    fetchMessages();

    // Initialize Socket.IO
    socketRef.current = io(import.meta.env.VITE_BACKEND_URL);
    socketRef.current.emit("register", userId);

    socketRef.current.on("private message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("private message");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId]);

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim() && selectedUserId) {
      const message = {
        senderId: userId,
        receiverId: selectedUserId,
        content: input,
      };

      // Optimistic update
      setMessages((prev) => [...prev, message]);
      setInput("");
      socketRef.current.emit("private message", message);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/message/savemessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(message),
            credentials: "include",
          }
        );

        if (!response.ok) {
          console.error("Failed to save message");
        }
      } catch (error) {
        console.error("Error saving message:", error);
      }
    }
  };

  const handleUserSelection = (user) => {
    setSelectedUserId(user._id);
    setSelectedUserDetails(user);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-100 p-4 border-r border-gray-300 h-full overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2">Users</h2>
          <div className="space-y-2">
            {users
              .filter((user) => user._id !== userId)
              .map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserSelection(user)}
                  className={`flex p-2 border-b border-gray-300 cursor-pointer ${
                    selectedUserId === user._id ? "bg-blue-100" : ""
                  }`}
                >
                  <FaUserCircle className="w-8 h-8 text-gray-400 mr-3" />
                  {user.username}
                </div>
              ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow p-6 flex flex-col overflow-hidden">
          {selectedUserId ? (
            <>
              <div className="border-b border-gray-300 pb-2 mb-4">
                <h2 className="text-xl font-semibold">
                  {selectedUserDetails.username}
                </h2>
              </div>
              <div className="flex-grow overflow-y-auto border border-gray-300 p-4 bg-gray-50 space-y-4">
                {messages
                  .filter(
                    (msg) =>
                      (msg.senderId === userId &&
                        msg.receiverId === selectedUserId) ||
                      (msg.receiverId === userId &&
                        msg.senderId === selectedUserId)
                  )
                  .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // Sort messages by timestamp, ascending
                  .map((msg, index) => (
                    <div
                      key={index}
                      className={`flex items-start ${
                        msg.senderId === userId ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div>
                        <p
                          className={`font-semibold mr-2 ${
                            msg.senderId === userId
                              ? "text-green-600"
                              : "text-blue-600"
                          }`}
                        >
                          {msg.senderId === userId
                            ? "You"
                            : selectedUserDetails.username}
                          :
                        </p>
                        <p
                          className={`bg-white p-2 rounded-lg shadow-md ${
                            msg.senderId === userId
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message"
                  className="flex-grow border border-gray-300 rounded-lg p-2"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-xl text-gray-500">
              Select a user to start chatting.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
