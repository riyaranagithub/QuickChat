import { useState, useEffect } from "react";
import { FaCog, FaUser, FaSignOutAlt, FaMoon, FaSun } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi"; // Import hamburger and close icons
import EditProfile from "./pages/EditProfile";
import { logout } from "../../store/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [menuOpen, setMenuOpen] = useState(false); // State for hamburger menu

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
  const toggleMenu = () => setMenuOpen((prev) => !prev); // Toggle menu visibility
  const editProfile = () => setShowEditProfile((prev) => !prev);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;

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

  const isLoggedIn = sessionStorage.getItem("userId") !== null;

  return (
    <header className="fixed top-0 left-0 w-full flex justify-between items-center p-4 bg-black text-white shadow-lg z-50">
      {/* Logo */}
      <div className="flex items-center space-x-4">
        <img src="/logo.png" alt="Quick Chat Logo" className="h-10 w-auto" />
        <h1 className="text-2xl font-semibold">Quick Chat</h1>
      </div>

      {/* Hamburger Menu Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden text-white p-2 focus:outline-none"
        aria-label="Toggle Menu"
      >
        {menuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
      </button>

      {/* Navigation Links */}
      <nav
        className={`${
          menuOpen ? "block" : "hidden"
        } absolute top-full left-0 w-full bg-black md:static md:w-auto md:flex md:space-x-6 md:bg-transparent`}
      >
        {isLoggedIn && (
          <>
            <Link
              to="/home"
              className="block px-4 py-2 text-center md:inline hover:text-gray-400"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/channel"
              className="block px-4 py-2 text-center md:inline hover:text-gray-400"
              onClick={() => setMenuOpen(false)}
            >
              Channels
            </Link>
          </>
        )}
        
        {isLoggedIn && (
          <>
          <button
          onClick={toggleDarkMode}
          className="block px-4 py-2 text-center md:inline hover:bg-gray-700 rounded-lg"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <FaSun className="text-yellow-500" /> : <FaMoon />}
        </button>
            <div
              className="block px-4 py-2 text-center md:inline hover:text-gray-400"
              onClick={editProfile}
            >
              <FaUser className="inline mr-2" />
              Profile
            </div>
            <div
              className="block px-4 py-2 text-center md:inline hover:text-gray-400"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="inline mr-2" />
              Logout
            </div>
          </>
        )}
      </nav>

      {/* Edit Profile Modal */}
      {showEditProfile && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
    <div
      className="relative w-full max-w-md max-h-[90vh] bg-white rounded-lg shadow-lg p-1"
      style={{ marginTop: "2rem", marginBottom: "2rem" }}
    >
      <button
        onClick={editProfile}
        className="absolute top-2 right-2 text-gray-500 hover:text-black"
      >
        ✖
      </button>
      <EditProfile />
    </div>
  </div>
)}

    </header>
  );
}

export default Header;
