import React from "react";
import HomePage from "./pages/HomePage";
import IngestPage from "./pages/IngestPage";
import InsightsPage from "./pages/InsightsPage";
import "./index.css";
import "./App.css";

function LinkBtn({ to, children }) {
  const onClick = (e) => {
    e.preventDefault();
    window.history.pushState({}, "", to);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return (
    <a className="nav-link" href={to} onClick={onClick}>
      {children}
    </a>
  );
}

function usePath() {
  const [path, setPath] = React.useState(window.location.pathname);
  React.useEffect(() => {
    const h = () => setPath(window.location.pathname);
    window.addEventListener("popstate", h);
    return () => window.removeEventListener("popstate", h);
  }, []);
  return path;
}

export default function App() {
  const path = usePath();
  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div className="brand">CipherGrid</div>
        <div className="nav-links">
          <LinkBtn to="/">Home</LinkBtn>
          <LinkBtn to="/ingest">Ingest</LinkBtn>
          <LinkBtn to="/insights">Insights</LinkBtn>
        </div>
      </nav>

      <main className="main-content">
        {path === "/ingest" ? <IngestPage /> :
         path === "/insights" ? <InsightsPage /> :
         <HomePage />}
      </main>
    </div>
  );
}













