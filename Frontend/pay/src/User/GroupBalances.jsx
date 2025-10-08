// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { Link } from "react-router-dom";

// function GroupBalances() {
//   const { groupId } = useParams();
//   console.log("groupId from URL:", groupId);
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     fetch(`http://localhost:4000/safepay/group-balances/${groupId}`)
//       .then(res => res.json())
//       .then(setData)
//       .catch(err => console.error("Error:", err));
//   }, [groupId]);

//   if (!data) return <p>Loading...</p>;

//   return (
//     <div className="container mt-4">
//       <h3>{data.groupName} – Group Balances</h3>
//       <p>Total Expense: ₹{(data.totalExpense || 0).toFixed(2)}</p>
//       <ul className="list-group">
// {data.members.map(m => (
//   <>
//     <li key={m.userId} className="list-group-item">
//       {m.name} ({m.email})
//       <br />
//       Paid: ₹{(m.paid || 0).toFixed(2)} | Share: ₹{(m.share || 0).toFixed(2)} |
//       {m.balance >= 0 ? (
//         <span> Gets Back: ₹{(m.balance || 0).toFixed(2)}</span>
//       ) : (
//         <span> Owes: ₹{Math.abs(m.balance || 0).toFixed(2)}</span>
//       )}
//     </li>
//     <Link to={`/groups/${groupId}/settlement`} className="btn btn-sm btn-warning ms-2">
//       Settlement
//     </Link>
//   </>
// ))}
//       </ul>
//     </div>
//   );
// }

// export default GroupBalances;

//new//
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function GroupBalances() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  console.log("groupId from URL:", groupId);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:4000/safepay/group-balances/${groupId}`)
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error("Error:", err));
  }, [groupId]);

  if (!data) return (
    <div className="container mt-4">
      <div className="d-flex justify-content-center align-items-center" style={{minHeight: '200px'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  );

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
              <h3 className="mb-1">{data.groupName} – Group Balances</h3>
            </div>
          </div>

          {/* Total Expense Card */}
          <div className="card shadow-sm mb-4">
            <div className="card-body text-center bg-light">
              <h5 className="card-title text-muted mb-1">Total Group Expense</h5>
              <h2 className="text-primary fw-bold">₹{(data.totalExpense || 0).toFixed(2)}</h2>
            </div>
          </div>

          {/* Members Balances */}
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0 text-dark">Member Balances</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {data.members.map(m => (
                  <div key={m.userId} className="list-group-item py-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-bold">{m.name}</h6>
                        <small className="text-muted">{m.email}</small>
                        
                        <div className="mt-2">
                          <div className="row g-2">
                            <div className="col-sm-4">
                              <small className="text-muted">Paid:</small>
                              <div className="fw-semibold text-success">₹{(m.paid || 0).toFixed(2)}</div>
                            </div>
                            <div className="col-sm-4">
                              <small className="text-muted">Share:</small>
                              <div className="fw-semibold text-info">₹{(m.share || 0).toFixed(2)}</div>
                            </div>
                            <div className="col-sm-4">
                              {m.balance >= 0 ? (
                                <>
                                  <small className="text-muted">Gets Back:</small>
                                  <div className="fw-semibold text-success">₹{(m.balance || 0).toFixed(2)}</div>
                                </>
                              ) : (
                                <>
                                  <small className="text-muted">Owes:</small>
                                  <div className="fw-semibold text-danger">₹{Math.abs(m.balance || 0).toFixed(2)}</div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ms-3">
                        <Link 
                          to={`/groups/${groupId}/settlement`} 
                          className="btn btn-warning btn-sm shadow-sm"
                          style={{ minWidth: '100px' }}
                        >
                          Settlement
                        </Link>
                      </div>
                    </div>
                    
                    {/* Balance Status Badge */}
                    <div className="mt-2">
                      {m.balance >= 0 ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          Credit: ₹{(m.balance || 0).toFixed(2)}
                        </span>
                      ) : (
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                          Debt: ₹{Math.abs(m.balance || 0).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupBalances;
