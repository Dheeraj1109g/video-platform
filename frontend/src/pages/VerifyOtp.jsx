import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";

function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email) {
      setError("Please provide your email address");
      return;
    }
    try {
      await api.post("/auth/verify-otp", { email, otp_code: otp });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setInfo("");
    if (!email) {
      setError("Please provide your email address to resend OTP");
      return;
    }
    setResending(true);
    try {
      await api.post("/auth/resend-otp", { email });
      setInfo("New OTP sent to your email.");
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      <h2>Verify OTP</h2>
      {location.state?.email ? (
        <p>OTP sent to {location.state.email}</p>
      ) : (
        <p>Please enter your email and the 6-digit OTP sent to you.</p>
      )}
      <form onSubmit={handleSubmit}>
        {!location.state?.email && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}
        <input
          type="text"
          placeholder="6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button type="submit">Verify</button>
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={resending}
          style={{ background: "#4b5563", color: "#fff" }}
        >
          {resending ? "Sending..." : "Resend OTP"}
        </button>
      </form>
      {info && <p style={{ color: "lightgreen", textAlign: "center" }}>{info}</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
    </div>
  );
}

export default VerifyOtp;