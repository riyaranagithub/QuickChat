import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../../store/userSlice"; // Make sure to import your login action

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const loginResponse = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include", // Ensure credentials are sent with the request
      });

      const loginResult = await loginResponse.json();

      if (!loginResponse.ok) {
        // Handle error response from backend
        setErrorMessage(loginResult.message || "Invalid login credentials");
        return;
      }

      // If login is successful, dispatch the login action
      dispatch(login(loginResult.user)); // Pass user data to the Redux store

      // Navigate to the home page
      navigate("/");

    } catch (error) {
      console.error("Error during login.", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border border-gray-200 rounded-lg shadow-md bg-white">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Log In to Your Account
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errorMessage && (
          <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
        )}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          Log In
        </button>
      </form>
      <p className="text-center mt-4 text-gray-600">
        Don’t have an account?{" "}
        <Link to="/signup" className="text-blue-500 font-medium hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default Login;
