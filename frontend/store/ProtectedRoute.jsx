import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "./userSlice";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("http://localhost:3000/profile", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const loggedUserData = await response.json();
          console.log("Logged User:", loggedUserData);
          dispatch(login(loggedUserData.user));
          navigate("/");
       
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          navigate("/login");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        setIsAuthenticated(false);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, [navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
