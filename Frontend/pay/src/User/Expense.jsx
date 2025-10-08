// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";

// function Expense() {
//   const { groupId } = useParams();
//   const navigate = useNavigate();
//   const [amount, setAmount] = useState("");
//   const [description, setDescription] = useState("");
//   const [members, setMembers] = useState([]);
//   const [selectedMembers, setSelectedMembers] = useState([]);
//   const [splitType, setSplitType] = useState("equal");
//   const [percentages, setPercentages] = useState({});
//   const [customShares, setCustomShares] = useState({});
//   const [loading, setLoading] = useState(false);

//   // Get logged-in user from localStorage
//   const user = JSON.parse(localStorage.getItem("ourstorage"));

//   // Fetch group members
//   useEffect(() => {
//     if (!groupId) return;
//     fetch(`http://localhost:4000/safepay/group/${groupId}`)
//       .then((res) => res.json())
//       .then((data) => {
//         setMembers(data.members || []);
//       });
//   }, [groupId]);

//   // Handle member selection
//   const handleMemberSelect = (userId) => {
//     setSelectedMembers((prev) =>
//       prev.includes(userId)
//         ? prev.filter((id) => id !== userId)
//         : [...prev, userId]
//     );
//   };

//   // Handle percent input for percentage split
//   const handlePercentChange = (userId, value) => {
//     setPercentages({ ...percentages, [userId]: value });
//   };

//   // Handle share input for custom split
//   const handleCustomShareChange = (userId, value) => {
//     setCustomShares({ ...customShares, [userId]: value });
//   };

//   // Validate splits before submit
//   const validateSplits = () => {
//     if (splitType === "percentage") {
//       const total = selectedMembers.reduce(
//         (sum, userId) => sum + Number(percentages[userId] || 0),
//         0
//       );
//       if (total !== 100) {
//         alert("Total percentage must be 100%");
//         return false;
//       }
//     }
//     if (splitType === "custom") {
//       const total = selectedMembers.reduce(
//         (sum, userId) => sum + Number(customShares[userId] || 0),
//         0
//       );
//       if (total !== Number(amount)) {
//         alert("Sum of custom shares must equal total amount");
//         return false;
//       }
//     }
//     return true;
//   };

//   // Submit handler
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!amount || !description || selectedMembers.length === 0) {
//       alert("Please fill all fields and select at least one member.");
//       return;
//     }
//     if (!validateSplits()) return;

//     setLoading(true);

//     let splits = [];
//     if (splitType === "equal") {
//       splits = selectedMembers.map((userId) => ({ userId }));
//     } else if (splitType === "percentage") {
//       splits = selectedMembers.map((userId) => ({
//         userId,
//         percent: Number(percentages[userId] || 0),
//       }));
//     } else if (splitType === "custom") {
//       splits = selectedMembers.map((userId) => ({
//         userId,
//         share: Number(customShares[userId] || 0),
//       }));
//     }

//     try {
//       const res = await fetch("http://localhost:4000/safepay/addexpense", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           groupId,
//           paidBy: user.id || user._id,
//           amount: Number(amount),
//           description,
//           splitType,
//           splits,
//         }),
//       });
//       const data = await res.json();
//       setLoading(false);
//       if (data.success) {
//         alert("Expense added!");
//         navigate(-1); // Go back to group details
//       } else {
//         alert("Error: " + (data.error || "Could not add expense"));
//       }
//     } catch (err) {
//       setLoading(false);
//       alert("Network error");
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h3>Add Expense</h3>
//       <form onSubmit={handleSubmit}>
//         <div className="mb-3">
//           <label>Description</label>
//           <input
//             className="form-control"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             required
//           />
//         </div>
//         <div className="mb-3">
//           <label>Amount</label>
//           <input
//             className="form-control"
//             type="number"
//             min="1"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//             required
//           />
//         </div>
//         <div className="mb-3">
//           <label>Split Type</label>
//           <select
//             className="form-select"
//             value={splitType}
//             onChange={(e) => setSplitType(e.target.value)}
//           >
//             <option value="equal">Equal</option>
//             <option value="percentage">Percentage</option>
//             <option value="custom">Custom</option>
//           </select>
//         </div>
//         <div className="mb-3">
//           <label>Select Members</label>
//           <ul className="list-group">
//             {members.map((m) => (
//               <li key={m.userId?._id || m.userId} className="list-group-item">
//                 <input
//                   type="checkbox"
//                   checked={selectedMembers.includes(m.userId?._id || m.userId)}
//                   onChange={() =>
//                     handleMemberSelect(m.userId?._id || m.userId)
//                   }
//                 />
//                 {" "}
//                 {m.userId?.email} ({m.profileRef?.name || "No name"})
//                 {splitType === "percentage" && selectedMembers.includes(m.userId?._id || m.userId) && (
//                   <input
//                     type="number"
//                     min="0"
//                     max="100"
//                     className="ms-2"
//                     style={{ width: 70 }}
//                     placeholder="%"
//                     value={percentages[m.userId?._id || m.userId] || ""}
//                     onChange={(e) =>
//                       handlePercentChange(m.userId?._id || m.userId, e.target.value)
//                     }
//                     required
//                   />
//                 )}
//                 {splitType === "custom" && selectedMembers.includes(m.userId?._id || m.userId) && (
//                   <input
//                     type="number"
//                     min="0"
//                     className="ms-2"
//                     style={{ width: 90 }}
//                     placeholder="₹"
//                     value={customShares[m.userId?._id || m.userId] || ""}
//                     onChange={(e) =>
//                       handleCustomShareChange(m.userId?._id || m.userId, e.target.value)
//                     }
//                     required
//                   />
//                 )}
//               </li>
//             ))}
//           </ul>
//         </div>
//         <button className="btn btn-success" type="submit" disabled={loading}>
//           {loading ? "Adding..." : "Add Expense"}
//         </button>
//       </form>
//     </div>
//   );
// }

// export default Expense;


// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";

// function Expense() {
//   const { groupId } = useParams();

//   const [amount, setAmount] = useState("");
//   const [description, setDescription] = useState("");
//   const [members, setMembers] = useState([]);
//   const [selectedMembers, setSelectedMembers] = useState([]);
//   const [splitType, setSplitType] = useState("equal");

//   const user = JSON.parse(localStorage.getItem("ourstorage"));

//   // Fetch group members
//   useEffect(() => {
//     if (!groupId) return; // avoid fetch if undefined

//     fetch(`http://localhost:4000/safepay/group/${groupId}`)
//       .then(res => res.json())
//       .then(data => {
//         console.log("Group data:", data);
//         if (data) setMembers(data.members || []);
//       })
//       .catch(err => console.error("Error fetching group:", err));
//   }, [groupId]);


//   const toggleMember = (member) => {
//     if (selectedMembers.find(m => m.userId === member.userId)) {
//       setSelectedMembers(selectedMembers.filter(m => m.userId !== member.userId));
//     } else {
//       setSelectedMembers([...selectedMembers, { userId: member.userId }]);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const res = await fetch("http://localhost:4000/safepay/addexpense", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         groupId,
//         paidBy: user.id || user._id,
//         amount,
//         description,
//         splitType,
//         splits: selectedMembers
//       })
//     });

//     const data = await res.json();
//     if (data.success) {
//       alert("Expense added!");
//       setAmount("");
//       setDescription("");
//       setSelectedMembers([]);
//     } else {
//       alert("Error: " + data.error);
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h3>Add Expense</h3>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder="Description"
//           className="form-control mb-2"
//           value={description}
//           onChange={e => setDescription(e.target.value)}
//           required
//         />
//         <input
//           type="number"
//           placeholder="Amount"
//           className="form-control mb-2"
//           value={amount}
//           onChange={e => setAmount(e.target.value)}
//           required
//         />

//         <label className="form-label">Split Type</label>
//         <select
//           className="form-select mb-3"
//           value={splitType}
//           onChange={e => setSplitType(e.target.value)}
//         >
//           <option value="equal">Equal</option>
//           <option value="percentage">Percentage</option>
//           <option value="custom">Custom</option>
//         </select>

//         <h5>Select Members</h5>
//         {members.map(m => (
//           <label key={m.userId} style={{ display: "block" }}>
//             <input
//               type="checkbox"
//               checked={!!selectedMembers.find(sel => sel.userId === m.userId)}
//               onChange={() => toggleMember(m)}
//             />
//             {m.profileRef?.name || m.userId}
//           </label>
//         ))}

//         <button className="btn btn-success mt-3" type="submit">Add Expense</button>
//       </form>
//     </div>
//   );
// }

// export default Expense;

// change code//

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Expense() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [splitType, setSplitType] = useState("equal");
  const [percentages, setPercentages] = useState({});
  const [customShares, setCustomShares] = useState({});
  const [loading, setLoading] = useState(false);

  // Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("ourstorage"));

  // Fetch group members
  // useEffect(() => {
  //   if (!groupId) return;
  //   fetch(`http://localhost:4000/safepay/group/${groupId}`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setMembers(data.members || []);
  //     });
  // }, [groupId]);

  useEffect(() => {
  if (!groupId) return;
  fetch(`http://localhost:4000/safepay/group/${groupId}`)
    .then((res) => res.json())
    .then((data) => {
      setMembers(data.members || []);
      // Auto-select all members (including admin)
      setSelectedMembers((data.members || []).map(m => m.userId?._id || m.userId));
    });
}, [groupId]);

  // Handle member selection
  const handleMemberSelect = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle percent input for percentage split
  const handlePercentChange = (userId, value) => {
    setPercentages({ ...percentages, [userId]: value });
  };

  // Handle share input for custom split
  const handleCustomShareChange = (userId, value) => {
    setCustomShares({ ...customShares, [userId]: value });
  };

  // Validate splits before submit
  const validateSplits = () => {
    if (splitType === "percentage") {
      const total = selectedMembers.reduce(
        (sum, userId) => sum + Number(percentages[userId] || 0),
        0
      );
      if (total !== 100) {
        alert("Total percentage must be 100%");
        return false;
      }
    }
    if (splitType === "custom") {
      const total = selectedMembers.reduce(
        (sum, userId) => sum + Number(customShares[userId] || 0),
        0
      );
      if (total !== Number(amount)) {
        alert("Sum of custom shares must equal total amount");
        return false;
      }
    }
    return true;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !description || selectedMembers.length === 0) {
      alert("Please fill all fields and select at least one member.");
      return;
    }
    if (!validateSplits()) return;

    setLoading(true);

    let splits = [];
    if (splitType === "equal") {
      splits = selectedMembers.map((userId) => ({ userId }));
    } else if (splitType === "percentage") {
      splits = selectedMembers.map((userId) => ({
        userId,
        percent: Number(percentages[userId] || 0),
      }));
    } else if (splitType === "custom") {
      splits = selectedMembers.map((userId) => ({
        userId,
        share: Number(customShares[userId] || 0),
      }));
    }

    try {
      const res = await fetch("http://localhost:4000/safepay/addexpense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          paidBy: user.id || user._id,
          amount: Number(amount),
          description,
          splitType,
          splits,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        alert("Expense added!");
        navigate(-1); // Go back to group details
      } else {
        alert("Error: " + (data.error || "Could not add expense"));
      }
    } catch (err) {
      setLoading(false);
      alert("Network error");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Add Expense</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Description</label>
          <input
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Amount</label>
          <input
            className="form-control"
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Split Type</label>
          <select
            className="form-select"
            value={splitType}
            onChange={(e) => setSplitType(e.target.value)}
          >
            <option value="equal">Equal</option>
            <option value="percentage">Percentage</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div className="mb-3">
          <label>Select Members</label>
          <ul className="list-group">
            {members.map((m) => (
              <li key={m.userId?._id || m.userId} className="list-group-item">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(m.userId?._id || m.userId)}
                  onChange={() =>
                    handleMemberSelect(m.userId?._id || m.userId)
                  }
                />
                {" "}
                {m.userId?.email} ({m.profileRef?.name || "No name"})
                {splitType === "percentage" && selectedMembers.includes(m.userId?._id || m.userId) && (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="ms-2"
                    style={{ width: 70 }}
                    placeholder="%"
                    value={percentages[m.userId?._id || m.userId] || ""}
                    onChange={(e) =>
                      handlePercentChange(m.userId?._id || m.userId, e.target.value)
                    }
                    required
                  />
                )}
                {splitType === "custom" && selectedMembers.includes(m.userId?._id || m.userId) && (
                  <input
                    type="number"
                    min="0"
                    className="ms-2"
                    style={{ width: 90 }}
                    placeholder="₹"
                    value={customShares[m.userId?._id || m.userId] || ""}
                    onChange={(e) =>
                      handleCustomShareChange(m.userId?._id || m.userId, e.target.value)
                    }
                    required
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
        <button className="btn btn-success" type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Expense"}
        </button>
      </form>
    </div>
  );
}

export default Expense;