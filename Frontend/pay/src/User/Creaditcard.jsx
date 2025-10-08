import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCreditCard, FaCheckCircle, FaDownload } from "react-icons/fa";
import Header from "./Header";

export default function CreditCardBill() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvc: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [recentPayments, setRecentPayments] = useState([]);

  useEffect(() => {
    fetchRecentPayments();
  }, []);

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
            .filter((txn) => txn.serviceType === "credit_card_payment")
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
  };

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

  const downloadInvoice = async (serviceId) => {
    try {
      const response = await fetch(`http://localhost:4000/safepay/invoice/${serviceId}`);
      if (!response.ok) throw new Error("Failed to download invoice");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `credit_card_payment${serviceId}.pdf`;
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

    
    const cardNumberRegex = /^\d{16}$/;
  if (!cardNumberRegex.test(formData.cardNumber)) {
    alert("⚠️ Card number must be 16 digits.");
    return;
  }

  // CARD HOLDER NAME VALIDATION
  const nameRegex = /^[A-Za-z ]+$/;
  if (!nameRegex.test(formData.cardHolder.trim())) {
    alert("⚠️ Card holder name must contain only letters and spaces.");
    return;
  }

  // EXPIRY VALIDATION (MM/YY format and not expired)
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!expiryRegex.test(formData.expiry)) {
    alert("⚠️ Expiry must be in MM/YY format.");
    return;
  } else {
    const [month, year] = formData.expiry.split("/").map(Number);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear() % 100; // last 2 digits of year
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      alert("⚠️ Card has expired.");
      return;
    }
  }

  // CVC VALIDATION
  const cvcRegex = /^\d{3,4}$/;
  if (!cvcRegex.test(formData.cvc)) {
    alert("⚠️ CVC must be 3 or 4 digits.");
    return;
  }
    if (
      !formData.cardNumber ||
      formData.cardNumber.length !== 16 ||
      !formData.cardHolder ||
      !formData.expiry ||
      !formData.cvc ||
      formData.cvc.length < 3 ||
      !formData.amount ||
      Number(formData.amount) <= 0
    ) {
      alert("Please fill in all fields correctly");
      return;
    }
    // CARD NUMBER VALIDATION
  

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

      const res = await fetch("http://localhost:4000/safepay/create-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: "credit_card_payment",
          serviceDetails: `Card: ${formData.cardNumber} | Holder: ${formData.cardHolder} | Expiry: ${formData.expiry}`,
          amount: Number(formData.amount),
          userId: user.id || user._id,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Payment initiation failed: " + data.message);
        setLoading(false);
        return;
      }

      const createdServiceId = data.serviceId;

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
        description: "Credit Card Bill Payment",
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
              alert("✅ Credit Card Bill paid successfully!");
              setFormData({
                cardNumber: "",
                cardHolder: "",
                expiry: "",
                cvc: "",
                amount: "",
              });
              fetchRecentPayments();
            } else {
              alert("❌ Payment verification failed");
            }
          } catch {
            alert("Error verifying payment");
          }
        },
        theme: { color: "#dc3545" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Error initiating payment: " + err.message);
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

            {/* Header and Back Button */}
            <div className="d-flex align-items-center mb-4">
              <button onClick={() => navigate(-1)} className="btn btn-outline-secondary me-3" style={{ minWidth: 100 }}>
                ← Back
              </button>
              <div>
                <h3 className="mb-1">Credit Card Bill Payment</h3>
                <p className="text-muted">Pay your credit card bill securely</p>
              </div>
            </div>

            {/* Payment Form */}
            <div className="card shadow-lg border-0">
              <div className="card-body">
                <div className="text-center mb-4">
                  <div className="bg-danger-subtle rounded-circle d-inline-flex justify-content-center align-items-center" style={{ width: 80, height: 80 }}>
                    <FaCreditCard className="text-danger" style={{ fontSize: 32 }} />
                  </div>
                  <h5 className="mt-3 fw-bold">Quick Credit Card Payment</h5>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      maxLength={16}
                      placeholder="1234 5678 9012 3456"
                      className="form-control form-control-lg border-2"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Card Holder Name</label>
                    <input
                      type="text"
                      name="cardHolder"
                      value={formData.cardHolder}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="form-control form-control-lg border-2"
                      required
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col">
                      <label className="form-label fw-semibold">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleInputChange}
                        maxLength={5}
                        placeholder="MM/YY"
                        className="form-control form-control-lg border-2"
                        required
                      />
                    </div>
                    <div className="col">
                      <label className="form-label fw-semibold">CVC</label>
                      <input
                        type="text"
                        name="cvc"
                        value={formData.cvc}
                        onChange={handleInputChange}
                        maxLength={4}
                        placeholder="123"
                        className="form-control form-control-lg border-2"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Amount (₹)</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      min={1}
                      placeholder="Enter amount"
                      className="form-control form-control-lg border-2"
                      required
                    />
                  </div>

                  <div className="alert alert-danger d-flex align-items-center mb-4">
                    <FaCheckCircle className="me-2" />
                    Credit card details are securely encrypted.
                  </div>

                  <button type="submit" className="btn btn-danger btn-lg w-100" disabled={loading} style={{ minHeight: 50 }}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Processing...
                      </>
                    ) : (
                      <>Pay Now - ₹{formData.amount || "0"}</>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="card mt-4 shadow-sm">
              <div className="card-header bg-light">
                <h6 className="mb-0">Recent Payments</h6>
              </div>
              <div className="card-body">
                {recentPayments.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-credit-card" style={{ fontSize: 48 }}></i>
                    <p>No recent payments found.</p>
                    <small>Your payment history will appear here.</small>
                  </div>
                ) : (
                  <ul className="list-group">
                    {recentPayments.map((payment) => (
                      <li key={payment._id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <span className="fw-bold text-success">₹{payment.amount}</span>{" "}
                          <span className="text-muted ms-2">{payment.cardHolder}</span>
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
                        <button onClick={() => downloadInvoice(payment._id)} className="btn btn-outline-danger btn-sm">
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