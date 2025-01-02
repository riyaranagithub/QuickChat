import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Header from "../Header";
import { FaUserCircle,FaTrashAlt } from "react-icons/fa";

function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const userId = sessionStorage.getItem("userId");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (selectedUserId && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, selectedUserId]); // This will trigger scrolling when messages or selected user changes

  useEffect(() => {
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

    socketRef.current = io(import.meta.env.VITE_BACKEND_URL, {
      withCredentials: true,
    });
    socketRef.current.on("connect", () => console.log("Connected to server"));
    socketRef.current.emit("register", userId);
    socketRef.current.emit("userOnline", userId);
    socketRef.current.on("private message", (msg) => {
      console.log("Received private message:", msg); 
      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on("userStatusUpdate", (update) => {
      console.log("User status update:", update);
      // Update UI based on user status
    });

 
    return () => {
      if (socketRef.current) {
        socketRef.current.off("private message");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId]);

  const sendMessage = async () => {
    if (input.trim() && selectedUserId) {
      const message = {
        senderId: userId,
        receiverId: selectedUserId,
        content: input,
      };

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

  const deleteMessage = async (msgId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/message/deletemessage/${msgId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (response.ok) {
        setMessages((prev) => prev.filter((msg) => msg._id !== msgId));
        alert("Message deleted successfully");
      } else {
        console.error("Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
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
<div className="w-64 bg-gray-100 dark:bg-gray-800 text-black dark:text-white p-4 border-r border-gray-300 h-full overflow-y-auto">
  <h2 className="text-lg font-semibold mb-2">Users</h2>
  <div className="space-y-2 font-Noto">
    {users
      .filter((user) => user._id !== userId)
      .map((user) => (
        <div
          key={user._id}
          onClick={() => handleUserSelection(user)}
          className={`flex items-center justify-between p-2 border-b border-gray-300 cursor-pointer ${
            selectedUserId === user._id ? "bg-blue-100 dark:bg-blue-900" : ""
          }`}
        >
          {/* Username and Status */}
          <div className="flex justify-between w-full">
            <div className="flex items-center gap-2">
                 <FaUserCircle className="w-8 h-8 text-gray-400 dark:text-gray-200 " />
            <span className="text-black dark:text-white">{user.username}</span>
            </div>
       
            <span
              className={`text-xs font-medium px-2 py-1 rounded-lg ${
                user.status === "online" ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-600"
              }`}
            >
              {user.status === "online" ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      ))}
  </div>
</div>


        {/* Chat Area */}
        <div className="flex-grow p-6 flex flex-col justify-center  overflow-hidden bg-gray-50 dark:bg-gray-900">
          {selectedUserId ? (
            <>
            <div className="border-b border-gray-300 dark:border-gray-700 pb-2 mb-4 flex items-center justify-between">
  <h2 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
    {selectedUserDetails.username}
    {/* Status Indicator */}
    <span
      className={`text-sm font-medium px-2 py-1 rounded-lg ${
        selectedUserDetails.status === "online"
          ? "bg-green-100 text-green-600"
          : "bg-gray-200 text-gray-600"
      }`}
    >
      {selectedUserDetails.status === "online" ? "Online" : "Offline"}
    </span>
  </h2>
</div>

<div className="flex-grow overflow-y-auto border border-gray-300 dark:border-gray-700 p-4 space-y-4 font-Noto">
                {messages
                  .filter(
                    (msg) =>
                      (msg.senderId === userId &&
                        msg.receiverId === selectedUserId) ||
                      (msg.receiverId === userId &&
                        msg.senderId === selectedUserId)
                  )
                  .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                  .map((msg, index) => (
                    <div
                      key={index}
                      className={`flex items-start ${
                        msg.senderId === userId ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {msg.senderId !== userId && (
                          <FaTrashAlt
                            className="text-red-500 cursor-pointer"
                            onClick={() => deleteMessage(msg._id)}
                          />
                        )}
                        <div>
                          <p
                            className={`font-semibold mr-2 ${
                              msg.senderId === userId
                                ? "text-green-600 dark:text-green-400"
                                : "text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            {msg.senderId === userId ? "You" : selectedUserDetails.username}
                          </p>
                          <p
                            className={`p-2 rounded-lg shadow-md ${
                              msg.senderId === userId
                                ? "bg-blue-100 dark:bg-gray-300 "
                                : "bg-gray-100 dark:bg-gray-300"
                            }`}
                          >
                            {msg.content}
                          </p>
                        </div>
                        {msg.senderId === userId && (
                          <FaTrashAlt
                            className="text-red-500 cursor-pointer"
                            onClick={() => deleteMessage(msg._id)}
                          />
                        )}
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
                  className="flex-grow border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-700 text-black dark:text-white"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-500 dark:bg-blue-700 text-white rounded-lg px-4 py-2 hover:bg-blue-600 dark:hover:bg-blue-800 transition"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <img
                src="Select.png"
                alt="Start Chatting Placeholder"
                className="object-contain h-2/3 w-2/3"
              />
              <h2 className="text-2xl font-semibold mb-4">
                Select a user to start chatting
              </h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
