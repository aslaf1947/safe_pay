// import React from "react";
// import { Link } from "react-router-dom";
// import Header from "./Header";
// import Footer from "./Footer";

// export default function Home() {
//   // Features data
//   const features = [
//     {
//       icon: "bi-lightning-charge",
//       title: "Instant Transfers",
//       description: "Send money instantly to anyone, anywhere in the world",
//     },
//     {
//       icon: "bi-shield-check",
//       title: "Bank-Level Security",
//       description: "Your money and data are protected with advanced encryption",
//     },
//     {
//       icon: "bi-qr-code",
//       title: "QR Payments",
//       description: "Pay merchants quickly by scanning QR codes",
//     },
//     {
//       icon: "bi-bell",
//       title: "Smart Notifications",
//       description: "Get real-time alerts for all your transactions",
//     },
//   ];

//   // Stats data
//   const stats = [
//     { number: "50M+", label: "Active Users" },
//     { number: "$2.5B+", label: "Processed Monthly" },
//     { number: "99.9%", label: "Uptime" },
//     { number: "180+", label: "Countries" },
//   ];

//   return (
//     <div>
//       <Header />

//       {/* Hero Section */}
//       <section className="hero-section">
//         <div className="container">
//           <div className="row align-items-center min-vh-75">
//             <div className="col-lg-6 hero-content">
//               <h1 className="display-4 fw-bold mb-4">
//                 The Future of
//                 <span className="d-block text-info">Digital Payments</span>
//               </h1>
//               <p className="lead mb-4 text-light">
//                 Send, receive, and manage your money with ease. SafePay offers
//                 secure, instant transfers with just a tap.
//               </p>
//               <div className="d-flex flex-column flex-sm-row gap-3">
//                 <Link
//                   to="/"
//                   className="btn btn-light btn-lg text-primary fw-semibold"
//                 >
//                   Start Free Today
//                   <i className="bi bi-arrow-right ms-2"></i>
//                 </Link>
//                 <button className="btn btn-outline-light btn-lg">
//                   Watch Demo
//                 </button>
//               </div>
//             </div>

//             {/* Balance Card */}
//             <div className="col-lg-6 mt-5 mt-lg-0">
//               <div className="position-relative">
//                 <div
//                   className="card shadow-lg border-0 p-4"
//                   style={{ transform: "rotate(3deg)" }}
//                 >
//                   <div className="card-gradient rounded p-4 mb-4">
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                       <small className="text-light opacity-75">
//                         SafePay Balance
//                       </small>
//                       <i className="bi bi-credit-card fs-4"></i>
//                     </div>
//                     <h3 className="fw-bold mb-0">$2,547.80</h3>
//                   </div>
//                   <div className="space-y-3">
//                     <div className="d-flex justify-content-between align-items-center py-2">
//                       <div className="d-flex align-items-center">
//                         <div
//                           className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
//                           style={{ width: "32px", height: "32px" }}
//                         >
//                           <i className="bi bi-arrow-down-left text-success"></i>
//                         </div>
//                         <span className="fw-medium">Coffee Shop</span>
//                       </div>
//                       <span className="text-success fw-semibold">+$4.50</span>
//                     </div>

//                     <div className="d-flex justify-content-between align-items-center py-2">
//                       <div className="d-flex align-items-center">
//                         <div
//                           className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
//                           style={{ width: "32px", height: "32px" }}
//                         >
//                           <i className="bi bi-arrow-up-right text-primary"></i>
//                         </div>
//                         <span className="fw-medium">John Doe</span>
//                       </div>
//                       <span className="fw-semibold">-$25.00</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section className="stats-section">
//         <div className="container">
//           <div className="row">
//             {stats.map((stat, index) => (
//               <div key={index} className="col-6 col-md-3 mb-4">
//                 <div className="stat-item text-center">
//                   <div className="stat-number fw-bold fs-4">{stat.number}</div>
//                   <div className="stat-label text-muted">{stat.label}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="py-5">
//         <div className="container">
//           <div className="text-center mb-5">
//             <h2 className="display-5 fw-bold mb-4">Why Choose SafePay?</h2>
//             <p
//               className="lead text-muted mx-auto"
//               style={{ maxWidth: "600px" }}
//             >
//               Experience the most secure, fast, and user-friendly payment
//               platform designed for the modern world.
//             </p>
//           </div>

//           <div className="row g-4">
//             {features.map((feature, index) => (
//               <div key={index} className="col-md-6 col-lg-3">
//                 <div className="card feature-card h-100 text-center">
//                   <div className="card-body">
//                     <div className="feature-icon mb-3">
//                       <i className={`${feature.icon} fs-2`}></i>
//                     </div>
//                     <h5 className="card-title fw-semibold mb-3">
//                       {feature.title}
//                     </h5>
//                     <p className="card-text text-muted">
//                       {feature.description}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Security Section */}
//       <section id="security" className="py-5 bg-light">
//         <div className="container">
//           <div className="row align-items-center">
//             {/* Text Content */}
//             <div className="col-lg-6">
//               <h2 className="display-6 fw-bold mb-4">
//                 Your Security is Our Priority
//               </h2>
//               <p className="lead text-muted mb-4">
//                 We use advanced encryption and security measures to protect your
//                 financial information and transactions.
//               </p>
//               <div className="list-group list-group-flush">
//                 {[
//                   "256-bit SSL encryption",
//                   "Two-factor authentication",
//                   "Biometric security",
//                   "24/7 fraud monitoring",
//                   "PCI DSS compliance",
//                 ].map((item, index) => (
//                   <div
//                     key={index}
//                     className="list-group-item border-0 px-0 py-2"
//                   >
//                     <i className="bi bi-check-circle-fill text-success me-3"></i>
//                     <span>{item}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Security Card */}
//             <div className="col-lg-6 mt-5 mt-lg-0">
//               <div className="card shadow border-0 p-4">
//                 <div className="text-center">
//                   <div
//                     className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
//                     style={{ width: "80px", height: "80px" }}
//                   >
//                     <i className="bi bi-shield-lock fs-1 text-success"></i>
//                   </div>
//                   <h4 className="fw-semibold mb-3">Bank-Level Security</h4>
//                   <p className="text-muted">
//                     Your data is protected with the same security standards used
//                     by major financial institutions worldwide.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Call To Action Section */}
//       <section className="py-5 bg-primary text-white">
//         <div className="container text-center">
//           <div className="row justify-content-center">
//             <div className="col-lg-8">
//               <h2 className="display-6 fw-bold mb-4">
//                 Ready to Get Started?
//               </h2>
//               <p className="lead mb-4">
//                 Join millions of users who trust SafePay for their daily
//                 transactions.
//               </p>
//               <Link
//                 to="/auth"
//                 className="btn btn-light btn-lg text-primary fw-semibold"
//               >
//                 Create Account Now
//                 <i className="bi bi-arrow-right ms-2"></i>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>
//       <Footer></Footer>
//     </div>
//   );
// }

import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import Header from "./Header";
import Footer from "./Footer";
import "./Cursor.css"; // <-- include cursor styles

export default function Home() {
  // Features data
  const features = [
    {
      icon: "bi-lightning-charge",
      title: "Instant Transfers",
      description: "Send money instantly to anyone, anywhere in the world",
    },
    {
      icon: "bi-shield-check",
      title: "Bank-Level Security",
      description: "Your money and data are protected with advanced encryption",
    },
    {
      icon: "bi-qr-code",
      title: "QR Payments",
      description: "Pay merchants quickly by scanning QR codes",
    },
    {
      icon: "bi-bell",
      title: "Smart Notifications",
      description: "Get real-time alerts for all your transactions",
    },
  ];

  const stats = [
    { number: "50M+", label: "Active Users" },
    { number: "$2.5B+", label: "Processed Monthly" },
    { number: "99.9%", label: "Uptime" },
    { number: "180+", label: "Countries" },
  ];

  // ===== Custom Cursor Animation =====
  useEffect(() => {
    const cursor = document.querySelector(".cursor");
    const follower = document.querySelector(".cursor-follower");

    let posX = 0, posY = 0;
    let mouseX = 0, mouseY = 0;

    gsap.to({}, {
      duration: 0.016,
      repeat: -1,
      onRepeat: () => {
        posX += (mouseX - posX) / 9;
        posY += (mouseY - posY) / 9;

        gsap.set(follower, { css: { left: posX - 12, top: posY - 12 } });
        gsap.set(cursor, { css: { left: mouseX, top: mouseY } });
      },
    });

    const moveHandler = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener("mousemove", moveHandler);

    // Add hover effect for elements with `.link` class
    const hoverElements = document.querySelectorAll(".link");
    hoverElements.forEach(el => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("active");
        follower.classList.add("active");
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("active");
        follower.classList.remove("active");
      });
    });

    return () => {
      window.removeEventListener("mousemove", moveHandler);
    };
  }, []);

  return (
    <div>
      {/* Custom Cursor */}
      <div className="cursor"></div>
      <div className="cursor-follower"></div>

      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center min-vh-75">
            <div className="col-lg-6 hero-content">
              <h1 className="display-4 fw-bold mb-4">
                The Future of
                <span className="d-block text-info">Digital Payments</span>
              </h1>
              <p className="lead mb-4 text-light">
                Send, receive, and manage your money with ease. SafePay offers
                secure, instant transfers with just a tap.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3">
                <Link
                  to="/"
                  className="btn btn-light btn-lg text-primary fw-semibold link"
                >
                  Start Free Today
                  <i className="bi bi-arrow-right ms-2"></i>
                </Link>
                <button className="btn btn-outline-light btn-lg link">
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Balance Card */}
            <div className="col-lg-6 mt-5 mt-lg-0">
              <div className="position-relative">
                <div
                  className="card shadow-lg border-0 p-4"
                  style={{ transform: "rotate(3deg)" }}
                >
                  <div className="card-gradient rounded p-4 mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <small className="text-light opacity-75">
                        SafePay Balance
                      </small>
                      <i className="bi bi-credit-card fs-4"></i>
                    </div>
                    <h3 className="fw-bold mb-0">$2,547.80</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="d-flex justify-content-between align-items-center py-2">
                      <div className="d-flex align-items-center">
                        <div
                          className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ width: "32px", height: "32px" }}
                        >
                          <i className="bi bi-arrow-down-left text-success"></i>
                        </div>
                        <span className="fw-medium">Coffee Shop</span>
                      </div>
                      <span className="text-success fw-semibold">+$4.50</span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center py-2">
                      <div className="d-flex align-items-center">
                        <div
                          className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ width: "32px", height: "32px" }}
                        >
                          <i className="bi bi-arrow-up-right text-primary"></i>
                        </div>
                        <span className="fw-medium">John Doe</span>
                      </div>
                      <span className="fw-semibold">-$25.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="row">
            {stats.map((stat, index) => (
              <div key={index} className="col-6 col-md-3 mb-4">
                <div className="stat-item text-center">
                  <div className="stat-number fw-bold fs-4">{stat.number}</div>
                  <div className="stat-label text-muted">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-4">Why Choose SafePay?</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: "600px" }}>
              Experience the most secure, fast, and user-friendly payment
              platform designed for the modern world.
            </p>
          </div>

          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-md-6 col-lg-3">
                <div className="card feature-card h-100 text-center link">
                  <div className="card-body">
                    <div className="feature-icon mb-3">
                      <i className={`${feature.icon} fs-2`}></i>
                    </div>
                    <h5 className="card-title fw-semibold mb-3">
                      {feature.title}
                    </h5>
                    <p className="card-text text-muted">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-5 bg-primary text-white">
        <div className="container text-center">
          <h2 className="display-6 fw-bold mb-4">Ready to Get Started?</h2>
          <p className="lead mb-4">
            Join millions of users who trust SafePay for their daily
            transactions.
          </p>
          <Link to="/auth" className="btn btn-light btn-lg text-primary fw-semibold link">
            Create Account Now
            <i className="bi bi-arrow-right ms-2"></i>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
