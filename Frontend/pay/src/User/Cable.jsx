import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTv, FaCheckCircle, FaDownload } from "react-icons/fa";
import Header from "./Header";

export default function CableDthBill() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    provider: "",
    subscriberId: "",
    customerName: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [recentPayments, setRecentPayments] = useState([]);
  const [errors, setErrors] = useState({
    subscriberId: "",
    customerName: "",
    amount: "",
  });
  useEffect(() => {
    fetchRecentPayments();
  }, []);

  // ✅ Validation Functions
  const validateSubscriberId = (value) => {
    if (!value) return "Subscriber ID is required.";
    if (!/^\d+$/.test(value)) return "Subscriber ID must contain only digits.";
    if (value.length < 6 || value.length > 12)
      return "Subscriber ID must be 6 to 12 digits.";
    return "";
  };

  const validateCustomerName = (value) => {
    if (!value) return "Customer name is required.";
    if (!/^[a-zA-Z\s]+$/.test(value))
      return "Customer name can only contain letters and spaces.";
    return "";
  };

  const validateAmount = (value) => {
    if (!value || value <= 0) return "Please enter a valid amount.";
    return "";
  };
  // Fetch recent payments from backend
  const fetchRecentPayments = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("ourstorage"));
      if (!user?.id && !user?._id) return;

      const res = await fetch(
        `http://localhost:4000/safepay/history/${user._id || user.id}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.transactions)) {
        setRecentPayments(
          data.transactions
            .filter((txn) => txn.serviceType === "dth_payment")
            .slice(0, 5)
        );
      }
    } catch {
      setRecentPayments([]);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (e.target.name === "subscriberId") {
      setErrors({ ...errors, subscriberId: validateSubscriberId(e.target.value) });
    }
    if (e.target.name === "customerName") {
      setErrors({ ...errors, customerName: validateCustomerName(e.target.value) });
    }
    if (e.target.name === "amount") {
      setErrors({ ...errors, amount: validateAmount(e.target.value) });
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
      const response = await fetch(`http://localhost:4000/safepay/invoice/${serviceId}`);
      if (!response.ok) throw new Error("Failed to download invoice");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dth_payment${serviceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Could not download invoice.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const subIdError = validateSubscriberId(formData.subscriberId);
    const nameError = validateCustomerName(formData.customerName);
    const amountError = validateAmount(formData.amount);

    if (subIdError || nameError || amountError) {
      setErrors({
        subscriberId: subIdError,
        customerName: nameError,
        amount: amountError,
      });
      return;
    }
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("ourstorage"));
      if (!user?.id && !user?._id) throw new Error("User not logged in");
      
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

      const response = await fetch("http://localhost:4000/safepay/create-service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceType: "dth_payment",
          serviceDetails: `Provider: ${formData.provider} | Subscriber: ${formData.subscriberId} | Name: ${formData.customerName}`,
          amount: Number(formData.amount),
          userId: user.id || user._id,
        }),
      });
     
      const data = await response.json();
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
                description: "cable / DTH Bill Payment",
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
                            alert("✅ Payment successful! cable/DTH bill paid.");
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
                    color: "blue",
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
                <h3 className="mb-1">Cable/DTH Bill Payment</h3>
                <p className="text-muted mb-0">Pay your cable or DTH subscription securely</p>
              </div>
            </div>

            <div className="card shadow-lg border-0">
              <div className="card-body p-4">
                {/* Header Icon */}
                <div className="text-center mb-4">
                  <div
                    className="bg-info-subtle rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <FaTv className="text-info" style={{ fontSize: "2.5rem" }} />
                  </div>
                  <h5 className="mt-3 text-dark fw-bold">Cable/DTH Payment</h5>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Provider</label>
                    <select
                      className="form-select form-select-lg border-2"
                      name="provider"
                      value={formData.provider}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select provider</option>
                      <option value="tatasky">Tata Sky</option>
                      <option value="d2h">Dish TV (D2H)</option>
                      <option value="airtel">Airtel Digital TV</option>
                      <option value="reliance">Reliance Digital TV</option>
                      <option value="others">Others</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Subscriber ID</label>
                    <input
                      type="text"
                      className={`form-control form-control-lg border-2 ${
                        errors.subscriberId ? "is-invalid" : ""
                      }`}
                      placeholder="Enter your subscriber ID"
                      name="subscriberId"
                      value={formData.subscriberId}
                      onChange={handleInputChange}
                      required
                    />
                     {errors.subscriberId && (
                      <div className="invalid-feedback" style={{ display: "block" }}>
                        {errors.subscriberId}
                      </div>
                    )}
                    <div className="form-text">
                      <small>Your subscriber ID is found on your cable/DTH bill</small>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Customer Name</label>
                    <input
                      type="text"
                      className={`form-control form-control-lg border-2 ${
                        errors.customerName ? "is-invalid" : ""
                      }`}
                      placeholder="Enter customer name"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                    />
                     {errors.customerName && (
                      <div className="invalid-feedback" style={{ display: "block" }}>
                        {errors.customerName}
                      </div>
                     )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Amount (₹)</label>
                    <input
                      type="number"
                      className={`form-control form-control-lg border-2 ${
                        errors.amount ? "is-invalid" : ""
                      }`}
                      placeholder="Enter amount to pay"
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

                  <div className="alert alert-info border-0 mb-4">
                    <div className="d-flex align-items-center">
                      <FaCheckCircle className="text-info me-2" />
                      <small>
                        <strong>Secure Payment:</strong> Your payment is encrypted and safe
                      </small>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-info btn-lg w-100 shadow-sm"
                    disabled={loading}
                    style={{ minHeight: "50px" }}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <FaTv className="me-2" />
                        Pay Cable/DTH Bill - ₹{formData.amount || "0"}
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
                          className="btn btn-outline-info btn-sm"
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