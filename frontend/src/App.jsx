import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Style.css";
import axios from "axios";

export default function App() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [err, setErr] = useState("");
  const [username, setUsername] = useState("");

  const inputChange = (event) => {
    setNewTask(event.target.value);
    setErr("");
  };

  useEffect(() => {
    fetchTasks();
    setUsername(localStorage.getItem("username"));
  }, []);

  const fetchTasks = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await axios.get(`http://localhost:3000/tasks/${userId}`);
      setTasks(response.data.tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addItem = async () => {
    if (newTask.trim() === "") {
      setErr("Please enter a task");
    } else {
      try {
        const userId = localStorage.getItem("userId");
        await axios.post(`http://localhost:3000/tasks/${userId}`, {
          task: newTask,
        });
        fetchTasks();
        setTasks([...tasks, newTask]);
        setNewTask("");
        setErr("");
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  // const onEdit = (index) => {
  //   setNewTask(tasks[index]);
  //   onDelete(index);
  // };

  const onEdit = (index) => {
    setNewTask(tasks[index].task);
    onDelete(tasks[index]._id, index);
  };

  const onDelete = async (taskId, index) => {
    try {
      await axios.delete(`http://localhost:3000/tasks/${taskId}`);
      const updatedTasks = [...tasks];
      updatedTasks.splice(index, 1);
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div className="container">
      <div className="user-logout">
        <h1 style={{ color: "black" }}>Welcome {username}</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

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
          <div key={task._id} className="tasks">
            <h4>{task.task}</h4>

            <div className="task-buttons">
              <button onClick={() => onEdit(index)}>Edit</button>
              <button onClick={() => onDelete(task._id, index)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
