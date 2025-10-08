import React, { useEffect, useState } from "react";
import { FaCog, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

  // Bank account modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [accountData, setAccountData] = useState({
    accountName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branch: "",
    deposit:0
  });

  // Profile edit modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const auth = JSON.parse(localStorage.getItem("ourstorage"));

  // ---------------- Fetch profile + accounts ----------------
  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:4000/safepay/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: auth?.id }),
      });
      const result = await res.json();
      if (result.success) setUserProfile(result);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ---------------- Bank Account Handlers ----------------
  const handleAccountChange = (e) => {
    setAccountData({ ...accountData, [e.target.name]: e.target.value });
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/safepay/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: auth?.id, ...accountData }),
      });
      const result = await res.json();
      alert(result.message);
      if (result.success) {
        setShowAddModal(false);
        setAccountData({ accountName: "", accountNumber: "", ifscCode: "", bankName: "", branch: "" ,deposit:0});
        fetchProfile();
      }
    } catch (err) {
      console.error("❌ Error adding account:", err);
    }
  };

  const handleDeleteAccount = async (accId) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;
    try {
      const res = await fetch("http://localhost:4000/safepay/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accId }),
      });
      const result = await res.json();
      alert(result.message);
      if (result.success) fetchProfile();
    } catch (err) {
      console.error("❌ Error deleting account:", err);
    }
  };

  // ---------------- Profile Handlers ----------------
  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/safepay/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: auth?.id, ...profileData }),
      });
      const result = await res.json();
      alert(result.message);
      if (result.success) {
        setShowProfileModal(false);
        fetchProfile();
      }
    } catch (err) {
      console.error("❌ Error updating profile:", err);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container pt-4">
      <h2 className="text-center text-warning mb-4">My Profile</h2>

      {/* Profile Card */}
      <div className="card shadow-lg mx-auto position-relative" style={{ maxWidth: "500px", borderRadius: "15px" }}>
        {/* Top-right buttons */}
          <div className="top-0 start-0 p-2">
            <button
              onClick={() => navigate("/")}
              className="btn btn-outline-secondary me-3"
              style={{ minWidth: '100px' }}
            >
              ← Back
            </button>
            </div>
        <div className="position-absolute top-0 end-0 p-2 d-flex gap-2">
          {/* Edit Profile Button */}
          <button
            className="btn btn-light border rounded-circle shadow-sm"
            onClick={() => {
              const reg = userProfile?.user?.regid || {};
              setProfileData({
                name: reg.name || "",
                email: userProfile?.user?.email || "",
                phone: reg.phone || "",
              });
              setShowProfileModal(true);
            }}
          >
            <FaEdit size={18} />
          </button>

          {/* Add Account Button */}
          <button className="btn btn-light border rounded-circle shadow-sm" onClick={() => setShowAddModal(true)}>
            <FaCog size={18} />
          </button>
        </div>

        <div className="card-body text-center">
          <div
            className="rounded-circle shadow mx-auto mb-3 bg-warning text-dark d-flex align-items-center justify-content-center"
            style={{ width: "120px", height: "120px", fontSize: "48px", fontWeight: "bold" }}
          >
            {userProfile?.user?.regid?.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <h4>{userProfile?.user?.regid?.name || "No Name"}</h4>
          <p className="text-muted">{userProfile?.user?.email || "No Email"}</p>
          <p>📱 {userProfile?.user?.regid?.phone || "No Phone"}</p>

          {/* Bank Accounts */}
          <div className="mt-4 text-start">
            <h5 className="text-warning">Bank Accounts</h5>
            {userProfile?.accounts?.length > 0 ? (
              userProfile.accounts.map((acc) => (
                <div key={acc._id} className="border p-2 rounded mb-2 d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-1">{acc.bankName} - {acc.branch}</p>
                    <p className="mb-1">A/C: {acc.accountNumber}</p>
                    <p className="mb-0">IFSC: {acc.ifscCode}</p>
                    <p className="mb-0">Deposit: ₹{acc.deposit}</p>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAccount(acc._id)}>
                    <FaTrash />
                  </button>
                </div>
              ))
            ) : (
              <p>No bank accounts added yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleAddAccount}>
              <div className="modal-header">
                <h5 className="modal-title">Add Bank Account</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                {["accountName", "accountNumber", "ifscCode", "bankName", "branch","deposit"].map((field) => (
                  <div className="mb-3" key={field}>
                    <label className="form-label">{field.replace(/([A-Z])/g, " $1")}</label>
                    <input type="text" className="form-control" name={field} value={accountData[field]} onChange={handleAccountChange} required />
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-warning">Save Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleUpdateProfile}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Profile</h5>
                <button type="button" className="btn-close" onClick={() => setShowProfileModal(false)}></button>
              </div>
              <div className="modal-body">
                {["name", "email", "phone"].map((field) => (
                  <div className="mb-3" key={field}>
                    <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                    <input
                      type={field === "email" ? "email" : "text"}
                      className="form-control"
                      name={field}
                      value={profileData[field]}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProfileModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-warning">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
