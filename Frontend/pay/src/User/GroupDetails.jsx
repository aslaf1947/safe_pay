// import React, { useEffect, useState } from "react";
// import { Link, useParams } from "react-router-dom";

// function GroupDetails() {
//   const { groupId } = useParams();
//   const [expenses, setExpenses] = useState([]);
//   const [group, setGroup] = useState(null);

//   useEffect(() => {
//     // Fetch group info
//     fetch(`http://localhost:4000/safepay/group/${groupId}`)
//       .then(res => res.json())
//       .then(data => {
//         console.log("Group data:", data); // Debug log
//         setGroup(data);
//       });
//     // Fetch expenses
//     fetch(`http://localhost:4000/safepay/expenses/${groupId}`)
//       .then(res => res.json())
//       .then(data => {
//         console.log("Expenses data:", data);
//         setExpenses(data || []);
//       });
//   }, [groupId]);

//   return (
//     <div className="container mt-4">
//       {group && (
//         <>
//           <h2>{group.name}</h2>
//           <p>{group.description}</p>

//           <Link to={`/groups/${groupId}/add-expense`} className="btn btn-success mb-3">
//             + Add Expense
//           </Link>

//           <h4>Expenses</h4>
//           <ul className="list-group">
//             {expenses.map(e => (
//               <li key={e._id} className="list-group-item">
//                 {e.description} - ₹{e.amount} (Paid by {e.paidBy?.email})
//               </li>
//             ))}
//           </ul>
//         </>
//       )}
//     </div>
//   );
// }

// export default GroupDetails;

//old//
// import React, { useEffect, useState } from "react";
// import { Link, useParams } from "react-router-dom";

// function GroupDetails() {
//   const { groupId } = useParams();
//   const [expenses, setExpenses] = useState([]);
//   const [group, setGroup] = useState(null);

//   useEffect(() => {
//     // Fetch group info
//     fetch(`http://localhost:4000/safepay/group/${groupId}`)
//       .then(res => res.json())
//       .then(data => setGroup(data));

//     // Fetch expenses
//     fetch(`http://localhost:4000/safepay/expenses/${groupId}`)
//       .then(res => res.json())
//       .then(data => setExpenses(data || []));
//   }, [groupId]);

//   return (
//     <div className="container mt-4">
//       {group && (
//         <>
//           <h2>{group.name}</h2>
//           <p>{group.description}</p>

//           <Link to={`/groups/${groupId}/add-expense`} className="btn btn-success mb-3">
//             + Add Expense
//           </Link>

//           <h4>Expenses</h4>
//           <ul className="list-group">
//             {expenses.map(e => (
//               <li key={e._id} className="list-group-item">
//                 <strong>{e.description}</strong> - Total ₹{e.amount} (Paid by {e.paidBy?.email})
//                 <ul>
//                   {e.splits.map(s => (
//                     <li key={s.userId._id}>
//                       {s.userId.email} - ₹{s.share}
//                     </li>
//                   ))}
//                 </ul>
//               </li>
//             ))}
//           </ul>
//         </>
//       )}
//     </div>
//   );
// }

// export default GroupDetails;

//new//
// import React, { useEffect, useState } from "react";
// import { Link, useParams, useNavigate } from "react-router-dom";

// function GroupDetails() {
//   const { groupId } = useParams();
//   const navigate = useNavigate();
//   const [expenses, setExpenses] = useState([]);
//   const [group, setGroup] = useState(null);

//   useEffect(() => {
//     // Fetch group info
//     fetch(`http://localhost:4000/safepay/group/${groupId}`)
//       .then(res => res.json())
//       .then(data => setGroup(data));

//     // Fetch expenses
//     fetch(`http://localhost:4000/safepay/expenses/${groupId}`)
//       .then(res => res.json())
//       .then(data => setExpenses(data || []));
//   }, [groupId]);

//   return (
//     <div className="container mt-4">
//       <div className="row">
//         <div className="col-12">
//           {/* Header with Back Button */}
//           <div className="d-flex align-items-center mb-4">
//             <button
//               onClick={() => navigate(-1)}
//               className="btn btn-outline-secondary me-3"
//               style={{ minWidth: '100px' }}
//             >
//               ← Back
//             </button>
//             <div>
//               {/* {group && (
//                 <>
//                   <h2 className="mb-1">{group.name}</h2>
//                   <p className="text-muted mb-0">{group.description}</p>
//                 </>
//               )} */}
//               {group && (
//                 <div className="mb-3">
//                   <h6 className="text-muted">Admin:</h6>
//                   <p className="fw-semibold">{group.admin.email}</p>
//                 </div>
//               )}
//             </div>
//           </div>
//           {group && group.members.length > 0 && (
//             <div className="mb-4">
//               <h6 className="text-muted">Members:</h6>
//               <ul className="list-unstyled ms-3">
//                 {group.members.map(m => (
//                   <li key={m.userId._id}>
//                     {m.userId.email} ({m.profileRef?.name || "No name"})
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}     
//           {group && (
//             <>
//               {/* Action Button */}
//               <div className="mb-4">
//                 <Link 
//                   to={`/groups/${groupId}/add-expense`} 
//                   className="btn btn-success btn-lg shadow-sm"
//                   style={{ minWidth: '150px' }}
//                 >
//                   + Add Expense
//                 </Link>
//               </div>

//               {/* Expenses Section */}
//               <div className="card shadow-sm">
//                 <div className="card-header bg-light">
//                   <h4 className="mb-0 text-dark">Expenses</h4>
//                 </div>
//                 <div className="card-body p-0">
//                   {expenses.length > 0 ? (
//                     <ul className="list-group list-group-flush">
//                       {expenses.map(e => (
//                         <li key={e._id} className="list-group-item py-3">
//                           <div className="d-flex justify-content-between align-items-start mb-2">
//                             <h6 className="mb-1 fw-bold">{e.description}</h6>
//                             <span className="badge bg-primary fs-6">₹{e.amount}</span>
//                           </div>
//                           <p className="mb-2 text-muted small">
//                             Paid by <strong>{e.paidBy?.email}</strong>
//                           </p>
//                           <div className="mt-2">
//                             <small className="text-muted fw-semibold">Split Details:</small>
//                             <ul className="list-unstyled mt-1 ms-3">
//                               {e.splits.map(s => (
//                                 <li key={s.userId._id} className="small text-secondary">
//                                   {s.userId.email} - <span className="fw-semibold">₹{s.share}</span>
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                         </li>
//                       ))}
//                     </ul>
//                   ) : (
//                     <div className="text-center py-5">
//                       <div className="text-muted">
//                         <h5>No expenses yet</h5>
//                         <p>Add your first expense to get started!</p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default GroupDetails;


// import React, { useEffect, useState } from "react";
// import { Link, useParams, useNavigate } from "react-router-dom";

// function GroupDetails() {
//   const { groupId } = useParams();
//   const navigate = useNavigate();
//   const [expenses, setExpenses] = useState([]);
//   const [group, setGroup] = useState(null);
//   const [users, setUsers] = useState([]); // all users
//   const auth = JSON.parse(localStorage.getItem("ourstorage"));

//   useEffect(() => {
//     // Fetch group info
//     fetch(`http://localhost:4000/safepay/group/${groupId}`)
//       .then((res) => res.json())
//       .then((data) => setGroup(data));

//     // Fetch expenses
//     fetch(`http://localhost:4000/safepay/expenses/${groupId}`)
//       .then((res) => res.json())
//       .then((data) => setExpenses(data || []));

//     // Fetch all users (for adding new members)
//     fetch("http://localhost:4000/safepay/users")
//       .then((res) => res.json())
//       .then(setUsers);
//   }, [groupId]);

//   // Only check for auth, not auth.user
//   if (!auth) {
//     return (
//       <div className="container mt-4">
//         <div className="alert alert-warning">
//           Please log in to view this page.
//         </div>
//       </div>
//     );
//   }

//   // Add member
//   const handleAddMember = async (userId) => {
//     const res = await fetch(
//       `http://localhost:4000/safepay/${groupId}/add-member`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId, adminId: auth.id }),
//       }
//     );
//     const data = await res.json();
//     setGroup(data); // refresh group state
//   };

//   // Remove member
//   const handleRemoveMember = async (userId) => {
//     const res = await fetch(
//       `http://localhost:4000/safepay/${groupId}/remove-member`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId, adminId: auth.id }),
//       }
//     );
//     const data = await res.json();
//     setGroup(data); // refresh group state
//   };

//   return (
//     <div className="container mt-4">
//       <div className="row">
//         <div className="col-12">
//           {/* Header with Back Button */}
//           <div className="d-flex align-items-center mb-4">
//             <button
//               onClick={() => navigate(-1)}
//               className="btn btn-outline-secondary me-3"
//               style={{ minWidth: "100px" }}
//             >
//               ← Back
//             </button>
//             <div>
//               {group && (
//                 <div className="mb-3">
//                   <h6 className="text-muted">Admin:</h6>
//                   <p className="fw-semibold">{group.admin?.email}</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Members Section */}
//           {group && group.members?.length > 0 && (
//             <div className="mb-4">
//               <h6 className="text-muted">Members:</h6>
//               <ul className="list-unstyled ms-3">
//                 {group.members.map((m) => (
//                   <li
//                     key={m.userId?._id}
//                     className="d-flex justify-content-between"
//                   >
//                     <span>
//                       {m.userId?.email} ({m.profileRef?.name || "No name"})
//                     </span>
//                     {/* Show Remove button only for admin */}
//                     {auth.id === group.admin?._id && (
//                       <button
//                         className="btn btn-sm btn-danger"
//                         onClick={() => handleRemoveMember(m.userId._id)}
//                       >
//                         Remove
//                       </button>
//                     )}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           {/* Add New Members Section */}
//           {auth.id === group?.admin?._id && (
//             <div className="mb-4">
//               <h6 className="text-muted">Add Members:</h6>
//               <ul className="list-unstyled ms-3">
//                 {users
//                   .filter(
//                     (u) =>
//                       !group.members.some(
//                         (m) => m.userId?._id.toString() === u._id.toString()
//                       )
//                   )
//                   .map((u) => (
//                     <li
//                       key={u._id}
//                       className="d-flex justify-content-between"
//                     >
//                       <span>
//                         {u.email} ({u.name || "No name"})
//                       </span>
//                       <button
//                         className="btn btn-sm btn-success"
//                         onClick={() => handleAddMember(u._id)}
//                       >
//                         Add
//                       </button>
//                     </li>
//                   ))}
//               </ul>
//             </div>
//           )}

//           {group && (
//             <>
//               {/* Action Button */}
//               <div className="mb-4">
//                 <Link
//                   to={`/groups/${groupId}/add-expense`}
//                   className="btn btn-success btn-lg shadow-sm"
//                   style={{ minWidth: "150px" }}
//                 >
//                   + Add Expense
//                 </Link>
//               </div>

//               {/* Expenses Section */}
//               <div className="card shadow-sm">
//                 <div className="card-header bg-light">
//                   <h4 className="mb-0 text-dark">Expenses</h4>
//                 </div>
//                 <div className="card-body p-0">
//                   {expenses.length > 0 ? (
//                     <ul className="list-group list-group-flush">
//                       {expenses.map((e) => (
//                         <li key={e._id} className="list-group-item py-3">
//                           <div className="d-flex justify-content-between align-items-start mb-2">
//                             <h6 className="mb-1 fw-bold">{e.description}</h6>
//                             <span className="badge bg-primary fs-6">
//                               ₹{e.amount}
//                             </span>
//                           </div>
//                           <p className="mb-2 text-muted small">
//                             Paid by <strong>{e.paidBy?.email}</strong>
//                           </p>
//                           <div className="mt-2">
//                             <small className="text-muted fw-semibold">
//                               Split Details:
//                             </small>
//                             <ul className="list-unstyled mt-1 ms-3">
//                               {e.splits.map((s) => (
//                                 <li
//                                   key={s.userId?._id}
//                                   className="small text-secondary"
//                                 >
//                                   {s.userId?.email} -{" "}
//                                   <span className="fw-semibold">₹{s.share}</span>
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                         </li>
//                       ))}
//                     </ul>
//                   ) : (
//                     <div className="text-center py-5">
//                       <div className="text-muted">
//                         <h5>No expenses yet</h5>
//                         <p>Add your first expense to get started!</p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default GroupDetails;



// import React, { useEffect, useState } from "react";
// import { Link, useParams, useNavigate } from "react-router-dom";

// function GroupDetails() {
//   const { groupId } = useParams();
//   const navigate = useNavigate();
//   const [expenses, setExpenses] = useState([]);
//   const [group, setGroup] = useState(null);
//   const [users, setUsers] = useState([]); // all users
//   const auth = JSON.parse(localStorage.getItem("ourstorage"));

//   useEffect(() => {
//     // Fetch group info
//     fetch(`http://localhost:4000/safepay/group/${groupId}`)
//       .then((res) => res.json())
//       .then((data) => setGroup(data));

//     // Fetch expenses
//     fetch(`http://localhost:4000/safepay/expenses/${groupId}`)
//       .then((res) => res.json())
//       .then((data) => setExpenses(data || []));

//     // Fetch all users (for adding new members)
//     fetch("http://localhost:4000/safepay/users")
//       .then((res) => res.json())
//       .then(setUsers);
//   }, [groupId]);

//   // Only check for auth, not auth.user
//   if (!auth) {
//     return (
//       <div className="container mt-4">
//         <div className="alert alert-warning">
//           Please log in to view this page.
//         </div>
//       </div>
//     );
//   }

//   // Add member
//   const handleAddMember = async (userId) => {
//     const res = await fetch(
//       `http://localhost:4000/safepay/${groupId}/add-member`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId, adminId: auth.id }),
//       }
//     );
//     const data = await res.json();
//     setGroup(data); // refresh group state
//   };

//   // Remove member
//   const handleRemoveMember = async (userId) => {
//     const res = await fetch(
//       `http://localhost:4000/safepay/${groupId}/remove-member`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId, adminId: auth.id }),
//       }
//     );
//     const data = await res.json();
//     setGroup(data); // refresh group state
//   };

//   return (
//     <div className="container mt-4">
//       <div className="row">
//         <div className="col-12">
//           {/* Header with Back Button */}
//           <div className="d-flex align-items-center mb-4">
//             <button
//               onClick={() => navigate(-1)}
//               className="btn btn-outline-secondary me-3"
//               style={{ minWidth: "100px" }}
//             >
//               ← Back
//             </button>
//             <div>
//               {group && (
//                 <div className="mb-3">
//                   <h6 className="text-muted mb-1">Admin:</h6>
//                   <p className="fw-semibold mb-0">{group.admin?.email}</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Members Section */}
//           {group && group.members?.length > 0 && (
//             <div className="card shadow-sm mb-4">
//               <div className="card-header bg-light">
//                 <h6 className="mb-0 text-dark">Members</h6>
//               </div>
//               <div className="card-body">
//                 <ul className="list-group list-group-flush">
//                   {group.members.map((m) => (
//                     <li
//                       key={m.userId?._id}
//                       className="list-group-item d-flex justify-content-between align-items-center"
//                     >
//                       <span>
//                         {m.userId?.email} <span className="text-muted">({m.profileRef?.name || "No name"})</span>
//                       </span>
//                       {/* Show Remove button only for admin */}
//                       {auth.id === group.admin?._id && (
//                         <button
//                           className="btn btn-sm btn-danger"
//                           onClick={() => handleRemoveMember(m.userId._id)}
//                         >
//                           Remove
//                         </button>
//                       )}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           )}

//           {/* Add New Members Section */}
//           {auth.id === group?.admin?._id && (
//             <div className="card shadow-sm mb-4">
//               <div className="card-header bg-light">
//                 <h6 className="mb-0 text-dark">Add Members</h6>
//               </div>
//               <div className="card-body">
//                 <ul className="list-group list-group-flush">
//                   {users
//                     .filter(
//                       (u) =>
//                         !group.members.some(
//                           (m) => m.userId?._id.toString() === u._id.toString()
//                         )
//                     )
//                     .map((u) => (
//                       <li
//                         key={u._id}
//                         className="list-group-item d-flex justify-content-between align-items-center"
//                       >
//                         <span>
//                           {u.email} <span className="text-muted">({u.name || "No name"})</span>
//                         </span>
//                         <button
//                           className="btn btn-sm btn-success"
//                           onClick={() => handleAddMember(u._id)}
//                         >
//                           Add
//                         </button>
//                       </li>
//                     ))}
//                 </ul>
//               </div>
//             </div>
//           )}

//           {group && (
//             <>
//               {/* Action Button */}
//               <div className="mb-4">
//                 <Link
//                   to={`/groups/${groupId}/add-expense`}
//                   className="btn btn-success btn-lg shadow-sm"
//                   style={{ minWidth: "150px" }}
//                 >
//                   + Add Expense
//                 </Link>
//               </div>

//               {/* Expenses Section */}
//               <div className="card shadow-sm">
//                 <div className="card-header bg-light">
//                   <h4 className="mb-0 text-dark">Expenses</h4>
//                 </div>
//                 <div className="card-body p-0">
//                   {expenses.length > 0 ? (
//                     <ul className="list-group list-group-flush">
//                       {expenses.map((e) => (
//                         <li key={e._id} className="list-group-item py-3">
//                           <div className="d-flex justify-content-between align-items-start mb-2">
//                             <h6 className="mb-1 fw-bold">{e.description}</h6>
//                             <span className="badge bg-primary fs-6">
//                               ₹{e.amount}
//                             </span>
//                           </div>
//                           <p className="mb-2 text-muted small">
//                             Paid by <strong>{e.paidBy?.email}</strong>
//                           </p>
//                           <div className="mt-2">
//                             <small className="text-muted fw-semibold">
//                               Split Details:
//                             </small>
//                             <ul className="list-unstyled mt-1 ms-3">
//                               {e.splits.map((s) => (
//                                 <li
//                                   key={s.userId?._id}
//                                   className="small text-secondary"
//                                 >
//                                   {s.userId?.email} -{" "}
//                                   <span className="fw-semibold">₹{s.share}</span>
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                         </li>
//                       ))}
//                     </ul>
//                   ) : (
//                     <div className="text-center py-5">
//                       <div className="text-muted">
//                         <h5>No expenses yet</h5>
//                         <p>Add your first expense to get started!</p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default GroupDetails;


//chnage code//
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [group, setGroup] = useState(null);
  const [users, setUsers] = useState([]); // all users
  const auth = JSON.parse(localStorage.getItem("ourstorage"));

  useEffect(() => {
    // Fetch group info
    fetch(`http://localhost:4000/safepay/group/${groupId}`)
      .then((res) => res.json())
      .then((data) => setGroup(data));

    // Fetch expenses
    fetch(`http://localhost:4000/safepay/expenses/${groupId}`)
      .then((res) => res.json())
      .then((data) => setExpenses(data || []));

    // Fetch all users (for adding new members)
    fetch("http://localhost:4000/safepay/users")
      .then((res) => res.json())
      .then(setUsers);
  }, [groupId]);

  // Only check for auth, not auth.user
  if (!auth) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Please log in to view this page.
        </div>
      </div>
    );
  }

  // Add member
  const handleAddMember = async (userId) => {
    const res = await fetch(
      `http://localhost:4000/safepay/${groupId}/add-member`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, adminId: auth.id }),
      }
    );
    const data = await res.json();
    setGroup(data); // refresh group state
  };

  // Remove member
  const handleRemoveMember = async (userId) => {
    const res = await fetch(
      `http://localhost:4000/safepay/${groupId}/remove-member`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, adminId: auth.id }),
      }
    );
    const data = await res.json();
    setGroup(data); // refresh group state
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          {/* Header with Back Button */}
          <div className="d-flex align-items-center mb-4">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-outline-secondary me-3"
              style={{ minWidth: "100px" }}
            >
              ← Back
            </button>
            <div>
              {group && (
                <div className="mb-3">
                  <h6 className="text-muted">Admin:</h6>
                  <p className="fw-semibold">{group.admin?.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Members Section */}
          {group && group.members?.length > 0 && (
            <div className="mb-4">
              <h6 className="text-muted">Members:</h6>
              <ul className="list-unstyled ms-3">
                {group.members.map((m) => (
                  <li
                    key={m.userId?._id}
                    className="d-flex justify-content-between"
                  >
                    <span>
                      {m.userId?.email} ({m.profileRef?.name || "No name"})
                    </span>
                    {/* Show Remove button only for admin */}
                    {auth.id === group.admin?._id && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRemoveMember(m.userId._id)}
                      >
                        Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Add New Members Section */}
          {auth.id === group?.admin?._id && (
            <div className="mb-4">
              <h6 className="text-muted">Add Members:</h6>
              <ul className="list-unstyled ms-3">
                {users
                  .filter(
                    (u) =>
                      !group.members.some(
                        (m) => m.userId?._id.toString() === u._id.toString()
                      )
                  )
                  .map((u) => (
                    <li
                      key={u._id}
                      className="d-flex justify-content-between"
                    >
                      <span>
                        {u.email} ({u.name || "No name"})
                      </span>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleAddMember(u._id)}
                      >
                        Add
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {group && (
            <>
              {/* Action Button */}
              <div className="mb-4">
                <Link
                  to={`/groups/${groupId}/add-expense`}
                  className="btn btn-success btn-lg shadow-sm"
                  style={{ minWidth: "150px" }}
                >
                  + Add Expense
                </Link>
              </div>

              {/* Expenses Section */}
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h4 className="mb-0 text-dark">Expenses</h4>
                </div>
                <div className="card-body p-0">
                  {expenses.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {expenses.map((e) => (
                        <li key={e._id} className="list-group-item py-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-1 fw-bold">{e.description}</h6>
                            <span className="badge bg-primary fs-6">
                              ₹{e.amount}
                            </span>
                          </div>
                          <p className="mb-2 text-muted small">
                            Paid by <strong>{e.paidBy?.email}</strong>
                          </p>
                          <div className="mt-2">
                            <small className="text-muted fw-semibold">
                              Split Details:
                            </small>
                            <ul className="list-unstyled mt-1 ms-3">
                              {e.splits.map((s) => (
                                <li
                                  key={s.userId?._id}
                                  className="small text-secondary"
                                >
                                  {s.userId?.email} -{" "}
                                 <span className="fw-semibold">₹{Number(s.share).toFixed(2)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-5">
                      <div className="text-muted">
                        <h5>No expenses yet</h5>
                        <p>Add your first expense to get started!</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupDetails;