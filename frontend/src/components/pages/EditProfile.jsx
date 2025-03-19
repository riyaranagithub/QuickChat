import React, { useEffect, useState } from "react";

const EditProfile = ({setShowEditProfile}) => {
  const [isEditing, setIsEditing] = useState({
    username: false,
    about: false,
  });
  const [formData, setFormData] = useState({
    _id: "",
    username: "",
    email: "",
    about: "",
    memberSince: "",
  });
  const [loading, setLoading] = useState(true);
  const userId = sessionStorage.getItem("userId");

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
          const formattedDate = new Date(
            data.user.createdAt
          ).toLocaleDateString("en-GB");

          setFormData({
            _id: data.user._id || "",
            username: data.user.username || "",
            email: data.user.email || "",
            about: data.user.about || "",
            memberSince: formattedDate || "",
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

  // Enable editing mode for a specific field
  const enableEditMode = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: true }));
  };

  // Disable editing after blur (optional, can be removed if not needed)
  const handleBlur = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: false }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

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
      console.log("response", response);
      if (response.ok) {
        const result = await response.json();
        console.log("Profile updated successfully", result);
        alert("Profile updated successfully");
        setIsEditing({ username: false, about: false });
      } else {
        console.error("Update error:", response.statusText);
      }
    } catch (error) {
      console.error("Something went wrong", error);
      alert("Something went wrong. Please try again.");
    }
    finally{
           setShowEditProfile (false)
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="p-4 border border-gray-300 rounded-lg shadow-md max-w-md  mx-auto bg-gray-800 font-Noto ">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-black">
        {/* User Icon */}
       

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-lg font-medium text-white"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-100"
          />
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
            onClick={() => enableEditMode("username")}
            onBlur={() => handleBlur("username")}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
              isEditing.username ? "bg-white" : "bg-gray-100"
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
            onClick={() => enableEditMode("about")}
            onBlur={() => handleBlur("about")}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 ${
              isEditing.about ? "bg-white" : "bg-gray-100"
            }`}
            rows="3"
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

        {/* Update Button */}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600 transition"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
