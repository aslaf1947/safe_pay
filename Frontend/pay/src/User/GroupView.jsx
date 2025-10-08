import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";

function GroupView() {
  const [groups, setGroups] = useState([]);
  const user = JSON.parse(localStorage.getItem("ourstorage"));

  useEffect(() => {
    fetch(`http://localhost:4000/safepay/groups/${user.id}`)
      .then(res => res.json())
      .then(data => setGroups(data));
  }, [user.id]);

  return (
    <>
    <Header></Header>
    <div className="container mt-4">
      <h2>My Groups</h2>
      <ul className="list-group">
        {groups.map(g => (
          <li key={g._id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>{g.name}</span>
            <div>
              {/* Existing View button */}
              <Link to={`/group/${g._id}`} className="btn btn-sm btn-primary me-2">
                View
              </Link>

              {/* ✅ New Balances button */}
              <Link to={`/groups/${g._id}/balances`} className="btn btn-sm btn-success me-2">
                Balances
              </Link>
              <Link to={`/groups/${g._id}/feed`} className="btn btn-sm btn-info">Activity Feed</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
    </>
  );
}

export default GroupView;
