import React, { useState, useEffect } from "react";
import "./Style.css";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [err, setErr] = useState("");

  const inputChange = (event) => {
    setNewTask(event.target.value);
    setErr("");
  };

  const addItem = () => {
    if (newTask.trim() === "") {
      setErr("Please enter a task");
    } else {
      setTasks([...tasks, newTask]);
      setNewTask("");
      setErr("");
    }
  };

  const onEdit = (index) => {
    setNewTask(tasks[index]);
    onDelete(index);
  };

  const onDelete = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);
  };

  return (
    <div className="container">
      <div className="items">
        <h1 className="title"> TO DO List </h1>

        <input
          type="text"
          value={newTask}
          onChange={inputChange}
          placeholder="Enter a task"
        />
        <p className="err_msg">{err}</p>
        <button onClick={addItem} className="button_add">
          Add Task
        </button>

        {tasks.map((task, index) => (
          <div className="tasks">
            <h4>{task}</h4>

            <div className="task-buttons">
              <button onClick={() => onEdit(index)}>Edit</button>
              <button onClick={() => onDelete(index)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
