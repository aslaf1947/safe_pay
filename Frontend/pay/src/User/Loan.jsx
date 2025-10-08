// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaMoneyCheckAlt, FaCheckCircle, FaDownload } from "react-icons/fa";
// import Header from "./Header";

// function LoanEMIPayment() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     lenderName: "",
//     loanAccount: "",
//     emiAmount: "",
//     tenure: "",
//     emiType: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [recentEMIs, setRecentEMIs] = useState([]);
//   const user = JSON.parse(localStorage.getItem("ourstorage"));

//   // Fetch recent loan EMI payments
//   const fetchRecentEMIs = async () => {
//     if (!user?.id && !user?._id) return;
//     try {
//       const res = await fetch(
//         `http://localhost:4000/safepay/history/${user._id || user.id}`
//       );
//       const data = await res.json();
//       if (data.success && Array.isArray(data.transactions)) {
//         setRecentEMIs(
//           data.transactions
//             .filter((txn) => txn.serviceType === "loan_emi")
//             .slice(0, 5)
//         );
//       }
//     } catch (err) {
//       setRecentEMIs([]);
//     }
//   };

//   useEffect(() => {
//     fetchRecentEMIs();
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

//   // Download EMI receipt PDF
//   const handleDownloadInvoice = async (serviceId) => {
//     try {
//       const res = await fetch(
//         `http://localhost:4000/safepay/invoice/${serviceId}`,
//         { method: "GET" }
//       );
//       if (!res.ok) throw new Error("Failed to download EMI receipt");
//       const blob = await res.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `loan_emi_${serviceId}.pdf`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       alert("Could not download EMI receipt/invoice.");
//     }
//   };

//   // Submit EMI payment
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (
//       !formData.emiAmount ||
//       formData.emiAmount <= 0 ||
//       !formData.lenderName ||
//       !formData.loanAccount ||
//       !formData.tenure ||
//       !formData.emiType
//     ) {
//       alert("Please fill all fields and enter a valid EMI amount");
//       return;
//     }

//     setLoading(true);

//     try {
//       // 1. Create Razorpay order from backend
//       const res = await fetch("http://localhost:4000/safepay/create-service", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           serviceType: "loan_emi",
//           serviceDetails: `${formData.lenderName} | Account: ${formData.loanAccount} | EMI Type: ${formData.emiType} | Tenure: ${formData.tenure} months`,
//           amount: Number(formData.emiAmount),
//           userId: user?.id,
//         }),
//       });

//       const data = await res.json();

//       if (!data.success) {
//         alert("Failed to create EMI payment: " + data.message);
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
//         description: "Loan EMI Payment",
//         order_id: data.order.id,
//         handler: async (response) => {
//           try {
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
//               alert("✅ EMI payment successful!");
//               setFormData({
//                 lenderName: "",
//                 loanAccount: "",
//                 emiAmount: "",
//                 tenure: "",
//                 emiType: "",
//               });
//               fetchRecentEMIs();
//             } else {
//               alert("❌ Payment verification failed!");
//             }
//           } catch (error) {
//             console.error(error);
//             alert("Error verifying EMI payment!");
//           }
//         },
//         theme: { color: "#9b59b6" }, // purple for loan
//       };

//       const razorpay = new window.Razorpay(options);
//       razorpay.open();
//     } catch (error) {
//       console.error(error);
//       alert("❌ Error initiating EMI payment: " + error.message);
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
//                 <h3 className="mb-1">Loan EMI Payment</h3>
//                 <p className="text-muted mb-0">Pay your loan EMI securely online</p>
//               </div>
//             </div>

//             <div className="card shadow-lg border-0">
//               <div className="card-body p-4">
//                 {/* Header Icon */}
//                 <div className="text-center mb-4">
//                   <div
//                     className="bg-purple-100 rounded-circle d-inline-flex align-items-center justify-content-center"
//                     style={{ width: "80px", height: "80px", background: "#f3e7fa" }}
//                   >
//                     <FaMoneyCheckAlt className="text-purple" style={{ fontSize: "2.5rem", color: "#9b59b6" }} />
//                   </div>
//                   <h5 className="mt-3 text-dark fw-bold">Fast EMI Payment</h5>
//                 </div>

//                 <form onSubmit={handleSubmit}>
//                   {/* Lender Name */}
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold">Lender Name / Bank</label>
//                     <input
//                       type="text"
//                       className="form-control form-control-lg border-2"
//                       placeholder="Bank or lender name"
//                       name="lenderName"
//                       value={formData.lenderName}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>

//                   {/* Loan Account */}
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold">Loan Account Number</label>
//                     <input
//                       type="text"
//                       className="form-control form-control-lg border-2"
//                       placeholder="Loan account number"
//                       name="loanAccount"
//                       value={formData.loanAccount}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>

//                   {/* EMI Type */}
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold">EMI Type</label>
//                     <select
//                       className="form-select form-select-lg border-2"
//                       name="emiType"
//                       value={formData.emiType}
//                       onChange={handleInputChange}
//                       required
//                     >
//                       <option value="">Select EMI type</option>
//                       <option value="home">Home Loan</option>
//                       <option value="car">Car Loan</option>
//                       <option value="personal">Personal Loan</option>
//                       <option value="education">Education Loan</option>
//                       <option value="other">Other</option>
//                     </select>
//                   </div>

//                   {/* Tenure */}
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold">Tenure (months)</label>
//                     <input
//                       type="number"
//                       className="form-control form-control-lg border-2"
//                       placeholder="Total months"
//                       name="tenure"
//                       min="1"
//                       value={formData.tenure}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>

//                   {/* EMI Amount */}
//                   <div className="mb-4">
//                     <label className="form-label fw-semibold">EMI Amount (₹)</label>
//                     <input
//                       type="number"
//                       className="form-control form-control-lg border-2"
//                       placeholder="EMI to pay"
//                       name="emiAmount"
//                       value={formData.emiAmount}
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
//                         <strong>Secure Payment:</strong> Your EMI payments are protected and encrypted.
//                       </small>
//                     </div>
//                   </div>

//                   <button
//                     type="submit"
//                     className="btn btn-primary btn-lg w-100 shadow-sm"
//                     disabled={loading}
//                     style={{ minHeight: "50px", background: "#9b59b6", border: "none" }}
//                   >
//                     {loading ? (
//                       <>
//                         <span className="spinner-border spinner-border-sm me-2" role="status"></span>
//                         Processing EMI Payment...
//                       </>
//                     ) : (
//                       <>
//                         <FaMoneyCheckAlt className="me-2" />
//                         Pay EMI - ₹{formData.emiAmount || "0"}
//                       </>
//                     )}
//                   </button>
//                 </form>
//               </div>
//             </div>

//             {/* Recent EMI Payments */}
//             <div className="card mt-4 border-0 shadow-sm">
//               <div className="card-header bg-light border-0">
//                 <h6 className="mb-0 text-dark">Recent EMI Payments</h6>
//               </div>
//               <div className="card-body">
//                 {recentEMIs.length === 0 ? (
//                   <div className="text-center text-muted py-3">
//                     <i className="bi bi-receipt" style={{ fontSize: "2rem" }}></i>
//                     <p className="mt-2 mb-0">No recent EMI payments found</p>
//                     <small>Your EMI payment history will appear here</small>
//                   </div>
//                 ) : (
//                   <ul className="list-group">
//                     {recentEMIs.map((emi) => (
//                       <li
//                         key={emi._id}
//                         className="list-group-item d-flex justify-content-between align-items-center"
//                       >
//                         <div>
//                           <span className="fw-bold text-success">₹{emi.amount}</span>{" "}
//                           <span className="text-muted ms-2">
//                             {emi.serviceDetails}
//                           </span>
//                           <br />
//                           <small className="text-muted">
//                             {new Date(emi.createdAt).toLocaleString("en-IN", {
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
//                           onClick={() => handleDownloadInvoice(emi._id)}
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

// export default LoanEMIPayment;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaMoneyCheckAlt, FaCheckCircle, FaDownload } from "react-icons/fa";
import Header from "./Header";

function LoanEMIPayment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    lenderName: "",
    loanAccount: "",
    emiAmount: "",
    tenure: "",
    emiType: "",
  });
  const [loading, setLoading] = useState(false);
  const [recentEMIs, setRecentEMIs] = useState([]);
  const [errors, setErrors] = useState({
    lenderName: "",
    loanAccount: "",
    emiAmount: "",
    tenure: "",
    emiType: "",
  });
  const user = JSON.parse(localStorage.getItem("ourstorage"));

  // Fetch recent loan EMI payments
  const fetchRecentEMIs = async () => {
    if (!user?.id && !user?._id) return;
    try {
      const res = await fetch(
        `http://localhost:4000/safepay/history/${user._id || user.id}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.transactions)) {
        setRecentEMIs(
          data.transactions
            .filter((txn) => txn.serviceType === "loan_emi")
            .slice(0, 5)
        );
      }
    } catch (err) {
      setRecentEMIs([]);
    }
  };

  useEffect(() => {
    fetchRecentEMIs();
    // eslint-disable-next-line
  }, []);

  // Validation function (same pattern as Electricity)
  const validateField = (name, value) => {
    switch (name) {
      case "lenderName":
        if (!value) return "Lender name is required.";
        return "";
      case "loanAccount":
        if (!value) return "Loan account number is required.";
        if (!/^[a-zA-Z0-9\-]+$/.test(value)) return "Only letters, numbers, and hyphens allowed.";
        return "";
      case "emiType":
        if (!value) return "EMI type is required.";
        return "";
      case "tenure":
        if (!value || isNaN(value) || Number(value) <= 0) return "Tenure is required and must be greater than 0.";
        return "";
      case "emiAmount":
        if (!value || isNaN(value) || Number(value) <= 0) return "EMI amount is required and must be greater than 0.";
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

  // Download EMI receipt PDF
  const handleDownloadInvoice = async (serviceId) => {
    try {
      const res = await fetch(
        `http://localhost:4000/safepay/invoice/${serviceId}`,
        { method: "GET" }
      );
      if (!res.ok) throw new Error("Failed to download EMI receipt");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `loan_emi_${serviceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Could not download EMI receipt/invoice.");
    }
  };

  // Submit EMI payment
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
          serviceType: "loan_emi",
          serviceDetails: `${formData.lenderName} | Account: ${formData.loanAccount} | EMI Type: ${formData.emiType} | Tenure: ${formData.tenure} months`,
          amount: Number(formData.emiAmount),
          userId: user?.id,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Failed to create EMI payment: " + data.message);
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
        description: "Loan EMI Payment",
        order_id: data.order.id,
        handler: async (response) => {
          try {
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
              alert("✅ EMI payment successful!");
              setFormData({
                lenderName: "",
                loanAccount: "",
                emiAmount: "",
                tenure: "",
                emiType: "",
              });
              fetchRecentEMIs();
            } else {
              alert("❌ Payment verification failed!");
            }
          } catch (error) {
            console.error(error);
            alert("Error verifying EMI payment!");
          }
        },
        theme: { color: "#9b59b6" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error(error);
      alert("❌ Error initiating EMI payment: " + error.message);
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
                <h3 className="mb-1">Loan EMI Payment</h3>
                <p className="text-muted mb-0">Pay your loan EMI securely online</p>
              </div>
            </div>

            <div className="card shadow-lg border-0">
              <div className="card-body p-4">
                {/* Header Icon */}
                <div className="text-center mb-4">
                  <div
                    className="bg-purple-100 rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: "80px", height: "80px", background: "#f3e7fa" }}
                  >
                    <FaMoneyCheckAlt className="text-purple" style={{ fontSize: "2.5rem", color: "#9b59b6" }} />
                  </div>
                  <h5 className="mt-3 text-dark fw-bold">Fast EMI Payment</h5>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Lender Name */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Lender Name / Bank</label>
                    <input
                      type="text"
                      className={`form-control form-control-lg border-2 ${errors.lenderName ? "is-invalid" : ""}`}
                      placeholder="Bank or lender name"
                      name="lenderName"
                      value={formData.lenderName}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.lenderName && (
                      <div className="invalid-feedback" style={{ display: "block" }}>
                        {errors.lenderName}
                      </div>
                    )}
                  </div>

                  {/* Loan Account */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Loan Account Number</label>
                    <input
                      type="text"
                      className={`form-control form-control-lg border-2 ${errors.loanAccount ? "is-invalid" : ""}`}
                      placeholder="Loan account number"
                      name="loanAccount"
                      value={formData.loanAccount}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.loanAccount && (
                      <div className="invalid-feedback" style={{ display: "block" }}>
                        {errors.loanAccount}
                      </div>
                    )}
                  </div>

                  {/* EMI Type */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">EMI Type</label>
                    <select
                      className={`form-select form-select-lg border-2 ${errors.emiType ? "is-invalid" : ""}`}
                      name="emiType"
                      value={formData.emiType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select EMI type</option>
                      <option value="home">Home Loan</option>
                      <option value="car">Car Loan</option>
                      <option value="personal">Personal Loan</option>
                      <option value="education">Education Loan</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.emiType && (
                      <div className="invalid-feedback" style={{ display: "block" }}>
                        {errors.emiType}
                      </div>
                    )}
                  </div>

                  {/* Tenure */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Tenure (months)</label>
                    <input
                      type="number"
                      className={`form-control form-control-lg border-2 ${errors.tenure ? "is-invalid" : ""}`}
                      placeholder="Total months"
                      name="tenure"
                      min="1"
                      value={formData.tenure}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.tenure && (
                      <div className="invalid-feedback" style={{ display: "block" }}>
                        {errors.tenure}
                      </div>
                    )}
                  </div>

                  {/* EMI Amount */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">EMI Amount (₹)</label>
                    <input
                      type="number"
                      className={`form-control form-control-lg border-2 ${errors.emiAmount ? "is-invalid" : ""}`}
                      placeholder="EMI to pay"
                      name="emiAmount"
                      value={formData.emiAmount}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                    {errors.emiAmount && (
                      <div className="invalid-feedback" style={{ display: "block" }}>
                        {errors.emiAmount}
                      </div>
                    )}
                  </div>

                  {/* Payment Info */}
                  <div className="alert alert-info border-0 mb-4">
                    <div className="d-flex align-items-center">
                      <FaCheckCircle className="text-info me-2" />
                      <small>
                        <strong>Secure Payment:</strong> Your EMI payments are protected and encrypted.
                      </small>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 shadow-sm"
                    disabled={loading}
                    style={{ minHeight: "50px", background: "#9b59b6", border: "none" }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Processing EMI Payment...
                      </>
                    ) : (
                      <>
                        <FaMoneyCheckAlt className="me-2" />
                        Pay EMI - ₹{formData.emiAmount || "0"}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Recent EMI Payments */}
            <div className="card mt-4 border-0 shadow-sm">
              <div className="card-header bg-light border-0">
                <h6 className="mb-0 text-dark">Recent EMI Payments</h6>
              </div>
              <div className="card-body">
                {recentEMIs.length === 0 ? (
                  <div className="text-center text-muted py-3">
                    <i className="bi bi-receipt" style={{ fontSize: "2rem" }}></i>
                    <p className="mt-2 mb-0">No recent EMI payments found</p>
                    <small>Your EMI payment history will appear here</small>
                  </div>
                ) : (
                  <ul className="list-group">
                    {recentEMIs.map((emi) => (
                      <li
                        key={emi._id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <span className="fw-bold text-success">₹{emi.amount}</span>{" "}
                          <span className="text-muted ms-2">
                            {emi.serviceDetails}
                          </span>
                          <br />
                          <small className="text-muted">
                            {new Date(emi.createdAt).toLocaleString("en-IN", {
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
                          onClick={() => handleDownloadInvoice(emi._id)}
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

export default LoanEMIPayment;
