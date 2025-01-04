import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "./userSlice";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('userId'); 
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/profile/profile`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
          credentials: "include",
        });
  
        if (response.ok) {
          const loggedUserData = await response.json();
          dispatch(login(loggedUserData.user));
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
  
    if (userId) checkLoginStatus();
    else navigate("/login");
  }, [dispatch, navigate, userId]);
  

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
