import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../../store/userSlice"; // Import your login action
import Particle from "../particle/Particle";

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
    <div className="relative flex justify-center items-center min-h-screen">
      {/* Particles Background */}
      <div className="absolute top-0 left-0 w-full h-full z-[-1]">
        <Particle />
      </div>
      <div className="relative z-10 w-4/5 sm:w-3/4 md:w-1/2 lg:w-1/4 flex items-center justify-center bg-gray-100 px-4 py-6 sm:px-6 rounded-lg shadow-lg">
        <div className="w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-6 font-Noto">
            Log In to Your Account
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-sm sm:text-base"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-sm sm:text-base"
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
          <p className="text-center mt-4 text-gray-600 font-Noto text-sm sm:text-base">
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
