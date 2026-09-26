import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function Upload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("video/")) {
      setError("Please select a valid video file (MP4, MOV, MKV, WebM)");
      return;
    }
    setError("");
    setFile(selectedFile);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a video file to upload");
      return;
    }
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    try {
      await api.post("/videos/upload", formData);
      navigate("/feed");
    } catch (err) {
      setError(err.message || "Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: "760px", margin: "40px auto", padding: "0 24px" }} className="animate-fade-in">
      <div className="glass-panel" style={{ padding: "36px" }}>
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(99, 102, 241, 0.15)",
              color: "var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Upload New Video</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                Share your content with creators around the world
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            padding: "14px 18px",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "10px",
            color: "#fca5a5",
            fontSize: "14px",
            marginBottom: "24px"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ maxWidth: "100%", margin: 0, gap: "20px" }}>
          {/* File Dropzone Area */}
          {!previewUrl ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "2px dashed",
                borderColor: isDragging ? "var(--accent-primary)" : "rgba(255, 255, 255, 0.15)",
                borderRadius: "14px",
                padding: "48px 24px",
                textAlign: "center",
                background: isDragging ? "rgba(99, 102, 241, 0.08)" : "rgba(15, 23, 42, 0.4)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(99, 102, 241, 0.1)",
                color: "var(--accent-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto"
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "6px" }}>
                Drag and drop your video file here
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "16px" }}>
                Or click anywhere to browse from your device
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                <span className="badge badge-purple">MP4</span>
                <span className="badge badge-purple">WebM</span>
                <span className="badge badge-purple">MOV</span>
                <span className="badge badge-purple">Max 100MB</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                style={{ display: "none" }}
              />
            </div>
          ) : (
            <div style={{
              borderRadius: "14px",
              overflow: "hidden",
              background: "#000",
              border: "1px solid var(--border-subtle)",
              padding: "16px"
            }}>
              <video
                src={previewUrl}
                controls
                style={{ width: "100%", maxHeight: "300px", borderRadius: "10px", background: "#05070a" }}
              />
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "12px"
              }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>{file?.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                  className="btn-secondary"
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                >
                  Change Video
                </button>
              </div>
            </div>
          )}

          {/* Title Field */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
              Video Title *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Give your video a catchy title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={uploading}
            />
          </div>

          {/* Description Field */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
              Description
            </label>
            <textarea
              className="input-field"
              rows="4"
              placeholder="Tell viewers what your video is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Submit Actions */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <Link to="/feed" className="btn-secondary" style={{ padding: "10px 20px" }}>
              Cancel
            </Link>
            <button
              type="submit"
              disabled={uploading || !file || !title.trim()}
              className="btn-primary"
              style={{ minWidth: "140px" }}
            >
              {uploading ? (
                <>
                  <svg
                    style={{ animation: "spin 1s linear infinite" }}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Uploading...
                </>
              ) : (
                "Publish Video"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Upload;
