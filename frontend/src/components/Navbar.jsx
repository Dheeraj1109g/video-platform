import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  useLocation();
  const token = localStorage.getItem("access_token");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(7, 9, 14, 0.8)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      padding: "0 24px"
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        height: "68px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px"
      }}>
        {/* Brand Logo */}
        <Link to="/feed" style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontWeight: 800,
          fontSize: "20px",
          letterSpacing: "-0.5px"
        }}>
          <div style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #6366f1, #a855f7, #d946ef)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)"
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span style={{
            background: "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Stream<span style={{ color: "#a855f7", WebkitTextFillColor: "#a855f7" }}>Hub</span>
          </span>
        </Link>

        {/* Navigation Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {token ? (
            <>
              <Link to="/upload" className="btn-primary" style={{ padding: "8px 16px", fontSize: "13px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Upload Video
              </Link>
              <button
                onClick={handleLogout}
                className="btn-secondary"
                style={{ padding: "8px 14px", fontSize: "13px" }}
                title="Log out of your account"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary" style={{ padding: "8px 18px", fontSize: "13px" }}>
                Sign In
              </Link>
              <Link to="/signup" className="btn-primary" style={{ padding: "8px 18px", fontSize: "13px" }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
