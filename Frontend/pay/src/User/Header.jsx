// import React from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { FaBell } from "react-icons/fa"; // Notification icon

// function Header() {
//   const navigate = useNavigate();

//   // Get authentication info from localStorage
//   const auth = JSON.parse(localStorage.getItem("ourstorage"));

//   const handleLogout = () => {
//     localStorage.removeItem("ourstorage");
//     navigate("/"); // Redirect to login page after logout
//     window.location.reload(); // refresh state
//   };

//   return (
//     <nav className="navbar navbar-expand-lg bg-body-tertiary shadow-sm">
//       <div className="container-fluid">
//         {/* Logo */}
//         <Link className="navbar-brand" to="/">
//           <img
//             src="/image/logo.png"
//             alt="Logo"
//             style={{ width: "50px", height: "50px" }}
//           />
//         </Link>

//         {/* Mobile Menu Toggle */}
//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarSupportedContent"
//           aria-controls="navbarSupportedContent"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>

//         <div className="collapse navbar-collapse" id="navbarSupportedContent">
//           <ul className="navbar-nav me-auto mb-2 mb-lg-0">
//             {/* Always show Home */}
//             <li className="nav-item">
//               <Link className="nav-link" to="/">
//                 Home
//               </Link>
//             </li>

//             {/* If logged in */}
//             {auth ? (
//               <>
//                 {/* Dropdown Menu */}
//                 <li className="nav-item dropdown">
//                   <Link
//                     className="nav-link dropdown-toggle"
//                     to="#"
//                     role="button"
//                     data-bs-toggle="dropdown"
//                     aria-expanded="false"
//                   >
//                     Groups
//                   </Link>
//                   <ul className="dropdown-menu">
//                     <li>
//                       <Link className="dropdown-item" to="/group">
//                         Create Group
//                       </Link>
//                     </li>
//                     <li>
//                       <Link className="dropdown-item" to="/my-groups">
//                         My Groups
//                       </Link>
//                     </li>
//                   </ul>
//                 </li>
//                 <li className="nav-item" style={{ marginLeft: "10px" }}>
//                   <Link className="nav-link" to="/service">
//                     Service
//                   </Link>
//                 </li>
//                 {/* Profile */}
//                 <li className="nav-item" style={{ marginLeft: "10px" }}>
//                   <Link className="nav-link" to="/profile">
//                     Profile
//                   </Link>
//                 </li>

//                 {/* My Balance */}
//                 <li className="nav-item" style={{ marginLeft: "10px" }}>
//                   <Link className="nav-link" to="/userbalances">
//                     My Balance
//                   </Link>
//                 </li>
//                 <li className="nav-item" style={{ marginLeft: "10px" }}>
//                   <Link className="nav-link" to="/history">
//                     History
//                   </Link>
//                 </li>

//               </>
//             ) : (
//               <>
//                 {/* If NOT logged in show Register & Login */}
//                 <li className="nav-item" style={{ marginLeft: "10px" }}>
//                   <Link className="nav-link" to="/register">
//                     Register
//                   </Link>
//                 </li>
//                 <li className="nav-item" style={{ marginLeft: "10px" }}>
//                   <Link className="nav-link" to="/login">
//                     Login
//                   </Link>
//                 </li>
//               </>
//             )}
//           </ul>

//           {/* Search + Notification + Logout button */}
//           <form className="d-flex align-items-center" role="search">
//             {/* Notification Icon */}
//             {auth && (
//               <Link to="/notifications" className="position-relative me-3" style={{ textDecoration: "none" }}>
//                 <FaBell size={22} />
//                 {/* Badge for notification count */}
//                 <span
//                   className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
//                   style={{ fontSize: "10px" }}
//                 >
//                   3
//                 </span>
//               </Link>
//             )}

//             {/* Logout */}
//             {auth && (
//               <button
//                 className="btn btn-danger ms-2"
//                 type="button"
//                 onClick={handleLogout}
//               >
//                 Logout
//               </button>
//             )}
//           </form>
//         </div>
//       </div>
//     </nav>
//   );
// }

// export default Header;

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBell, FaCheckCircle } from "react-icons/fa";
import axios from "axios";
function Header() {
  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem("ourstorage"));

  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchNotifications = async () => {
  const userId = auth?._id || auth?.id;
  if (!userId) return; // Don't fetch if no userId
  try {
    const res = await axios.get(`http://localhost:4000/safepay/usernotification/${userId}`);
    setNotifications(res.data.notifications || res.data.data || []);
  } catch (err) {
    setNotifications([]);
  }
};

useEffect(() => {
  if (auth && (auth._id || auth.id)) fetchNotifications();
  // eslint-disable-next-line
}, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:4000/safepay/usernotification/${id}/read`);
      fetchNotifications();
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ourstorage");
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <img src="/image/logo.png" alt="Logo" style={{ width: "50px", height: "50px" }} />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            {auth ? (
              <>
                <li className="nav-item dropdown">
                  <Link
                    className="nav-link dropdown-toggle"
                    to="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Groups
                  </Link>
                  <ul className="dropdown-menu">
                    <li>
                      <Link className="dropdown-item" to="/group">Create Group</Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/my-groups">My Groups</Link>
                    </li>
                  </ul>
                </li>
                <li className="nav-item" style={{ marginLeft: "10px" }}>
                  <Link className="nav-link" to="/service">Service</Link>
                </li>
                <li className="nav-item" style={{ marginLeft: "10px" }}>
                  <Link className="nav-link" to="/profile">Profile</Link>
                </li>
                <li className="nav-item" style={{ marginLeft: "10px" }}>
                  <Link className="nav-link" to="/userbalances">My Balance</Link>
                </li>
                <li className="nav-item" style={{ marginLeft: "10px" }}>
                  <Link className="nav-link" to="/history">History</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item" style={{ marginLeft: "10px" }}>
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
                <li className="nav-item" style={{ marginLeft: "10px" }}>
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
              </>
            )}
          </ul>
        <form className="d-flex align-items-center" role="search">
  {auth && (
    <div className="dropdown me-3">
      <button
        className="btn position-relative"
        style={{ background: "transparent", border: "none" }}
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <FaBell size={22} />
        <span
          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          style={{ fontSize: "10px" }}
        >
          {notifications.filter(n => !n.isRead).length}
        </span>
      </button>

      {/* Notification dropdown */}
      <ul
        className="dropdown-menu dropdown-menu-end shadow"
        style={{ width: "320px", maxHeight: "400px", overflowY: "auto" }}
      >
        <li className="dropdown-header fw-bold">Notifications</li>
        {notifications.length === 0 ? (
          <li className="dropdown-item text-muted">No notifications</li>
        ) : (
          notifications.map((n) => (
            <li
              key={n._id}
              className={`dropdown-item d-flex justify-content-between align-items-center ${n.isRead ? "bg-light" : "bg-warning-subtle"}`}
            >
              <span style={{ whiteSpace: "normal" }}>{n.message}</span>
              {!n.isRead && (
                <button
                  className="btn btn-sm btn-success ms-2"
                  onClick={() => markAsRead(n._id)}
                >
                  <FaCheckCircle />
                </button>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  )}

  {auth && (
    <button
      className="btn btn-danger ms-2"
      type="button"
      onClick={handleLogout}
    >
      Logout
    </button>
  )}
</form>
</div>
      </div>
    </nav>
  );
}

export default Header;

