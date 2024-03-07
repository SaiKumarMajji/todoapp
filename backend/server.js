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
          res.json({ message: "Success", userId: user._id });
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

app.listen(3000, () => {
  console.log("server is running");
});
