import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import { FaUserCircle } from 'react-icons/fa';

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const username = useSelector((state) => state.user.user?.username || 'Guest');
  const socketRef = useRef(null);

  useEffect(() => {
    // Fetch users
    const fetchUsers = async () => {
      try {
        const userResponse = await fetch('http://localhost:3000/userall', { method: 'GET', credentials: 'include' });
        if (userResponse.ok) {
          const data = await userResponse.json();
          setUsers(data.users);
        } else {
          console.error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    // Fetch messages
    const fetchMessages = async () => {
      try {
        const messageResponse = await fetch('http://localhost:3000/messageall', { method: 'GET', credentials: 'include' });
        if (messageResponse.ok) {
          const data = await messageResponse.json();
          setMessages(data.messages);
        } else {
          console.error('Failed to fetch messages');
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchUsers();
    fetchMessages();

    // Initialize Socket.IO connection
    socketRef.current = io('http://localhost:3000');

    // Listen for incoming private messages
    socketRef.current.on('private message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('private message');
        socketRef.current.disconnect();
      }
    };
  }, []);

  const sendMessage = async () => {
    if (input.trim() && selectedUser) {
      const message = { sender: username, receiver: selectedUser, content: input };
      socketRef.current.emit('private message', message);
      setMessages((prev) => [...prev, message]);
      setInput('');

      try {
        const response = await fetch('http://localhost:3000', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
          credentials: 'include',
        });

        if (response.ok) {
          console.log('Message saved to DB');
        } else {
          const errorData = await response.json();
          console.error('Failed to save message:', errorData.message);
        }
      } catch (error) {
        console.error('Error saving message:', error);
      }
    }
  };

  const handleUserSelection = (user) => {
    setSelectedUser(user.username);
    setSelectedUserDetails(user);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header />

      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-100 p-4 border-r border-gray-300 h-full overflow-y-auto">
         

          <div>
            <h2 className="text-lg font-semibold mb-2">Users</h2>
            <div className="space-y-2">
              {users
                .filter((user) => user.username !== username)
                .map((user, index) => (
                  <div
                    key={index}
                    onClick={() => handleUserSelection(user)}
                    className={`flex p-2 border-b border-gray-300 cursor-pointer ${selectedUser === user.username ? 'bg-blue-100' : ''}`}
                  >
                    {user.profileImage ? <img
                      src={`http://localhost:3000/${user.profileImage}`}
                      alt={user.username}
                      className="w-8 h-8 rounded-full mr-3"
                    /> : <FaUserCircle className="w-8 h-8 text-gray-400 mr-3" />}
                    
                    {user.username}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow p-6 flex flex-col overflow-hidden">
          {selectedUser ? (
            <>
              <div className="border-b border-gray-300 pb-2 mb-4">
                <h2 className="text-xl font-semibold"> {selectedUser}</h2>
              </div>

           

              <div className="flex-grow overflow-y-auto border border-gray-300 p-4 bg-gray-50 space-y-4 max-h-[60vh]">
                {messages
                  .filter(
                    (msg) =>
                      (msg.sender === username && msg.receiver === selectedUser) ||
                      (msg.receiver === username && msg.sender === selectedUser)
                  )
                  .map((msg, index) => (
                    <div key={index} className="flex items-start">
                      <div>
                        <p
                          className={`font-semibold mr-2 ${
                            msg.sender === username ? 'text-green-600' : 'text-blue-600'
                          }`}
                        >
                          {msg.sender}:
                        </p>
                        <p className="bg-white p-2 rounded-lg shadow-md">{msg.content}</p>
                      </div>
                    </div>
                  ))}
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
            <p className="text-center text-xl text-gray-500">Select a user to start chatting.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
