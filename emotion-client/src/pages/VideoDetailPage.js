import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";

function VideoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);

  useEffect(() => {
    fetchVideoDetails();
  }, [id]);

  const fetchVideoDetails = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`http://localhost:8000/video/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.detail || "Failed to fetch video details");
      } else {
        setVideo(data);
      }
    } catch (err) {
      setErrorMsg("Could not reach server. Make sure the API is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`http://localhost:8000/video/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.detail || "Failed to delete video");
        setDeleting(false);
      } else {
        navigate("/history");
      }
    } catch (err) {
      setErrorMsg("Could not reach server. Make sure the API is running.");
      setDeleting(false);
    }
  };

  const currentFrame = video?.frames?.[selectedFrameIndex];

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.topBar}>
            <button style={styles.backButton} onClick={() => navigate("/history")}>
              ← Back to History
            </button>
            <button 
              style={styles.deleteButton} 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
            >
              🗑️ Delete
            </button>
          </div>

          {loading && (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingDots}>
                <span style={{...styles.dot, animationDelay: '-0.32s'}}></span>
                <span style={{...styles.dot, animationDelay: '-0.16s'}}></span>
                <span style={styles.dot}></span>
              </div>
              <p style={styles.loadingText}>Loading video details...</p>
            </div>
          )}

          {errorMsg && (
            <div style={styles.errorBox}>
              <strong>Error: </strong>
              {errorMsg}
            </div>
          )}

          {!loading && video && (
            <>
              {/* Frame Viewer */}
              {currentFrame && (
                <div style={styles.frameContainer}>
                  <img
                    src={`http://localhost:8000/video/${video.id}/frame/${currentFrame.frame_number}/file`}
                    alt={`Frame ${currentFrame.frame_number}`}
                    style={styles.frameImage}
                  />
                  <div style={styles.frameInfo}>
                    <span>Frame {selectedFrameIndex + 1} of {video.frames.length}</span>
                    <span>⏱️ {currentFrame.timestamp}s</span>
                  </div>
                </div>
              )}

              {/* Frame Navigation */}
              <div style={styles.frameNav}>
                <button 
                  style={{
                    ...styles.navButton,
                    ...(selectedFrameIndex === 0 ? styles.navButtonDisabled : {})
                  }}
                  onClick={() => setSelectedFrameIndex(Math.max(0, selectedFrameIndex - 1))}
                  disabled={selectedFrameIndex === 0}
                >
                  ← Prev
                </button>
                <div style={styles.thumbnailContainer}>
                  {video.frames?.slice(0, 10).map((frame, idx) => (
                    <div
                      key={idx}
                      style={{
                        ...styles.thumbnail,
                        ...(selectedFrameIndex === idx ? styles.thumbnailActive : {})
                      }}
                      onClick={() => setSelectedFrameIndex(idx)}
                    >
                      <img
                        src={`http://localhost:8000/video/${video.id}/frame/${frame.frame_number}/file`}
                        alt={`Thumb ${idx}`}
                        style={styles.thumbnailImage}
                      />
                    </div>
                  ))}
                  {video.frames?.length > 10 && (
                    <div style={styles.moreFrames}>
                      +{video.frames.length - 10} more
                    </div>
                  )}
                </div>
                <button 
                  style={{
                    ...styles.navButton,
                    ...(selectedFrameIndex === video.frames.length - 1 ? styles.navButtonDisabled : {})
                  }}
                  onClick={() => setSelectedFrameIndex(Math.min(video.frames.length - 1, selectedFrameIndex + 1))}
                  disabled={selectedFrameIndex === video.frames.length - 1}
                >
                  Next →
                </button>
              </div>

              {/* Video Info */}
              <div style={styles.info}>
                <h2 style={styles.title}>{video.filename}</h2>

                {/* Video Metadata */}
                <div style={styles.section}>
                  <div style={styles.sectionLabel}>Video Information</div>
                  <div style={styles.metadataGrid}>
                    <div style={styles.metadataItem}>
                      <span style={styles.metadataLabel}>Duration:</span>
                      <span style={styles.metadataValue}>{video.duration_seconds}s</span>
                    </div>
                    <div style={styles.metadataItem}>
                      <span style={styles.metadataLabel}>Total Frames:</span>
                      <span style={styles.metadataValue}>{video.total_frames}</span>
                    </div>
                    <div style={styles.metadataItem}>
                      <span style={styles.metadataLabel}>Analyzed Frames:</span>
                      <span style={styles.metadataValue}>{video.analyzed_frames}</span>
                    </div>
                    <div style={styles.metadataItem}>
                      <span style={styles.metadataLabel}>FPS:</span>
                      <span style={styles.metadataValue}>{video.fps}</span>
                    </div>
                    <div style={styles.metadataItem}>
                      <span style={styles.metadataLabel}>Frame Interval:</span>
                      <span style={styles.metadataValue}>Every {video.frame_interval} frames</span>
                    </div>
                    <div style={styles.metadataItem}>
                      <span style={styles.metadataLabel}>Upload Date:</span>
                      <span style={styles.metadataValue}>
                        {new Date(video.upload_date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Current Frame Emotion */}
                {currentFrame && (
                  <div style={styles.section}>
                    <div style={styles.sectionLabel}>Current Frame Emotion</div>
                    <div style={styles.currentFrameEmotion}>
                      <div style={styles.emotionBadge}>
                        {currentFrame.dominant_emotion}
                      </div>
                      <span style={styles.frameConfidence}>
                        {currentFrame.dominant_confidence?.toFixed(2)}% confidence
                      </span>
                    </div>
                    
                    {currentFrame.emotions_data && (
                      <div style={styles.emotionList}>
                        {currentFrame.emotions_data.map((item, idx) => (
                          <div key={idx} style={styles.emotionListItem}>
                            <span style={styles.emotionListName}>{item.emotion}</span>
                            <div style={styles.emotionListRight}>
                              <div style={styles.progressBar}>
                                <div 
                                  style={{
                                    ...styles.progressFill,
                                    width: `${item.confidence}%`
                                  }}
                                />
                              </div>
                              <span style={styles.emotionListValue}>
                                {item.confidence?.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Aggregated Emotions */}
                {video.aggregated_data?.emotions && (
                  <div style={styles.section}>
                    <div style={styles.sectionLabel}>Overall Emotion Distribution</div>
                    <div style={styles.emotionList}>
                      {Object.entries(video.aggregated_data.emotions).map(([emotion, data], idx) => (
                        <div key={idx} style={styles.emotionListItem}>
                          <span style={styles.emotionListName}>{emotion}</span>
                          <div style={styles.emotionListRight}>
                            <div style={styles.progressBar}>
                              <div 
                                style={{
                                  ...styles.progressFill,
                                  width: `${data.average}%`
                                }}
                              />
                            </div>
                            <span style={styles.emotionListValue}>
                              {data.average}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Delete Video Analysis?</h3>
            <p style={styles.modalText}>
              Are you sure you want to delete this video analysis? This action cannot be undone.
            </p>
            <div style={styles.modalActions}>
              <button 
                style={styles.cancelButton} 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                style={styles.confirmDeleteButton} 
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
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
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
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
    padding: "2rem",
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: "1rem",
    maxWidth: "1100px",
    width: "100%",
    margin: "0 auto",
    padding: "1.5rem 2rem",
    border: "1px solid #334155",
    boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    gap: "1rem",
  },
  backButton: {
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
  deleteButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#7f1d1d",
    color: "#fecaca",
    border: "1px solid #991b1b",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 500,
    transition: "all 0.2s",
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
  },
  frameContainer: {
    width: "100%",
    marginBottom: "1rem",
    backgroundColor: "#0f172a",
    borderRadius: "0.75rem",
    overflow: "hidden",
    border: "1px solid #334155",
  },
  frameImage: {
    width: "100%",
    height: "auto",
    maxHeight: "500px",
    objectFit: "contain",
    display: "block",
  },
  frameInfo: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.75rem 1rem",
    backgroundColor: "#1e293b",
    fontSize: "0.85rem",
    color: "#94a3b8",
  },
  frameNav: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  navButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#334155",
    color: "#e2e8f0",
    border: "1px solid #475569",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 500,
    transition: "all 0.2s",
    flexShrink: 0,
  },
  navButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  thumbnailContainer: {
    display: "flex",
    gap: "0.5rem",
    flex: 1,
    overflowX: "auto",
    padding: "0.25rem",
  },
  thumbnail: {
    width: "80px",
    height: "60px",
    borderRadius: "0.375rem",
    overflow: "hidden",
    cursor: "pointer",
    border: "2px solid #334155",
    transition: "all 0.2s",
    flexShrink: 0,
  },
  thumbnailActive: {
    border: "2px solid #3b82f6",
    transform: "scale(1.05)",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  moreFrames: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 1rem",
    fontSize: "0.8rem",
    color: "#64748b",
    whiteSpace: "nowrap",
  },
  info: {
    padding: "0",
  },
  title: {
    fontSize: "1.5rem",
    color: "#f8fafc",
    fontWeight: 600,
    marginTop: 0,
    marginBottom: "1.5rem",
  },
  section: {
    marginBottom: "1.5rem",
    paddingBottom: "1.5rem",
    borderBottom: "1px solid #334155",
  },
  sectionLabel: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "0.75rem",
  },
  emotionCard: {
    padding: "1.5rem",
    backgroundColor: "#0f172a",
    borderRadius: "0.5rem",
    border: "2px solid #3b82f6",
    textAlign: "center",
  },
  emotionName: {
    fontSize: "2rem",
    color: "#3b82f6",
    fontWeight: 700,
    textTransform: "capitalize",
    marginBottom: "0.5rem",
  },
  emotionConfidence: {
    fontSize: "1.1rem",
    color: "#cbd5e1",
    fontWeight: 500,
  },
  currentFrameEmotion: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1rem",
    padding: "1rem",
    backgroundColor: "#0f172a",
    borderRadius: "0.5rem",
  },
  emotionBadge: {
    padding: "0.5rem 1rem",
    backgroundColor: "#1e3a8a",
    color: "#3b82f6",
    borderRadius: "0.5rem",
    fontSize: "1rem",
    fontWeight: 600,
    textTransform: "capitalize",
  },
  frameConfidence: {
    color: "#cbd5e1",
    fontSize: "0.95rem",
  },
  emotionList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  emotionListItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.75rem 1rem",
    backgroundColor: "#0f172a",
    borderRadius: "0.5rem",
    border: "1px solid #334155",
  },
  emotionListName: {
    color: "#e2e8f0",
    textTransform: "capitalize",
    fontWeight: 600,
    fontSize: "0.95rem",
    minWidth: "100px",
  },
  emotionListRight: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flex: 1,
    marginLeft: "1rem",
  },
  progressBar: {
    flex: 1,
    height: "8px",
    backgroundColor: "#1e293b",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  },
  emotionListValue: {
    color: "#3b82f6",
    fontWeight: 700,
    fontSize: "0.9rem",
    minWidth: "60px",
    textAlign: "right",
  },
  metadataGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "0.75rem",
  },
  metadataItem: {
    padding: "0.75rem 1rem",
    backgroundColor: "#0f172a",
    borderRadius: "0.5rem",
    border: "1px solid #334155",
  },
  metadataLabel: {
    display: "block",
    fontSize: "0.8rem",
    color: "#94a3b8",
    marginBottom: "0.25rem",
  },
  metadataValue: {
    display: "block",
    fontSize: "0.95rem",
    color: "#e2e8f0",
    fontWeight: 600,
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    animation: "fadeIn 0.2s ease-out",
  },
  modalContent: {
    backgroundColor: "#1e293b",
    borderRadius: "0.75rem",
    padding: "2rem",
    maxWidth: "400px",
    width: "90%",
    border: "1px solid #475569",
  },
  modalTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#f8fafc",
    margin: "0 0 1rem 0",
  },
  modalText: {
    fontSize: "0.95rem",
    color: "#cbd5e1",
    lineHeight: 1.5,
    margin: "0 0 1.5rem 0",
  },
  modalActions: {
    display: "flex",
    gap: "0.75rem",
    justifyContent: "flex-end",
  },
  cancelButton: {
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
  confirmDeleteButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 500,
    transition: "all 0.2s",
  },
};

export default VideoDetailPage;