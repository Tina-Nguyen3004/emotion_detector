import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  return (
    <header style={styles.header}>
      <button style={styles.homeButton} onClick={() => navigate("/")}>
        🏠 Home
      </button>
      <h2 style={styles.title}>🎭 Emotion Detector</h2>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 2rem",
    backgroundColor: "#1e293b",
    borderBottom: "1px solid #334155",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  homeButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    padding: "0.5rem 1rem",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#f8fafc",
    margin: 0,
  },
};

export default Header;