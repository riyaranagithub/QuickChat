import { useState, useEffect } from "react";
import { FaCog, FaUser, FaSignOutAlt, FaMoon, FaSun } from "react-icons/fa";
import EditProfile from "./pages/EditProfile";
import { logout } from "../../store/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const editProfile = () => {
    setShowEditProfile((prev) => !prev);
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) {
      return;
    }

    try {
      sessionStorage.removeItem("userToken");
      sessionStorage.removeItem("userId");
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("An error occurred while logging out.");
    }
  };

  return (
    <header className="flex justify-between items-center p-4 bg-black text-white drop-shadow-2xl">
      {/* Logo and Heading */}
      <div className="flex items-center space-x-4">
        <img
          src="/logo.png"
          alt="Quick Chat Logo"
          className="h-10 w-auto"
        />
        <h1 className="text-2xl font-semibold font-Rubik">Quick Chat</h1>
      </div>

      {/* Navigation and Controls */}
      <div className="flex space-x-6 items-center">
        <button
          onClick={toggleDarkMode}
          className="flex items-center p-2 rounded-lg hover:bg-gray-700 transition"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? (
            <FaSun className="text-yellow-500" />
          ) : (
            <FaMoon className="text-gray-300" />
          )}
        </button>

        <div
          className="flex items-center cursor-pointer hover:text-gray-400"
          onClick={editProfile}
        >
          <FaUser className="mr-2" />
          <span>Profile</span>
        </div>
        <div
          className="flex items-center cursor-pointer hover:text-gray-400"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="mr-2" />
          <span>Logout</span>
        </div>
      </div>

      {showEditProfile && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex  justify-center z-50">
          <div className="relative w-full max-w-md">
            <button
              onClick={editProfile}
              className="absolute top-2 right-2 text-gray-400 hover:text-white "
            >
              ✖
            </button>
            <EditProfile />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
