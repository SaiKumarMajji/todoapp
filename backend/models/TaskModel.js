const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  task: {
    type: String,

    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const TaskModel = mongoose.model("Task", taskSchema);

module.exports = TaskModel;
