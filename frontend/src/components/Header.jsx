import { useState } from "react";
import { FaCog, FaUser, FaSignOutAlt } from "react-icons/fa";
import EditProfile from "./pages/EditProfile";
import { logout } from "../../store/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const editProfile = () => {
    setShowEditProfile((prev) => !prev);
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) {
      return; // If user cancels, simply return
    }
  
    try {
      // Clear session storage or local storage
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
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      {/* Left side: ChatApp logo */}
      <div className="text-2xl font-bold">ChatApp</div>

      {/* Right side: Settings, Profile, Logout with icons */}
      <div className="flex space-x-6">
        <div className="flex items-center cursor-pointer hover:text-gray-400">
          <FaCog className="mr-2" />
          <span>Settings</span>
        </div>
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
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
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
