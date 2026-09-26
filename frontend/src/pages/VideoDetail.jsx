import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

function VideoDetail() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [otherVideos, setOtherVideos] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      api.get(`/videos/${id}`),
      api.get(`/videos/${id}/comments`),
      api.get("/videos?limit=6"),
    ])
      .then(([videoRes, commentsRes, otherRes]) => {
        if (isMounted) {
          setVideo(videoRes.data.data);
          setComments(commentsRes.data.data || []);
          const allOther = (otherRes.data.data || []).filter((v) => String(v.id) !== String(id));
          setOtherVideos(allOther);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load video details");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setError("");
    setSubmitting(true);
    try {
      await api.post(`/videos/${id}/comment`, { text });
      setText("");
      const res = await api.get(`/videos/${id}/comments`);
      setComments(res.data.data || []);
    } catch (err) {
      setError(err.message || "Could not post comment. Please sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "32px 24px" }}>
        <div className="skeleton" style={{ width: "100%", aspectRatio: "16/9", borderRadius: "16px", marginBottom: "20px" }} />
        <div className="skeleton" style={{ width: "60%", height: "28px", borderRadius: "8px", marginBottom: "12px" }} />
        <div className="skeleton" style={{ width: "30%", height: "18px", borderRadius: "6px" }} />
      </div>
    );
  }

  if (!video) {
    return (
      <div style={{ maxWidth: "600px", margin: "60px auto", textAlign: "center" }} className="glass-panel">
        <h2 style={{ fontSize: "22px", marginBottom: "12px", color: "var(--danger)" }}>Video Unavailable</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>{error || "We couldn't find the video you were looking for."}</p>
        <Link to="/feed" className="btn-primary">Return to Feed</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "28px 24px" }} className="animate-fade-in">
      <div style={{
        display: "grid",
        gridTemplateColumns: otherVideos.length > 0 ? "minmax(0, 1fr) 340px" : "1fr",
        gap: "32px",
        alignItems: "start"
      }}>
        {/* Main Cinema & Interaction Column */}
        <div>
          {/* Player Wrapper */}
          <div style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16/9",
            borderRadius: "18px",
            overflow: "hidden",
            background: "#000",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.08)"
          }}>
            <video
              src={video.cloudinary_url}
              controls
              autoPlay
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          {/* Video Title & Actions */}
          <div style={{ marginTop: "20px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 700, lineHeight: 1.4, marginBottom: "12px" }}>
              {video.title}
            </h1>

            <div style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              paddingBottom: "18px",
              borderBottom: "1px solid var(--border-subtle)"
            }}>
              {/* Creator info */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "16px",
                  color: "#fff",
                  boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)"
                }}>
                  {(video.title || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "15px" }}>Community Creator</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{formatDate(video.created_at)}</div>
                </div>
              </div>

              {/* Share Button */}
              <div style={{ position: "relative" }}>
                <button onClick={handleShare} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "13px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  {copied ? "Copied Link!" : "Share"}
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible Description Card */}
          {video.description && (
            <div
              className="glass-panel"
              style={{
                marginTop: "18px",
                padding: "16px 20px",
                cursor: "pointer",
                background: "rgba(18, 24, 38, 0.5)"
              }}
              onClick={() => setShowFullDesc(!showFullDesc)}
            >
              <div style={{
                fontSize: "14px",
                color: "var(--text-secondary)",
                whiteSpace: "pre-wrap",
                display: "-webkit-box",
                WebkitLineClamp: showFullDesc ? "unset" : 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}>
                {video.description}
              </div>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "#a78bfa",
                  fontSize: "12px",
                  fontWeight: 600,
                  marginTop: "8px",
                  padding: 0,
                  cursor: "pointer"
                }}
              >
                {showFullDesc ? "Show less" : "Show more"}
              </button>
            </div>
          )}

          {/* Comments Section */}
          <div style={{ marginTop: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700 }}>Comments</h2>
              <span className="badge badge-purple">{comments.length}</span>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleComment} style={{ maxWidth: "100%", margin: "0 0 24px 0" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: "var(--text-secondary)"
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Add a comment..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                    <button
                      type="submit"
                      disabled={!text.trim() || submitting}
                      className="btn-primary"
                      style={{ padding: "8px 20px", fontSize: "13px" }}
                    >
                      {submitting ? "Posting..." : "Comment"}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {error && (
              <div style={{
                padding: "12px 16px",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "10px",
                color: "#fca5a5",
                fontSize: "13px",
                marginBottom: "16px"
              }}>
                {error}
              </div>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "14px", fontStyle: "italic" }}>
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {comments.map((c) => (
                  <div key={c.id} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "12px",
                      flexShrink: 0
                    }}>
                      U{c.user_id}
                    </div>
                    <div className="glass-panel" style={{
                      flex: 1,
                      padding: "12px 16px",
                      background: "rgba(18, 24, 38, 0.4)",
                      borderRadius: "12px"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 600, fontSize: "13px" }}>User #{c.user_id}</span>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{formatDate(c.created_at)}</span>
                      </div>
                      <p style={{ fontSize: "14px", color: "#e2e8f0", lineHeight: "1.5" }}>{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Recommended / Up Next */}
        {otherVideos.length > 0 && (
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "#cbd5e1" }}>
              Up Next
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {otherVideos.map((item) => (
                <Link
                  key={item.id}
                  to={`/video/${item.id}`}
                  style={{
                    display: "flex",
                    gap: "12px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    padding: "8px",
                    background: "rgba(18, 24, 38, 0.4)",
                    border: "1px solid var(--border-subtle)",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(26, 34, 52, 0.7)";
                    e.currentTarget.style.borderColor = "rgba(129, 140, 248, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(18, 24, 38, 0.4)";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                  }}
                >
                  <div style={{
                    width: "110px",
                    aspectRatio: "16/9",
                    borderRadius: "6px",
                    overflow: "hidden",
                    background: "#000",
                    flexShrink: 0
                  }}>
                    <video src={item.cloudinary_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h4 style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#f1f5f9",
                      lineHeight: "1.3",
                      marginBottom: "4px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}>
                      {item.title}
                    </h4>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{formatDate(item.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoDetail;
