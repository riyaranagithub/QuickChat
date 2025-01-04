import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../../store/userSlice"; // Import your login action

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );

      const result = await response.json();
      if (response.ok) {
        sessionStorage.setItem("userId", result.user._id);
        sessionStorage.setItem("username", result.user.username);
        dispatch(login(result.user));
        navigate("/home");
        console.log("Navigation to home page");
      } else {
        setErrorMessage(result.message || "Invalid login credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex h-500 mt-16">
      {/* Left Side - Image */}
      <div className="w-1/2 h-full">
        <img
          src="login.png" // Replace with the actual image path
          alt="Background"
          className="object-cover w-full h-[50vh] md:h-full p-10 rounded-3xl" // Ensures the image is half screen on small screens and full on medium screens
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-1/2 flex items-center justify-center bg-gray-100">
        <div className="h-full p-6 bg-white rounded-lg shadow-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6 font-Noto">
            Log In to Your Account
          </h2>
          <form onSubmit={handleSubmit} className="space-y-10">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
            />
            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition font-Noto"
            >
              Log In
            </button>
          </form>
          <p className="text-center mt-4 text-gray-600 font-Noto">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
