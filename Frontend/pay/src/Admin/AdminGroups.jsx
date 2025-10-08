import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import Navbar from "./Navbar";

function AdminGroups() {
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedGroupName, setSelectedGroupName] = useState("");

  // Fetch all groups on load
  const fetchGroups = () => {
    fetch("http://localhost:4000/safepay/admingroups")
      .then((res) => res.json())
      .then((data) => setGroups(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Fetch members of a specific group
  const handleViewMembers = (groupId, groupName) => {
    setSelectedGroupName(groupName);
    fetch(`http://localhost:4000/safepay/admingroups/${groupId}/members`)
      .then((res) => res.json())
      .then((data) => {
        setMembers(data);
        setShowMembersModal(true);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-grow-1">
        <Navbar />
        <div className="container mt-4">
          <h2 className="text-danger">Admin Groups Panel</h2>
          <p>Here you can manage groups and view members.</p>

          {/* Groups Table */}
          <table className="table table-striped table-bordered">
            <thead className="table-danger">
              <tr>
                <th>#</th>
                <th>Group Name</th>
                <th>Description</th>
                <th>Admin</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.length > 0 ? (
                groups.map((group, index) => (
                  <tr key={group._id}>
                    <td>{index + 1}</td>
                    <td>{group.name}</td>
                    <td>{group.description || "No description"}</td>
                    <td>{group.admin ? group.admin.email : "N/A"}</td>
                    <td>
                      {group.createdAt
                        ? new Date(group.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleViewMembers(group._id, group.name)}
                      >
                        View Members
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No groups available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Members Modal */}
      {showMembersModal && (
        <div className="modal" style={{ display: "block" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Members of Group: <span className="text-danger">{selectedGroupName}</span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowMembersModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {members.length > 0 ? (
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{member.profileRef?.name || "N/A"}</td>
                          <td>{member.profileRef?.phone || "N/A"}</td>
                          <td>{member.userId?.email || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center">No members found for this group.</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowMembersModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminGroups;
