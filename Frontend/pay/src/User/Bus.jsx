// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaBus, FaCheckCircle, FaDownload } from "react-icons/fa";
// import Header from "./Header";

// function BusBooking() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     from: "",
//     to: "",
//     date: "",
//     passengerName: "",
//     seatCount: 1,
//     amount: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [recentBookings, setRecentBookings] = useState([]);
//   const user = JSON.parse(localStorage.getItem("ourstorage"));

//   // Fetch recent bus bookings
//   const fetchRecentBookings = async () => {
//     if (!user?.id && !user?._id) return;
//     try {
//       const res = await fetch(
//         `http://localhost:4000/safepay/history/${user._id || user.id}`
//       );
//       const data = await res.json();
//       if (data.success && Array.isArray(data.transactions)) {
//         // Only show bus bookings, latest 5
//         setRecentBookings(
//           data.transactions
//             .filter(
//               (txn) => txn.serviceType === "bus_booking"
//             )
//             .slice(0, 5)
//         );
//       }
//     } catch (err) {
//       setRecentBookings([]);
//     }
//   };

//   useEffect(() => {
//     fetchRecentBookings();
//     // eslint-disable-next-line
//   }, []);

//   // Handle input fields
//   const handleInputChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]:
//         e.target.name === "seatCount"
//           ? Math.max(1, +e.target.value)
//           : e.target.value,
//     });
//   };

//   // Load Razorpay SDK dynamically
//   const loadRazorpayScript = () => {
//     return new Promise((resolve) => {
//       if (document.getElementById("razorpay-script")) {
//         resolve(true);
//         return;
//       }
//       const script = document.createElement("script");
//       script.id = "razorpay-script";
//       script.src = "https://checkout.razorpay.com/v1/checkout.js";
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//       document.body.appendChild(script);
//     });
//   };

//   // Download invoice PDF
//   const handleDownloadInvoice = async (serviceId) => {
//     try {
//       const res = await fetch(
//         `http://localhost:4000/safepay/invoice/${serviceId}`,
//         { method: "GET" }
//       );
//       if (!res.ok) throw new Error("Failed to download ticket/invoice");
//       const blob = await res.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `bus_booking${serviceId}.pdf`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       alert("Could not download ticket/invoice.");
//     }
//   };

//   // Submit booking
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (
//       !formData.amount ||
//       formData.amount <= 0 ||
//       !formData.from ||
//       !formData.to ||
//       !formData.date ||
//       !formData.passengerName
//     ) {
//       alert("Please fill all fields and enter a valid amount");
//       return;
//     }

//     setLoading(true);

//     try {
//       // 1. Create Razorpay order from backend
//       const res = await fetch("http://localhost:4000/safepay/create-service", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           serviceType: "bus_booking",
//           serviceDetails: `${formData.from} → ${formData.to} | ${formData.passengerName} | ${formData.seatCount} seat(s) | ${formData.date}`,
//           amount: Number(formData.amount),
//           userId: user?.id,
//         }),
//       });

//       const data = await res.json();

//       if (!data.success) {
//         alert("Failed to create booking: " + data.message);
//         setLoading(false);
//         return;
//       }

//       const createdServiceId = data.serviceId;

//       // 2. Load Razorpay SDK
//       const isLoaded = await loadRazorpayScript();
//       if (!isLoaded) {
//         alert("Payment SDK failed to load");
//         setLoading(false);
//         return;
//       }

//       // 3. Open Razorpay Checkout
//       const options = {
//         key: "rzp_test_4Ex6Tyjkp79GFy",
//         amount: data.order.amount,
//         currency: "INR",
//         name: "SafePay",
//         description: "Bus Ticket Booking",
//         order_id: data.order.id,
//         handler: async (response) => {
//           try {
//             // 4. Verify payment with backend
//             const verifyRes = await fetch(
//               "http://localhost:4000/safepay/verify-service",
//               {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                   razorpayOrderId: response.razorpay_order_id,
//                   razorpayPaymentId: response.razorpay_payment_id,
//                   razorpaySignature: response.razorpay_signature,
//                   serviceId: createdServiceId,
//                 }),
//               }
//             );

//             const verifyData = await verifyRes.json();

//             if (verifyData.success) {
//               alert("✅ Booking successful! Ticket issued.");
//               setFormData({
//                 from: "",
//                 to: "",
//                 date: "",
//                 passengerName: "",
//                 seatCount: 1,
//                 amount: "",
//               });
//               fetchRecentBookings(); // Refresh list
//             } else {
//               alert("❌ Payment verification failed!");
//             }
//           } catch (error) {
//             console.error(error);
//             alert("Error verifying booking/payment!");
//           }
//         },
//         theme: { color: "#f4c430" },
//       };

//       const razorpay = new window.Razorpay(options);
//       razorpay.open();
//     } catch (error) {
//       console.error(error);
//       alert("❌ Error initiating booking: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <Header />
//       <div className="container py-4">
//         <div className="row justify-content-center">
//           <div className="col-lg-6">
//             {/* Header with Back Button */}
//             <div className="d-flex align-items-center mb-4">
//               <button
//                 onClick={() => navigate(-1)}
//                 className="btn btn-outline-secondary me-3"
//                 style={{ minWidth: "100px" }}
//               >
//                 ← Back
//               </button>
//               <div>
//                 <h3 className="mb-1">Bus Ticket Booking</h3>
//                 <p className="text-muted mb-0">Book your bus journey instantly and securely</p>
//               </div>
//             </div>

//             <div className="card shadow-lg border-0">
//               <div className="card-body p-4">
//                 {/* Header Icon */}
//                 <div className="text-center mb-4">
//                   <div
//                     className="bg-warning-subtle rounded-circle d-inline-flex align-items-center justify-content-center"
//                     style={{ width: "80px", height: "80px" }}
//                   >
//                     <FaBus className="text-warning" style={{ fontSize: "2.5rem" }} />
//                   </div>
//                   <h5 className="mt-3 text-dark fw-bold">Quick Bus Booking</h5>
//                 </div>

//                 <form onSubmit={handleSubmit}>
//                   {/* From */}
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold">
//                       From (City)
//                     </label>
//                     <input
//                       type="text"
//                       className="form-control form-control-lg border-2"
//                       placeholder="Departure city"
//                       name="from"
//                       value={formData.from}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>

//                   {/* To */}
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold">
//                       To (City)
//                     </label>
//                     <input
//                       type="text"
//                       className="form-control form-control-lg border-2"
//                       placeholder="Arrival city"
//                       name="to"
//                       value={formData.to}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>

//                   {/* Date */}
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold">
//                       Journey Date
//                     </label>
//                     <input
//                       type="date"
//                       className="form-control form-control-lg border-2"
//                       name="date"
//                       value={formData.date}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>

//                   {/* Passenger Name */}
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold">
//                       Passenger Name
//                     </label>
//                     <input
//                       type="text"
//                       className="form-control form-control-lg border-2"
//                       name="passengerName"
//                       placeholder="Passenger full name"
//                       value={formData.passengerName}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>

//                   {/* Seat Count */}
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold">
//                       Number of Seats
//                     </label>
//                     <input
//                       type="number"
//                       className="form-control form-control-lg border-2"
//                       name="seatCount"
//                       min="1"
//                       value={formData.seatCount}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>

//                   {/* Amount */}
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold">
//                       Amount (₹)
//                     </label>
//                     <input
//                       type="number"
//                       className="form-control form-control-lg border-2"
//                       placeholder="Total fare (auto or manual)"
//                       name="amount"
//                       value={formData.amount}
//                       onChange={handleInputChange}
//                       min="1"
//                       required
//                     />
//                   </div>

//                   {/* Payment Info */}
//                   <div className="alert alert-info border-0 mb-4">
//                     <div className="d-flex align-items-center">
//                       <FaCheckCircle className="text-info me-2" />
//                       <small>
//                         <strong>Secure Payment:</strong> Your booking and payment are protected.
//                       </small>
//                     </div>
//                   </div>

//                   <button
//                     type="submit"
//                     className="btn btn-warning btn-lg w-100 shadow-sm"
//                     disabled={loading}
//                     style={{ minHeight: "50px" }}
//                   >
//                     {loading ? (
//                       <>
//                         <span className="spinner-border spinner-border-sm me-2" role="status"></span>
//                         Processing Payment...
//                       </>
//                     ) : (
//                       <>
//                         <FaBus className="me-2" />
//                         Book Ticket - ₹{formData.amount || "0"}
//                       </>
//                     )}
//                   </button>
//                 </form>
//               </div>
//             </div>

//             {/* Recent Bookings */}
//             <div className="card mt-4 border-0 shadow-sm">
//               <div className="card-header bg-light border-0">
//                 <h6 className="mb-0 text-dark">
//                   Recent Bus Bookings
//                 </h6>
//               </div>
//               <div className="card-body">
//                 {recentBookings.length === 0 ? (
//                   <div className="text-center text-muted py-3">
//                     <i className="bi bi-receipt" style={{ fontSize: "2rem" }}></i>
//                     <p className="mt-2 mb-0">No recent bookings found</p>
//                     <small>Your ticket history will appear here</small>
//                   </div>
//                 ) : (
//                   <ul className="list-group">
//                     {recentBookings.map((booking) => (
//                       <li
//                         key={booking._id}
//                         className="list-group-item d-flex justify-content-between align-items-center"
//                       >
//                         <div>
//                           <span className="fw-bold text-success">₹{booking.amount}</span>{" "}
//                           <span className="text-muted ms-2">
//                             {booking.serviceDetails}
//                           </span>
//                           <br />
//                           <small className="text-muted">
//                             {new Date(booking.createdAt).toLocaleString("en-IN", {
//                               day: "2-digit",
//                               month: "short",
//                               year: "numeric",
//                               hour: "2-digit",
//                               minute: "2-digit",
//                             })}
//                           </small>
//                         </div>
//                         <button
//                           className="btn btn-outline-primary btn-sm"
//                           onClick={() => handleDownloadInvoice(booking._id)}
//                         >
//                           <FaDownload className="me-1" />
//                           Ticket
//                         </button>
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default BusBooking;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBus, FaCheckCircle, FaDownload } from "react-icons/fa";
import Header from "./Header";

function BusBooking() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: "",
    passengerName: "",
    seatCount: 1,
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [recentBookings, setRecentBookings] = useState([]);
  const user = JSON.parse(localStorage.getItem("ourstorage"));
  const [errors, setErrors] = useState({
    from: "",
    to: "",
    date: "",
    passengerName: "",
    seatCount: "",
    amount: "",
  });

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case "from":
      case "to":
        if (!value) return "This field is required.";
        if (!/^[a-zA-Z\s]+$/.test(value)) return "Only letters and spaces allowed.";
        return "";
      case "date":
        if (!value) return "Date is required.";
        if (new Date(value) < new Date()) return "Date cannot be in the past.";
        return "";
      case "passengerName":
        if (!value) return "Passenger name is required.";
        if (!/^[a-zA-Z\s]+$/.test(value)) return "Only letters and spaces allowed.";
        return "";
      case "seatCount":
        if (!value || isNaN(value) || value < 1) return "At least 1 seat required.";
        return "";
      case "amount":
        if (!value || isNaN(value) || value <= 0) return "Enter a valid amount.";
        return "";
      default:
        return "";
    }
  };

  // Fetch recent bus bookings
  const fetchRecentBookings = async () => {
    if (!user?.id && !user?._id) return;
    try {
      const res = await fetch(
        `http://localhost:4000/safepay/history/${user._id || user.id}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.transactions)) {
        setRecentBookings(
          data.transactions
            .filter((txn) => txn.serviceType === "bus_booking")
            .slice(0, 5)
        );
      }
    } catch (err) {
      setRecentBookings([]);
    }
  };

  useEffect(() => {
    fetchRecentBookings();
    // eslint-disable-next-line
  }, []);

  // Handle input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "seatCount" ? Math.max(1, +value) : value,
    });
    setErrors({
      ...errors,
      [name]: validateField(name, value),
    });
  };

  // Load Razorpay SDK dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Download invoice PDF
  const handleDownloadInvoice = async (serviceId) => {
    try {
      const res = await fetch(
        `http://localhost:4000/safepay/invoice/${serviceId}`,
        { method: "GET" }
      );
      if (!res.ok) throw new Error("Failed to download ticket/invoice");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bus_booking${serviceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Could not download ticket/invoice.");
    }
  };

  // Submit booking
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submit
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      newErrors[key] = validateField(key, formData[key]);
    });
    setErrors(newErrors);

    // If any error, stop submit
    if (Object.values(newErrors).some((err) => err)) {
      alert("Please fix the errors before submitting.");
      return;
    }

    setLoading(true);

    try {
            // 1. Check deposit before payment
            const accountRes = await fetch(`http://localhost:4000/safepay/account/${user?.id || user?._id}`);
            const accountData = await accountRes.json();
            if (!accountData.success) {
                alert("Account not found");
                setLoading(false);
                return;
            }
            if (accountData.deposit < Number(formData.amount)) {
                alert("Insufficient deposit balance. Please add funds to your account.");
                setLoading(false);
                return;
            }
      // 1. Create Razorpay order from backend
      const res = await fetch("http://localhost:4000/safepay/create-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: "bus_booking",
          serviceDetails: `${formData.from} → ${formData.to} | ${formData.passengerName} | ${formData.seatCount} seat(s) | ${formData.date}`,
          amount: Number(formData.amount),
          userId: user?.id,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Failed to create booking: " + data.message);
        setLoading(false);
        return;
      }

      const createdServiceId = data.serviceId;

      // 2. Load Razorpay SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Payment SDK failed to load");
        setLoading(false);
        return;
      }

      // 3. Open Razorpay Checkout
      const options = {
        key: "rzp_test_4Ex6Tyjkp79GFy",
        amount: data.order.amount,
        currency: "INR",
        name: "SafePay",
        description: "Bus Ticket Booking",
        order_id: data.order.id,
        handler: async (response) => {
          try {
            // 4. Verify payment with backend
            const verifyRes = await fetch(
              "http://localhost:4000/safepay/verify-service",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  serviceId: createdServiceId,
                }),
              }
            );

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              alert("✅ Booking successful! Ticket issued.");
              setFormData({
                from: "",
                to: "",
                date: "",
                passengerName: "",
                seatCount: 1,
                amount: "",
              });
              fetchRecentBookings(); // Refresh list
            } else {
              alert("❌ Payment verification failed!");
            }
          } catch (error) {
            console.error(error);
            alert("Error verifying booking/payment!");
          }
        },
        theme: { color: "#f4c430" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error(error);
      alert("❌ Error initiating booking: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-6">
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
                <h3 className="mb-1">Bus Ticket Booking</h3>
                <p className="text-muted mb-0">Book your bus journey instantly and securely</p>
              </div>
            </div>

            <div className="card shadow-lg border-0">
              <div className="card-body p-4">
                {/* Header Icon */}
                <div className="text-center mb-4">
                  <div
                    className="bg-warning-subtle rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <FaBus className="text-warning" style={{ fontSize: "2.5rem" }} />
                  </div>
                  <h5 className="mt-3 text-dark fw-bold">Quick Bus Booking</h5>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* From */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      From (City)
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg border-2 ${errors.from ? "is-invalid" : ""}`}
                      placeholder="Departure city"
                      name="from"
                      value={formData.from}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.from && (
                      <div className="invalid-feedback" style={{ display: "block" }}>
                        {errors.from}
                      </div>
                    )}
                  </div>

                  {/* To */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      To (City)
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg border-2 ${errors.to ? "is-invalid" : ""}`}
                      placeholder="Arrival city"
                      name="to"
                      value={formData.to}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.to && (
                      <div className="invalid-feedback" style={{ display: "block" }}>
                        {errors.to}
                      </div>
                    )}
                  </div>

                  {/* Date */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Journey Date
                    </label>
                    <input
                      type="date"
                      className={`form-control form-control-lg border-2 ${errors.date ? "is-invalid" : ""}`}
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.date && (
                      <div className="invalid-feedback" style={{ display: "block" }}>
                        {errors.date}
                      </div>
                    )}
                  </div>

                  {/* Passenger Name */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Passenger Name
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg border-2 ${errors.passengerName ? "is-invalid" : ""}`}
                      name="passengerName"
                      placeholder="Passenger full name"
                      value={formData.passengerName}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.passengerName && (
                      <div className="invalid-feedback" style={{ display: "block" }}>
                        {errors.passengerName}
                      </div>
                    )}
                  </div>

                  {/* Seat Count */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Number of Seats
                    </label>
                    <input
                      type="number"
                      className={`form-control form-control-lg border-2 ${errors.seatCount ? "is-invalid" : ""}`}
                      name="seatCount"
                      min="1"
                      value={formData.seatCount}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.seatCount && (
                      <div className="invalid-feedback" style={{ display: "block" }}>
                        {errors.seatCount}
                      </div>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      className={`form-control form-control-lg border-2 ${errors.amount ? "is-invalid" : ""}`}
                      placeholder="Total fare (auto or manual)"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                    {errors.amount && (
                      <div className="invalid-feedback" style={{ display: "block" }}>
                        {errors.amount}
                      </div>
                    )}
                  </div>

                  {/* Payment Info */}
                  <div className="alert alert-info border-0 mb-4">
                    <div className="d-flex align-items-center">
                      <FaCheckCircle className="text-info me-2" />
                      <small>
                        <strong>Secure Payment:</strong> Your booking and payment are protected.
                      </small>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-warning btn-lg w-100 shadow-sm"
                    disabled={loading}
                    style={{ minHeight: "50px" }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <FaBus className="me-2" />
                        Book Ticket - ₹{formData.amount || "0"}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="card mt-4 border-0 shadow-sm">
              <div className="card-header bg-light border-0">
                <h6 className="mb-0 text-dark">
                  Recent Bus Bookings
                </h6>
              </div>
              <div className="card-body">
                {recentBookings.length === 0 ? (
                  <div className="text-center text-muted py-3">
                    <i className="bi bi-receipt" style={{ fontSize: "2rem" }}></i>
                    <p className="mt-2 mb-0">No recent bookings found</p>
                    <small>Your ticket history will appear here</small>
                  </div>
                ) : (
                  <ul className="list-group">
                    {recentBookings.map((booking) => (
                      <li
                        key={booking._id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <span className="fw-bold text-success">₹{booking.amount}</span>{" "}
                          <span className="text-muted ms-2">
                            {booking.serviceDetails}
                          </span>
                          <br />
                          <small className="text-muted">
                            {new Date(booking.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </small>
                        </div>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleDownloadInvoice(booking._id)}
                        >
                          <FaDownload className="me-1" />
                          Ticket
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BusBooking;