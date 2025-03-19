QuickChat - Real-Time Chat Application

QuickChat is a real-time chat application built using the MERN stack with Socket.IO for instant messaging. It allows users to communicate seamlessly with an intuitive and responsive interface.

Features

Real-time Messaging - Instant communication using Socket.IO.

User Authentication - Secure login and registration.

Group & Private Chats - Engage in one-on-one or group conversations.

Online Status - Know when users are online.

Tech Stack

Frontend: React, Redux, React Router, Tailwind CSS

Backend: Node.js, Express.js, MongoDB, Mongoose

Real-time Communication: Socket.IO

Authentication: JWT, bcrypt

Installation

Backend Setup

Clone the repository:

git clone https://github.com/yourusername/quickchat-backend.git

Navigate to the backend folder:

cd backend

Install dependencies:

npm install

Create a .env file and add your environment variables:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=your_frontend_url
Access_Control_Allow_Methods="GET, POST, PUT,PATCH, DELETE, OPTIONS"
UPLOAD_DIR=/uploads


Start the backend server:

npm run dev

Frontend Setup

Clone the frontend repository:

Navigate to the frontend folder:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

Deployment

Live Demo

The application is deployed and accessible at:
https://qucikchat.netlify.app/

Contributing

Contributions are welcome! Feel free to fork the repository and submit a pull request.

License

This project is licensed under the MIT License.

Happy chatting! 🚀

