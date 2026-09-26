import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../api/axios";

function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email) {
      setError("Please provide your email address");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/auth/verify-otp", { email, otp_code: otp });
      navigate("/login", { state: { verified: true } });
    } catch (err) {
      setError(err.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setError("");
    setInfo("");
    if (!email) {
      setError("Please provide your email address to resend OTP");
      return;
    }
    setResending(true);
    try {
      await api.post("/auth/resend-otp", { email });
      setInfo("A new 6-digit verification code was sent to your email.");
      setCooldown(60);
    } catch (err) {
      setError(err.message || "Failed to resend OTP. Please wait before trying again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 120px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    }} className="animate-fade-in">
      <div className="glass-panel" style={{ width: "100%", maxWidth: "440px", padding: "40px", textAlign: "center" }}>
        {/* Email Icon */}
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
          boxShadow: "0 0 25px rgba(6, 182, 212, 0.4)"
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>Verify Your Email</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px", lineHeight: "1.5" }}>
          {email ? (
            <>We sent a 6-digit verification code to <br /><strong style={{ color: "#f8fafc" }}>{email}</strong></>
          ) : (
            "Enter your email and the 6-digit code sent to your inbox."
          )}
        </p>

        {info && (
          <div style={{
            padding: "12px 16px",
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "10px",
            color: "#6ee7b7",
            fontSize: "13px",
            marginBottom: "20px"
          }}>
            {info}
          </div>
        )}

        {error && (
          <div style={{
            padding: "12px 16px",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "10px",
            color: "#fca5a5",
            fontSize: "13px",
            marginBottom: "20px"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ maxWidth: "100%", margin: 0, gap: "16px" }}>
          {!location.state?.email && (
            <div style={{ textAlign: "left" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Email Address
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", textAlign: "left" }}>
              Security Code
            </label>
            <input
              type="text"
              maxLength={6}
              className="input-field"
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              required
              disabled={submitting}
              style={{
                fontSize: "26px",
                letterSpacing: "12px",
                textAlign: "center",
                fontWeight: 700,
                padding: "12px"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || otp.length < 6}
            className="btn-primary"
            style={{ width: "100%", padding: "12px", marginTop: "8px" }}
          >
            {submitting ? "Verifying..." : "Confirm & Activate"}
          </button>
        </form>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "24px",
          paddingTop: "20px",
          borderTop: "1px solid var(--border-subtle)",
          fontSize: "13px"
        }}>
          <span style={{ color: "var(--text-muted)" }}>Didn't receive code?</span>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending || cooldown > 0}
            style={{
              background: "none",
              border: "none",
              color: cooldown > 0 ? "var(--text-muted)" : "var(--accent-primary)",
              fontWeight: 600,
              cursor: cooldown > 0 ? "not-allowed" : "pointer",
              padding: 0
            }}
          >
            {resending
              ? "Sending..."
              : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend Code"}
          </button>
        </div>

        <div style={{ marginTop: "16px", fontSize: "13px" }}>
          <Link to="/login" style={{ color: "var(--text-secondary)" }}>
            ? Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
