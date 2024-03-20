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
  const [id, setId] = useState();
  const [updatebtn, setUpdateBtn] = useState(false);

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
      const response =
        await axios.get(`https://todoapp-backend-nrxj.onrender.com

/tasks/${userId}`);
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
        await axios.post(
          `https://todoapp-backend-nrxj.onrender.com

/tasks/${userId}`,
          {
            task: newTask,
          }
        );
        fetchTasks();
        setTasks([...tasks, newTask]);
        setNewTask("");
        setErr("");
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  const onEdit = (index) => {
    setNewTask(tasks[index].task);

    setId(tasks[index]._id);
    setUpdateBtn(true);
  };

  const ItemUpdate = async () => {
    if (newTask.trim() === "") {
      setErr("Please add a task for updating.");
      return; // Stop execution if task is empty
    }
    try {
      await axios.put(
        `https://todoapp-backend-nrxj.onrender.com

/tasks/${id}`,
        {
          task: newTask,
        }
      );
      const updatedTasks = tasks.map((task) =>
        task._id === id ? { ...task, task: newTask } : task
      );
      setTasks(updatedTasks);
      setNewTask("");
      setUpdateBtn(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const onDelete = async (taskId, index) => {
    try {
      await axios.delete(`https://todoapp-backend-nrxj.onrender.com

/tasks/${taskId}`);
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
    navigate("/");
  };

  return (
    <div className="container">
      <div className="user-logout">
        <h1 className="username">Welcome {username}</h1>
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
        {updatebtn ? (
          <button onClick={ItemUpdate} className="update-btn">
            UpdateTask
          </button>
        ) : (
          <button onClick={addItem} className="button_add">
            Add Task
          </button>
        )}

        {tasks.map((task, index) => (
          <div key={index} className="tasks">
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
