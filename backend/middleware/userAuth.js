import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // Extract token from cookies
  console.log("token",token)

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, "Riya@Tinder"); // Replace with your secret key
    req.user = decoded; // Add decoded user data to the request
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token expired. Please login again." });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
};


export default verifyToken