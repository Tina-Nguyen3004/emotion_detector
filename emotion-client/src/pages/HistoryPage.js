import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

function HistoryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("images"); // "images" or "videos"
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      // Fetch both images and videos
      const [imagesRes, videosRes] = await Promise.all([
        fetch("http://localhost:8000/images"),
        fetch("http://localhost:8000/videos")
      ]);

      const imagesData = await imagesRes.json();
      const videosData = await videosRes.json();

      if (!imagesRes.ok || !videosRes.ok) {
        setErrorMsg("Failed to fetch history");
      } else {
        setImages(imagesData.images || []);
        setVideos(videosData.videos || []);
      }
    } catch (err) {
      setErrorMsg("Could not reach server. Make sure the API is running.");
    } finally {
      setLoading(false);
    }
  };

  const viewImageDetails = (imageId) => {
    navigate(`/image/${imageId}`);
  };

  const viewVideoDetails = (videoId) => {
    navigate(`/video/${videoId}`);
  };

  const currentData = activeTab === "images" ? images : videos;
  const currentCount = currentData.length;

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div>
              <h2 style={styles.title}>Analysis History 📊</h2>
              <p style={styles.subtitle}>
                View all your previous emotion analyses
              </p>
            </div>
            <button style={styles.refreshButton} onClick={fetchHistory}>
              🔄 Refresh
            </button>
          </div>

          {/* Tab Navigation */}
          <div style={styles.tabContainer}>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === "images" ? styles.tabActive : {})
              }}
              onClick={() => setActiveTab("images")}
            >
              📸 Images ({images.length})
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === "videos" ? styles.tabActive : {})
              }}
              onClick={() => setActiveTab("videos")}
            >
              🎥 Videos ({videos.length})
            </button>
          </div>

          {loading && (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingDots}>
                <span style={{...styles.dot, animationDelay: '-0.32s'}}></span>
                <span style={{...styles.dot, animationDelay: '-0.16s'}}></span>
                <span style={styles.dot}></span>
              </div>
              <p style={styles.loadingText}>Loading history...</p>
            </div>
          )}

          {errorMsg && (
            <div style={styles.errorBox}>
              <strong>Error: </strong>
              {errorMsg}
            </div>
          )}

          {!loading && !errorMsg && currentCount === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                {activeTab === "images" ? "📭" : "🎬"}
              </div>
              <p style={styles.emptyText}>
                No {activeTab} analyzed yet
              </p>
              <p style={styles.emptySubtext}>
                Upload {activeTab === "images" ? "an image" : "a video"} on the Analyze page to get started!
              </p>
            </div>
          )}

          {!loading && currentCount > 0 && (
            <div style={styles.statsBar}>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>
                  Total {activeTab === "images" ? "Images" : "Videos"}:
                </span>
                <span style={styles.statValue}>{currentCount}</span>
              </div>
            </div>
          )}

          {/* Images List */}
          {activeTab === "images" && (
            <div style={styles.itemList}>
              {images.map((img) => (
                <div
                  key={img.id}
                  style={styles.itemCard}
                  onClick={() => viewImageDetails(img.id)}
                >
                  <div style={styles.itemInfo}>
                    <div style={styles.filename}>{img.filename}</div>
                    <div style={styles.metaRow}>
                      <div style={styles.emotionBadge}>
                        {img.dominant_emotion}
                      </div>
                      <div style={styles.confidence}>
                        {img.dominant_confidence?.toFixed(2)}% confidence
                      </div>
                    </div>
                    <div style={styles.timestamp}>
                      {new Date(img.upload_date).toLocaleString()}
                    </div>
                  </div>
                  <div style={styles.arrow}>→</div>
                </div>
              ))}
            </div>
          )}

          {/* Videos List */}
          {activeTab === "videos" && (
            <div style={styles.itemList}>
              {videos.map((vid) => (
                <div
                  key={vid.id}
                  style={styles.itemCard}
                  onClick={() => viewVideoDetails(vid.id)}
                >
                  <div style={styles.itemInfo}>
                    <div style={styles.filename}>{vid.filename}</div>
                    <div style={styles.metaRow}>
                      <div style={styles.emotionBadge}>
                        {vid.dominant_emotion}
                      </div>
                      <div style={styles.confidence}>
                        {vid.dominant_confidence?.toFixed(2)}% confidence
                      </div>
                    </div>
                    <div style={styles.videoMeta}>
                      <span style={styles.metaItem}>
                        ⏱️ {vid.duration_seconds?.toFixed(1)}s
                      </span>
                      <span style={styles.metaItem}>
                        📊 {vid.analyzed_frames} frames
                      </span>
                    </div>
                    <div style={styles.timestamp}>
                      {new Date(vid.upload_date).toLocaleString()}
                    </div>
                  </div>
                  <div style={styles.arrow}>→</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
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
    padding: "2rem",
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: "1rem",
    maxWidth: "900px",
    width: "100%",
    margin: "0 auto",
    padding: "1.5rem 2rem",
    border: "1px solid #334155",
    boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.5rem",
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
    marginBottom: 0,
    lineHeight: 1.4,
  },
  refreshButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#334155",
    color: "#e2e8f0",
    border: "1px solid #475569",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 500,
    transition: "all 0.2s",
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
    color: "#94a3b8",
    border: "none",
    borderBottom: "3px solid transparent",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 600,
    transition: "all 0.2s",
    marginBottom: "-2px",
  },
  tabActive: {
    color: "#3b82f6",
    borderBottomColor: "#3b82f6",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "3rem 1rem",
  },
  loadingDots: {
    display: "flex",
    justifyContent: "center",
    gap: "0.5rem",
    marginBottom: "1rem",
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
  emptyState: {
    textAlign: "center",
    padding: "3rem 1rem",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },
  emptyText: {
    fontSize: "1.1rem",
    color: "#cbd5e1",
    margin: "0 0 0.5rem 0",
    fontWeight: 600,
  },
  emptySubtext: {
    fontSize: "0.9rem",
    color: "#94a3b8",
    margin: 0,
  },
  statsBar: {
    display: "flex",
    gap: "1rem",
    padding: "1rem",
    backgroundColor: "#0f172a",
    borderRadius: "0.5rem",
    border: "1px solid #334155",
    marginBottom: "1.5rem",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: "0.9rem",
  },
  statValue: {
    color: "#3b82f6",
    fontSize: "1.1rem",
    fontWeight: 700,
  },
  itemList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  itemCard: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "0.75rem",
    padding: "1rem",
    cursor: "pointer",
    transition: "all 0.2s",
    animation: "fadeIn 0.3s ease-out",
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  filename: {
    fontSize: "1rem",
    color: "#e2e8f0",
    fontWeight: 600,
    marginBottom: "0.5rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "0.5rem",
    flexWrap: "wrap",
  },
  emotionBadge: {
    display: "inline-block",
    padding: "0.25rem 0.75rem",
    backgroundColor: "#1e3a8a",
    color: "#3b82f6",
    borderRadius: "0.375rem",
    fontSize: "0.85rem",
    fontWeight: 600,
    textTransform: "capitalize",
  },
  confidence: {
    fontSize: "0.85rem",
    color: "#94a3b8",
  },
  videoMeta: {
    display: "flex",
    gap: "1rem",
    marginBottom: "0.5rem",
  },
  metaItem: {
    fontSize: "0.8rem",
    color: "#64748b",
  },
  timestamp: {
    fontSize: "0.8rem",
    color: "#64748b",
  },
  arrow: {
    fontSize: "1.5rem",
    color: "#475569",
    flexShrink: 0,
  },
};

export default HistoryPage;