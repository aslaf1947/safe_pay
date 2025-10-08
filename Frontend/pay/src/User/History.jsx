// import React, { useEffect, useState } from "react";
// import Header from "./Header";

// export default function TransactionHistory() {
//   const [transactions, setTransactions] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const user = JSON.parse(localStorage.getItem("ourstorage"));
//   const userId = user?._id || user?.id;

//   useEffect(() => {
//     if (!userId) return;

//     fetch(`http://localhost:4000/safepay/history/${userId}`)
//       .then(res => res.json())
//       .then(data => {
//         if (data.success) setTransactions(data.transactions);
//         setLoading(false);
//       })
//       .catch(err => {
//         console.error(err);
//         setLoading(false);
//       });
//   }, [userId]);

//   if (loading) return <p className="text-center mt-4">Loading transactions...</p>;

//   return (
//     <>
//     <Header></Header>
//     <div className="max-w-5xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow-lg">
//       <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
//       {transactions.length === 0 ? (
//         <p className="text-gray-500">No transactions found.</p>
//       ) : (
//         <table className="w-full border-collapse">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="border p-2">Type</th>
//               <th className="border p-2">From / Service</th>
//               <th className="border p-2">To</th>
//               <th className="border p-2">Amount</th>
//               <th className="border p-2">Payment Status</th>
//               <th className="border p-2">Date</th>
//             </tr>
//           </thead>
//           <tbody>
//             {transactions.map((txn, index) => (
//               <tr key={index} className="hover:bg-gray-50">
//                 <td className="border p-2">{txn.type}</td>
//                 <td className="border p-2">
//                   {txn.type === "service" ? txn.serviceType.replace("_", " ") : txn.fromUser}
//                 </td>
//                 <td className="border p-2">{txn.type === "service" ? "-" : txn.toUser}</td>
//                 <td className="border p-2">₹{txn.amount}</td>
//                 <td className="border p-2">{txn.paymentStatus || "Not Paid"}</td>
//                 <td className="border p-2">
//                   {new Date(txn.date).toLocaleString("en-IN", {
//                     day: "2-digit",
//                     month: "short",
//                     year: "numeric",
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//     </>
//   );
// }

import React, { useEffect, useState } from "react";
import Header from "./Header";

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("ourstorage"));
  const userId = user?._id || user?.id;

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:4000/safepay/history/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setTransactions(data.transactions);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <p className="text-center mt-5">Loading transactions...</p>;

  // Helper to format payment status
  const getStatusClass = (status) => {
    if (status === "Paid" || status === "success" || status === "completed") return "text-success fw-bold";
    if (status === "Failed" || status === "failed") return "text-danger fw-bold";
    return "text-warning fw-bold";
  };

  return (
    <>
      <style>{`
        .card { border-radius: 1rem; }
        .card-header { border-top-left-radius: 1rem; border-top-right-radius: 1rem; font-weight: 600; font-size: 1.3rem; }
        .table-hover tbody tr:hover { background-color: #fff3cd; transition: background-color 0.2s ease-in-out; }
        .table-responsive { overflow-x: auto; }
        .table tbody tr:nth-child(odd) { background-color: #f8f9fa; }
      `}</style>
      <Header />
      <div className="container my-5">
        <div className="card shadow-sm">
          <div className="card-header bg-warning text-dark">
            <h3 className="mb-0 text-center">Transaction History</h3>
          </div>
          <div className="card-body">
            {transactions.length === 0 ? (
              <p className="text-center text-muted">No transactions found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-warning">
                    <tr>
                      <th>Type</th>
                      <th>From / Service</th>
                      {/* <th>To</th> */}
                      <th>Amount</th>
                      <th>Payment Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn, index) => (
                      <tr key={index}>
                        <td className="text-capitalize">{txn.type || "service"}</td>
                        <td>
                          {txn.type === "service" || !txn.type
                            ? (txn.serviceType ? txn.serviceType.replace("_", " ") : "-")
                            : txn.fromUser || "-"}
                        </td>
                        {/* <td>
                          {txn.type === "service" || !txn.type
                            ? "-"
                            : txn.toUser || "-"}
                        </td> */}
                        <td className="text-success fw-bold">₹{txn.amount}</td>
                        <td className={getStatusClass(txn.paymentStatus || txn.status)}>
                          {txn.paymentStatus
                            ? txn.paymentStatus.charAt(0).toUpperCase() + txn.paymentStatus.slice(1)
                            : txn.status
                            ? txn.status.charAt(0).toUpperCase() + txn.status.slice(1)
                            : "Not Paid"}
                        </td>
                        <td className="text-muted">
                          {new Date(txn.date || txn.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
