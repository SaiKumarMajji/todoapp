const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./models/UserModel");

const bcrypt = require("bcryptjs");
const TaskModel = require("./models/TaskModel");

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/Users");

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  UserModel.findOne({ email: email }).then((user) => {
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
          res.json("password is incorrect");
        }
      });
    } else {
      res.json("this email is not registered");
    }
  });
});

app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      res.status(500).json({ error: "Failed to hash password" });
    } else {
      UserModel.create({
        username: username,
        email: email,
        password: hashedPassword,
      })
        .then((user) => res.json(user))
        .catch((err) => res.status(400).json({ error: err.message }));
    }
  });
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
