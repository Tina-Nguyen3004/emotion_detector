import React from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  const handleAnalyze = () => {
    navigate("/analysis");
  };

  const handleHistory = () => {
    navigate("/history");
  };

  return (
    <div style={styles.homePage}>
      <div style={styles.homeCard}>
        <div style={styles.homeHeader}>
          <h1 style={styles.homeTitle}>🎭 Emotion Detector</h1>
          <p style={styles.homeSubtitle}>
            Analyze emotions from images and videos using AI-powered facial recognition
          </p>
        </div>

        <div style={styles.homeActions}>
          <button 
            style={{...styles.homeButton, ...styles.primaryButton}} 
            onClick={handleAnalyze}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(59, 130, 246, 0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <span style={styles.buttonIcon}>📸</span>
            <span style={styles.buttonText}>Analyze Image/Video</span>
            <span style={styles.buttonDescription}>Upload and detect emotions</span>
          </button>

          <button 
            style={{...styles.homeButton, ...styles.secondaryButton}} 
            onClick={handleHistory}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#475569";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#334155";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <span style={styles.buttonIcon}>📋</span>
            <span style={styles.buttonText}>View History</span>
            <span style={styles.buttonDescription}>Browse past analyses</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  homePage: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: "2rem",
  },
  homeCard: {
    backgroundColor: "#1e293b",
    borderRadius: "1.5rem",
    maxWidth: "600px",
    width: "100%",
    padding: "3rem 2.5rem",
    border: "1px solid #334155",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  homeHeader: {
    textAlign: "center",
    marginBottom: "3rem",
  },
  homeTitle: {
    fontSize: "2.5rem",
    fontWeight: 700,
    margin: "0 0 1rem 0",
    color: "#f8fafc",
    letterSpacing: "-0.025em",
  },
  homeSubtitle: {
    fontSize: "1rem",
    color: "#94a3b8",
    lineHeight: 1.6,
    margin: 0,
  },
  homeActions: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    marginBottom: "2rem",
  },
  homeButton: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "1.5rem",
    border: "none",
    borderRadius: "0.75rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textAlign: "left",
  },
  primaryButton: {
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
  },
  secondaryButton: {
    backgroundColor: "#334155",
    color: "#f8fafc",
  },
  buttonIcon: {
    fontSize: "2rem",
    marginBottom: "0.75rem",
    display: "block",
  },
  buttonText: {
    fontSize: "1.25rem",
    fontWeight: 600,
    marginBottom: "0.25rem",
    display: "block",
  },
  buttonDescription: {
    fontSize: "0.875rem",
    opacity: 0.8,
    display: "block",
  },
  homeFooter: {
    textAlign: "center",
    paddingTop: "2rem",
    borderTop: "1px solid #334155",
  },
  footerText: {
    fontSize: "0.75rem",
    color: "#64748b",
    margin: 0,
  },
};

export default HomePage;