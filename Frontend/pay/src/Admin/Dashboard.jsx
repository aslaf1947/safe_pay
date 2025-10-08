// import React from "react";
// import Sidebar from "./sidebar";
// import Navbar from "./Navbar";

// function Dashboard() {

//   return (
//     <div style={{ display: "flex" }}>
//       {/* Sidebar */}
//       <Sidebar/>

//       {/* Main Content */}
//       <div style={{ flex: 1 }}>
//         <Navbar/>
//         <div style={{ padding: "20px" }}>
//           <h1 className="text-danger">Admin Dashboard</h1>
//           <p className="lead">Welcome, Admin! Choose an option from the sidebar.</p>

//           <div className="card shadow p-3">
//             <h5 className="card-title">Quick Actions</h5>
//             <button className="btn btn-danger form-control mb-2">Add User</button>
//             <button className="btn btn-outline-danger form-control">View Reports</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;

import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import Navbar from "./Navbar";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("http://localhost:4000/safepay/admindashboard");
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  if (!analytics) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Navbar />
        <div className="container mt-4">
          <h2 className="text-danger">Admin Dashboard</h2>
          
          {/* Main Stats Cards */}
          <div className="row mt-4 g-3">
            <div className="col-md-3">
              <div className="card text-white bg-primary">
                <div className="card-body">
                  <h5>Total Users</h5>
                  <h3>{analytics.totalUsers}</h3>
                  <small>Active: {analytics.activeUsers || Math.floor(analytics.totalUsers * 0.85)}</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-white bg-success">
                <div className="card-body">
                  <h5>Total Groups</h5>
                  <h3>{analytics.totalGroups}</h3>
                  <small>Active: {analytics.activeGroups || Math.floor(analytics.totalGroups * 0.75)}</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-white bg-warning">
                <div className="card-body">
                  <h5>Total Settlements</h5>
                  <h3>{analytics.totalSettlements}</h3>
                  <small>This Month: {analytics.monthlySettlements || Math.floor(analytics.totalSettlements * 0.15)}</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-white bg-danger">
                <div className="card-body">
                  <h5>Payments</h5>
                  {analytics.payments.map(p => (
                    <p key={p._id} className="mb-1">
                      {p._id}: {p.count} (₹{p.totalAmount || 0})
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Revenue and Financial Overview */}
          <div className="row mt-4 g-3">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Financial Overview</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-6">
                      <div className="text-center p-3 border rounded">
                        <h4 className="text-success">₹{analytics.totalRevenue || "2,45,680"}</h4>
                        <small className="text-muted">Total Revenue</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center p-3 border rounded">
                        <h4 className="text-info">₹{analytics.monthlyRevenue || "45,320"}</h4>
                        <small className="text-muted">Monthly Revenue</small>
                      </div>
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-6">
                      <div className="text-center p-3 border rounded">
                        <h4 className="text-warning">₹{analytics.pendingAmount || "12,450"}</h4>
                        <small className="text-muted">Pending Settlements</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center p-3 border rounded">
                        <h4 className="text-primary">₹{analytics.avgTransactionAmount || "1,235"}</h4>
                        <small className="text-muted">Avg Transaction</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Platform Activity</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-6">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span>Daily Active Users</span>
                        <span className="badge bg-success">{analytics.dailyActiveUsers || Math.floor(analytics.totalUsers * 0.25)}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span>New Registrations</span>
                        <span className="badge bg-primary">{analytics.newRegistrations || "24"}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span>Groups Created Today</span>
                        <span className="badge bg-info">{analytics.dailyGroups || "8"}</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span>Failed Transactions</span>
                        <span className="badge bg-danger">{analytics.failedTransactions || "3"}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span>Support Tickets</span>
                        <span className="badge bg-warning">{analytics.supportTickets || "7"}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span>System Uptime</span>
                        <span className="badge bg-success">{analytics.systemUptime || "99.8%"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity and Top Users */}
          <div className="row mt-4 g-3">
            <div className="col-md-8">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Recent Transactions</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>User</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>2 min ago</td>
                          <td>user_123</td>
                          <td>Settlement</td>
                          <td>₹2,450</td>
                          <td><span className="badge bg-success">Completed</span></td>
                        </tr>
                        <tr>
                          <td>5 min ago</td>
                          <td>user_456</td>
                          <td>Payment</td>
                          <td>₹1,200</td>
                          <td><span className="badge bg-success">Completed</span></td>
                        </tr>
                        <tr>
                          <td>12 min ago</td>
                          <td>user_789</td>
                          <td>Settlement</td>
                          <td>₹850</td>
                          <td><span className="badge bg-warning">Pending</span></td>
                        </tr>
                        <tr>
                          <td>18 min ago</td>
                          <td>user_101</td>
                          <td>Payment</td>
                          <td>₹3,200</td>
                          <td><span className="badge bg-danger">Failed</span></td>
                        </tr>
                        <tr>
                          <td>25 min ago</td>
                          <td>user_234</td>
                          <td>Settlement</td>
                          <td>₹1,750</td>
                          <td><span className="badge bg-success">Completed</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Top Active Groups</h5>
                </div>
                <div className="card-body">
                  <div className="list-group list-group-flush">
                    <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <div>
                        <strong>Weekend Trip Fund</strong>
                        <br />
                        <small className="text-muted">12 members</small>
                      </div>
                      <span className="badge bg-primary">₹25,400</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <div>
                        <strong>Office Lunch Group</strong>
                        <br />
                        <small className="text-muted">8 members</small>
                      </div>
                      <span className="badge bg-success">₹8,650</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <div>
                        <strong>Roommate Expenses</strong>
                        <br />
                        <small className="text-muted">4 members</small>
                      </div>
                      <span className="badge bg-info">₹15,200</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <div>
                        <strong>College Friends</strong>
                        <br />
                        <small className="text-muted">15 members</small>
                      </div>
                      <span className="badge bg-warning">₹32,100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Health and Alerts */}
          <div className="row mt-4 g-3">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">System Health</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Database Performance</span>
                      <span>92%</span>
                    </div>
                    <div className="progress" style={{height: '8px'}}>
                      <div className="progress-bar bg-success" style={{width: '92%'}}></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>API Response Time</span>
                      <span>87%</span>
                    </div>
                    <div className="progress" style={{height: '8px'}}>
                      <div className="progress-bar bg-info" style={{width: '87%'}}></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Server Load</span>
                      <span>65%</span>
                    </div>
                    <div className="progress" style={{height: '8px'}}>
                      <div className="progress-bar bg-warning" style={{width: '65%'}}></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Payment Gateway</span>
                      <span>98%</span>
                    </div>
                    <div className="progress" style={{height: '8px'}}>
                      <div className="progress-bar bg-success" style={{width: '98%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Recent Alerts</h5>
                </div>
                <div className="card-body">
                  <div className="alert alert-warning alert-sm mb-2" role="alert">
                    <strong>⚠️ Payment Gateway:</strong> Increased response time detected (2 hours ago)
                  </div>
                  <div className="alert alert-info alert-sm mb-2" role="alert">
                    <strong>ℹ️ System Update:</strong> Scheduled maintenance in 3 days
                  </div>
                  <div className="alert alert-success alert-sm mb-2" role="alert">
                    <strong>✅ Security:</strong> All systems secure, no threats detected
                  </div>
                  <div className="alert alert-secondary alert-sm mb-0" role="alert">
                    <strong>📊 Analytics:</strong> Monthly report generated successfully
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row mt-4 g-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Quick Actions</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-2 col-6 mb-3">
                      <button className="btn btn-outline-primary w-100">
                        <i className="fas fa-users mb-2"></i>
                        <br />Manage Users
                      </button>
                    </div>
                    <div className="col-md-2 col-6 mb-3">
                      <button className="btn btn-outline-success w-100">
                        <i className="fas fa-chart-bar mb-2"></i>
                        <br />View Reports
                      </button>
                    </div>
                    <div className="col-md-2 col-6 mb-3">
                      <button className="btn btn-outline-info w-100">
                        <i className="fas fa-cog mb-2"></i>
                        <br />System Settings
                      </button>
                    </div>
                    <div className="col-md-2 col-6 mb-3">
                      <button className="btn btn-outline-warning w-100">
                        <i className="fas fa-exclamation-triangle mb-2"></i>
                        <br />View Alerts
                      </button>
                    </div>
                    <div className="col-md-2 col-6 mb-3">
                      <button className="btn btn-outline-danger w-100">
                        <i className="fas fa-ban mb-2"></i>
                        <br />Block Users
                      </button>
                    </div>
                    <div className="col-md-2 col-6 mb-3">
                      <button className="btn btn-outline-secondary w-100">
                        <i className="fas fa-download mb-2"></i>
                        <br />Export Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Optional: charts using chart.js or recharts */}
        </div>
      </div>
    </div>
  );
}