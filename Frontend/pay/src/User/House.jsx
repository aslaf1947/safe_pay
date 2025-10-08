import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCheckCircle, FaDownload } from "react-icons/fa";
import Header from "./Header";

export default function HouseRentBill() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tenantName: "",
    landlordName: "",
    propertyAddress: "",
    rentAmount: "",
    rentMonth: "",
  });
  const [loading, setLoading] = useState(false);
  const [recentPayments, setRecentPayments] = useState([]);

  // Fetch recent payments
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
            .filter((txn) => txn.serviceType === "house_rent")
            .slice(0, 5)
        );
      }
    } catch (error) {
      setRecentPayments([]);
    }
  };

  useEffect(() => {
    fetchRecentPayments();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.tenantName ||
      !formData.landlordName ||
      !formData.propertyAddress ||
      !formData.rentAmount ||
      formData.rentAmount <= 0 ||
      !formData.rentMonth
    ) {
      alert("Please fill all fields correctly and ensure rent amount is valid");
      return;
    }

    if (!formData.rentAmount || formData.rentAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    // 3. Tenant/Landlord name validation (only letters & spaces)
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(formData.tenantName)) {
      alert("⚠️ Tenant name should only contain letters.");
      return;
    }
    if (!nameRegex.test(formData.landlordName)) {
      alert("⚠️ Landlord name should only contain letters.");
      return;
    }

    // 4. Address validation (min length)
    if (formData.propertyAddress.length < 5) {
      alert("⚠️ Please enter a valid property address.");
      return;
    }

    // 5. Rent month should not be in the future
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    if (formData.rentMonth > currentMonth) {
      alert("⚠️ Rent month cannot be in the future.");
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
      if (accountData.deposit < Number(formData.rentAmount)) {
        alert("Insufficient deposit balance. Please add funds to your account.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(localStorage.getItem("ourstorage"));
      if (!user?.id && !user?._id) throw new Error("User not logged in");

      // Step 1: Create Razorpay order from backend
      const response = await fetch("http://localhost:4000/safepay/create-service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceType: "house_rent",
          serviceDetails: `${formData.propertyAddress} | Tenant: ${formData.tenantName} | Landlord: ${formData.landlordName} | Month: ${formData.rentMonth}`,
          amount: Number(formData.rentAmount),
          userId: user.id || user._id,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        alert("❌ Payment initiation failed: " + data.message);
        setLoading(false);
        return;
      }

      const createdServiceId = data.serviceId;

      // Step 2: Load Razorpay SDK
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

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Razorpay SDK failed to load");
        setLoading(false);
        return;
      }

      // Step 3: Open Razorpay Checkout
      const options = {
        key: "rzp_test_4Ex6Tyjkp79GFy",
        amount: data.order.amount,
        currency: "INR",
        name: "SafePay",
        description: "House Rent Payment",
        order_id: data.order.id,
        handler: async (response) => {
          try {
            // Step 4: Verify payment with backend
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
              alert("✅ Payment successful! House rent paid.");
              setFormData({
                tenantName: "",
                landlordName: "",
                propertyAddress: "",
                rentAmount: "",
                rentMonth: "",
              });
              fetchRecentPayments();
            } else {
              alert("❌ Payment verification failed!");
            }
          } catch (error) {
            alert("Error verifying payment!");
          }
        },
        theme: {
          color: "#198754",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

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
            <div className="d-flex align-items-center mb-4">
              <button
                onClick={() => navigate(-1)}
                className="btn btn-outline-secondary me-3"
                style={{ minWidth: "100px" }}
              >
                ← Back
              </button>
              <div>
                <h3 className="mb-1">House Rent Payment</h3>
                <p className="text-muted mb-0">Pay your rent securely and keep digital receipts</p>
              </div>
            </div>

            <div className="card shadow-lg border-0">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <div
                    className="bg-success-subtle rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <FaHome className="text-success" style={{ fontSize: "2.5rem" }} />
                  </div>
                  <h5 className="mt-3 text-dark fw-bold">Rent Bill Payment</h5>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tenant Name</label>
                    <input
                      type="text"
                      className="form-control form-control-lg border-2"
                      placeholder="Enter tenant's full name"
                      name="tenantName"
                      value={formData.tenantName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Landlord Name</label>
                    <input
                      type="text"
                      className="form-control form-control-lg border-2"
                      placeholder="Enter landlord's full name"
                      name="landlordName"
                      value={formData.landlordName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Property Address</label>
                    <input
                      type="text"
                      className="form-control form-control-lg border-2"
                      placeholder="Enter rented property address"
                      name="propertyAddress"
                      value={formData.propertyAddress}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Rent Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control form-control-lg border-2"
                      placeholder="Enter rent amount"
                      name="rentAmount"
                      value={formData.rentAmount}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Month / Period</label>
                    <input
                      type="month"
                      className="form-control form-control-lg border-2"
                      name="rentMonth"
                      value={formData.rentMonth}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="alert alert-info border-0 mb-4">
                    <div className="d-flex align-items-center">
                      <FaCheckCircle className="text-info me-2" />
                      <small>
                        <strong>Secure Payment:</strong> All transactions are end-to-end encrypted
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
                        <FaHome className="me-2" />
                        Pay House Rent - ₹{formData.rentAmount || "0"}
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
                  Recent Rent Payments
                </h6>
              </div>
              <div className="card-body">
                {recentPayments.length === 0 ? (
                  <div className="text-center text-muted py-3">
                    <i className="bi bi-receipt" style={{ fontSize: "2rem" }}></i>
                    <p className="mt-2 mb-0">No recent payments found</p>
                    <small>Your rent payment history will appear here</small>
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
          </div>
        </div>
      </div>
    </>
  );
}