// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaHospital, FaCheckCircle, FaDownload } from "react-icons/fa";
// import Header from "./Header";

// function HospitalBill() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     hospitalName: "",
//     patientName: "",
//     patientId: "",
//     billType: "",
//     amount: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [recentBills, setRecentBills] = useState([]);
//   const user = JSON.parse(localStorage.getItem("ourstorage"));

//   // Fetch recent hospital bill payments
//   const fetchRecentBills = async () => {
//     if (!user?.id && !user?._id) return;
//     try {
//       const res = await fetch(
//         `http://localhost:4000/safepay/history/${user._id || user.id}`
//       );
//       const data = await res.json();
//       if (data.success && Array.isArray(data.transactions)) {
//         // Only show hospital bills, latest 5
//         setRecentBills(
//           data.transactions
//             .filter((txn) => txn.serviceType === "hospital_bill")
//             .slice(0, 5)
//         );
//       }
//     } catch (err) {
//       setRecentBills([]);
//     }
//   };

//   useEffect(() => {
//     fetchRecentBills();
//   }, []);

//   // Handle input fields
//   const handleInputChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
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
//       if (!res.ok) throw new Error("Failed to download bill receipt");
//       const blob = await res.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `hospital_bill_${serviceId}.pdf`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       alert("Could not download bill receipt/invoice.");
//     }
//   };

//   // Submit bill payment
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (
//       !formData.amount ||
//       formData.amount <= 0 ||
//       !formData.hospitalName ||
//       !formData.patientName ||
//       !formData.patientId ||
//       !formData.billType
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
//           serviceType: "hospital_bill",
//           serviceDetails: `${formData.hospitalName} | ${formData.patientName} (${formData.patientId}) | ${formData.billType}`,
//           amount: Number(formData.amount),
//           userId: user?.id,
//         }),
//       });

//       const data = await res.json();

//       if (!data.success) {
//         alert("Failed to create payment: " + data.message);
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
//         description: "Hospital Bill Payment",
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
//               alert("✅ Payment successful! Hospital bill paid.");
//               setFormData({
//                 hospitalName: "",
//                 patientName: "",
//                 patientId: "",
//                 billType: "",
//                 amount: "",
//               });
//               fetchRecentBills(); // Refresh list
//             } else {
//               alert("❌ Payment verification failed!");
//             }
//           } catch (error) {
//             console.error(error);
//             alert("Error verifying payment!");
//           }
//         },
//         theme: { color: "#16a085" }, // teal/green for hospital
//       };

//       const razorpay = new window.Razorpay(options);
//       razorpay.open();
//     } catch (error) {
//       console.error(error);
//       alert("❌ Error initiating payment: " + error.message);
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
//                 <h3 className="mb-1">Hospital Bill Payment</h3>
//                 <p className="text-muted mb-0">Pay your hospital bills securely online</p>
//               </div>
//             </div>

//             <div className="card shadow-lg border-0">
//               <div className="card-body p-4">
//                 {/* Header Icon */}
//                 <div className="text-center mb-4">
//                   <div
//                     className="bg-success-subtle rounded-circle d-inline-flex align-items-center justify-content-center"
//                     style={{ width: "80px", height: "80px" }}
//                   >
//                     <FaHospital className="text-success" style={{ fontSize: "2.5rem" }} />
//                   </div>
//                   <h5 className="mt-3 text-dark fw-bold">Instant Bill Payment</h5>
//                 </div>

//                 <form onSubmit={handleSubmit}>
//                   {/* Hospital Name */}
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold">Hospital Name</label>
//                     <input
//                       type="text"
//                       className="form-control form-control-lg border-2"
//                       placeholder="Hospital or clinic name"
//                       name="hospitalName"
//                       value={formData.hospitalName}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>

//                   {/* Patient Name */}
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold">Patient Name</label>
//                     <input
//                       type="text"
//                       className="form-control form-control-lg border-2"
//                       placeholder="Patient full name"
//                       name="patientName"
//                       value={formData.patientName}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>

//                   {/* Patient ID */}
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold">Patient ID / Record No.</label>
//                     <input
//                       type="text"
//                       className="form-control form-control-lg border-2"
//                       placeholder="Admission or record number"
//                       name="patientId"
//                       value={formData.patientId}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>

//                   {/* Bill Type */}
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold">Bill Type</label>
//                     <select
//                       className="form-select form-select-lg border-2"
//                       name="billType"
//                       value={formData.billType}
//                       onChange={handleInputChange}
//                       required
//                     >
//                       <option value="">Select bill type</option>
//                       <option value="treatment">Treatment</option>
//                       <option value="surgery">Surgery</option>
//                       <option value="pharmacy">Pharmacy</option>
//                       <option value="room">Room Charges</option>
//                       <option value="other">Other</option>
//                     </select>
//                   </div>

//                   {/* Amount */}
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold">Amount (₹)</label>
//                     <input
//                       type="number"
//                       className="form-control form-control-lg border-2"
//                       placeholder="Total bill amount"
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
//                         <strong>Secure Payment:</strong> Your hospital payments are protected.
//                       </small>
//                     </div>
//                   </div>

//                   <button
//                     type="submit"
//                     className="btn btn-success btn-lg w-100 shadow-sm"
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
//                         <FaHospital className="me-2" />
//                         Pay Bill - ₹{formData.amount || "0"}
//                       </>
//                     )}
//                   </button>
//                 </form>
//               </div>
//             </div>

//             {/* Recent Hospital Bills */}
//             <div className="card mt-4 border-0 shadow-sm">
//               <div className="card-header bg-light border-0">
//                 <h6 className="mb-0 text-dark">Recent Hospital Bills</h6>
//               </div>
//               <div className="card-body">
//                 {recentBills.length === 0 ? (
//                   <div className="text-center text-muted py-3">
//                     <i className="bi bi-receipt" style={{ fontSize: "2rem" }}></i>
//                     <p className="mt-2 mb-0">No recent hospital bills found</p>
//                     <small>Your hospital bill history will appear here</small>
//                   </div>
//                 ) : (
//                   <ul className="list-group">
//                     {recentBills.map((bill) => (
//                       <li
//                         key={bill._id}
//                         className="list-group-item d-flex justify-content-between align-items-center"
//                       >
//                         <div>
//                           <span className="fw-bold text-success">₹{bill.amount}</span>{" "}
//                           <span className="text-muted ms-2">
//                             {bill.serviceDetails}
//                           </span>
//                           <br />
//                           <small className="text-muted">
//                             {new Date(bill.createdAt).toLocaleString("en-IN", {
//                               day: "2-digit",
//                               month: "short",
//                               year: "numeric",
//                               hour: "2-digit",
//                               minute: "2-digit",
//                             })}
//                           </small>
//                         </div>
//                         <button
//                           className="btn btn-outline-success btn-sm"
//                           onClick={() => handleDownloadInvoice(bill._id)}
//                         >
//                           <FaDownload className="me-1" />
//                           Receipt
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

// export default HospitalBill;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHospital, FaCheckCircle, FaDownload } from "react-icons/fa";
import Header from "./Header";

function HospitalBill() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hospitalName: "",
    patientName: "",
    patientId: "",
    billType: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [recentBills, setRecentBills] = useState([]);
  const [errors, setErrors] = useState({
    hospitalName: "",
    patientName: "",
    patientId: "",
    billType: "",
    amount: "",
  });
  const user = JSON.parse(localStorage.getItem("ourstorage"));

  // Fetch recent hospital bill payments
  const fetchRecentBills = async () => {
    if (!user?.id && !user?._id) return;
    try {
      const res = await fetch(
        `http://localhost:4000/safepay/history/${user._id || user.id}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.transactions)) {
        setRecentBills(
          data.transactions
            .filter((txn) => txn.serviceType === "hospital_bill")
            .slice(0, 5)
        );
      }
    } catch (err) {
      setRecentBills([]);
    }
  };

  useEffect(() => {
    fetchRecentBills();
    // eslint-disable-next-line
  }, []);

  // Validation function (same pattern as Electricity)
  const validateField = (name, value) => {
    switch (name) {
      case "hospitalName":
        if (!value) return "Hospital name is required.";
        return "";
      case "patientName":
        if (!value) return "Patient name is required.";
        if (!/^[a-zA-Z\s]+$/.test(value)) return "Only letters and spaces allowed.";
        return "";
      case "patientId":
        if (!value) return "Patient ID is required.";
        if (!/^[a-zA-Z0-9\-]+$/.test(value)) return "Only letters, numbers, and hyphens allowed.";
        return "";
      case "billType":
        if (!value) return "Bill type is required.";
        return "";
      case "amount":
        if (!value || isNaN(value) || Number(value) <= 0) return "Amount is required and must be greater than 0.";
        return "";
      default:
        return "";
    }
  };

  // Handle input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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
      if (!res.ok) throw new Error("Failed to download bill receipt");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hospital_bill_${serviceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Could not download bill receipt/invoice.");
    }
  };

  // Submit bill payment
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
          serviceType: "hospital_bill",
          serviceDetails: `${formData.hospitalName} | ${formData.patientName} (${formData.patientId}) | ${formData.billType}`,
          amount: Number(formData.amount),
          userId: user?.id,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Failed to create payment: " + data.message);
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
        description: "Hospital Bill Payment",
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
              alert("✅ Payment successful! Hospital bill paid.");
              setFormData({
                hospitalName: "",
                patientName: "",
                patientId: "",
                billType: "",
                amount: "",
              });
              fetchRecentBills(); // Refresh list
            } else {
              alert("❌ Payment verification failed!");
            }
          } catch (error) {
            console.error(error);
            alert("Error verifying payment!");
          }
        },
        theme: { color: "#16a085" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error(error);
      alert("❌ Error initiating payment: " + error.message);
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
                <h3 className="mb-1">Hospital Bill Payment</h3>
                <p className="text-muted mb-0">Pay your hospital bills securely online</p>
              </div>
            </div>

            <div className="card shadow-lg border-0">
              <div className="card-body p-4">
                {/* Header Icon */}
                <div className="text-center mb-4">
                  <div
                    className="bg-success-subtle rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <FaHospital className="text-success" style={{ fontSize: "2.5rem" }} />
                  </div>
                  <h5 className="mt-3 text-dark fw-bold">Instant Bill Payment</h5>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Hospital Name */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Hospital Name</label>
                    <input
                      type="text"
                      className={`form-control form-control-lg border-2 ${errors.hospitalName ? "is-invalid" : ""}`}
                      placeholder="Hospital or clinic name"
                      name="hospitalName"
                      value={formData.hospitalName}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.hospitalName && (
                      <div className="invalid-feedback" style={{ display: "block" }}>
                        {errors.hospitalName}
                      </div>
                    )}
                  </div>

                  {/* Patient Name */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Patient Name</label>
                    <input
                      type="text"
                      className={`form-control form-control-lg border-2 ${errors.patientName ? "is-invalid" : ""}`}
                      placeholder="Patient full name"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.patientName && (
                      <div className="invalid-feedback" style={{ display: "block" }}>
                        {errors.patientName}
                      </div>
                    )}
                  </div>

                  {/* Patient ID */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Patient ID / Record No.</label>
                    <input
                      type="text"
                      className={`form-control form-control-lg border-2 ${errors.patientId ? "is-invalid" : ""}`}
                      placeholder="Admission or record number"
                      name="patientId"
                      value={formData.patientId}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.patientId && (
                      <div className="invalid-feedback" style={{ display: "block" }}>
                        {errors.patientId}
                      </div>
                    )}
                  </div>

                  {/* Bill Type */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Bill Type</label>
                    <select
                      className={`form-select form-select-lg border-2 ${errors.billType ? "is-invalid" : ""}`}
                      name="billType"
                      value={formData.billType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select bill type</option>
                      <option value="treatment">Treatment</option>
                      <option value="surgery">Surgery</option>
                      <option value="pharmacy">Pharmacy</option>
                      <option value="room">Room Charges</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.billType && (
                      <div className="invalid-feedback" style={{ display: "block" }}>
                        {errors.billType}
                      </div>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Amount (₹)</label>
                    <input
                      type="number"
                      className={`form-control form-control-lg border-2 ${errors.amount ? "is-invalid" : ""}`}
                      placeholder="Total bill amount"
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
                        <strong>Secure Payment:</strong> Your hospital payments are protected.
                      </small>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success btn-lg w-100 shadow-sm"
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
                        <FaHospital className="me-2" />
                        Pay Bill - ₹{formData.amount || "0"}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Recent Hospital Bills */}
            <div className="card mt-4 border-0 shadow-sm">
              <div className="card-header bg-light border-0">
                <h6 className="mb-0 text-dark">Recent Hospital Bills</h6>
              </div>
              <div className="card-body">
                {recentBills.length === 0 ? (
                  <div className="text-center text-muted py-3">
                    <i className="bi bi-receipt" style={{ fontSize: "2rem" }}></i>
                    <p className="mt-2 mb-0">No recent hospital bills found</p>
                    <small>Your hospital bill history will appear here</small>
                  </div>
                ) : (
                  <ul className="list-group">
                    {recentBills.map((bill) => (
                      <li
                        key={bill._id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <span className="fw-bold text-success">₹{bill.amount}</span>{" "}
                          <span className="text-muted ms-2">
                            {bill.serviceDetails}
                          </span>
                          <br />
                          <small className="text-muted">
                            {new Date(bill.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </small>
                        </div>
                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() => handleDownloadInvoice(bill._id)}
                        >
                          <FaDownload className="me-1" />
                          Receipt
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

export default HospitalBill;
