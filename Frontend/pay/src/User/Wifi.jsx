// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaWifi, FaCheckCircle, FaDownload } from "react-icons/fa";
// import Header from "./Header";

// export default function WifiBill() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     provider: "",
//     accountNumber: "",
//     customerName: "",
//     amount: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [recentPayments, setRecentPayments] = useState([]);

//   const providers = [
//     { value: "airtel", label: "Airtel Xstream" },
//     { value: "jio", label: "JioFiber" },
//     { value: "bsnl", label: "BSNL" },
//     { value: "hathway", label: "Hathway" },
//     { value: "act", label: "ACT Fibernet" },
//   ];
//   const [errors, setErrors] = useState({
//     accountNumber: "",
//     customerName: "",
//   });


//   useEffect(() => {
//     fetchRecentPayments();
//   }, []);

//   // Fetch recent payments from backend
//   const fetchRecentPayments = async () => {
//     try {
//       const user = JSON.parse(localStorage.getItem("ourstorage"));
//       if (!user?.id && !user?._id) return;

//       const res = await fetch(`http://localhost:4000/safepay/history/${user._id || user.id}`);
//       const data = await res.json();
//       if (data.success && Array.isArray(data.transactions)) {
//         setRecentPayments(
//           data.transactions.filter((txn) => txn.serviceType === "wifi_bill").slice(0, 5)
//         );
//       }
//     } catch {
//       setRecentPayments([]);
//     }
//   };
// const validateAccountNumber = (value) => {
//     if (!value) return "Account number is required.";
//     if (!/^\d+$/.test(value)) return "Account number must contain only digits.";
//     if (value.length < 6 || value.length > 12)
//       return "Account number must be between 6 to 12 digits.";
//     return "";
//   };

//   const validateCustomerName = (value) => {
//     if (!value) return "Customer name is required.";
//     if (!/^[a-zA-Z ]+$/.test(value)) return "Name must contain only letters.";
//     if (value.length < 3) return "Name must be at least 3 characters long.";
//     return "";
//   };

//   const handleInputChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//     if (e.target.name === "accountNumber") {
//       setErrors({ ...errors, accountNumber: validateAccountNumber(e.target.value) });
//     }
//     if (e.target.name === "customerName") {
//       setErrors({ ...errors, customerName: validateCustomerName(e.target.value) });
//     }
//   };

//   // Download invoice pdf
//   const downloadInvoice = async (serviceId) => {
//     try {
//       const response = await fetch(`http://localhost:4000/safepay/invoice/${serviceId}`);
//       if (!response.ok) throw new Error("Failed to download invoice");
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `wifi_bill_${serviceId}.pdf`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);
//     } catch {
//       alert("Could not download invoice.");
//     }
//   };

//   // Load Razorpay script dynamically
//   const loadRazorpay = () => {
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

//   // Handle form submit and initiate Razorpay payment
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//    const user = JSON.parse(localStorage.getItem("ourstorage"));
//       if (!user?.id && !user?._id) throw new Error("User not logged in");
//     const accountError = validateAccountNumber(formData.accountNumber);
//     const nameError = validateCustomerName(formData.customerName);
    
//     if (!formData.provider || !formData.accountNumber || !formData.customerName || !formData.amount || Number(formData.amount) <= 0) {
//       alert("Please fill all fields correctly");
//       return;
//     }
//     if (accountError || nameError) {
//       setErrors({ accountNumber: accountError, customerName: nameError });
//       return; // Stop submission if errors
//     }
//     if (!formData.provider) {
//       alert("Please select a provider");
//       return;
//     }

//     setLoading(true);

   
//         try {
//             // 1. Check deposit before payment
//             const accountRes = await fetch(`http://localhost:4000/safepay/account/${user?.id || user?._id}`);
//             const accountData = await accountRes.json();
//             if (!accountData.success) {
//                 alert("Account not found");
//                 setLoading(false);
//                 return;
//             }
//             if (accountData.deposit < Number(formData.amount)) {
//                 alert("Insufficient deposit balance. Please add funds to your account.");
//                 setLoading(false);
//                 return;
//             }
      

//       const res = await fetch("http://localhost:4000/safepay/create-service", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           serviceType: "wifi_bill",
//           serviceDetails: `Provider: ${formData.provider} | Account: ${formData.accountNumber} | Name: ${formData.customerName}`,
//           amount: Number(formData.amount),
//           userId: user.id || user._id,
//         }),
//       });

//       const data = await res.json();

//       if (!data.success) {
//         alert("Payment initiation failed: " + data.message);
//         setLoading(false);
//         return;
//       }

//       const createdServiceId = data.serviceId;

//       const razorpayLoaded = await loadRazorpay();

//       if (!razorpayLoaded) {
//         alert("Razorpay SDK failed to load");
//         setLoading(false);
//         return;
//       }

//       const options = {
//         key: "rzp_test_4Ex6Tyjkp79GFy",
//         amount: data.order.amount,
//         currency: "INR",
//         name: "SafePay",
//         description: "WiFi Bill Payment",
//         order_id: data.order.id,
//         handler: async (response) => {
//           try {
//             const verifyRes = await fetch("http://localhost:4000/safepay/verify-service", {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({
//                 razorpayOrderId: response.razorpay_order_id,
//                 razorpayPaymentId: response.razorpay_payment_id,
//                 razorpaySignature: response.razorpay_signature,
//                 serviceId: createdServiceId,
//               }),
//             });
//             const verifyData = await verifyRes.json();
//             if (verifyData.success) {
//               alert("✅ WiFi Bill paid successfully!");
//               setFormData({ provider: "", accountNumber: "", customerName: "", amount: "" });
//               fetchRecentPayments();
//             } else {
//               alert("❌ Payment verification failed");
//             }
//           } catch {
//             alert("Error verifying payment");
//           }
//         },
//         theme: { color: "#17a2b8" },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err) {
//       alert("Error initiating payment: " + err.message);
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

//             {/* Header and back button */}
//             <div className="d-flex align-items-center mb-4">
//               <button onClick={() => navigate(-1)} className="btn btn-outline-secondary me-3" style={{ minWidth: "100px" }}>
//                 ← Back
//               </button>
//               <div>
//                 <h3 className="mb-1">WiFi Bill Payment</h3>
//                 <p className="text-muted">Pay your home or office WiFi/Internet bill securely</p>
//               </div>
//             </div>

//             {/* Payment form */}
//             <div className="card shadow-lg border-0">
//               <div className="card-body">

//                 <div className="text-center mb-4">
//                   <div className="bg-info rounded-circle d-inline-flex justify-content-center align-items-center" style={{ width: 80, height: 80 }}>
//                     <FaWifi className="text-info" style={{ fontSize: 32 }} />
//                   </div>
//                   <h5 className="my-3 fw-bold">WiFi Bill Payment</h5>
//                 </div>

//                 <form onSubmit={handleSubmit}>
//                   <div className="mb-3">
//                     <label className="form-label fw-semibold">Provider</label>
//                     <select name="provider" value={formData.provider} onChange={handleInputChange} className="form-select" required>
//                       <option value="">Select Provider</option>
//                       {providers.map(p => <option key={p.value} value={p.value} >{p.label}</option>)}
//                     </select>
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label fw-semibold">Account Number</label>
//                     <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} className="form-control" required placeholder="Enter your account number" />
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label fw-semibold">Customer Name</label>
//                     <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} className="form-control" required placeholder="Enter your name" />
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label fw-semibold">Amount (₹)</label>
//                     <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} min="1" className="form-control" required placeholder="Enter amount to pay" />
//                   </div>

//                   <div className="alert alert-info d-flex align-items-center">
//                     <FaCheckCircle className="me-2" />
//                     <div>All transactions are secure and encrypted.</div>
//                   </div>

//                   <button type="submit" className="btn btn-info w-100" disabled={loading}>
//                     {loading ? (
//                       <><span className="spinner-border spinner-border-sm me-2" role="status" />Processing...</>
//                     ) : (
//                       <>Pay Now - ₹{formData.amount || "0"}</>
//                     )}
//                   </button>
//                 </form>

//               </div>
//             </div>

//             {/* Recent payments */}
//             <div className="card mt-4 shadow-sm">
//               <div className="card-header bg-light">
//                 <h6 className="mb-0">Recent Payments</h6>
//               </div>
//               <div className="card-body">
//                 {!recentPayments?.length ? (
//                   <div className="text-center text-muted py-4">
//                     <FaWifi size={48} className="mb-3" />
//                     <p>No recent payments found.</p>
//                     <small>Your payment history will appear here.</small>
//                   </div>
//                 ) : (
//                   <ul className="list-group">
//                     {recentPayments.map(payment => (
//                       <li key={payment._id} className="list-group-item d-flex justify-content-between align-items-center">
//                         <div>
//                           <span className="fw-bold text-success">₹{payment.amount}</span>{" "}
//                           <span className="text-muted ms-2">
//                             Provider: {providers.find(p => p.value === payment.provider)?.label || payment.provider} | Account: {payment.accountNumber}
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
//                         <button onClick={() => downloadInvoice(payment._id)} className="btn btn-outline-info btn-sm">
//                           <FaDownload className="me-1" />
//                           Invoice
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

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaWifi, FaCheckCircle, FaDownload } from "react-icons/fa";
import Header from "./Header";

export default function WifiBill() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    provider: "",
    accountNumber: "",
    customerName: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [recentPayments, setRecentPayments] = useState([]);
  const [errors, setErrors] = useState({});

  const providers = [
    { value: "airtel", label: "Airtel Xstream" },
    { value: "jio", label: "JioFiber" },
    { value: "bsnl", label: "BSNL" },
    { value: "hathway", label: "Hathway" },
    { value: "act", label: "ACT Fibernet" },
  ];

  useEffect(() => {
    fetchRecentPayments();
  }, []);

  // Fetch recent payments
  const fetchRecentPayments = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("ourstorage"));
      const userId = user?._id || user?.id;
      if (!userId) return;

      const res = await fetch(`http://localhost:4000/safepay/history/${userId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.transactions)) {
        setRecentPayments(
          data.transactions
            .filter((txn) => txn.serviceType === "wifi_bill")
            .slice(0, 5)
        );
      }
    } catch {
      setRecentPayments([]);
    }
  };

  // Validation
  const validateAccountNumber = (value) => {
    if (!value) return "Account number is required.";
    if (!/^\d+$/.test(value)) return "Account number must contain only digits.";
    if (value.length < 6 || value.length > 12)
      return "Account number must be 6–12 digits.";
    return "";
  };

  const validateCustomerName = (value) => {
    if (!value) return "Customer name is required.";
    if (!/^[a-zA-Z ]+$/.test(value)) return "Name must contain only letters.";
    if (value.length < 3) return "Name must be at least 3 characters.";
    return "";
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "accountNumber") {
      setErrors((prev) => ({ ...prev, accountNumber: validateAccountNumber(e.target.value) }));
    }
    if (e.target.name === "customerName") {
      setErrors((prev) => ({ ...prev, customerName: validateCustomerName(e.target.value) }));
    }
  };

  // Download invoice
  const downloadInvoice = async (serviceId) => {
    try {
      const response = await fetch(`http://localhost:4000/safepay/invoice/${serviceId}`);
      if (!response.ok) throw new Error("Failed to download invoice");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wifi_bill_${serviceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Could not download invoice.");
    }
  };

  // Load Razorpay script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) return resolve(true);
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("ourstorage"));
    const userId = user?._id || user?.id;
    if (!userId) return alert("User not logged in");

    // Validation
    const accountError = validateAccountNumber(formData.accountNumber);
    const nameError = validateCustomerName(formData.customerName);
    if (accountError || nameError) {
      setErrors({ accountNumber: accountError, customerName: nameError });
      return;
    }
    if (!formData.provider || !formData.amount || Number(formData.amount) <= 0) {
      return alert("Please fill all fields correctly.");
    }

    setLoading(true);

    try {
      // 1. Check deposit balance
      const accountRes = await fetch(`http://localhost:4000/safepay/account/${userId}`);
      const accountData = await accountRes.json();
      if (!accountData.success) throw new Error("Account not found");
      if (accountData.deposit < Number(formData.amount)) {
        alert("Insufficient deposit balance.");
        setLoading(false);
        return;
      }

      // 2. Create service
      const res = await fetch("http://localhost:4000/safepay/create-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: "wifi_bill",
          serviceDetails: `Provider: ${formData.provider} | Account: ${formData.accountNumber} | Name: ${formData.customerName}`,
          amount: Number(formData.amount),
          userId,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Payment initiation failed");

      const createdServiceId = data.serviceId;

      // 3. Load Razorpay
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) throw new Error("Razorpay SDK failed to load");

      // 4. Open Razorpay checkout
      const options = {
        key: "rzp_test_4Ex6Tyjkp79GFy",
        amount: data.order.amount,
        currency: "INR",
        name: "SafePay",
        description: "WiFi Bill Payment",
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await fetch("http://localhost:4000/safepay/verify-service", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                serviceId: createdServiceId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              alert("✅ WiFi Bill paid successfully!");
              setFormData({ provider: "", accountNumber: "", customerName: "", amount: "" });
              fetchRecentPayments();
            } else {
              alert("❌ Payment verification failed");
            }
          } catch {
            alert("Error verifying payment");
          }
        },
        theme: { color: "#17a2b8" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      alert("Error: " + err.message);
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

            {/* Back + Header */}
            <div className="d-flex align-items-center mb-4">
              <button onClick={() => navigate(-1)} className="btn btn-outline-secondary me-3" style={{ minWidth: "100px" }}>
                ← Back
              </button>
              <div>
                <h3 className="mb-1">WiFi Bill Payment</h3>
                <p className="text-muted">Pay your broadband bill securely</p>
              </div>
            </div>

            {/* Form */}
            <div className="card shadow-lg border-0">
              <div className="card-body">
                <div className="text-center mb-4">
                  <div className="bg-light rounded-circle d-inline-flex justify-content-center align-items-center" style={{ width: 80, height: 80 }}>
                    <FaWifi className="text-info" style={{ fontSize: 32 }} />
                  </div>
                  <h5 className="my-3 fw-bold">WiFi Bill Payment</h5>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Provider */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Provider</label>
                    <select name="provider" value={formData.provider} onChange={handleInputChange} className="form-select" required>
                      <option value="">Select Provider</option>
                      {providers.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Account Number */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Account Number</label>
                    <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} className="form-control" required />
                    {errors.accountNumber && <small className="text-danger">{errors.accountNumber}</small>}
                  </div>

                  {/* Customer Name */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Customer Name</label>
                    <input type="text" name="customerName" value={formData.customerName} onChange={handleInputChange} className="form-control" required />
                    {errors.customerName && <small className="text-danger">{errors.customerName}</small>}
                  </div>

                  {/* Amount */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Amount (₹)</label>
                    <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} min="1" className="form-control" required />
                  </div>

                  <div className="alert alert-info d-flex align-items-center">
                    <FaCheckCircle className="me-2" />
                    <div>All transactions are secure and encrypted.</div>
                  </div>

                  <button type="submit" className="btn btn-info w-100" disabled={loading}>
                    {loading ? <><span className="spinner-border spinner-border-sm me-2" />Processing...</> : <>Pay Now - ₹{formData.amount || "0"}</>}
                  </button>
                </form>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="card mt-4 shadow-sm">
              <div className="card-header bg-light"><h6 className="mb-0">Recent Payments</h6></div>
              <div className="card-body">
                {!recentPayments?.length ? (
                  <div className="text-center text-muted py-4">
                    <FaWifi size={48} className="mb-3" />
                    <p>No recent payments found.</p>
                  </div>
                ) : (
                  <ul className="list-group">
                    {recentPayments.map((payment) => (
                      <li key={payment._id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <span className="fw-bold text-success">₹{payment.amount}</span>{" "}
                          <span className="text-muted ms-2">{payment.serviceDetails}</span>
                          <br />
                          <small className="text-muted">
                            {new Date(payment.createdAt).toLocaleString("en-IN")}
                          </small>
                        </div>
                        <button onClick={() => downloadInvoice(payment._id)} className="btn btn-outline-info btn-sm">
                          <FaDownload className="me-1" />Invoice
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
