import React, { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";

const EditProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    _id: "",
    username: "",
    about: "",
    memberSince: "", // Added for account information
  });
  const [loading, setLoading] = useState(true);
  const userId = sessionStorage.getItem("userId"); // Retrieve user ID

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/profile/profile`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          const formattedDate = new Date(data.user.createdAt).toLocaleDateString(
            "en-GB"
          );

          setFormData({
            _id: data.user._id || "",
            username: data.user.username || "",
            about: data.user.about || "",
            memberSince: formattedDate || "", // Populate join date
          });
        } else {
          console.error("Failed to fetch profile:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing((prev) => !prev);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsEditing(false);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/profile/updateProfile`,
        {
          method: "PUT",
          body: JSON.stringify(formData),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Profile updated successfully", result);
      } else {
        console.error("Update error:", response.statusText);
      }
    } catch (error) {
      console.error("Something went wrong", error);
      alert("Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="p-4 border border-gray-300 rounded-lg shadow-md max-w-md mx-auto bg-gray-800 font-Noto">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-semibold text-white mr-2">Edit Profile</h2>
        <button
          onClick={toggleEditMode}
          className="text-gray-100 hover:text-blue-500 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 3.487a1.875 1.875 0 112.651 2.651L7.44 18.211l-4.095.455a.937.937 0 01-1.037-1.037l.455-4.095L16.862 3.487z"
            />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-black">
        {/* User Icon */}
        <div className="relative flex flex-col items-center">
          <FaUserCircle className="w-24 h-24 text-gray-400 mb-2" />
        </div>

        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="block text-lg font-medium text-white"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
              isEditing ? "bg-white" : "bg-gray-100"
            }`}
          />
        </div>

        {/* About */}
        <div>
          <label
            htmlFor="about"
            className="block text-lg font-medium text-white"
          >
            About
          </label>
          <textarea
            id="about"
            name="about"
            value={formData.about}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
              isEditing ? "bg-white" : "bg-gray-100"
            }`}
            rows="4"
          />
        </div>

        {/* Account Information */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 text-blue-500">
            Account Information
          </h3>
          <div className="flex justify-between items-center border-t border-gray-200 pt-2">
            <span className="text-white">Member Since</span>
            <span className="text-white">{formData.memberSince}</span>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600 transition"
          >
            Save Changes
          </button>
        )}
      </form>
    </div>
  );
};

export default EditProfile;
