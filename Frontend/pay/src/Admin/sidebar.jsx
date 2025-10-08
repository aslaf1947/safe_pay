// simple sidebar for admin panel
import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const sidebarStyle = {
    width: "220px",
    background: "#212529",
    color: "white",
    padding: "20px",
  };

  return (
    <div style={sidebarStyle}>
      <h4 className="mb-4">Admin</h4>
      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-link ${
                isActive ? "bg-danger text-white fw-bold rounded" : "text-white"
              }`
            }
          >
            Dashboard
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink
            to="/adminusers"
            className={({ isActive }) =>
              `nav-link ${
                isActive ? "bg-danger text-white fw-bold rounded" : "text-white"
              }`
            }
          >
            Users
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink
            to="/admingroups"
            className={({ isActive }) =>
              `nav-link ${
                isActive ? "bg-danger text-white fw-bold rounded" : "text-white"
              }`
            }
          >
            Groups
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink
            to="/admintransactions"
            className={({ isActive }) =>
              `nav-link ${
                isActive ? "bg-danger text-white fw-bold rounded" : "text-white"
              }`
            }
          >
            Transactions
          </NavLink>
        </li>
        {/* <li className="nav-item mb-2">
          <NavLink
            to="/adminactivityLogs"
            className={({ isActive }) =>
              `nav-link ${
                isActive ? "bg-danger text-white fw-bold rounded" : "text-white"
              }`
            }
          >
            Activity Logs
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `nav-link ${
                isActive ? "bg-danger text-white fw-bold rounded" : "text-white"
              }`
            }
          >
            Reports
          </NavLink>
        </li>
        <li className="nav-item mb-2">
          <NavLink
            to="/verification"
            className={({ isActive }) =>
              `nav-link ${
                isActive ? "bg-danger text-white fw-bold rounded" : "text-white"
              }`
            }
          >
            Verification
          </NavLink>
        </li> */}
        {/* <li className="nav-item mb-2">
          <NavLink
            to="/register"
            className={({ isActive }) =>
              `nav-link ${
                isActive ? "bg-danger text-white fw-bold rounded" : "text-white"
              }`
            }
          >
            Register User
          </NavLink>
        </li> */}
      </ul>
    </div>
  );
}

export default Sidebar;
