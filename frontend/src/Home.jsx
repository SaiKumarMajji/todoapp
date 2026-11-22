import { Link } from "react-router-dom";
import { FiArrowRight, FiCalendar, FiEdit3, FiList, FiPlus } from "react-icons/fi";
import { Header } from "./Layout";

const exampleTasks = ["Review weekly priorities", "Send design feedback", "Plan tomorrow’s work"];
const features = [
  { icon: FiPlus, title: "Capture tasks", text: "Give every to-do a place as soon as it comes up." },
  { icon: FiEdit3, title: "Adjust as you go", text: "Edit tasks when plans change and clear them when you’re done." },
  { icon: FiList, title: "See it all at a glance", text: "Keep your personal to-dos together in one simple list." },
];

export default function Home() {
  const signedIn = Boolean(localStorage.getItem("userId"));
  const destination = signedIn ? "/todo" : "/signup";
  return (
    <>
      <Header>
        {!signedIn && <Link className="nav-link" to="/login">Sign in</Link>}
        <Link className="button button-primary button-small" to={destination}>{signedIn ? "My tasks" : "Get started"}</Link>
      </Header>
      <main className="home">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-label"><FiList /> Your personal task list</span>
            <h1>A little more order.<br /><em>A lot more focus.</em></h1>
            <p>Capture what’s on your mind, see what needs doing, and make space for the rest of your day.</p>
            <Link className="button button-primary" to={destination}>{signedIn ? "Open my tasks" : "Create your task list"} <FiArrowRight /></Link>
          </div>
          <div className="hero-preview">
            <div className="preview-card">
              <div className="preview-heading">
                <span className="feature-icon"><FiCalendar /></span>
                <div><span className="preview-label">Example list</span><h2>My tasks</h2></div>
              </div>
              <ul>
                {exampleTasks.map((task) => <li key={task}><span className="task-marker" />{task}</li>)}
              </ul>
            </div>
          </div>
        </section>
        <section className="features" aria-label="What you can do">
          {features.map(({ icon: Icon, title, text }) => (
            <article key={title}><span className="feature-icon"><Icon /></span><h2>{title}</h2><p>{text}</p></article>
          ))}
        </section>
      </main>
    </>
  );
}
