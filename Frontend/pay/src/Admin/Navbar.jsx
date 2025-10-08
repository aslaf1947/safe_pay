import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all stored user data
    localStorage.removeItem("ourstorage"); // or clear everything with localStorage.clear()

    // Redirect to login page
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-danger">
      <div className="container-fluid">
        {/* Toggle button (☰) */}
        <button className="btn btn-outline-light me-3">☰</button>

        <a className="navbar-brand" href="/">
          Admin Panel
        </a>

        <div>
          <button className="btn btn-light" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
