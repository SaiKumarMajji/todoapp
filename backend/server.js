const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./models/UserModel");

const bcrypt = require("bcryptjs");
const TaskModel = require("./models/TaskModel");

const app = express();

app.use(express.json());
app.use(cors());

require("dotenv").config();

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

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  UserModel.findOne({ email: email })
    .then((user) => {
      if (user) {
        bcrypt.compare(password, user.password, (err, result) => {
          if (result) {
            // res.json("Success");
            res.json({
              message: "Success",
              userId: user._id,
              username: user.username,
            });
          } else {
            // res.json("password is incorrect");
            res.status(401).json({ error: "Password is incorrect" });
          }
        });
      } else {
        // res.json("this email is not registered");
        res.status(404).json({ error: "Email is not registered" });
      }
    })
    .catch((error) => {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Internal server error" }); // Internal Server Error status code
    });
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if (!specialChars.test(password)) {
      return res.status(400).json({
        error: "Password must contain one special character",
      });
    }
    // Check if username already exists
    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Check if email already registered
    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Hash password and create new user
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ error: "Failed to hash password" });
      } else {
        UserModel.create({
          username: username,
          email: email,
          password: hashedPassword,
        })
          .then((user) => res.status(201).json(user))
          .catch((err) => res.status(400).json({ error: err.message }));
      }
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/tasks/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { task } = req.body;
    const newTask = await TaskModel.create({ task, user: userId });

    res.status(201).json({ message: "Task added successfully", task: newTask });
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/tasks/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const tasks = await TaskModel.find({ user: userId });

    res.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { task } = req.body;

  try {
    const updatedTask = await TaskModel.findByIdAndUpdate(
      id,
      { task },
      { new: true }
    );

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Error updating task" });
  }
});

app.delete("/tasks/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    await TaskModel.findByIdAndDelete(taskId);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3000, () => {
  console.log("server is running");
});
