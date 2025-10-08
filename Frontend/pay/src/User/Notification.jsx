// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { FaBell, FaCheckCircle } from "react-icons/fa";

// export default function Notifications({ userId }) {
//   const [notifications, setNotifications] = useState([]);

//   useEffect(() => {
//     fetchNotifications();
//   }, []);

//   const fetchNotifications = async () => {
//     const res = await axios.get(`http://localhost:5000/api/notifications/${userId}`);
//     setNotifications(res.data.notifications);
//   };

//   const markAsRead = async (id) => {
//     await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
//     fetchNotifications();
//   };

//   return (
//     <div className="p-4 max-w-lg mx-auto bg-white shadow-lg rounded-lg">
//       <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
//         <FaBell className="text-yellow-500" /> Notifications
//       </h2>
//       {notifications.length === 0 ? (
//         <p className="text-gray-500">No notifications yet.</p>
//       ) : (
//         notifications.map((n) => (
//           <div
//             key={n._id}
//             className={`p-3 mb-2 rounded-lg shadow-sm flex justify-between items-center ${
//               n.isRead ? "bg-gray-100" : "bg-yellow-100"
//             }`}
//           >
//             <span>{n.message}</span>
//             {!n.isRead && (
//               <button
//                 onClick={() => markAsRead(n._id)}
//                 className="text-green-600 flex items-center gap-1"
//               >
//                 <FaCheckCircle /> Mark as read
//               </button>
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   );
// }
