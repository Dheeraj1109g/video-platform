import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function Feed() {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Trending", "Recently Added", "Music", "Tech", "Gaming"];

  useEffect(() => {
    let isMounted = true;
    api
      .get("/videos")
      .then((res) => {
        if (isMounted) {
          setVideos(res.data.data || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load videos");
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
  }, []);

  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    const query = searchQuery.toLowerCase();
    return videos.filter(
      (v) =>
        (v.title && v.title.toLowerCase().includes(query)) ||
        (v.description && v.description.toLowerCase().includes(query))
    );
  }, [videos, searchQuery]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "";
    }
  };

  const getAvatarGradient = (id) => {
    const gradients = [
      "linear-gradient(135deg, #6366f1, #8b5cf6)",
      "linear-gradient(135deg, #ec4899, #f43f5e)",
      "linear-gradient(135deg, #06b6d4, #3b82f6)",
      "linear-gradient(135deg, #10b981, #059669)",
      "linear-gradient(135deg, #f59e0b, #d97706)"
    ];
    return gradients[(id || 0) % gradients.length];
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "28px 24px" }} className="animate-fade-in">
      {/* Top Search & Filter Bar */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        marginBottom: "28px"
      }}>
        {/* Category Pills */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "8px 18px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 600,
                border: "1px solid",
                borderColor: activeCategory === cat ? "var(--accent-primary)" : "var(--border-subtle)",
                background: activeCategory === cat ? "var(--accent-gradient)" : "rgba(255, 255, 255, 0.04)",
                color: activeCategory === cat ? "#fff" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap"
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: "relative", minWidth: "260px", maxWidth: "400px", flex: "1" }}>
          <svg
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)"
            }}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="input-field"
            placeholder="Search videos, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "42px", height: "42px" }}
          />
        </div>
      </div>

      {error && (
        <div style={{
          padding: "16px 20px",
          background: "rgba(239, 68, 68, 0.12)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "12px",
          color: "#fca5a5",
          marginBottom: "24px"
        }}>
          {error}
        </div>
      )}

      {/* Shimmer Skeletons when Loading */}
      {loading && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
          gap: "24px"
        }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-panel" style={{ overflow: "hidden", padding: "12px" }}>
              <div className="skeleton" style={{ width: "100%", aspectRatio: "16/9", borderRadius: "10px" }} />
              <div style={{ display: "flex", gap: "12px", marginTop: "14px" }}>
                <div className="skeleton" style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: "85%", height: "16px", marginBottom: "8px" }} />
                  <div className="skeleton" style={{ width: "50%", height: "12px" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredVideos.length === 0 && (
        <div className="glass-panel" style={{
          padding: "60px 24px",
          textAlign: "center",
          maxWidth: "500px",
          margin: "40px auto"
        }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(99, 102, 241, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px auto",
            color: "var(--accent-primary)"
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
              <line x1="7" y1="2" x2="7" y2="22" />
              <line x1="17" y1="2" x2="17" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="2" y1="7" x2="7" y2="7" />
              <line x1="2" y1="17" x2="7" y2="17" />
              <line x1="17" y1="17" x2="22" y2="17" />
              <line x1="17" y1="7" x2="22" y2="7" />
            </svg>
          </div>
          <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>
            {searchQuery ? "No matches found" : "No videos yet"}
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
            {searchQuery
              ? `We couldn't find any videos matching "${searchQuery}"`
              : "Be the very first creator to upload a video to StreamHub!"}
          </p>
          <Link to="/upload" className="btn-primary">
            Upload Your Video
          </Link>
        </div>
      )}

      {/* Videos Grid */}
      {!loading && filteredVideos.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
          gap: "24px"
        }}>
          {filteredVideos.map((video) => (
            <Link
              key={video.id}
              to={`/video/${video.id}`}
              style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: "14px",
                overflow: "hidden",
                background: "rgba(18, 24, 38, 0.6)",
                border: "1px solid var(--border-subtle)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.4)";
                e.currentTarget.style.borderColor = "rgba(129, 140, 248, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "var(--border-subtle)";
              }}
            >
              {/* Thumbnail Container */}
              <div style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16/9",
                background: "#0d131f",
                overflow: "hidden"
              }}>
                <video
                  src={video.cloudinary_url}
                  preload="metadata"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
                {/* Play Button Overlay */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0, 0, 0, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s"
                }}>
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "rgba(15, 23, 42, 0.8)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.4)"
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                {/* Badges */}
                <span className="badge badge-hd" style={{ position: "absolute", bottom: "10px", right: "10px" }}>
                  HD
                </span>
              </div>

              {/* Card Meta Content */}
              <div style={{ padding: "16px", display: "flex", gap: "12px", flex: 1 }}>
                <div style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: getAvatarGradient(video.id),
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "14px",
                  flexShrink: 0
                }}>
                  {(video.title || "V").charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#f8fafc",
                    marginBottom: "4px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: "1.4"
                  }}>
                    {video.title}
                  </h3>
                  {video.description && (
                    <p style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      marginBottom: "6px",
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}>
                      {video.description}
                    </p>
                  )}
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {formatDate(video.created_at)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Feed;
