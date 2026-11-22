const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./models/UserModel");
const nodemailer = require("nodemailer");

const OtpModel = require("./models/OtpModel");
const bcrypt = require("bcryptjs");
const TaskModel = require("./models/TaskModel");
const { setTokenCookie } = require("./utils/setCookie");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { protect } = require("./middleware/authMiddleware");


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL, 
    credentials: true,             
  })
);


mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// mongoose.connect("mongodb://127.0.0.1:27017/Users");

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      // generic message to prevent enumeration
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
    setTokenCookie(res, token);

    res.json({
      userId: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if (!specialChars.test(password)) {
      return res.status(400).json({ error: "One special character required" });
    }
    if (await UserModel.findOne({ username })) {
      return res.status(400).json({ error: "Username already taken" });
    }
    if (await UserModel.findOne({ email })) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      username,
      email,
      password: hashed,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
    setTokenCookie(res, token);

    // return safe user data — never the password
    res.status(201).json({
      userId: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// CREATE a task — identity comes from the cookie, not the URL
app.post("/tasks", protect, async (req, res) => {
  try {
    const newTask = await TaskModel.create({
      task: req.body.task,
      user: req.user._id,   // derived from JWT, cannot be spoofed
      completed: false,
    });
    res.status(201).json({ message: "Task added successfully", task: newTask });
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// READ all tasks belonging to the logged-in user
app.get("/tasks", protect, async (req, res) => {
  try {
    const tasks = await TaskModel.find({ user: req.user._id });
    res.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// UPDATE — only if the task belongs to the logged-in user
app.put("/tasks/:id", protect, async (req, res) => {
  try {
    const updated = await TaskModel.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, // ownership enforced in the filter
      { task: req.body.task },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE — only if the task belongs to the logged-in user
app.delete("/tasks/:taskId", protect, async (req, res) => {
  try {
    const deleted = await TaskModel.findOneAndDelete({
      _id: req.params.taskId,
      user: req.user._id,
    });
    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get("/me", protect, (req, res) => {
  res.json({
    userId: req.user._id,
    username: req.user.username,
    email: req.user.email,
  });
});

app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ message: "Logged out" });
});

const transporter = nodemailer.createTransport({
  service: "Gmail", // e.g., Gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Endpoint to send OTP
app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email exists in the database
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Email is not registered" });
    }

    // Generate OTP
    const generateOTP = () => {
      return Math.floor(1000 + Math.random() * 9000);
    };
    const otp = generateOTP();
    // Save OTP to the database
    await OtpModel.create({ email, otp });

    // Compose email
    const mailOptions = {
      from: "noreply@gmail.com",
      to: email,
      subject: "OTP for Verification",
      text: `Your OTP for Password reset is: ${otp}`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending OTP email:", error);
        res.status(500).json({ error: "Failed to send OTP" });
      } else {
        console.log("Email sent:", info.response);
        res.status(200).json({ message: "OTP sent successfully" });
      }
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Retrieve OTP from the database
    const storedOTP = await OtpModel.findOne({ email });
    console.log("Stored OTP:", storedOTP);
    if (!storedOTP) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Compare OTP
    console.log("Entered OTP:", otp);
    if (parseInt(otp) !== storedOTP.otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // OTP verification successful
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Check if password contains at least one special character
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if (!specialChars.test(newPassword)) {
      return res.status(400).json({
        error: "one special character required",
      });
    }

    // Update user's password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserModel.findOneAndUpdate({ email }, { password: hashedPassword });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3000, () => {
  console.log("server is running");
});
