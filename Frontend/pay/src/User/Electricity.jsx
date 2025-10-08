// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaBolt, FaCheckCircle } from "react-icons/fa";
// import Header from "./Header";

// function Electricity() {
//     const navigate = useNavigate();
//     const [formData, setFormData] = useState({
//         state: "",
//         board: "",
//         consumerNumber: "",
//         amount: "",
//     });
//     const [loading, setLoading] = useState(false);
//     const [serviceId, setServiceId] = useState(null);
//     const user = JSON.parse(localStorage.getItem("ourstorage")); // Assuming user info is stored in localStorage
//     // Handle input fields
//     const handleInputChange = (e) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value,
//         });
//     };

//     // Load Razorpay SDK dynamically
//     const loadRazorpayScript = () => {
//         return new Promise((resolve) => {
//             if (document.getElementById("razorpay-script")) {
//                 resolve(true);
//                 return;
//             }
//             const script = document.createElement("script");
//             script.id = "razorpay-script";
//             script.src = "https://checkout.razorpay.com/v1/checkout.js";
//             script.onload = () => resolve(true);
//             script.onerror = () => resolve(false);
//             document.body.appendChild(script);
//         });
//     };

//     // Submit payment
//    const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.amount || formData.amount <= 0) {
//         alert("Please enter a valid amount");
//         return;
//     }

//     setLoading(true);

//     try {
//         // Step 1: Create Razorpay order from backend
//         const res = await fetch("http://localhost:4000/safepay/create-service", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 serviceType: "electricity_bill",
//                 serviceDetails: `${formData.state} - ${formData.board} - ${formData.consumerNumber}`,
//                 amount: Number(formData.amount),
//                 userId: user?.id,
//             })
//         });

//         const data = await res.json();

//         if (!data.success) {
//             alert("Failed to create Razorpay order: " + data.message);
//             setLoading(false);
//             return;
//         }

//         // Save serviceId from backend response
//         const createdServiceId = data.serviceId;

//         // Step 2: Load Razorpay SDK
//         const isLoaded = await loadRazorpayScript();
//         if (!isLoaded) {
//             alert("Razorpay SDK failed to load");
//             setLoading(false);
//             return;
//         }

//         // Step 3: Open Razorpay Checkout
//         const options = {
//             key: "rzp_test_4Ex6Tyjkp79GFy",
//             amount: data.order.amount,
//             currency: "INR",
//             name: "SafePay",
//             description: "Electricity Bill Payment",
//             order_id: data.order.id,
//             handler: async (response) => {
//                 try {
//                     // Step 4: Verify payment with backend
//                     const verifyRes = await fetch("http://localhost:4000/safepay/verify-service", {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify({
//                             razorpayOrderId: response.razorpay_order_id,
//                             razorpayPaymentId: response.razorpay_payment_id,
//                             razorpaySignature: response.razorpay_signature,
//                             serviceId: createdServiceId, // <-- Use the correct serviceId here
//                         }),
//                     });

//                     const verifyData = await verifyRes.json();

//                     if (verifyData.success) {
//                         alert("✅ Payment successful! Electricity bill paid.");
//                         setFormData({ state: "", board: "", consumerNumber: "", amount: "" });
//                     } else {
//                         alert("❌ Payment verification failed!");
//                     }
//                 } catch (error) {
//                     console.error(error);
//                     alert("Error verifying payment!");
//                 }
//             },
//             theme: {
//                 color: "#f4c430",
//             },
//         };

//         const razorpay = new window.Razorpay(options);
//         razorpay.open();
//     } catch (error) {
//         console.error(error);
//         alert("❌ Error initiating payment: " + error.message);
//     } finally {
//         setLoading(false);
//     }
// };

// return (
//     <>
//         <Header />
//         <div className="container py-4">
//             <div className="row justify-content-center">
//                 <div className="col-lg-6">
//                     {/* Header with Back Button */}
//                     <div className="d-flex align-items-center mb-4">
//                         <button
//                             onClick={() => navigate(-1)}
//                             className="btn btn-outline-secondary me-3"
//                             style={{ minWidth: "100px" }}
//                         >
//                             ← Back
//                         </button>
//                         <div>
//                             <h3 className="mb-1">Electricity Bill Payment</h3>
//                             <p className="text-muted mb-0">Pay your electricity bill securely</p>
//                         </div>
//                     </div>

//                     <div className="card shadow-lg border-0">
//                         <div className="card-body p-4">
//                             {/* Header Icon */}
//                             <div className="text-center mb-4">
//                                 <div
//                                     className="bg-warning-subtle rounded-circle d-inline-flex align-items-center justify-content-center"
//                                     style={{ width: "80px", height: "80px" }}
//                                 >
//                                     <FaBolt className="text-warning" style={{ fontSize: "2.5rem" }} />
//                                 </div>
//                                 <h5 className="mt-3 text-dark fw-bold">Quick Bill Payment</h5>
//                             </div>

//                             <form onSubmit={handleSubmit}>
//                                 {/* State */}
//                                 <div className="mb-4">
//                                     <label className="form-label fw-semibold">
//                                         <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
//                                         Select State
//                                     </label>
//                                     <select
//                                         className="form-select form-select-lg border-2"
//                                         name="state"
//                                         value={formData.state}
//                                         onChange={handleInputChange}
//                                         required
//                                     >
//                                         <option value="">Choose your state</option>
//                                         <option value="kerala">Kerala</option>
//                                         <option value="tamilnadu">Tamil Nadu</option>
//                                         <option value="karnataka">Karnataka</option>
//                                         <option value="maharashtra">Maharashtra</option>
//                                         <option value="gujarat">Gujarat</option>
//                                     </select>
//                                 </div>

//                                 {/* Board */}
//                                 <div className="mb-4">
//                                     <label className="form-label fw-semibold">
//                                         <i className="bi bi-building me-2 text-primary"></i>
//                                         Electricity Board
//                                     </label>
//                                     <select
//                                         className="form-select form-select-lg border-2"
//                                         name="board"
//                                         value={formData.board}
//                                         onChange={handleInputChange}
//                                         required
//                                     >
//                                         <option value="">Select electricity board</option>
//                                         <option value="kseb">KSEB (Kerala)</option>
//                                         <option value="tangedco">TANGEDCO (Tamil Nadu)</option>
//                                         <option value="bescom">BESCOM (Karnataka)</option>
//                                         <option value="msedcl">MSEDCL (Maharashtra)</option>
//                                         <option value="ugvcl">UGVCL (Gujarat)</option>
//                                     </select>
//                                 </div>

//                                 {/* Consumer Number */}
//                                 <div className="mb-4">
//                                     <label className="form-label fw-semibold">
//                                         <i className="bi bi-hash me-2 text-primary"></i>
//                                         Consumer Number
//                                     </label>
//                                     <input
//                                         type="text"
//                                         className="form-control form-control-lg border-2"
//                                         placeholder="Enter your consumer number"
//                                         name="consumerNumber"
//                                         value={formData.consumerNumber}
//                                         onChange={handleInputChange}
//                                         required
//                                     />
//                                     <div className="form-text">
//                                         <i className="bi bi-info-circle me-1"></i>
//                                         You can find this on your electricity bill
//                                     </div>
//                                 </div>

//                                 {/* Amount */}
//                                 <div className="mb-4">
//                                     <label className="form-label fw-semibold">
//                                         <i className="bi bi-currency-rupee me-2 text-primary"></i>
//                                         Amount (₹)
//                                     </label>
//                                     <input
//                                         type="number"
//                                         className="form-control form-control-lg border-2"
//                                         placeholder="Enter amount to pay"
//                                         name="amount"
//                                         value={formData.amount}
//                                         onChange={handleInputChange}
//                                         min="1"
//                                         required
//                                     />
//                                 </div>

//                                 {/* Payment Info */}
//                                 <div className="alert alert-info border-0 mb-4">
//                                     <div className="d-flex align-items-center">
//                                         <FaCheckCircle className="text-info me-2" />
//                                         <small>
//                                             <strong>Secure Payment:</strong> Your payment is protected with 256-bit SSL encryption
//                                         </small>
//                                     </div>
//                                 </div>

//                                 <button
//                                     type="submit"
//                                     className="btn btn-warning btn-lg w-100 shadow-sm"
//                                     disabled={loading}
//                                     style={{ minHeight: "50px" }}
//                                 >
//                                     {loading ? (
//                                         <>
//                                             <span className="spinner-border spinner-border-sm me-2" role="status"></span>
//                                             Processing Payment...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <FaBolt className="me-2" />
//                                             Pay Electricity Bill - ₹{formData.amount || "0"}
//                                         </>
//                                     )}
//                                 </button>
//                             </form>
//                         </div>
//                     </div>

//                     {/* Recent Payments */}
//                     <div className="card mt-4 border-0 shadow-sm">
//                         <div className="card-header bg-light border-0">
//                             <h6 className="mb-0 text-dark">
//                                 <i className="bi bi-clock-history me-2"></i>
//                                 Recent Payments
//                             </h6>
//                         </div>
//                         <div className="card-body">
//                             <div className="text-center text-muted py-3">
//                                 <i className="bi bi-receipt" style={{ fontSize: "2rem" }}></i>
//                                 <p className="mt-2 mb-0">No recent payments found</p>
//                                 <small>Your payment history will appear here</small>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </>
// );
// }

// export default Electricity;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBolt, FaCheckCircle, FaDownload } from "react-icons/fa";
import Header from "./Header";

function Electricity() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        state: "",
        board: "",
        consumerNumber: "",
        amount: "",
    });
    const [loading, setLoading] = useState(false);
    const [recentPayments, setRecentPayments] = useState([]);
    const user = JSON.parse(localStorage.getItem("ourstorage"));
    const [errors, setErrors] = useState({ consumerNumber: "", });
    // Fetch recent payments
    const fetchRecentPayments = async () => {
        if (!user?.id && !user?._id) return;
        try {
            const res = await fetch(`http://localhost:4000/safepay/history/${user._id || user.id}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.transactions)) {
                // Only show electricity payments, latest 5
                setRecentPayments(
                    data.transactions
                        .filter(txn => txn.serviceType === "electricity_bill")
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

    const validateConsumerNumber = (value) => {
        if (!value) {
            return "Consumer number is required.";
        }
        if (!/^\d+$/.test(value)) {
            return "Consumer number must contain only digits.";
        }
        if (value.length < 10 || value.length > 15) {
            return "Consumer number must be between 10 to 15 digits.";
        }
        return "";
    };
    // Handle input fields
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (e.target.name === "consumerNumber") {
            setErrors({ ...errors, consumerNumber: validateConsumerNumber(e.target.value) });
        }

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
            const res = await fetch(`http://localhost:4000/safepay/invoice/${serviceId}`, {
                method: "GET",
            });
            if (!res.ok) throw new Error("Failed to download invoice");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `invoice_${serviceId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert("Could not download invoice.");
        }
    };

    // ...existing code...
    // Submit payment
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.amount || formData.amount <= 0) {
            alert("Please enter a valid amount");
            return;
        }
        const consumerError = validateConsumerNumber(formData.consumerNumber);
    if (consumerError) {
        setErrors({ ...errors, consumerNumber: consumerError });
        return; // Stop submission if error
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

            // Step 2: Create Razorpay order from backend
            const res = await fetch("http://localhost:4000/safepay/create-service", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    serviceType: "electricity_bill",
                    serviceDetails: `${formData.state} - ${formData.board} - ${formData.consumerNumber}`,
                    amount: Number(formData.amount),
                    userId: user?.id,
                })
            });

            const data = await res.json();

            if (!data.success) {
                alert("Failed to create Razorpay order: " + data.message);
                setLoading(false);
                return;
            }

            // Save serviceId from backend response
            const createdServiceId = data.serviceId;

            // Step 3: Load Razorpay SDK
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                alert("Razorpay SDK failed to load");
                setLoading(false);
                return;
            }

            // Step 4: Open Razorpay Checkout
            const options = {
                key: "rzp_test_4Ex6Tyjkp79GFy",
                amount: data.order.amount,
                currency: "INR",
                name: "SafePay",
                description: "Electricity Bill Payment",
                order_id: data.order.id,
                handler: async (response) => {
                    try {
                        // Step 5: Verify payment with backend
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
                            alert("✅ Payment successful! Electricity bill paid.");
                            setFormData({ state: "", board: "", consumerNumber: "", amount: "" });
                            fetchRecentPayments(); // Refresh recent payments
                        } else {
                            alert("❌ Payment verification failed!");
                        }
                    } catch (error) {
                        console.error(error);
                        alert("Error verifying payment!");
                    }
                },
                theme: {
                    color: "#f4c430",
                },
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
                                <h3 className="mb-1">Electricity Bill Payment</h3>
                                <p className="text-muted mb-0">Pay your electricity bill securely</p>
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
                                        <FaBolt className="text-warning" style={{ fontSize: "2.5rem" }} />
                                    </div>
                                    <h5 className="mt-3 text-dark fw-bold">Quick Bill Payment</h5>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    {/* State */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">
                                            <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                                            Select State
                                        </label>
                                        <select
                                            className="form-select form-select-lg border-2"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Choose your state</option>
                                            <option value="kerala">Kerala</option>
                                            <option value="tamilnadu">Tamil Nadu</option>
                                            <option value="karnataka">Karnataka</option>
                                            <option value="maharashtra">Maharashtra</option>
                                            <option value="gujarat">Gujarat</option>
                                        </select>
                                    </div>

                                    {/* Board */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">
                                            <i className="bi bi-building me-2 text-primary"></i>
                                            Electricity Board
                                        </label>
                                        <select
                                            className="form-select form-select-lg border-2"
                                            name="board"
                                            value={formData.board}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select electricity board</option>
                                            <option value="kseb">KSEB (Kerala)</option>
                                            <option value="tangedco">TANGEDCO (Tamil Nadu)</option>
                                            <option value="bescom">BESCOM (Karnataka)</option>
                                            <option value="msedcl">MSEDCL (Maharashtra)</option>
                                            <option value="ugvcl">UGVCL (Gujarat)</option>
                                        </select>
                                    </div>

                                    {/* Consumer Number */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">
                                            <i className="bi bi-hash me-2 text-primary"></i>
                                            Consumer Number
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control form-control-lg border-2 ${errors.consumerNumber ? "is-invalid" : ""}`}
                                            placeholder="Enter your consumer number"
                                            name="consumerNumber"
                                            value={formData.consumerNumber}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        {errors.consumerNumber && (
                                            <div className="invalid-feedback" style={{ display: "block" }}>
                                                {errors.consumerNumber}
                                            </div>
                                        )}
                                        <div className="form-text">
                                            <i className="bi bi-info-circle me-1"></i>
                                            You can find this on your electricity bill
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">
                                            <i className="bi bi-currency-rupee me-2 text-primary"></i>
                                            Amount (₹)
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control form-control-lg border-2"
                                            placeholder="Enter amount to pay"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                            min="1"
                                            required
                                        />
                                    </div>

                                    {/* Payment Info */}
                                    <div className="alert alert-info border-0 mb-4">
                                        <div className="d-flex align-items-center">
                                            <FaCheckCircle className="text-info me-2" />
                                            <small>
                                                <strong>Secure Payment:</strong> Your payment is protected with 256-bit SSL encryption
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
                                                <FaBolt className="me-2" />
                                                Pay Recent ectricity Bill - ₹{formData.amount || "0"}
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Recent Payments */}
                        <div className="card mt-4 border-0 shadow-sm">
                            <div className="card-header bg-light border-0">
                                <h6 className="mb-0 text-dark">
                                    <i className="bi bi-clock-history me-2"></i>
                                    Recent Payments
                                </h6>
                            </div>
                            <div className="card-body">
                                {recentPayments.length === 0 ? (
                                    <div className="text-center text-muted py-3">
                                        <i className="bi bi-receipt" style={{ fontSize: "2rem" }}></i>
                                        <p className="mt-2 mb-0">No recent payments found</p>
                                        <small>Your payment history will appear here</small>
                                    </div>
                                ) : (
                                    <ul className="list-group">
                                        {recentPayments.map((payment) => (
                                            <li key={payment._id} className="list-group-item d-flex justify-content-between align-items-center">
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
                                                    Invoice
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

export default Electricity;