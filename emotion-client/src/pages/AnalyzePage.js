import React, { useState } from "react";
import Header from "../components/Header";

function AnalyzePage() {
  const [activeTab, setActiveTab] = useState("image");
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [frameInterval, setFrameInterval] = useState(30);

  const handleFileChange = (e) => {
    const picked = e.target.files[0];
    setFile(picked || null);
    setResult(null);
    setErrorMsg("");

    if (picked) {
      setPreviewURL(URL.createObjectURL(picked));
    } else {
      setPreviewURL(null);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFile(null);
    setPreviewURL(null);
    setResult(null);
    setErrorMsg("");
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setErrorMsg("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    if (activeTab === "video") {
      formData.append("frame_interval", frameInterval);
    }

    try {
      const endpoint = activeTab === "image" ? "/image" : "/video";
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.detail || "Server error.");
      } else {
        setResult(data);
      }
    } catch (err) {
      setErrorMsg("Could not reach server. Make sure the API is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Upload & Analyze 😎</h2>
          <p style={styles.subtitle}>
            Upload an image or video to analyze emotions with time-weighted accuracy.
          </p>

          <div style={styles.tabContainer}>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === "image" ? styles.tabActive : {}),
              }}
              onClick={() => handleTabChange("image")}
            >
              📷 Image
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === "video" ? styles.tabActive : {}),
              }}
              onClick={() => handleTabChange("video")}
            >
              🎥 Video
            </button>
          </div>

          <label style={styles.label}>
            Step 1. Pick {activeTab === "image" ? "an image" : "a video"}
          </label>
          <input
            type="file"
            accept={activeTab === "image" ? "image/*" : "video/*"}
            onChange={handleFileChange}
            style={styles.fileInput}
          />

          {previewURL && activeTab === "image" && (
            <img src={previewURL} alt="preview" style={styles.preview} />
          )}
          {previewURL && activeTab === "video" && (
            <video src={previewURL} controls style={styles.preview} />
          )}

          {activeTab === "video" && (
            <div style={styles.optionGroup}>
              <label style={styles.optionLabel}>
                Frame Interval (analyze every Nth frame):
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={frameInterval}
                onChange={(e) => setFrameInterval(parseInt(e.target.value) || 1)}
                style={styles.numberInput}
              />
              <small style={styles.hint}>
                Lower = more accurate but slower. Higher = faster but less detailed.
              </small>
            </div>
          )}

          <button
            style={{
              ...styles.button,
              ...((!file || loading) ? styles.buttonDisabled : {}),
            }}
            disabled={!file || loading}
            onClick={handleAnalyze}
          >
            {loading ? (
              <span style={styles.buttonLoading}>
                <Spinner />
                Analyzing...
              </span>
            ) : (
              `Analyze ${activeTab === "image" ? "Image" : "Video"}`
            )}
          </button>

          {loading && (
            <div style={styles.loadingMessage}>
              <div style={styles.loadingDots}>
                <span style={{...styles.dot, animationDelay: '-0.32s'}}></span>
                <span style={{...styles.dot, animationDelay: '-0.16s'}}></span>
                <span style={styles.dot}></span>
              </div>
              <p style={styles.loadingText}>
                Processing {activeTab}... This may take a few moments.
              </p>
            </div>
          )}

          {errorMsg && (
            <div style={styles.errorBox}>
              <strong>Error: </strong>
              {errorMsg}
            </div>
          )}

          {result && activeTab === "image" && <ImageResult result={result} />}
          {result && activeTab === "video" && <VideoResult result={result} />}
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span style={styles.spinner}>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </span>
  );
}

function ImageResult({ result }) {
  return (
    <div style={styles.resultBox}>
      <div>
        <strong>Main emotion:</strong>{" "}
        {result.dominant_emotion} (
        {result.dominant_confidence?.toFixed
          ? result.dominant_confidence.toFixed(2)
          : result.dominant_confidence}
        %)
      </div>

      <div style={{ marginTop: "0.75rem" }}>
        <strong>Top emotions:</strong>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
          {result.top_k_emotions?.map((item, idx) => (
            <li key={idx}>
              {item.emotion}:{" "}
              {item.confidence.toFixed
                ? item.confidence.toFixed(2)
                : item.confidence}
              %
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function VideoResult({ result }) {
  const [showFrames, setShowFrames] = useState(false);

  return (
    <div style={styles.resultBox}>
      <div style={styles.section}>
        <strong>Video Information:</strong>
        <div style={styles.infoGrid}>
          <span>Duration: {result.video_info?.duration_seconds}s</span>
          <span>FPS: {result.video_info?.fps}</span>
          <span>Total Frames: {result.video_info?.total_frames}</span>
          <span>Analyzed: {result.video_info?.analyzed_frames}</span>
        </div>
      </div>

      <div style={styles.section}>
        <strong>Overall Dominant Emotion:</strong>
        <div style={styles.dominantEmotionCard}>
          <div style={styles.dominantEmotionName}>
            {result.aggregated_emotions?.dominant_emotion || "N/A"}
          </div>
          <div style={styles.dominantEmotionConfidence}>
            {result.aggregated_emotions?.dominant_average_confidence}% average confidence
          </div>
          <div style={styles.dominantEmotionNote}>
            (Time-weighted across entire video)
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <strong>All Detected Emotions:</strong>
        <div style={styles.emotionList}>
          {Object.entries(result.aggregated_emotions?.emotions || {}).map(
            ([emotion, stats]) => (
              <div key={emotion} style={styles.emotionItem}>
                <div style={styles.emotionHeader}>
                  <span style={styles.emotionName}>{emotion}</span>
                  <span style={styles.emotionPresence}>
                    {stats.presence_percentage}% of video
                  </span>
                </div>
                <div style={styles.emotionStats}>
                  <div style={styles.statItem}>
                    <span style={styles.statLabel}>Weighted Avg:</span>
                    <span style={styles.statValue}>{stats.average}%</span>
                  </div>
                  <div style={styles.statItem}>
                    <span style={styles.statLabel}>Simple Avg:</span>
                    <span style={styles.statValue}>{stats.simple_average}%</span>
                  </div>
                  <div style={styles.statItem}>
                    <span style={styles.statLabel}>Range:</span>
                    <span style={styles.statValue}>{stats.min}% - {stats.max}%</span>
                  </div>
                  <div style={styles.statItem}>
                    <span style={styles.statLabel}>Std Dev:</span>
                    <span style={styles.statValue}>{stats.std}%</span>
                  </div>
                </div>

                <div style={styles.progressBarContainer}>
                  <div
                    style={{
                      ...styles.progressBar,
                      width: `${stats.presence_percentage}%`
                    }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <button
        style={styles.toggleButton}
        onClick={() => setShowFrames(!showFrames)}
      >
        {showFrames ? "Hide" : "Show"} Frame-by-Frame Analysis ({result.frame_by_frame?.length} frames)
      </button>

      {showFrames && (
        <div style={styles.frameList}>
          {result.frame_by_frame?.map((frame, idx) => (
            <div key={idx} style={styles.frameItem}>
              <div style={styles.frameHeader}>
                Frame {frame.frame} @ {frame.timestamp}s
              </div>
              <div style={styles.frameEmotions}>
                <strong>{frame.dominant_emotion}</strong> ({frame.dominant_confidence?.toFixed(2)}%)
                <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                  {frame.top_k_emotions?.slice(1).map(e =>
                    `${e.emotion}: ${e.confidence.toFixed(1)}%`
                  ).join(" | ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0);
              opacity: 0.5;
            }
            40% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: "#0f172a",
    minHeight: "100vh",
    color: "#f8fafc",
    fontFamily: "system-ui, sans-serif",
  },
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: "1rem",
    maxWidth: "700px",
    width: "100%",
    padding: "1.5rem 2rem",
    border: "1px solid #334155",
    boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#f8fafc",
    margin: 0,
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "#94a3b8",
    marginTop: "0.5rem",
    marginBottom: "1.25rem",
    lineHeight: 1.4,
  },
  tabContainer: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
    borderBottom: "2px solid #334155",
  },
  tab: {
    flex: 1,
    padding: "0.75rem 1rem",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "#94a3b8",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    marginBottom: "-2px",
  },
  tabActive: {
    color: "#3b82f6",
    borderBottomColor: "#3b82f6",
  },
  label: {
    fontSize: "0.75rem",
    letterSpacing: "0.03em",
    textTransform: "uppercase",
    color: "#94a3b8",
    fontWeight: 600,
    display: "block",
    marginBottom: "0.5rem",
  },
  fileInput: {
    width: "100%",
    padding: "0.5rem",
    marginBottom: "1rem",
    backgroundColor: "#0f172a",
    border: "1px solid #475569",
    borderRadius: "0.5rem",
    color: "#f8fafc",
  },
  preview: {
    width: "100%",
    maxHeight: "300px",
    objectFit: "contain",
    borderRadius: "0.5rem",
    border: "1px solid #475569",
    background: "#0f172a",
    marginBottom: "1rem",
  },
  optionGroup: {
    marginBottom: "1rem",
    padding: "1rem",
    backgroundColor: "#0f172a",
    borderRadius: "0.5rem",
    border: "1px solid #334155",
  },
  optionLabel: {
    fontSize: "0.85rem",
    color: "#cbd5e1",
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: 500,
  },
  numberInput: {
    width: "100%",
    padding: "0.5rem",
    backgroundColor: "#1e293b",
    border: "1px solid #475569",
    borderRadius: "0.375rem",
    color: "#f8fafc",
    fontSize: "0.95rem",
  },
  hint: {
    display: "block",
    marginTop: "0.5rem",
    fontSize: "0.75rem",
    color: "#64748b",
    fontStyle: "italic",
  },
  button: {
    width: "100%",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "0.5rem",
    padding: "0.75rem 1rem",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: "1rem",
    transition: "all 0.2s",
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  buttonLoading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  },
  spinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingMessage: {
    backgroundColor: "#1e3a8a",
    border: "1px solid #3b82f6",
    borderRadius: "0.5rem",
    padding: "1rem",
    marginBottom: "1rem",
    textAlign: "center",
  },
  loadingDots: {
    display: "flex",
    justifyContent: "center",
    gap: "0.5rem",
    marginBottom: "0.75rem",
  },
  dot: {
    width: "8px",
    height: "8px",
    backgroundColor: "#3b82f6",
    borderRadius: "50%",
    animation: "bounce 1.4s infinite ease-in-out both",
  },
  loadingText: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "0.9rem",
  },
  errorBox: {
    backgroundColor: "#7f1d1d",
    border: "1px solid #fecaca",
    color: "#fecaca",
    borderRadius: "0.5rem",
    padding: "0.75rem 1rem",
    fontSize: "0.9rem",
    lineHeight: 1.4,
    marginBottom: "1rem",
  },
  resultBox: {
    backgroundColor: "#0f172a",
    border: "1px solid #475569",
    borderRadius: "0.5rem",
    padding: "1rem",
    fontSize: "0.9rem",
    lineHeight: 1.5,
    color: "#e2e8f0",
  },
  section: {
    marginBottom: "1rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid #334155",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.5rem",
    marginTop: "0.5rem",
    fontSize: "0.85rem",
    color: "#94a3b8",
  },
  dominantEmotionCard: {
    marginTop: "0.75rem",
    padding: "1rem",
    backgroundColor: "#1e293b",
    borderRadius: "0.5rem",
    border: "2px solid #3b82f6",
    textAlign: "center",
  },
  dominantEmotionName: {
    fontSize: "1.5rem",
    color: "#3b82f6",
    fontWeight: 700,
    textTransform: "capitalize",
    marginBottom: "0.25rem",
  },
  dominantEmotionConfidence: {
    fontSize: "1rem",
    color: "#cbd5e1",
    marginBottom: "0.25rem",
  },
  dominantEmotionNote: {
    fontSize: "0.75rem",
    color: "#64748b",
    fontStyle: "italic",
  },
  emotionList: {
    marginTop: "0.75rem",
  },
  emotionItem: {
    padding: "0.75rem",
    marginBottom: "0.75rem",
    backgroundColor: "#1e293b",
    borderRadius: "0.5rem",
    border: "1px solid #334155",
  },
  emotionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  emotionName: {
    fontWeight: 600,
    color: "#cbd5e1",
    textTransform: "capitalize",
    fontSize: "0.95rem",
  },
  emotionPresence: {
    fontSize: "0.75rem",
    color: "#3b82f6",
    fontWeight: 600,
    backgroundColor: "#1e3a8a",
    padding: "0.125rem 0.5rem",
    borderRadius: "0.25rem",
  },
  emotionStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.5rem",
    marginBottom: "0.5rem",
  },
  statItem: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.8rem",
  },
  statLabel: {
    color: "#94a3b8",
  },
  statValue: {
    color: "#e2e8f0",
    fontWeight: 600,
  },
  progressBarContainer: {
    width: "100%",
    height: "4px",
    backgroundColor: "#334155",
    borderRadius: "2px",
    overflow: "hidden",
    marginTop: "0.5rem",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3b82f6",
    transition: "width 0.3s ease",
  },
  toggleButton: {
    width: "100%",
    padding: "0.625rem",
    backgroundColor: "#334155",
    color: "#e2e8f0",
    border: "1px solid #475569",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 500,
    marginTop: "0.5rem",
  },
  frameList: {
    marginTop: "1rem",
    maxHeight: "300px",
    overflowY: "auto",
  },
  frameItem: {
    padding: "0.75rem",
    marginBottom: "0.5rem",
    backgroundColor: "#1e293b",
    borderRadius: "0.375rem",
    border: "1px solid #334155",
  },
  frameHeader: {
    fontSize: "0.75rem",
    color: "#64748b",
    marginBottom: "0.375rem",
    fontWeight: 500,
  },
  frameEmotions: {
    fontSize: "0.85rem",
    color: "#cbd5e1",
  },
};

export default AnalyzePage;