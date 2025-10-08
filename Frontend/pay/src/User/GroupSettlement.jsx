// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";

// function GroupSettlement() {
//   const { groupId } = useParams();
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     fetch(`http://localhost:4000/safepay/group-settlement/${groupId}`)
//       .then(res => res.json())
//       .then(setData)
//       .catch(err => console.error("❌ Fetch error:", err));
//   }, [groupId]);

//   const handleSettle = async (fromId, toId, amount) => {
//     try {
//       if (!window.Razorpay) {
//         alert("Razorpay SDK not loaded. Check index.html script.");
//         return;
//       }

//       // Step 1: Create order
//       const res = await fetch("http://localhost:4000/safepay/create-order", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ amount: amount * 100 }) // convert to paise
//       });

//       const { order } = await res.json();
//       if (!order?.id) {
//         alert("Failed to create Razorpay order.");
//         return;
//       }

//       // Step 2: Open Razorpay checkout
//       const options = {
//         key: "rzp_test_4Ex6Tyjkp79GFy", // Replace with your Razorpay test key
//         amount: order.amount,
//         currency: order.currency,
//         order_id: order.id,
//         name: "SafePay Splitter",
//         description: "Group Settlement",
//         handler: async function (response) {
//           try {
//             // Step 3: Verify + Save settlement
//             const verifyRes = await fetch(
//               `http://localhost:4000/safepay/verify-payment/${groupId}`,
//               {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                   fromId,
//                   toId,
//                   amount,
//                   ...response
//                 })
//               }
//             );

//             const result = await verifyRes.json();

//             if (result.success) {
//               alert("Settlement Successful ✅");
//               // Refresh settlement data
//               fetch(`http://localhost:4000/safepay/group-settlement/${groupId}`)
//                 .then(res => res.json())
//                 .then(setData);
//             } else {
//               alert("Settlement Failed ❌: " + result.message);
//             }
//           } catch (err) {
//             console.error("❌ Verification error:", err);
//             alert("Error verifying payment. Check console.");
//           }
//         },
//         theme: {
//           color: "#3399cc"
//         }
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err) {
//       console.error("❌ Error during settlement:", err);
//     }
//   };

//   if (!data) return <p>Loading settlements...</p>;

//   const settlements = data.settlements || [];

//   return (
//     <div className="container mt-4">
//       <h3>{data.groupName} – Settlement Suggestions</h3>
//       <ul className="list-group">
//         {settlements.length === 0 ? (
//           <li className="list-group-item">All settled 🎉</li>
//         ) : (
//           settlements.map((s, i) => (
//             <li
//               key={i}
//               className="list-group-item d-flex justify-content-between align-items-center"
//             >
//               <span>
//                 {s.from} → {s.to} : ₹{s.amount.toFixed(2)}
//               </span>
//               <button
//                 className="btn btn-sm btn-success"
//                 onClick={() => handleSettle(s.from, s.to, s.amount)}
//               >
//                 Settle Up
//               </button>
//             </li>
//           ))
//         )}
//       </ul>
//     </div>
//   );
// }

// export default GroupSettlement;
//old//

// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";

// function GroupSettlement() {
//   const { groupId } = useParams();
//   const navigate = useNavigate();
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [settling, setSettling] = useState(null);

//   // Get authenticated user from localStorage
//   const auth = JSON.parse(localStorage.getItem("ourstorage")) || null;
//   const authUserId = auth?.id;

//   // Fetch settlement data
//   useEffect(() => {
//     if (!groupId) return;
//     if (!authUserId) {
//       setLoading(false);
//       setData(null);
//       return;
//     }

//     setLoading(true);
//     fetch(`http://localhost:4000/safepay/group-settlement/${groupId}?userid=${authUserId}`)
//       .then(res => res.json())
//       .then(data => {
//         setData(data);
//         console.log("Settlement data:", data);
        
//       })
//       .catch(err => {
//         console.error("❌ Error fetching settlement data:", err);
//         setData(null);
//       })
//       .finally(() => setLoading(false));
//   }, [groupId, authUserId]);

//   // Handle settlement with Razorpay
//   const handleSettle = async (fromId, toId, amount, idx) => {
//     if (!window.Razorpay) return alert("Razorpay SDK not loaded.");
//     setSettling(idx);

//     try {
//       const res = await fetch("http://localhost:4000/safepay/create-order", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ amount: amount * 100 }),
//       });
//       const { order } = await res.json();
//       if (!order?.id) {
//         alert("Failed to create Razorpay order.");
//         setSettling(null);
//         return;
//       }

//       const options = {
//         key: "rzp_test_4Ex6Tyjkp79GFy",
//         amount: order.amount,
//         currency: order.currency,
//         order_id: order.id,
//         name: "SafePay Splitter",
//         description: "Group Settlement",
//         handler: function (response) {
//           fetch(`http://localhost:4000/safepay/verify-payment/${groupId}`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               fromId,
//               toId,
//               amount,
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_signature: response.razorpay_signature,
//             }),
//           })
//             .then(res => res.json())
//             .then(result => {
//               if (result.success) {
//                 alert("Settlement Successful ✅");
//                 // Refresh settlement data
//                 fetch(`http://localhost:4000/safepay/group-settlement/${groupId}?userid=${authUserId}&t=${Date.now()}`)
//                   .then(r => r.json())
//                   .then(d => setData(d))
//                   .catch(e => console.error(e));
//               } else {
//                 alert("Settlement Failed ❌: " + result.message);
//               }
//             })
//             .catch(err => console.error("Verification error:", err))
//             .finally(() => setSettling(null));
//         },
//         theme: { color: "#3399cc" },
//         modal: {
//           ondismiss: () => setSettling(null),
//         },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err) {
//       console.error("Error creating order:", err);
//       setSettling(null);
//     }
//   };

//   if (!authUserId)
//     return (
//       <div className="container mt-4">
//         <p className="text-center text-danger">❌ Please log in to view settlements.</p>
//       </div>
//     );

//   if (!groupId)
//     return (
//       <div className="container mt-4">
//         <p className="text-center text-danger">❌ Invalid group selected.</p>
//       </div>
//     );

//   if (loading)
//     return (
//       <p className="text-center mt-4">
//         <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>{" "}
//         Loading settlements...
//       </p>
//     );
//   if (!data)
//     return <p className="text-center text-danger mt-4">❌ Failed to load settlement data.</p>;

//   const settlements = data.settlements || [];

//   return (
//     <div className="container mt-4">
//       <h3 className="mb-3">
//         {data.groupName} – <span className="text-primary">Settlement Suggestions</span>
//       </h3>

//       <ul className="list-group">
//         {settlements.length === 0 ? (
//           <li className="list-group-item text-center">🎉 All settled up!</li>
//         ) : (
//           settlements.map((s, i) => (
//             <li
//               key={i}
//               className="list-group-item d-flex justify-content-between align-items-center"
//             >
//               <span>
//                 <strong>{s.fromName}</strong> → <strong>{s.toName}</strong> : ₹
//                 {s.amount.toFixed(2)}
//               </span>

//               {s.fromId === authUserId && s.canSettle ? (
//                 <button
//                   className="btn btn-sm btn-success"
//                   onClick={() => handleSettle(s.fromId, s.toId, s.amount, i)}
//                   disabled={settling === i}
//                 >
//                   {settling === i ? (
//                     <>
//                       <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>{" "}
//                       Settling...
//                     </>
//                   ) : (
//                     "Settle Up"
//                   )}
//                 </button>
//               ) : s.message?.toLowerCase().includes("add bank") ? (
//                 <button className="btn btn-sm btn-warning" onClick={() => navigate("/profile")}>
//                   Add Bank Details
//                 </button>
//               ) : (
//                 <span className={`small ${s.message?.includes("❌") ? "text-danger" : "text-warning"}`}>
//                   {s.message}
//                 </span>
//               )}
//             </li>
//           ))
//         )}
//       </ul>
//     </div>
//   );
// }

// export default GroupSettlement;
//new//
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function GroupSettlement() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState(null);

  // Get authenticated user from localStorage
  const auth = JSON.parse(localStorage.getItem("ourstorage")) || null;
  const authUserId = auth?.id;

  // Fetch settlement data
  useEffect(() => {
    if (!groupId) return;
    if (!authUserId) {
      setLoading(false);
      setData(null);
      return;
    }

    setLoading(true);
    fetch(`http://localhost:4000/safepay/group-settlement/${groupId}?userid=${authUserId}`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        console.log("Settlement data:", data);
        
      })
      .catch(err => {
        console.error("❌ Error fetching settlement data:", err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [groupId, authUserId]);

  // Handle settlement with Razorpay
  const handleSettle = async (fromId, toId, amount, idx) => {
    if (!window.Razorpay) return alert("Razorpay SDK not loaded.");
    setSettling(idx);

    try {
      const res = await fetch("http://localhost:4000/safepay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount * 100 }),
      });
      const { order } = await res.json();
      if (!order?.id) {
        alert("Failed to create Razorpay order.");
        setSettling(null);
        return;
      }

      const options = {
        key: "rzp_test_4Ex6Tyjkp79GFy",
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "SafePay Splitter",
        description: "Group Settlement",
        handler: function (response) {
          fetch(`http://localhost:4000/safepay/verify-payment/${groupId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fromId,
              toId,
              amount,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })
            .then(res => res.json())
            .then(result => {
              if (result.success) {
                alert("Settlement Successful ✅");
                // Refresh settlement data
                fetch(`http://localhost:4000/safepay/group-settlement/${groupId}?userid=${authUserId}&t=${Date.now()}`)
                  .then(r => r.json())
                  .then(d => setData(d))
                  .catch(e => console.error(e));
              } else {
                alert("Settlement Failed ❌: " + result.message);
              }
            })
            .catch(err => console.error("Verification error:", err))
            .finally(() => setSettling(null));
        },
        theme: { color: "#3399cc" },
        modal: {
          ondismiss: () => setSettling(null),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Error creating order:", err);
      setSettling(null);
    }
  };

  if (!authUserId)
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Please log in to view settlements.
          </div>
        </div>
      </div>
    );

  if (!groupId)
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Invalid group selected.
          </div>
        </div>
      </div>
    );

  if (loading)
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: '200px'}}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading settlements...</p>
          </div>
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Failed to load settlement data.
          </div>
        </div>
      </div>
    );

  const settlements = data.settlements || [];

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          {/* Header with Back Button */}
          <div className="d-flex align-items-center mb-4">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-outline-secondary me-3"
              style={{ minWidth: '100px' }}
            >
              ← Back
            </button>
            <div>
              <h3 className="mb-1">{data.groupName} – Settlement Suggestions</h3>
            </div>
          </div>

          {/* Settlement Card */}
          <div className="card shadow-sm">
            <div className="card-header bg-light d-flex align-items-center">
              <i className="bi bi-calculator me-2 text-primary"></i>
              <h5 className="mb-0 text-dark">Settlement Transactions</h5>
            </div>
            <div className="card-body p-0">
              {settlements.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="bi bi-check-circle-fill text-success" style={{fontSize: '3rem'}}></i>
                  </div>
                  <h5 className="text-success">All Settled Up!</h5>
                  <p className="text-muted">No pending settlements in this group.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {settlements.map((s, i) => (
                    <div
                      key={i}
                      className="list-group-item py-3"
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            <span className="badge bg-light text-dark me-2">#{i + 1}</span>
                            <div className="settlement-flow">
                              <span className="fw-bold text-primary">{s.fromName}</span>
                              <span className="mx-2 text-muted">
                                <i className="bi bi-arrow-right"></i>
                              </span>
                              <span className="fw-bold text-success">{s.toName}</span>
                            </div>
                          </div>
                          <div className="amount-display">
                            <span className="h5 text-danger mb-0">₹{s.amount.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="ms-3">
                          {s.fromId === authUserId && s.canSettle ? (
                            <button
                              className="btn btn-success shadow-sm"
                              onClick={() => handleSettle(s.fromId, s.toId, s.amount, i)}
                              disabled={settling === i}
                              style={{ minWidth: '120px' }}
                            >
                              {settling === i ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Settling...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-credit-card me-1"></i>
                                  Settle Up
                                </>
                              )}
                            </button>
                          ) : s.message?.toLowerCase().includes("add bank") ? (
                            <button 
                              className="btn btn-warning shadow-sm"
                              onClick={() => navigate("/profile")}
                              style={{ minWidth: '120px' }}
                            >
                              <i className="bi bi-bank me-1"></i>
                              Add Bank Details
                            </button>
                          ) : (
                            <div className="text-end">
                              <span className={`badge ${s.message?.includes("❌") ? "bg-danger-subtle text-danger" : "bg-warning-subtle text-warning"}`}>
                                {s.message}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupSettlement;