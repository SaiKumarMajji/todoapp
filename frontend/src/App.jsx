import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Navigate, useNavigate } from "react-router-dom";
import { FiEdit2, FiList, FiLogOut, FiPlus, FiTrash2 } from "react-icons/fi";
import { api, errorMessage } from "./api";
import { FormError, Header } from "./Layout";

export default function App() {
  const userId = localStorage.getItem("userId");
  return userId ? <TaskList userId={userId} /> : <Navigate to="/login" replace />;
}

function TaskList({ userId }) {
  const navigate = useNavigate();
  const input = useRef(null);
  const [tasks, setTasks] = useState([]);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    api.get("/tasks/" + userId, { signal: controller.signal })
      .then(({ data }) => setTasks(data.tasks))
      .catch(() => {
        if (!controller.signal.aborted) setLoadError("Couldn’t load your tasks.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [userId, attempt]);

  function resetDraft() {
    setDraft("");
    setEditingId(null);
    setError("");
  }

  async function save(event) {
    event.preventDefault();
    const task = draft.trim();
    if (!task) {
      setError("Enter a task first.");
      input.current.focus();
      return;
    }
    setPending(true);
    setError("");
    try {
      if (editingId) {
        const { data } = await api.put("/tasks/" + editingId, { task });
        if (!data?._id) throw new Error("Task not found");
        setTasks((current) => current.map((entry) => entry._id === editingId ? data : entry));
      } else {
        const { data } = await api.post("/tasks/" + userId, { task });
        setTasks((current) => [...current, data.task]);
      }
      resetDraft();
    } catch (error) {
      setError(errorMessage(error, "Couldn’t save the task. Please try again."));
    } finally {
      setPending(false);
      input.current?.focus();
    }
  }

  async function remove(id) {
    setPending(true);
    setError("");
    try {
      await api.delete("/tasks/" + id);
      setTasks((current) => current.filter((task) => task._id !== id));
      if (id === editingId) resetDraft();
    } catch (error) {
      setError(errorMessage(error, "Couldn’t delete the task. Please try again."));
    } finally {
      setPending(false);
    }
  }

  function startEdit(task) {
    setDraft(task.task);
    setEditingId(task._id);
    setError("");
    input.current.focus();
  }

  function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    navigate("/", { replace: true });
  }

  const username = localStorage.getItem("username");
  const date = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date());

  return (
    <>
      <Header>
        <button className="button button-secondary button-small" onClick={logout}><FiLogOut /> Sign out</button>
      </Header>
      <main className="workspace">
        <p className="workspace-date">{date}</p>
        <h1>My tasks</h1>
        <p className="muted">{username ? "Welcome, " + username + "." : "Welcome back."}</p>
        <section className="workspace-card" aria-labelledby="task-list-title">
          <div className="workspace-heading">
            <h2 id="task-list-title">Task list</h2>
            {!loading && !loadError && <span className="task-count" aria-live="polite">{tasks.length} {tasks.length === 1 ? "task" : "tasks"}</span>}
          </div>
          <form className="task-form" onSubmit={save}>
            <label className="sr-only" htmlFor="task">{editingId ? "Edit task" : "New task"}</label>
            <input id="task" ref={input} value={draft} onChange={(event) => { setDraft(event.target.value); setError(""); }}
              placeholder="What needs doing?" readOnly={pending} />
            <button className="button button-primary" disabled={pending || loading || Boolean(loadError)}>
              {!editingId && <FiPlus />}{editingId ? "Save changes" : "Add task"}
            </button>
            {editingId && <button className="button button-secondary" type="button" onClick={resetDraft} disabled={pending}>Cancel</button>}
          </form>
          <FormError message={error} />
          {loading && <p className="empty-state" role="status">Loading your tasks…</p>}
          {loadError && (
            <div className="empty-state">
              <FormError message={loadError} />
              <button className="button button-secondary" onClick={() => { setLoading(true); setLoadError(""); setAttempt(attempt + 1); }}>Try again</button>
            </div>
          )}
          {!loading && !loadError && (tasks.length ? (
            <ul className="task-list">
              {tasks.map((task) => (
                <li className={task._id === editingId ? "editing" : undefined} key={task._id}>
                  <span className="task-marker" aria-hidden="true" />
                  <span className="task-text">{task.task}</span>
                  <div className="task-actions">
                    <button type="button" className="icon-button" aria-label={"Edit " + task.task} title="Edit task" onClick={() => startEdit(task)} disabled={pending}><FiEdit2 /></button>
                    <button type="button" className="icon-button delete-button" aria-label={"Delete " + task.task} title="Delete task" onClick={() => remove(task._id)} disabled={pending}><FiTrash2 /></button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state"><span className="feature-icon"><FiList /></span><h3>No tasks yet</h3><p>Add a task above to get started.</p></div>
          ))}
        </section>
      </main>
    </>
  );
}
TaskList.propTypes = { userId: PropTypes.string.isRequired };
