import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import Navbar from "./Navbar";

function AdminUsers() {
  const [users, setUsers] = useState([]);

  // Fetch users from backend
  const fetchUsers = () => {
    fetch("http://localhost:4000/safepay/adminusers")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete user
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      fetch(`http://localhost:4000/safepay/adminusers/${id}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() => {
          alert("User deleted successfully!");
          fetchUsers(); // refresh user list
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-grow-1">
        <Navbar />
        <div className="container mt-4">
          <h2 className="text-danger">Admin Users Panel</h2>
          <p>Here you can view, search, and delete users.</p>

          {/* Users Table */}
          <table className="table table-striped table-bordered">
            <thead className="table-danger">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((u, index) => (
                  <tr key={u._id}>
                    <td>{index + 1}</td>
                    <td>{u.name}</td>
                    <td>{u.phone}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(u._id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No users available
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

export default AdminUsers;
