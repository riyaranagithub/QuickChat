import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/pages/Home";
import Channel from "./components/pages/Channel";
import Login from "./components/pages/Login";
import SignUp from "./components/pages/SignUp";
import Header from "./components/Header";
import EditProfile from "./components/pages/EditProfile";
import ProtectedRoute from "../store/ProtectedRoute";
import { Navigate } from "react-router-dom";

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/channel"
          element={
            <ProtectedRoute>
              <Channel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
