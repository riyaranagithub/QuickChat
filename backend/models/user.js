import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    minlength: [3, "Username must be at least 3 characters long"],
    maxlength: [30, "Username cannot exceed 30 characters"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(value) {
        console.log("Email validator running....");
        if (!validator.isEmail(value)) {
          throw new Error("Not a valid email: ");
        }
      },
      message: "Please provide a valid email address",
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    validate: {
      validator: function (value) {
        console.log("Password validator running....");
        if (!validator.isStrongPassword(value, {
          minLength: 8,
          minUppercase: 1,
          minLowercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })) {
          throw new Error("Password must be at least 8 characters long, including 1 uppercase, 1 lowercase, 1 number, and 1 special character");
        }
      },
      message: "Invalid password format",
    }},
    about: {
      type: String,
      required: false,
      default: "This is a default about me section.",
      minlength: [10, "About must be at least 10 characters long"],
      maxlength: [200, "About cannot exceed 200 characters"],
    },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets the date when the document is created
  },
  status: {
    type: String,
    enum: ["online", "offline", "away"],
    default: "offline",
  }
});

userSchema.methods.getJwt= function () {
  const user=this;
   const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
   return token;
  
}
userSchema.methods.validatePassword = async function(password){
  const user = this
  const isPasswordValid = await bcrypt.compare(password, user.password);
  return isPasswordValid;
}

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: String,
  createdAt: { type: Date, default: Date.now },
});



const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);
export {User,Message}
