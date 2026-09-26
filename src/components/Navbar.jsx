import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <nav style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid #333" }}>
      <Link to="/feed" style={{ fontWeight: "bold", textDecoration: "none" }}>Video Platform</Link>
      <div style={{ display: "flex", gap: "16px" }}>
        {token ? (
          <>
            <Link to="/upload">Upload</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;