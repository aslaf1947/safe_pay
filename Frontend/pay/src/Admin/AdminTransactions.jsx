// import React, { useState, useEffect } from "react";
// import Sidebar from "./sidebar";
// import Navbar from "./Navbar";

// function AdminTransactions() {
//   const [transactions, setTransactions] = useState([]);

//   useEffect(() => {
//     fetch("http://localhost:4000/transactions")
//       .then((res) => res.json())
//       .then((data) => setTransactions(data))
//       .catch((err) => console.error(err));
//   }, []);

//   const handleDispute = (id) => {
//     fetch(`http://localhost:4000/transactions/${id}/dispute`, { method: "PUT" })
//       .then(() => {
//         // Refresh transactions
//         fetch("http://localhost:4000/transactions")
//           .then((res) => res.json())
//           .then((data) => setTransactions(data));
//       })
//       .catch((err) => console.error(err));
//   };

//   const handleResolve = (id) => {
//     fetch(`http://localhost:4000/transactions/${id}/resolve`, { method: "PUT" })
//       .then(() => {
//         // Refresh transactions
//         fetch("http://localhost:4000/transactions")
//           .then((res) => res.json())
//           .then((data) => setTransactions(data));
//       })
//       .catch((err) => console.error(err));
//   };

//   return (
//     <div className="d-flex">
//       <Sidebar />
//       <div className="flex-grow-1">
//         <Navbar />
//         <div className="container mt-4">
//           <h2 className="text-danger">Admin Transactions Panel</h2>
//           <p>Here you can view all transactions.</p>
//           <table className="table table-striped table-bordered">
//             <thead className="table-danger">
//               <tr>
//                 <th>ID</th>
//                 <th>User</th>
//                 <th>Group</th>
//                 <th>Amount</th>
//                 <th>Date</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {transactions.length > 0 ? (
//                 transactions.map((t, index) => (
//                   <tr key={t._id || index}>
//                     <td>{t._id || index + 1}</td>
//                     <td>{t.user?.name || "N/A"}</td>
//                     <td>{t.group?.groupName || "N/A"}</td>
//                     <td>{t.amount}</td>
//                     <td>{new Date(t.createdAt).toLocaleDateString()}</td>
//                     <td>
//                       <button
//                         className="btn btn-warning btn-sm me-2"
//                         onClick={() => handleDispute(t._id)}
//                       >
//                         Mark Dispute
//                       </button>
//                       <button
//                         className="btn btn-success btn-sm"
//                         onClick={() => handleResolve(t._id)}
//                       >
//                         Resolve
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="6" className="text-center">
//                     No transactions available
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AdminTransactions;\

import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import Navbar from "./Navbar";

function UserHistory() {
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch all registered users on page load
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:4000/safepay/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch activity for selected user
  const fetchHistory = async (userId) => {
    try {
      const res = await fetch(
        `http://localhost:4000/safepay/userhistory/${userId}/activity`
      );
      const data = await res.json();
      setHistory(data);
      setSelectedUser(userId);
    } catch (error) {
      console.error("Error fetching history:", error);
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
          <h3 className="mb-3 text-danger">Registered Users</h3>

          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-danger">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>View Activity</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => fetchHistory(user._id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal for user activity */}
          {selectedUser && (
            <div
              className="modal fade show"
              style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-xl modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header bg-danger text-white">
                    <h5 className="modal-title">User Activity</h5>
                    <button
                      className="btn-close"
                      onClick={() => {
                        setSelectedUser(null);
                        setHistory([]);
                      }}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {history.length === 0 ? (
                      <p>No activity found for this user.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-striped table-bordered">
                          <thead>
                            <tr>
                              <th>Type</th>
                              <th>Details</th>
                              {/* <th>Amount</th> */}
                              <th>Status</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {history.map((item, index) => (
                              <tr key={index}>
                                <td>
                                  <span
                                    className={`badge bg-${
                                      item.type === "Payment" ? "success" : "info"
                                    }`}
                                  >
                                    {item.type}
                                  </span>
                                </td>
                                <td>
                                  {item.type === "Service"
                                    ? item.serviceType
                                    : `Booking: ${item.bookingId || "N/A"}`}
                                </td>
                                {/* <td>{item.amount || 0}</td> */}
                                <td>{item.status}</td>
                                <td>
                                  {new Date(item.createdAt).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setSelectedUser(null);
                        setHistory([]);
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserHistory;
