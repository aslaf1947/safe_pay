// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";

// export default function GroupFeed() {
//   const { groupId } = useParams();
//   const [feed, setFeed] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!groupId) return; // Don't fetch if groupId is undefined

//     fetch(`http://localhost:4000/safepay/${groupId}/feed`)
//       .then(res => {
//         if (!res.ok) throw new Error("Failed to fetch group feed");
//         return res.json();
//       })
//       .then(setFeed)
//       .catch(err => setError(err.message));
//   }, [groupId]);

//   return (
//     <div>
//       <h2>Group Activity</h2>
//       {error && <div style={{ color: "red" }}>{error}</div>}
//       {feed.length === 0 && !error && <p>No activity yet.</p>}
//       {feed.map((f, i) => (
//         <div key={i}>
//           <p>
//             {f.message} by {f.userId?.name || f.userId?.email || "Unknown"} on{" "}
//             {f.createdAt ? new Date(f.createdAt).toLocaleString() : ""}
//           </p>
//         </div>
//       ))}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function GroupFeed() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [feed, setFeed] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!groupId) return; // Don't fetch if groupId is undefined

    fetch(`http://localhost:4000/safepay/${groupId}/feed`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch group feed");
        return res.json();
      })
      .then(setFeed)
      .catch(err => setError(err.message));
  }, [groupId]);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Group Activity</h2>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {feed.length === 0 && !error && (
        <p className="text-muted">No activity yet.</p>
      )}
      
      {feed.map((f, i) => (
        <div key={i} className="card mb-3">
          <div className="card-body">
            <p className="card-text mb-0">
              {f.message} by <strong>{f.userId?.name || f.userId?.email || "Unknown"}</strong> on{" "}
              {f.createdAt ? new Date(f.createdAt).toLocaleString() : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}