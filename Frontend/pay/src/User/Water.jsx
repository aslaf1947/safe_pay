import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTint, FaCheckCircle, FaDownload } from "react-icons/fa";
import Header from "./Header";

export default function WaterBillService() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    authority: "",
    connectionId: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [recentPayments, setRecentPayments] = useState([]);
  const [errors, setErrors] = useState({ authority: "", connectionId: "", amount: "" });
  useEffect(() => {
    fetchRecentPayments();
  }, []);

  // ✅ Validation Functions
  const validateAuthority = (value) => {
    if (!value) return "Water authority is required.";
    return "";
  };

  const validateConnectionId = (value) => {
    if (!value) return "Connection ID is required.";
    if (!/^\d+$/.test(value)) return "Connection ID must contain only digits.";
    if (value.length < 6 || value.length > 15)
      return "Connection ID must be between 6 to 15 digits.";
    return "";
  };

  const validateAmount = (value) => {
    if (!value) return "Amount is required.";
    if (Number(value) <= 0) return "Amount must be greater than 0.";
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
            .filter((txn) => txn.serviceType === "water_bill")
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
    if (e.target.name === "authority") {
      setErrors({ ...errors, authority: validateAuthority(e.target.value) });
    }
    if (e.target.name === "connectionId") {
      setErrors({ ...errors, connectionId: validateConnectionId(e.target.value) });
    }
    if (e.target.name === "amount") {
      setErrors({ ...errors, amount: validateAmount(e.target.value) });
    }
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
      a.download = `water_bill_${serviceId}.pdf`;
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
      !formData.authority ||
      !formData.connectionId ||
      !formData.amount ||
      Number(formData.amount) <= 0
    ) {
      alert("Please fill all fields correctly");
      return;
    }
    const authorityError = validateAuthority(formData.authority);
    const connectionError = validateConnectionId(formData.connectionId);
    const amountError = validateAmount(formData.amount);

    if (authorityError || connectionError || amountError) {
      setErrors({
        authority: authorityError,
        connectionId: connectionError,
        amount: amountError,
      });
      return;
    }
    setLoading(true);

    try {
      // 1. Check deposit before payment
      const user = JSON.parse(localStorage.getItem("ourstorage"));
      if (!(user?.id || user?._id)) return;


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
          serviceType: "water_bill",
          serviceDetails: `Authority: ${formData.authority} | Connection: ${formData.connectionId}`,
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
        description: "Water Bill Payment",
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
              alert("✅ Water bill paid successfully!");
              setFormData({ authority: "", connectionId: "", amount: "" });
              fetchRecentPayments();
            } else {
              alert("❌ Payment verification failed");
            }
          } catch {
            alert("Error verifying payment");
          }
        },
        theme: { color: "#0d6efd" },
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
                <h3 className="mb-1">Water Bill Payment</h3>
                <p className="text-muted mb-0">Pay your water bill instantly</p>
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
                    <FaTint className="text-primary" style={{ fontSize: "2.5rem" }} />
                  </div>
                  <h5 className="mt-3 text-dark fw-bold">Water Bill Payment</h5>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-building-gear me-2 text-primary"></i>
                      Water Authority
                    </label>
                    <select
                       className={`form-select form-select-lg border-2 ${errors.authority ? "is-invalid" : ""}`}
                      name="authority"
                      value={formData.authority}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select water authority</option>
                      <option value="kwa">Kerala Water Authority (KWA)</option>
                      <option value="cmwssb">Chennai Metro Water Supply (CMWSSB)</option>
                      <option value="bwssb">Bangalore Water Supply (BWSSB)</option>
                      <option value="mcgm">Municipal Corporation Mumbai (MCGM)</option>
                      <option value="dwsc">Delhi Water Supply Corporation</option>
                      <option value="phed">Public Health Engineering Department</option>
                    </select>
                    {errors.authority && <div className="invalid-feedback">{errors.authority}</div>}
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-credit-card-2-front me-2 text-primary"></i>
                      Connection ID / Consumer Number
                    </label>
                    <input
                      type="text"
                     className={`form-control form-control-lg border-2 ${errors.connectionId ? "is-invalid" : ""}`}
                      placeholder="Enter your connection ID"
                      name="connectionId"
                      value={formData.connectionId}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.connectionId && <div className="invalid-feedback">{errors.connectionId}</div>}
                    <div className="form-text">
                      <i className="bi bi-info-circle me-1"></i>
                      Found on your water bill or connection certificate
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-currency-rupee me-2 text-primary"></i>
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                       className={`form-control form-control-lg border-2 ${errors.amount ? "is-invalid" : ""}`}
                      placeholder="Enter amount to pay"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                    {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
                  </div>

                  {/* Payment Info */}
                  <div className="alert alert-info border-0 mb-4">
                    <div className="d-flex align-items-center">
                      <FaCheckCircle className="text-info me-2" />
                      <small>
                        <strong>Quick Payment:</strong> Instant confirmation and receipt generation
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
                        <FaTint className="me-2" />
                        Pay Water Bill - ₹{formData.amount || "0"}
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
                  Recent Water Bill Payments
                </h6>
              </div>
              <div className="card-body">
                {recentPayments.length === 0 ? (
                  <div className="text-center text-muted py-3">
                    <FaTint size={48} className="mb-3" />
                    <p className="mt-2 mb-0">No recent payments found</p>
                    <small>Your water bill payment history will appear here</small>
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
                          Invoice
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Water Conservation Tip */}
            <div className="card mt-4 border-0 shadow-sm bg-light">
              <div className="card-body text-center">
                <FaTint className="text-primary mb-2" style={{ fontSize: "2rem" }} />
                <h6 className="text-primary">💡 Water Conservation Tip</h6>
                <p className="text-muted small mb-0">
                  Fix leaky faucets immediately - a single drip can waste over 3,000 gallons per year!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}