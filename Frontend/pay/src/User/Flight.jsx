// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaPlane, FaCheckCircle, FaCalendarAlt, FaUsers } from "react-icons/fa";
// import Header from "./Header";

// export default function FlightBookingService() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     from: '',
//     to: '',
//     departureDate: '',
//     returnDate: '',
//     passengerCount: 1,
//     flightClass: 'economy',
//     tripType: 'oneway'
//   });
//   const [loading, setLoading] = useState(false);

//   const popularRoutes = [
//     { from: 'Delhi', to: 'Mumbai', price: '₹4,500' },
//     { from: 'Mumbai', to: 'Bangalore', price: '₹3,800' },
//     { from: 'Delhi', to: 'Goa', price: '₹5,200' },
//     { from: 'Chennai', to: 'Kolkata', price: '₹4,100' },
//   ];

//   const handleInputChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleRouteSelect = (route) => {
//     setFormData({
//       ...formData,
//       from: route.from,
//       to: route.to
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//       const response = await fetch('http://localhost:4000/safepay/services/flight-booking', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData)
//       });
      
//       const data = await response.json();
      
//       if (data.success) {
//         alert(`✅ Flight booking successful! PNR: ${data.pnr}`);
//         setFormData({
//           from: '', to: '', departureDate: '', returnDate: '',
//           passengerCount: 1, flightClass: 'economy', tripType: 'oneway'
//         });
//       } else {
//         alert('❌ Booking failed: ' + data.message);
//       }
//     } catch (error) {
//       alert('❌ Error: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <Header />
//       <div className="container py-4">
//         <div className="row justify-content-center">
//           <div className="col-lg-10">
//             {/* Header with Back Button */}
//             <div className="d-flex align-items-center mb-4">
//               <button
//                 onClick={() => navigate(-1)}
//                 className="btn btn-outline-secondary me-3"
//                 style={{ minWidth: '100px' }}
//               >
//                 ← Back
//               </button>
//               <div>
//                 <h3 className="mb-1">Flight Booking</h3>
//                 <p className="text-muted mb-0">Book domestic and international flights</p>
//               </div>
//             </div>

//             <div className="row g-4">
//               {/* Booking Form */}
//               <div className="col-lg-8">
//                 <div className="card shadow-lg border-0">
//                   <div className="card-body p-4">
//                     <div className="text-center mb-4">
//                       <div className="bg-primary-subtle rounded-circle d-inline-flex align-items-center justify-content-center" 
//                            style={{width: '80px', height: '80px'}}>
//                         <FaPlane className="text-primary" style={{fontSize: '2.5rem'}} />
//                       </div>
//                       <h5 className="mt-3 text-dark fw-bold">Book Your Flight</h5>
//                     </div>
                    
//                     <form onSubmit={handleSubmit}>
//                       {/* Trip Type */}
//                       <div className="mb-4">
//                         <div className="d-flex gap-4">
//                           <div className="form-check">
//                             <input 
//                               className="form-check-input" 
//                               type="radio" 
//                               name="tripType" 
//                               value="oneway"
//                               checked={formData.tripType === 'oneway'}
//                               onChange={handleInputChange}
//                             />
//                             <label className="form-check-label fw-semibold">One Way</label>
//                           </div>
//                           <div className="form-check">
//                             <input 
//                               className="form-check-input" 
//                               type="radio" 
//                               name="tripType" 
//                               value="roundtrip"
//                               checked={formData.tripType === 'roundtrip'}
//                               onChange={handleInputChange}
//                             />
//                             <label className="form-check-label fw-semibold">Round Trip</label>
//                           </div>
//                         </div>
//                       </div>

//                       {/* From and To */}
//                       <div className="row g-3 mb-4">
//                         <div className="col-md-6">
//                           <label className="form-label fw-semibold">
//                             <i className="bi bi-geo-alt me-2 text-primary"></i>
//                             From
//                           </label>
//                           <input 
//                             type="text" 
//                             className="form-control form-control-lg border-2" 
//                             placeholder="Departure city"
//                             name="from"
//                             value={formData.from}
//                             onChange={handleInputChange}
//                             required
//                           />
//                         </div>
//                         <div className="col-md-6">
//                           <label className="form-label fw-semibold">
//                             <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
//                             To
//                           </label>
//                           <input 
//                             type="text" 
//                             className="form-control form-control-lg border-2" 
//                             placeholder="Destination city"
//                             name="to"
//                             value={formData.to}
//                             onChange={handleInputChange}
//                             required
//                           />
//                         </div>
//                       </div>

//                       {/* Dates */}
//                       <div className="row g-3 mb-4">
//                         <div className="col-md-6">
//                           <label className="form-label fw-semibold">
//                             <FaCalendarAlt className="me-2 text-primary" />
//                             Departure Date
//                           </label>
//                           <input 
//                             type="date" 
//                             className="form-control form-control-lg border-2"
//                             name="departureDate"
//                             value={formData.departureDate}
//                             onChange={handleInputChange}
//                             min={new Date().toISOString().split('T')[0]}
//                             required
//                           />
//                         </div>
//                         {formData.tripType === 'roundtrip' && (
//                           <div className="col-md-6">
//                             <label className="form-label fw-semibold">
//                               <FaCalendarAlt className="me-2 text-primary" />
//                               Return Date
//                             </label>
//                             <input 
//                               type="date" 
//                               className="form-control form-control-lg border-2"
//                               name="returnDate"
//                               value={formData.returnDate}
//                               onChange={handleInputChange}
//                               min={formData.departureDate}
//                             />
//                           </div>
//                         )}
//                       </div>

//                       {/* Passengers and Class */}
//                       <div className="row g-3 mb-4">
//                         <div className="col-md-6">
//                           <label className="form-label fw-semibold">
//                             <FaUsers className="me-2 text-primary" />
//                             Passengers
//                           </label>
//                           <select 
//                             className="form-select form-select-lg border-2"
//                             name="passengerCount"
//                             value={formData.passengerCount}
//                             onChange={handleInputChange}
//                           >
//                             {[1,2,3,4,5,6,7,8,9].map(num => (
//                               <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
//                             ))}
//                           </select>
//                         </div>
//                         <div className="col-md-6">
//                           <label className="form-label fw-semibold">
//                             <i className="bi bi-airplane me-2 text-primary"></i>
//                             Class
//                           </label>
//                           <select 
//                             className="form-select form-select-lg border-2"
//                             name="flightClass"
//                             value={formData.flightClass}
//                             onChange={handleInputChange}
//                           >
//                             <option value="economy">Economy</option>
//                             <option value="premium">Premium Economy</option>
//                             <option value="business">Business</option>
//                             <option value="first">First Class</option>
//                           </select>
//                         </div>
//                       </div>
                      
//                       <div className="alert alert-info border-0 mb-4">
//                         <div className="d-flex align-items-center">
//                           <FaCheckCircle className="text-info me-2" />
//                           <small>
//                             <strong>Best Price Guarantee:</strong> We'll find you the best deals on flights
//                           </small>
//                         </div>
//                       </div>
                      
//                       <button 
//                         type="submit" 
//                         className="btn btn-primary btn-lg w-100 shadow-sm"
//                         disabled={loading}
//                         style={{ minHeight: '50px' }}
//                       >
//                         {loading ? (
//                           <>
//                             <span className="spinner-border spinner-border-sm me-2" role="status"></span>
//                             Searching Flights...
//                           </>
//                         ) : (
//                           <>
//                             <FaPlane className="me-2" />
//                             Search Flights
//                           </>
//                         )}
//                       </button>
//                     </form>
//                   </div>
//                 </div>
//               </div>

//               {/* Popular Routes */}
//               <div className="col-lg-4">
//                 <div className="card shadow-sm border-0">
//                   <div className="card-header bg-light border-0">
//                     <h6 className="mb-0 text-dark fw-bold">
//                       <i className="bi bi-star-fill text-warning me-2"></i>
//                       Popular Routes
//                     </h6>
//                   </div>
//                   <div className="card-body p-3">
//                     {popularRoutes.map((route, index) => (
//                       <div 
//                         key={index}
//                         className="card mb-2 border cursor-pointer hover-card"
//                         onClick={() => handleRouteSelect(route)}
//                         style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
//                       >
//                         <div className="card-body p-3">
//                           <div className="d-flex justify-content-between align-items-center">
//                             <div>
//                               <div className="fw-bold text-dark">{route.from} → {route.to}</div>
//                               <small className="text-muted">Starting from</small>
//                             </div>
//                             <div className="text-primary fw-bold">{route.price}</div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Flight Features */}
//                 <div className="card mt-4 shadow-sm border-0">
//                   <div className="card-header bg-light border-0">
//                     <h6 className="mb-0 text-dark">
//                       <i className="bi bi-check-circle me-2 text-success"></i>
//                       Why Book With Us?
//                     </h6>
//                   </div>
//                   <div className="card-body">
//                     <div className="d-flex align-items-center mb-3">
//                       <i className="bi bi-shield-check text-success me-3"></i>
//                       <small>Secure booking & payment</small>
//                     </div>
//                     <div className="d-flex align-items-center mb-3">
//                       <i className="bi bi-clock text-primary me-3"></i>
//                       <small>24/7 customer support</small>
//                     </div>
//                     <div className="d-flex align-items-center mb-3">
//                       <i className="bi bi-percent text-warning me-3"></i>
//                       <small>Best price guarantee</small>
//                     </div>
//                     <div className="d-flex align-items-center">
//                       <i className="bi bi-phone text-info me-3"></i>
//                       <small>Instant booking confirmation</small>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlane, FaCheckCircle, FaCalendarAlt, FaUsers, FaDownload } from "react-icons/fa";
import Header from "./Header";

export default function FlightBookingService() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    passengerCount: 1,
    flightClass: 'economy',
    tripType: 'oneway',
    amount: ''
  });
  const [loading, setLoading] = useState(false);
  const [recentBookings, setRecentBookings] = useState([]);
  const [errors, setErrors] = useState({
    from: "",
    to: "",
    departureDate: "",
    returnDate: "",
    passengerCount: "",
    amount: ""
  });
  const user = JSON.parse(localStorage.getItem("ourstorage"));

  const popularRoutes = [
    { from: 'Delhi', to: 'Mumbai', price: '₹4,500' },
    { from: 'Mumbai', to: 'Bangalore', price: '₹3,800' },
    { from: 'Delhi', to: 'Goa', price: '₹5,200' },
    { from: 'Chennai', to: 'Kolkata', price: '₹4,100' },
  ];

  // Fetch recent flight bookings
  const fetchRecentBookings = async () => {
    if (!user?.id && !user?._id) return;
    try {
      const res = await fetch(`http://localhost:4000/safepay/history/${user._id || user.id}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.transactions)) {
        setRecentBookings(
          data.transactions
            .filter(txn => txn.serviceType === "flight_booking")
            .slice(0, 5)
        );
      }
    } catch (err) {
      setRecentBookings([]);
    }
  };

  React.useEffect(() => {
    fetchRecentBookings();
    // eslint-disable-next-line
  }, []);

  // Validation function
  const validateField = (name, value) => {
    switch (name) {
      case "from":
      case "to":
        if (!value) return "This field is required.";
        if (!/^[a-zA-Z\s]+$/.test(value)) return "Only letters and spaces allowed.";
        return "";
      case "departureDate":
        if (!value) return "Departure date is required.";
        if (new Date(value) < new Date()) return "Date cannot be in the past.";
        return "";
      case "returnDate":
        if (formData.tripType === "roundtrip") {
          if (!value) return "Return date is required for round trip.";
          if (new Date(value) < new Date(formData.departureDate)) return "Return date must be after departure.";
        }
        return "";
      case "passengerCount":
        if (!value || isNaN(value) || value < 1) return "At least 1 passenger required.";
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
      [name]: name === "passengerCount" ? Math.max(1, +value) : value
    });
    setErrors({
      ...errors,
      [name]: validateField(name, value),
      ...(name === "departureDate" && formData.tripType === "roundtrip"
        ? { returnDate: validateField("returnDate", formData.returnDate) }
        : {}),
    });
  };

  const handleRouteSelect = (route) => {
    setFormData({
      ...formData,
      from: route.from,
      to: route.to
    });
    setErrors({
      ...errors,
      from: validateField("from", route.from),
      to: validateField("to", route.to),
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

  // Download ticket PDF
  const handleDownloadTicket = async (serviceId) => {
    try {
      const res = await fetch(`http://localhost:4000/safepay/invoice/${serviceId}`, {
        method: "GET",
      });
      if (!res.ok) throw new Error("Failed to download ticket");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `flight_ticket_${serviceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Could not download ticket.");
    }
  };

  // Submit booking
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
          serviceType: "flight_booking",
          serviceDetails: `${formData.from} → ${formData.to} | ${formData.passengerCount} passenger(s) | ${formData.flightClass} | ${formData.tripType} | ${formData.departureDate}${formData.tripType === "roundtrip" ? " - " + formData.returnDate : ""}`,
          amount: Number(formData.amount),
          userId: user?.id,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Failed to create booking: " + data.message);
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
        amount: data.order?.amount || Number(formData.amount) * 100, // fallback to entered amount
        currency: "INR",
        name: "SafePay",
        description: "Flight Ticket Booking",
        order_id: data.order?.id,
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
              alert("✅ Booking successful! Ticket issued.");
              setFormData({
                from: "",
                to: "",
                departureDate: "",
                returnDate: "",
                passengerCount: 1,
                flightClass: "economy",
                tripType: "oneway",
                amount: ""
              });
              fetchRecentBookings(); // Refresh list
            } else {
              alert("❌ Payment verification failed!");
            }
          } catch (error) {
            console.error(error);
            alert("Error verifying booking/payment!");
          }
        },
        theme: { color: "#3399cc" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error(error);
      alert("❌ Error initiating booking: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-10">
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
                <h3 className="mb-1">Flight Booking</h3>
                <p className="text-muted mb-0">Book domestic and international flights</p>
              </div>
            </div>

            <div className="row g-4">
              {/* Booking Form */}
              <div className="col-lg-8">
                <div className="card shadow-lg border-0">
                  <div className="card-body p-4">
                    <div className="text-center mb-4">
                      <div className="bg-primary-subtle rounded-circle d-inline-flex align-items-center justify-content-center"
                        style={{ width: "80px", height: "80px" }}>
                        <FaPlane className="text-primary" style={{ fontSize: "2.5rem" }} />
                      </div>
                      <h5 className="mt-3 text-dark fw-bold">Book Your Flight</h5>
                    </div>

                    <form onSubmit={handleSubmit}>
                      {/* Trip Type */}
                      <div className="mb-4">
                        <div className="d-flex gap-4">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="tripType"
                              value="oneway"
                              checked={formData.tripType === "oneway"}
                              onChange={handleInputChange}
                            />
                            <label className="form-check-label fw-semibold">One Way</label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="tripType"
                              value="roundtrip"
                              checked={formData.tripType === "roundtrip"}
                              onChange={handleInputChange}
                            />
                            <label className="form-check-label fw-semibold">Round Trip</label>
                          </div>
                        </div>
                      </div>

                      {/* From and To */}
                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            <i className="bi bi-geo-alt me-2 text-primary"></i>
                            From
                          </label>
                          <input
                            type="text"
                            className={`form-control form-control-lg border-2 ${errors.from ? "is-invalid" : ""}`}
                            placeholder="Departure city"
                            name="from"
                            value={formData.from}
                            onChange={handleInputChange}
                            required
                          />
                          {errors.from && (
                            <div className="invalid-feedback" style={{ display: "block" }}>
                              {errors.from}
                            </div>
                          )}
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                            To
                          </label>
                          <input
                            type="text"
                            className={`form-control form-control-lg border-2 ${errors.to ? "is-invalid" : ""}`}
                            placeholder="Destination city"
                            name="to"
                            value={formData.to}
                            onChange={handleInputChange}
                            required
                          />
                          {errors.to && (
                            <div className="invalid-feedback" style={{ display: "block" }}>
                              {errors.to}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            <FaCalendarAlt className="me-2 text-primary" />
                            Departure Date
                          </label>
                          <input
                            type="date"
                            className={`form-control form-control-lg border-2 ${errors.departureDate ? "is-invalid" : ""}`}
                            name="departureDate"
                            value={formData.departureDate}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split("T")[0]}
                            required
                          />
                          {errors.departureDate && (
                            <div className="invalid-feedback" style={{ display: "block" }}>
                              {errors.departureDate}
                            </div>
                          )}
                        </div>
                        {formData.tripType === "roundtrip" && (
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              <FaCalendarAlt className="me-2 text-primary" />
                              Return Date
                            </label>
                            <input
                              type="date"
                              className={`form-control form-control-lg border-2 ${errors.returnDate ? "is-invalid" : ""}`}
                              name="returnDate"
                              value={formData.returnDate}
                              onChange={handleInputChange}
                              min={formData.departureDate}
                              required={formData.tripType === "roundtrip"}
                            />
                            {errors.returnDate && (
                              <div className="invalid-feedback" style={{ display: "block" }}>
                                {errors.returnDate}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Passengers and Class */}
                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            <FaUsers className="me-2 text-primary" />
                            Passengers
                          </label>
                          <select
                            className={`form-select form-select-lg border-2 ${errors.passengerCount ? "is-invalid" : ""}`}
                            name="passengerCount"
                            value={formData.passengerCount}
                            onChange={handleInputChange}
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                              <option key={num} value={num}>
                                {num} Passenger{num > 1 ? "s" : ""}
                              </option>
                            ))}
                          </select>
                          {errors.passengerCount && (
                            <div className="invalid-feedback" style={{ display: "block" }}>
                              {errors.passengerCount}
                            </div>
                          )}
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            <i className="bi bi-airplane me-2 text-primary"></i>
                            Class
                          </label>
                          <select
                            className="form-select form-select-lg border-2"
                            name="flightClass"
                            value={formData.flightClass}
                            onChange={handleInputChange}
                          >
                            <option value="economy">Economy</option>
                            <option value="premium">Premium Economy</option>
                            <option value="business">Business</option>
                            <option value="first">First Class</option>
                          </select>
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
                          className={`form-control form-control-lg border-2 ${errors.amount ? "is-invalid" : ""}`}
                          placeholder="Enter amount"
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
                            <strong>Best Price Guarantee:</strong> We'll find you the best deals on flights
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
                            Searching Flights...
                          </>
                        ) : (
                          <>
                            <FaPlane className="me-2" />
                            Search Flights
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="col-lg-4">
                <div className="card mt-4 border-0 shadow-sm">
                  <div className="card-header bg-light border-0">
                    <h6 className="mb-0 text-dark">
                      <i className="bi bi-clock-history me-2"></i>
                      Recent Flight Bookings
                    </h6>
                  </div>
                  <div className="card-body">
                    {recentBookings.length === 0 ? (
                      <div className="text-center text-muted py-3">
                        <i className="bi bi-receipt" style={{ fontSize: "2rem" }}></i>
                        <p className="mt-2 mb-0">No recent bookings found</p>
                        <small>Your flight history will appear here</small>
                      </div>
                    ) : (
                      <ul className="list-group">
                        {recentBookings.map((booking) => (
                          <li
                            key={booking._id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            <div>
                              <span className="fw-bold text-success">₹{booking.amount}</span>{" "}
                              <span className="text-muted ms-2">
                                {booking.serviceDetails}
                              </span>
                              <br />
                              <small className="text-muted">
                                {new Date(booking.createdAt).toLocaleString("en-IN", {
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
                              onClick={() => handleDownloadTicket(booking._id)}
                            >
                              <FaDownload className="me-1" />
                              Ticket
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Popular Routes */}
                <div className="card shadow-sm border-0 mt-4">
                  <div className="card-header bg-light border-0">
                    <h6 className="mb-0 text-dark fw-bold">
                      <i className="bi bi-star-fill text-warning me-2"></i>
                      Popular Routes
                    </h6>
                  </div>
                  <div className="card-body p-3">
                    {popularRoutes.map((route, index) => (
                      <div
                        key={index}
                        className="card mb-2 border cursor-pointer hover-card"
                        onClick={() => handleRouteSelect(route)}
                        style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                      >
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <div className="fw-bold text-dark">
                                {route.from} → {route.to}
                              </div>
                              <small className="text-muted">Starting from</small>
                            </div>
                            <div className="text-primary fw-bold">{route.price}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flight Features */}
                <div className="card mt-4 shadow-sm border-0">
                  <div className="card-header bg-light border-0">
                    <h6 className="mb-0 text-dark">
                      <i className="bi bi-check-circle me-2 text-success"></i>
                      Why Book With Us?
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <i className="bi bi-shield-check text-success me-3"></i>
                      <small>Secure booking & payment</small>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <i className="bi bi-clock text-primary me-3"></i>
                      <small>24/7 customer support</small>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <i className="bi bi-percent text-warning me-3"></i>
                      <small>Best price guarantee</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-phone text-info me-3"></i>
                      <small>Instant booking confirmation</small>
                    </div>
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