import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import Navbar from "./Navbar";

function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/activities")
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Navbar />
        <div className="container mt-4">
          <h2 className="text-danger">Activity Logs</h2>
          <table className="table table-striped table-bordered">
            <thead className="table-danger">
              <tr>
                <th>ID</th>
                <th>Action</th>
                <th>User</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <tr key={log._id || index}>
                    <td>{log._id || index + 1}</td>
                    <td>{log.action}</td>
                    <td>{log.user?.name || "N/A"}</td>
                    <td>{new Date(log.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No logs available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminActivityLogs;