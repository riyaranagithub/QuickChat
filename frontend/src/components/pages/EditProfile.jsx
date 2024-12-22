import React, { useEffect, useState } from "react";
import { FaCamera, FaUserCircle } from "react-icons/fa";

const EditProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    about: "",
    profileImage: "",
    memberSince: "", // Added for account information
  });
  const [loading, setLoading] = useState(true);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:3000/profile", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          const formattedDate = new Date(data.user.createdAt).toLocaleDateString(
            "en-GB" // This is the format "DD/MM/YYYY"
          );
          const imageUrl = data.user.profileImage ? `http://localhost:3000/${data.user.profileImage.replace(/\\/g, '/')}` : "";
    
          setFormData({
            username: data.user.username || "",
            about: data.user.about || "",
            profileImage: imageUrl || "",
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

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prevData) => ({
          ...prevData,
          profileImage: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsEditing(false);

    try {
      const response = await fetch("http://localhost:3000/updateProfile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Profile updated successfully", result);
      } else {
        console.error("Update error:", response.statusText);
      }
    } catch (error) {
      console.error("Something went wrong", error);
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="p-4 border border-gray-300 rounded-lg shadow-md max-w-md mx-auto bg-gray-800">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-semibold mr-2">Edit Profile</h2>
        <button
          onClick={toggleEditMode}
          className="text-gray-600 hover:text-blue-500 transition"
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

      <form onSubmit={handleSubmit} className="space-y-4 text-black" >
        {/* Profile Image */}
        <div className="relative flex flex-col items-center">
          {formData.profileImage ? (
            <img
              src={formData.profileImage}
              // alt="Profile"
              className="w-24 h-24 rounded-full mb-2 border border-gray-300 object-cover"
            />
          ) : (
            <FaUserCircle className="w-24 h-24 text-gray-400 mb-2" />
          )}
          {isEditing && (
            <label
              className=" bg-blue-500 p-2 rounded-full shadow-md cursor-pointer "
            
            >
              <FaCamera className="text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
          {isEditing && (
            <p className="mt-4 text-sm text-gray-600">
              Click the camera icon to update your image.
            </p>
          )}
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-white">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${
              isEditing ? "bg-white" : "bg-gray-100"
            }`}
          />
        </div>

        {/* About */}
        <div>
          <label htmlFor="about" className="block text-sm font-medium text-white">
            About
          </label>
          <textarea
            id="about"
            name="about"
            value={formData.about}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${
              isEditing ? "bg-white" : "bg-gray-100"
            }`}
            rows="4"
          />
        </div>

        {/* Account Information */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Account Information</h3>
          <div className="flex justify-between items-center border-t border-gray-200 pt-2">
            <span className="text-white">Member Since</span>
            <span className="text-gray-800">{formData.memberSince}</span>
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
