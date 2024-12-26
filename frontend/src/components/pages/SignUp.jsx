import React, { useState } from "react";
import { Link,useNavigate } from "react-router-dom";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    about: "",
  });
  const navigate=useNavigate()
  const [profileImage, setProfileImage] = useState(null); // Store the selected image file
  const [imagePreview, setImagePreview] = useState(null); // Preview of the selected image
  const [errors, setErrors] = useState({}); // Store field-specific errors

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null })); // Clear error for the field being edited
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file)); // Create a preview URL for the image
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataObj = new FormData(); // Use FormData for file uploads
    formDataObj.append("username", formData.username);
    formDataObj.append("email", formData.email);
    formDataObj.append("password", formData.password);
    formDataObj.append("about", formData.about);
    if (profileImage) {
      formDataObj.append("profileImage", profileImage); // Attach the image file
    }
    for (let [key, value] of formDataObj.entries()) {
      console.log(`${key}:`, value);
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/signup`, {
        method: "POST",
        body: formDataObj,
        credentials: "include" // Send FormData as the request body
      });

      const result = await response.json();
      console.log("Signup response:", result);
      if (response.ok) {
        console.log("Signup successful:", result);
        navigate("/")
        
      } else {
        console.error("Signup error:", result.errors);
        setErrors(result.errors || {});
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-5 p-6 border border-gray-200 rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Create an Account
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="username"
            placeholder="Full Name"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="name"
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}
        </div>
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>
        <div>
          <textarea
            name="about"
            placeholder="About (optional)"
            value={formData.about}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
          {errors.about && (
            <p className="text-red-500 text-sm mt-1">{errors.about}</p>
          )}
        </div>
        <div>
          <label className="block mb-2 text-gray-600">Profile Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-4 w-20 h-20 rounded-full object-cover"
            />
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          Sign Up
        </button>
      </form>

      <p className="text-center mt-4 text-gray-600">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-blue-500 font-medium hover:underline"
        >
          Log In
        </Link>
      </p>
    </div>
  );
};

export default SignUp;
