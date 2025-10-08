// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaUniversity, FaCheckCircle, FaDownload } from "react-icons/fa";
// import Header from "./Header";

// function EducationFees() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     institution: "",
//     studentName: "",
//     studentId: "",
//     feeType: "",
//     amount: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [recentPayments, setRecentPayments] = useState([]);
//   const user = JSON.parse(localStorage.getItem("ourstorage"));

//   // Fetch recent education fee payments
//   const fetchRecentPayments = async () => {
//     if (!user?.id && !user?._id) return;
//     try {
//       const res = await fetch(
//         `http://localhost:4000/safepay/history/${user._id || user.id}`
//       );
//       const data = await res.json();
//       if (data.success && Array.isArray(data.transactions)) {
//         // Only show education fees, latest 5
//         setRecentPayments(
//           data.transactions
//             .filter((txn) => txn.serviceType === "education_fee")
//             .slice(0, 5)
//         );
//       }
//     } catch (err) {
//       setRecentPayments([]);
//     }
//   };

//   useEffect(() => {
//     fetchRecentPayments();
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
//       if (!res.ok) throw new Error("Failed to download fee receipt");
//       const blob = await res.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `education_fee_${serviceId}.pdf`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       alert("Could not download fee receipt/invoice.");
//     }
//   };

//   // Submit fee payment
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (
//       !formData.amount ||
//       formData.amount <= 0 ||
//       !formData.institution ||
//       !formData.studentName ||
//       !formData.studentId ||
//       !formData.feeType
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
//           serviceType: "education_fee",
//           serviceDetails: `${formData.institution} | ${formData.studentName} (${formData.studentId}) | ${formData.feeType}`,
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
//         description: "Education Fees Payment",
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
//               alert("✅ Payment successful! Education fee paid.");
//               setFormData({
//                 institution: "",
//                 studentName: "",
//                 studentId: "",
//                 feeType: "",
//                 amount: "",
//               });
//               fetchRecentPayments(); // Refresh list
//             } else {
//               alert("❌ Payment verification failed!");
//             }
//           } catch (error) {
//             console.error(error);
//             alert("Error verifying payment!");
//           }
//         },
//         theme: { color: "#007bff" }, // blue for education
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
//                 <h3 className="mb-1">Education Fees Payment</h3>
//                 <p className="text-muted mb-0">Pay your educational fees securely online</p>
//               </div>
//             </div>

//             <div className="card shadow-lg border-0">
//               <div className="card-body p-4">
//                 {/* Header Icon */}
//                 <div className="text-center mb-4">
//                   <div
//                     className="bg-primary-subtle rounded-circle d-inline-flex align-items-center justify-content-center"
//                     style={{ width: "80px", height: "80px" }}
//                   >
//                     <FaUniversity className="text-primary" style={{ fontSize: "2.5rem" }} />
//                   </div>
//                   <h5 className="mt-3 text-dark fw-bold">Instant Fee Payment</h5>
//                 </div>

//                 <form onSubmit={handleSubmit}>
//                   {/* Institution */}
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold">Institution</label>
//                     <input
//                       type="text"
//                       className="form-control form-control-lg border-2"
//                       placeholder="School / College / Institute name"
//                       name="institution"
//                       value={formData.institution}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>

//                   {/* Student Name */}
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold">Student Name</label>
//                     <input
//                       type="text"
//                       className="form-control form-control-lg border-2"
//                       placeholder="Student full name"
//                       name="studentName"
//                       value={formData.studentName}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>

//                   {/* Student ID */}
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold">Student ID / Roll No.</label>
//                     <input
//                       type="text"
//                       className="form-control form-control-lg border-2"
//                       placeholder="Admission number or roll no."
//                       name="studentId"
//                       value={formData.studentId}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>

//                   {/* Fee Type */}
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold">Fee Type</label>
//                     <select
//                       className="form-select form-select-lg border-2"
//                       name="feeType"
//                       value={formData.feeType}
//                       onChange={handleInputChange}
//                       required
//                     >
//                       <option value="">Select fee type</option>
//                       <option value="tuition">Tuition Fee</option>
//                       <option value="hostel">Hostel Fee</option>
//                       <option value="exam">Exam Fee</option>
//                       <option value="library">Library Fee</option>
//                       <option value="other">Other</option>
//                     </select>
//                   </div>

//                   {/* Amount */}
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold">Amount (₹)</label>
//                     <input
//                       type="number"
//                       className="form-control form-control-lg border-2"
//                       placeholder="Total amount"
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
//                         <strong>Secure Payment:</strong> Your fee payment is protected and encrypted.
//                       </small>
//                     </div>
//                   </div>

//                   <button
//                     type="submit"
//                     className="btn btn-primary btn-lg w-100 shadow-sm"
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
//                         <FaUniversity className="me-2" />
//                         Pay Fees - ₹{formData.amount || "0"}
//                       </>
//                     )}
//                   </button>
//                 </form>
//               </div>
//             </div>

//             {/* Recent Payments */}
//             <div className="card mt-4 border-0 shadow-sm">
//               <div className="card-header bg-light border-0">
//                 <h6 className="mb-0 text-dark">Recent Fee Payments</h6>
//               </div>
//               <div className="card-body">
//                 {recentPayments.length === 0 ? (
//                   <div className="text-center text-muted py-3">
//                     <i className="bi bi-receipt" style={{ fontSize: "2rem" }}></i>
//                     <p className="mt-2 mb-0">No recent payments found</p>
//                     <small>Your fee payment history will appear here</small>
//                   </div>
//                 ) : (
//                   <ul className="list-group">
//                     {recentPayments.map((payment) => (
//                       <li
//                         key={payment._id}
//                         className="list-group-item d-flex justify-content-between align-items-center"
//                       >
//                         <div>
//                           <span className="fw-bold text-success">₹{payment.amount}</span>{" "}
//                           <span className="text-muted ms-2">
//                             {payment.serviceDetails}
//                           </span>
//                           <br />
//                           <small className="text-muted">
//                             {new Date(payment.createdAt).toLocaleString("en-IN", {
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
//                           onClick={() => handleDownloadInvoice(payment._id)}
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

// export default EducationFees;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUniversity, FaCheckCircle, FaDownload } from "react-icons/fa";
import Header from "./Header";

function EducationFees() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    institution: "",
    studentName: "",
    studentId: "",
    feeType: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [recentPayments, setRecentPayments] = useState([]);
  const [errors, setErrors] = useState({
    institution: "",
    studentName: "",
    studentId: "",
    feeType: "",
    amount: "",
  });
  const user = JSON.parse(localStorage.getItem("ourstorage"));

  // Fetch recent education fee payments
  const fetchRecentPayments = async () => {
    if (!user?.id && !user?._id) return;
    try {
      const res = await fetch(
        `http://localhost:4000/safepay/history/${user._id || user.id}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.transactions)) {
        setRecentPayments(
          data.transactions
            .filter((txn) => txn.serviceType === "education_fee")
            .slice(0, 5)
        );
      }
    } catch (err) {
      setRecentPayments([]);
    }
  };

  useEffect(() => {
    fetchRecentPayments();
    // eslint-disable-next-line
  }, []);

  // Validation function (same pattern as Electricity)
  const validateField = (name, value) => {
    switch (name) {
      case "institution":
        if (!value) return "Institution name is required.";
        return "";
      case "studentName":
        if (!value) return "Student name is required.";
        if (!/^[a-zA-Z\s]+$/.test(value)) return "Only letters and spaces allowed.";
        return "";
      case "studentId":
        if (!value) return "Student ID is required.";
        if (!/^[a-zA-Z0-9\-]+$/.test(value)) return "Only letters, numbers, and hyphens allowed.";
        return "";
      case "feeType":
        if (!value) return "Fee type is required.";
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
      if (!res.ok) throw new Error("Failed to download fee receipt");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `education_fee${serviceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Could not download fee receipt/invoice.");
    }
  };

  // Submit fee payment
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
          serviceType: "education_fee",
          serviceDetails: `${formData.institution} | ${formData.studentName} (${formData.studentId}) | ${formData.feeType}`,
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
        description: "Education Fees Payment",
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
              alert("✅ Payment successful! Education fee paid.");
              setFormData({
                institution: "",
                studentName: "",
                studentId: "",
                feeType: "",
                amount: "",
              });
              fetchRecentPayments(); // Refresh list
            } else {
              alert("❌ Payment verification failed!");
            }
          } catch (error) {
            console.error(error);
            alert("Error verifying payment!");
          }
        },
        theme: { color: "#007bff" },
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
                <h3 className="mb-1">Education Fees Payment</h3>
                <p className="text-muted mb-0">Pay your educational fees securely online</p>
              </div>
            </div>

            <div className="card shadow-lg border-0">
              <div className="card-body p-4">
                {/* Header Icon */}
                <div className="text-center mb-4">
                  <div
                    className="bg-primary-subtle rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <FaUniversity className="text-primary" style={{ fontSize: "2.5rem" }} />
                  </div>
                  <h5 className="mt-3 text-dark fw-bold">Instant Fee Payment</h5>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Institution */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Institution</label>
                    <input
                      type="text"
                      className={`form-control form-control-lg border-2 ${errors.institution ? "is-invalid" : ""}`}
                      placeholder="School / College / Institute name"
                      name="institution"
                      value={formData.institution}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.institution && (
                      <div className="invalid-feedback" style={{ display: "block" }}>
                        {errors.institution}
                      </div>
                    )}
                  </div>

                  {/* Student Name */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Student Name</label>
                    <input
                      type="text"
                      className={`form-control form-control-lg border-2 ${errors.studentName ? "is-invalid" : ""}`}
                      placeholder="Student full name"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.studentName && (
                      <div className="invalid-feedback" style={{ display: "block" }}>
                        {errors.studentName}
                      </div>
                    )}
                  </div>

                  {/* Student ID */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Student ID / Roll No.</label>
                    <input
                      type="text"
                      className={`form-control form-control-lg border-2 ${errors.studentId ? "is-invalid" : ""}`}
                      placeholder="Admission number or roll no."
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.studentId && (
                      <div className="invalid-feedback" style={{ display: "block" }}>
                        {errors.studentId}
                      </div>
                    )}
                  </div>

                  {/* Fee Type */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Fee Type</label>
                    <select
                      className={`form-select form-select-lg border-2 ${errors.feeType ? "is-invalid" : ""}`}
                      name="feeType"
                      value={formData.feeType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select fee type</option>
                      <option value="tuition">Tuition Fee</option>
                      <option value="hostel">Hostel Fee</option>
                      <option value="exam">Exam Fee</option>
                      <option value="library">Library Fee</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.feeType && (
                      <div className="invalid-feedback" style={{ display: "block" }}>
                        {errors.feeType}
                      </div>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Amount (₹)</label>
                    <input
                      type="number"
                      className={`form-control form-control-lg border-2 ${errors.amount ? "is-invalid" : ""}`}
                      placeholder="Total amount"
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
                        <strong>Secure Payment:</strong> Your fee payment is protected and encrypted.
                      </small>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 shadow-sm"
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
                        <FaUniversity className="me-2" />
                        Pay Fees - ₹{formData.amount || "0"}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="card mt-4 border-0 shadow-sm">
              <div className="card-header bg-light border-0">
                <h6 className="mb-0 text-dark">Recent Fee Payments</h6>
              </div>
              <div className="card-body">
                {recentPayments.length === 0 ? (
                  <div className="text-center text-muted py-3">
                    <i className="bi bi-receipt" style={{ fontSize: "2rem" }}></i>
                    <p className="mt-2 mb-0">No recent payments found</p>
                    <small>Your fee payment history will appear here</small>
                  </div>
                ) : (
                  <ul className="list-group">
                    {recentPayments.map((payment) => (
                      <li
                        key={payment._id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <span className="fw-bold text-success">₹{payment.amount}</span>{" "}
                          <span className="text-muted ms-2">
                            {payment.serviceDetails}
                          </span>
                          <br />
                          <small className="text-muted">
                            {new Date(payment.createdAt).toLocaleString("en-IN", {
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
                          onClick={() => handleDownloadInvoice(payment._id)}
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

export default EducationFees;



