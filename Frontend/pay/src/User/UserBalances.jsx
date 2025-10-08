import React, { useEffect, useState } from "react";
import Header from "./Header";

function UserBalances() {
  const user = JSON.parse(localStorage.getItem("ourstorage"));
  const userId = user?._id || user?.id; // ensure correct field

  const [balances, setBalances] = useState([]);
  const [deposit, setDeposit] = useState(0);

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:4000/safepay/user-balances/${userId}`)
      .then(res => res.json())
      .then(data => {
        setBalances(data.balances || []);
        setDeposit(data.deposit || 0);
      })
      .catch(err => console.error("Error loading balances:", err));
  }, [userId]);

  if (!userId) {
    return <p>Please log in to view your balances.</p>;
  }

  return (
    <>
      <Header />
      <div className="container mt-4">
        <h3>My Balances</h3>
        <div className="mb-3">
          <strong>Your Deposit: </strong>₹{deposit.toFixed(2)}
        </div>
        {balances.length === 0 ? (
          <p>No balances pending!</p>
        ) : (
          <ul className="list-group">
            {balances.map((b, i) => (
              <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  {b.amount > 0 ? (
                    <span>
                      {b.name || "Unknown"} ({b.email}) owes you ₹{b.amount.toFixed(2)}
                    </span>
                  ) : (
                    <span>
                       {b.name || "Unknown"} owe you ({b.email}) ₹{Math.abs(b.amount).toFixed(2)}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default UserBalances;