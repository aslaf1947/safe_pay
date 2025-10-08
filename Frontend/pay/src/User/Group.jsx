// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import Header from "./Header";

// function Group() {
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [members, setMembers] = useState([]);
//   const [users, setUsers] = useState([]);

//   // logged-in user from localStorage (yourstorage/ourstorage depending on naming)
//   const user = JSON.parse(localStorage.getItem("ourstorage")); 
//   // user._id = login table id
//   // user.regid = reg table id

//   useEffect(() => {
//     // Fetch all registered users
//     fetch("http://localhost:4000/safepay/users")
//       .then(res => res.json())
//       .then(data => {
//       console.log("Users fetched:", data); // <- check this in browser console
//       setUsers(data);
//       });
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const res = await fetch("http://localhost:4000/safepay/creategroup", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         name,
//         description,
//         admin: { userId: user.id, regid: user.regid },
//         members                                            // already [{ userId, regid }]
//       })
//     });

//     const data = await res.json();
//     if (data.success) {
//       alert("Group created successfully!");
//       setName("");
//       setDescription("");
//       setMembers([]);
//     } else {
//       alert("Error: " + data.error);
//     }
//   };

//   const toggleMember = (checkedUser) => {
//     const exists = members.find(m => m.userId === checkedUser._id);

//     if (exists) {
//       // remove from members
//       setMembers(members.filter(m => m.userId !== checkedUser._id));
//     } else {
//       // add with both loginId + regid
//       setMembers([...members, { userId: checkedUser._id, regid: checkedUser.regid }]);
//     }
//   };

//   return (
//     <>
//     <Header></Header>
//     <div className="container pt-4">
//       <h2>Create Group</h2>
//       <form onSubmit={handleSubmit} className='mx-auto mt-5'>
//         <label htmlFor="groupname" className="form-label">Group Name</label>
//         <input 
//           type="text" 
//           placeholder="Group Name" 
//           className="form-control mb-2"
//           value={name} 
//           onChange={e => setName(e.target.value)} 
//           required
//         />
//         <label htmlFor="groupdesc" className="form-label">Group Description</label>
//         <input 
//           type="text" 
//           placeholder="Description"
//           className="form-control mb-2" 
//           value={description} 
//           onChange={e => setDescription(e.target.value)} 
//         />

//         <h4>Select Members</h4>
//         {Array.isArray(users) && users.map(u => (
//   <label key={u._id} className="form-check">
//     <input
//       type="checkbox"
//       className="form-check-input"
//       checked={!!members.find(m => m.userId === u._id)}
//       onChange={() => toggleMember(u)}
//     />
//     {u.name} ({u.email})
//   </label>
// ))}
//         <button className="btn btn-info mt-3" type="submit">Create</button>
//         <Link to="/my-groups" className="btn btn-secondary mt-3 ms-2">View Groups</Link>
//       </form>
//     </div>
//     </>
//   );
// }

// export default Group;

//new//

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";

function Group() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // logged-in user from localStorage (yourstorage/ourstorage depending on naming)
  const user = JSON.parse(localStorage.getItem("ourstorage")); 
  // user._id = login table id
  // user.regid = reg table id

  useEffect(() => {
    // Fetch all registered users
    fetch("http://localhost:4000/safepay/users")
      .then(res => res.json())
      .then(data => {
        console.log("Users fetched:", data); // <- check this in browser console
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching users:", err);
        setLoading(false);
      });
  }, []);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setCreating(true);

  //   try {
  //     const res = await fetch("http://localhost:4000/safepay/creategroup", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         name,
  //         description,
  //         admin: { userId: user.id, regid: user.regid },
  //         members                                            // already [{ userId, regid }]
  //       })
  //     });

  //     const data = await res.json();
  //     if (data.success) {
  //       alert("Group created successfully!");
  //       setName("");
  //       setDescription("");
  //       setMembers([]);
  //     } else {
  //       alert("Error: " + data.error);
  //     }
  //   } catch (error) {
  //     alert("Error creating group: " + error.message);
  //   } finally {
  //     setCreating(false);
  //   }
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!user?.id || !user?.regid) return alert("User not logged in properly.");

  setCreating(true);

  try {
    const res = await fetch("http://localhost:4000/safepay/creategroup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        admin: { userId: user.id, regid: user.regid },
        members, 
        feed: [
          { userId: user.id, message: `Group "${name}" created by ${user.name}` }
        ]
      })
    });

    const data = await res.json();
    if (data.success) {
      alert("Group created successfully!");
      setName("");
      setDescription("");
      setMembers([]);
    } else {
      alert("Error: " + data.error);
    }
  } catch (error) {
    alert("Error creating group: " + error.message);
  } finally {
    setCreating(false);
  }
};


  const toggleMember = (checkedUser) => {
    const exists = members.find(m => m.userId === checkedUser._id);

    if (exists) {
      // remove from members
      setMembers(members.filter(m => m.userId !== checkedUser._id));
    } else {
      // add with both loginId + regid
      setMembers([...members, { userId: checkedUser._id, regid: checkedUser.regid }]);
    }
  };

  return (
    <>
      <Header />
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-6">
            {/* Header Section */}
            <div className="text-center mb-5">
              <div className="mb-3">
                <i className="bi bi-people-fill text-primary" style={{fontSize: '3rem'}}></i>
              </div>
              <h2 className="fw-bold text-dark mb-2">Create New Group</h2>
              <p className="text-muted">Start splitting expenses with your friends and family</p>
            </div>

            {/* Main Form Card */}
            <div className="card shadow-lg border-0">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  {/* Group Name */}
                  <div className="mb-4">
                    <label htmlFor="groupname" className="form-label fw-semibold text-dark">
                      <i className="bi bi-tag-fill me-2 text-primary"></i>
                      Group Name
                    </label>
                    <input 
                      type="text" 
                      id="groupname"
                      placeholder="e.g., Weekend Trip, Office Lunch, House Rent" 
                      className="form-control form-control-lg border-2"
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      required
                    />
                  </div>

                  {/* Group Description */}
                  <div className="mb-4">
                    <label htmlFor="groupdesc" className="form-label fw-semibold text-dark">
                      <i className="bi bi-card-text me-2 text-primary"></i>
                      Group Description
                    </label>
                    <textarea 
                      id="groupdesc"
                      placeholder="Brief description of what this group is for..."
                      className="form-control border-2" 
                      rows="3"
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                    />
                  </div>

                  {/* Members Selection */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <label className="form-label fw-semibold text-dark mb-0">
                        <i className="bi bi-person-plus-fill me-2 text-primary"></i>
                        Select Members
                      </label>
                      <span className="badge bg-primary-subtle text-primary">
                        {members.length} selected
                      </span>
                    </div>

                    {loading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <span className="text-muted">Loading users...</span>
                      </div>
                    ) : (
                      <div className="border rounded-3 p-3 bg-light" style={{maxHeight: '250px', overflowY: 'auto'}}>
                        {Array.isArray(users) && users.length > 0 ? (
                          <div className="row g-2">
                            {users.map(u => (
                              <div key={u._id} className="col-12">
                                <div className={`card border-2 ${members.find(m => m.userId === u._id) ? 'border-primary bg-primary-subtle' : 'border-light'} cursor-pointer`}
                                     onClick={() => toggleMember(u)}
                                     style={{cursor: 'pointer', transition: 'all 0.2s ease'}}>
                                  <div className="card-body p-3">
                                    <div className="form-check mb-0">
                                      <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={!!members.find(m => m.userId === u._id)}
                                        onChange={() => toggleMember(u)}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      <label className="form-check-label ms-2">
                                        <div className="d-flex align-items-center">
                                          <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                                               style={{width: '40px', height: '40px'}}>
                                            <i className="bi bi-person-fill text-white"></i>
                                          </div>
                                          <div>
                                            <div className="fw-semibold text-dark">{u.name}</div>
                                            <small className="text-muted">{u.email}</small>
                                          </div>
                                        </div>
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted">
                            <i className="bi bi-person-x-fill mb-2" style={{fontSize: '2rem'}}></i>
                            <p>No users available to add</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                    <button 
                      className="btn btn-primary btn-lg shadow-sm px-4" 
                      type="submit"
                      disabled={creating || !name.trim()}
                      style={{minWidth: '150px'}}
                    >
                      {creating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-plus-circle-fill me-2"></i>
                          Create Group
                        </>
                      )}
                    </button>
                    
                    <Link 
                      to="/my-groups" 
                      className="btn btn-outline-secondary btn-lg px-4"
                      style={{minWidth: '150px'}}
                    >
                      <i className="bi bi-list-ul me-2"></i>
                      View Groups
                    </Link>
                  </div>
                </form>
              </div>
            </div>

            {/* Helper Text */}
            <div className="text-center mt-4">
              <small className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                You'll be automatically added as the group admin
              </small>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Group;