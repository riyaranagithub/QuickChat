import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Home from "./components/pages/Home"
import Channel from "./components/pages/Channel";
import Login from "./components/pages/Login";
import SignUp from "./components/pages/SignUp";
import Header from "./components/Header";
import EditProfile from "./components/pages/EditProfile";

const App = () => {
  const isLoggedIn = sessionStorage.getItem("userId") !== null; // Check login status from sessionStorage

  return (
    <Router>
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Routes */}
        {isLoggedIn ? (
          <>
            <Route path="/home" element={<Home />} />
            <Route path="/channel" element={<Channel />} />
            <Route path="/profile" element={<EditProfile />} />
          </>
        ) : (
          <Route path="/" element={<Navigate to="/login" />} /> // Redirect non-logged-in users to login
        )}

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to={isLoggedIn ? "/home" : "/login"} />} /> {/* Fallback route */}
      </Routes>
    </Router>
  );
};


export default App;
