import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaMobileAlt, FaCheckCircle, FaDownload } from "react-icons/fa";
import Header from "./Header";

export default function MobileRechargeService() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    operator: "",
    mobileNumber: "",
    amount: "",
    rechargeType: "prepaid",
  });
  const [loading, setLoading] = useState(false);
  const [recentRecharges, setRecentRecharges] = useState([]);

  const popularPlans = [
    { amount: 199, validity: "28 days", data: "1.5GB/day", calls: "Unlimited" },
    { amount: 299, validity: "28 days", data: "2GB/day", calls: "Unlimited" },
    { amount: 399, validity: "56 days", data: "1.5GB/day", calls: "Unlimited" },
    { amount: 599, validity: "84 days", data: "1.5GB/day", calls: "Unlimited" },
  ];

  useEffect(() => {
    fetchRecentRecharges();
  }, []);

  // Fetch recent recharge history
  const fetchRecentRecharges = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("ourstorage"));
      if (!user?.id && !user?._id) return;

      const res = await fetch(
        `http://localhost:4000/safepay/history/${user._id || user.id}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.transactions)) {
        setRecentRecharges(
          data.transactions
            .filter((txn) => txn.serviceType === "mobile_recharge")
            .slice(0, 5)
        );
      }
    } catch {
      setRecentRecharges([]);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle popular plan selection
  const handlePlanSelect = (plan) => {
    setFormData({
      ...formData,
      amount: plan.amount.toString(),
    });
  };

  // Dynamically load Razorpay SDK script
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

  // Download invoice PDF for a recharge transaction
  const handleDownloadInvoice = async (serviceId) => {
    try {
      const res = await fetch(
        `http://localhost:4000/safepay/invoice/${serviceId}`,
        { method: "GET" }
      );
      if (!res.ok) throw new Error("Failed to download invoice");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mobile_recharge_${serviceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Could not download invoice.");
    }
  };

  // Handle form submission and initiate Razorpay payment
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.operator) {
      alert("Please select operator");
      return;
    }
    if (!formData.mobileNumber || !/^\d{10}$/.test(formData.mobileNumber)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!formData.amount || Number(formData.amount) < 10) {
      alert("Please enter a valid amount (min ₹10)");
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

      const user = JSON.parse(localStorage.getItem("ourstorage"));

      const res = await fetch("http://localhost:4000/safepay/create-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: "mobile_recharge",
          serviceDetails: {
            operator: formData.operator,
            mobileNumber: formData.mobileNumber,
            rechargeType: formData.rechargeType,
          },
          amount: Number(formData.amount),
          userId: user?.id,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Failed to create Razorpay order: " + data.message);
        setLoading(false);
        return;
      }

      // Load Razorpay checkout script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Failed to load Razorpay SDK");
        setLoading(false);
        return;
      }

      // Configure Razorpay options
      const options = {
        key: "rzp_test_4Ex6Tykp79GF", // Replace with your Razorpay key
        amount: data.order.amount,
        currency: "INR",
        name: "SafePay",
        description: "Mobile Recharge",
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await fetch(
              `http://localhost:4000/safepay/verify-service`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  serviceId: data.serviceId,
                }),
              }
            );
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              alert("✅ Mobile recharge successful!");
              setFormData({ operator: "", mobileNumber: "", amount: "", rechargeType: "prepaid" });
              fetchRecentRecharges();
            } else {
              alert("❌ Payment verification failed!");
            }
          } catch {
            alert("Error verifying payment!");
          }
        },
        theme: {
          color: "#2196f3",
        },
      };

      // Open Razorpay checkout window
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert("Error initiating payment: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Header and back button */}
            <div className="d-flex align-items-center mb-4">
              <button onClick={() => navigate(-1)} className="btn btn-outline-secondary me-3" style={{ minWidth: "100px" }}>
                ← Back
              </button>
              <div>
                <h3 className="mb-1">Mobile Recharge</h3>
                <p className="text-muted mb-0">Instant recharge for all operators</p>
              </div>
            </div>

            <div className="row g-4">
              {/* Recharge form */}
              <div className="col-lg-6">
                <div className="card shadow-lg border-0">
                  <div className="card-body p-4">
                    <div className="text-center mb-4">
                      <div className="bg-primary-subtle rounded-circle d-inline-flex justify-content-center align-items-center" style={{ width: 80, height: 80 }}>
                        <FaMobileAlt className="text-primary" style={{ fontSize: "2.5rem" }} />
                      </div>
                      <h5 className="mt-3 text-dark fw-bold">Mobile Recharge</h5>
                    </div>
                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label className="form-label fw-semibold">Select Operator</label>
                        <select className="form-select form-select-lg border-2" name="operator" value={formData.operator} onChange={handleInputChange} required>
                          <option value="">Choose your operator</option>
                          <option value="jio">Jio</option>
                          <option value="airtel">Airtel</option>
                          <option value="vi">Vi</option>
                          <option value="bsnl">BSNL</option>
                          <option value="mtnl">MTNL</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label className="form-label fw-semibold">Mobile Number</label>
                        <input type="tel" className="form-control form-control-lg border-2" placeholder="Enter 10-digit mobile number" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} pattern="[0-9]{10}" required />
                      </div>

                      <div className="mb-4">
                        <label className="form-label fw-semibold">Recharge Type</label>
                        <div className="d-flex gap-3">
                          <div className="form-check">
                            <input type="radio" className="form-check-input" name="rechargeType" value="prepaid" checked={formData.rechargeType === "prepaid"} onChange={handleInputChange} />
                            <label className="form-check-label">Prepaid</label>
                          </div>
                          <div className="form-check">
                            <input type="radio" className="form-check-input" name="rechargeType" value="postpaid" checked={formData.rechargeType === "postpaid"} onChange={handleInputChange} />
                            <label className="form-check-label">Postpaid</label>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="form-label fw-semibold">Amount (₹)</label>
                        <input type="number" className="form-control form-control-lg border-2" placeholder="Enter amount" name="amount" value={formData.amount} onChange={handleInputChange} min={10} required />
                      </div>

                      <div className="alert alert-info border-0 mb-4">
                        <div className="d-flex align-items-center">
                          <FaCheckCircle className="text-info me-2" />
                          <small>Instant recharge - your mobile will be credited within minutes</small>
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary btn-lg w-100 shadow-sm" disabled={loading} style={{ minHeight: 50 }}>
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span> Processing...
                          </>
                        ) : (
                          <> <FaMobileAlt className="me-2" /> Recharge Now - ₹{formData.amount || "0"} </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Popular plans */}
              <div className="col-lg-6">
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-light border-0">
                    <h6 className="mb-0 text-dark"><i className="bi bi-star-fill text-warning me-2"></i> Popular Plans</h6>
                  </div>
                  <div className="card-body p-3">
                    {popularPlans.map((plan, i) => (
                      <div key={i} className="card mb-2" style={{ cursor: "pointer" }} onClick={() => handlePlanSelect(plan)} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8f9fa"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "white"}>
                        <div className="card-body p-3 d-flex justify-content-between">
                          <div>
                            <h6 className="mb-1 text-primary fw-bold">₹{plan.amount}</h6>
                            <small className="text-muted">Validity: {plan.validity}</small>
                          </div>
                          <div className="text-end">
                            <div className="small text-success">{plan.data}</div>
                            <div className="small text-info">{plan.calls}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Recharges */}
                <div className="card mt-4 shadow-sm border-0">
                  <div className="card-header bg-light border-0">
                    <h6 className="mb-0 text-dark"><i className="bi bi-clock-history me-2"></i> Recent Recharges</h6>
                  </div>
                  <div className="card-body">
                    {recentRecharges.length === 0 ? (
                      <div className="text-center text-muted py-4">
                        <i className="bi bi-phone" style={{ fontSize: 48 }}></i>
                        <p className="mt-3 mb-1">No recent recharges</p>
                        <small className="text-muted">Your recharge history will appear here.</small>
                      </div>
                    ) : (
                      <ul className="list-group">
                        {recentRecharges.map((recharge) => (
                          <li key={recharge._id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                              <span className="fw-bold text-success">₹{recharge.amount}</span> 
                              <span className="ms-2 text-muted">{recharge.serviceDetails?.operator || "Unknown"} - {recharge.serviceDetails?.mobileNumber || "Unknown"}</span>
                              <br />
                              <small className="text-muted">{new Date(recharge.createdAt).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</small>
                            </div>
                            <button className="btn btn-outline-primary btn-sm" onClick={() => handleDownloadInvoice(recharge._id)}>
                              <FaDownload className="me-1" /> Invoice
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
        </div>
        </div>
      </>
    );
}

