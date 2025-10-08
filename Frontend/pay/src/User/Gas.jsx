import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaGasPump, FaCheckCircle, FaDownload } from "react-icons/fa";
import Header from "./Header";

export default function GasBillService() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    provider: "",
    consumerNumber: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [recentPayments, setRecentPayments] = useState([]);
  const [errors, setErrors] = useState({});
  useEffect(() => {
    fetchRecentPayments();
  }, []);

  // Validation functions
  const validateProvider = (provider) => {
    if (!provider) return "Please select a gas provider.";
    return "";
  };

  const validateConsumerNumber = (num) => {
    if (!num) return "Consumer number is required.";
    if (!/^\d+$/.test(num)) return "Consumer number must contain only digits.";
    if (num.length < 6 || num.length > 15)
      return "Consumer number must be 6–15 digits long.";
    return "";
  };

  const validateAmount = (amount) => {
    if (!amount) return "Amount is required.";
    if (Number(amount) <= 0) return "Amount must be greater than 0.";
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
            .filter((txn) => txn.serviceType === "gas_bill")
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
    let errorMsg = "";
    if (e.target.name === "provider") errorMsg = validateProvider(e.target.value);
    if (e.target.name === "consumerNumber") errorMsg = validateConsumerNumber(e.target.value);
    if (e.target.name === "amount") errorMsg = validateAmount(e.target.value);

    setErrors({
      ...errors,
      [e.target.name]: errorMsg,
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
      a.download = `gas_bill_${serviceId}.pdf`;
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

    if (
      !formData.provider ||
      !formData.consumerNumber ||
      !formData.amount ||
      Number(formData.amount) <= 0
    ) {
      alert("Please fill all fields correctly");
      return;
    }
    const providerError = validateProvider(formData.provider);
    const consumerError = validateConsumerNumber(formData.consumerNumber);
    const amountError = validateAmount(formData.amount);

    setErrors({
      provider: providerError,
      consumerNumber: consumerError,
      amount: amountError,
    });

    if (providerError || consumerError || amountError) {
      return; // ❌ stop submission if errors exist
    }


    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("ourstorage"));
      if (!user?.id && !user?._id) throw new Error("User not logged in");

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
      
      const response = await fetch("http://localhost:4000/safepay/create-service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceType: "gas_bill",
          serviceDetails: `Provider: ${formData.provider} | Consumer: ${formData.consumerNumber}`,
          amount: Number(formData.amount),
          userId: user.id || user._id,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        alert("❌ Payment failed: " + data.message);
        setLoading(false);
        return;
      }

      const createdServiceId = data.serviceId;

      // Load Razorpay SDK
      const loadRazorpay = () => {
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

      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        alert("Failed to load Razorpay SDK");
        setLoading(false);
        return;
      }

      const options = {
        key: "rzp_test_4Ex6Tyjkp79GFy",
        amount: data.order.amount,
        currency: "INR",
        name: "SafePay",
        description: "Gas Bill Payment",
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
              alert("✅ Gas bill paid successfully!");
              setFormData({ provider: "", consumerNumber: "", amount: "" });
              fetchRecentPayments();
            } else {
              alert("❌ Payment verification failed");
            }
          } catch {
            alert("Error verifying payment");
          }
        },
        theme: { color: "#ffc107" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert("❌ Error: " + error.message);
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
                <h3 className="mb-1">Gas Bill Payment</h3>
                <p className="text-muted mb-0">Pay your gas bill quickly and securely</p>
              </div>
            </div>

            <div className="card shadow-lg border-0">
              <div className="card-body p-4">
                {/* Header Icon */}
                <div className="text-center mb-4">
                  <div className="bg-warning-subtle rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: "80px", height: "80px" }}>
                    <FaGasPump className="text-warning" style={{ fontSize: "2.5rem" }} />
                  </div>
                  <h5 className="mt-3 text-dark fw-bold">Gas Bill Payment</h5>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-building me-2 text-primary"></i>
                      Gas Provider
                    </label>
                    <select
                      className={`form-select form-select-lg border-2 ${errors.provider ? "is-invalid" : "" }`} 
                        name="provider"
                      value={formData.provider}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select gas provider</option>
                      <option value="iocl">Indian Oil Corporation (IOCL)</option>
                      <option value="bpcl">Bharat Petroleum (BPCL)</option>
                      <option value="hpcl">Hindustan Petroleum (HPCL)</option>
                      <option value="gail">Gas Authority of India Limited (GAIL)</option>
                      <option value="adani">Adani Gas</option>
                      <option value="gujarat">Gujarat Gas</option>
                      <option value="mga">Mahanagar Gas</option>
                      <option value="indraprastha">Indraprastha Gas</option>
                    </select>
                    {errors.provider && (
                      <div className="invalid-feedback">{errors.provider}</div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-credit-card-2-front me-2 text-primary"></i>
                      Consumer Number
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg border-2 ${
                        errors.consumerNumber ? "is-invalid" : ""
                      }`}
                      placeholder="Enter your consumer number"
                      name="consumerNumber"
                      value={formData.consumerNumber}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.consumerNumber && (
                      <div className="invalid-feedback">{errors.consumerNumber}</div>
                    )}
                    <div className="form-text">
                      <i className="bi bi-info-circle me-1"></i>
                      Found on your gas bill or connection papers
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-currency-rupee me-2 text-primary"></i>
                      Amount (₹)
                    </label>
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
                      <div className="invalid-feedback">{errors.amount}</div>
                    )}
                  </div>

                  {/* Payment Info */}
                  <div className="alert alert-info border-0 mb-4">
                    <div className="d-flex align-items-center">
                      <FaCheckCircle className="text-info me-2" />
                      <small>
                        <strong>Safe Payment:</strong> Secure payment processing with instant receipt
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
                        <FaGasPump className="me-2" />
                        Pay Gas Bill - ₹{formData.amount || "0"}
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
                  Recent Gas Bill Payments
                </h6>
              </div>
              <div className="card-body">
                {recentPayments.length === 0 ? (
                  <div className="text-center text-muted py-3">
                    <FaGasPump size={48} className="mb-3" />
                    <p className="mt-2 mb-0">No recent payments found</p>
                    <small>Your gas bill payment history will appear here</small>
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
                          className="btn btn-outline-warning btn-sm"
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

            {/* Gas Safety Tip */}
            <div className="card mt-4 border-0 shadow-sm bg-light">
              <div className="card-body text-center">
                <FaGasPump className="text-warning mb-2" style={{ fontSize: "2rem" }} />
                <h6 className="text-warning">🛡️ Gas Safety Tip</h6>
                <p className="text-muted small mb-0">
                  Always check for gas leaks regularly. If you smell gas, turn off the main valve and contact your provider immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}