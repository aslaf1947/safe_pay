// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import {
//   FaBolt,
//   FaHome,
//   FaMobileAlt,
//   FaWifi,
//   FaCreditCard,
//   FaBus,
//   FaPlane,
//   FaEllipsisH,
// } from "react-icons/fa";
// import "bootstrap/dist/css/bootstrap.min.css";
// import Header from "./Header";

// const services = [
//   { id: 1, name: "Electricity Bill", icon: <FaBolt className="text-warning" /> },
//   { id: 2, name: "House Rent", icon: <FaHome className="text-success" /> },
//   { id: 3, name: "Mobile Recharge", icon: <FaMobileAlt className="text-primary" /> },
//   { id: 4, name: "WiFi Bill", icon: <FaWifi className="text-info" /> },
//   { id: 5, name: "Credit Card", icon: <FaCreditCard className="text-danger" /> },
//   { id: 6, name: "Bus Tickets", icon: <FaBus className="text-warning" /> },
//   { id: 7, name: "Flight Booking", icon: <FaPlane className="text-primary" /> },
//   { id: 8, name: "More", icon: <FaEllipsisH className="text-secondary" /> },
// ];

// export default function ServicePage() {
//   const [showMore, setShowMore] = useState(false);

//   const handleServiceClick = (serviceName) => {
//     alert(`You clicked on ${serviceName}`);
//   };

//   return (
//     <>
//      <Header/>
//     <div className="container py-4">
       
//       <h2 className="text-center mb-4 fw-bold text-dark">Services</h2>

//       {/* Service Grid */}
//       <div className="row g-3 text-center">
//         {services.slice(0, showMore ? services.length : 6).map((service) => (
//           <div className="col-4 col-md-3" key={service.id}>
//             <motion.div
//               whileTap={{ scale: 0.85 }}
//               className="card border-0 shadow-sm p-3 rounded-4 service-card"
//               style={{
//                 cursor: "pointer",
//                 transition: "all 0.3s ease-in-out",
//               }}
//               onClick={() => handleServiceClick(service.name)}
//             >
//               <div
//                 className="d-flex justify-content-center align-items-center mb-2"
//                 style={{
//                   width: "50px",
//                   height: "50px",
//                   margin: "0 auto",
//                   borderRadius: "50%",
//                   backgroundColor: "#f8f9fa",
//                 }}
//               >
//                 <div className="fs-3">{service.icon}</div>
//               </div>
//               <p className="small fw-semibold text-dark mb-0">{service.name}</p>
//             </motion.div>
//           </div>
//         ))}
//       </div>

//       {/* Show More Button */}
//       <div className="text-center mt-4">
//         <button
//           className="btn btn-primary px-4 rounded-pill shadow"
//           onClick={() => setShowMore(!showMore)}
//         >
//           {showMore ? "Show Less" : "Show More"}
//         </button>
//       </div>
//     </div>
//     </>
//   );
// }

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaBolt,
  FaHome,
  FaMobileAlt,
  FaWifi,
  FaCreditCard,
  FaBus,
  FaPlane,
  FaEllipsisH,
  FaTint,
  FaGasPump,
  FaTv,
  FaGraduationCap,
  FaHospital,
  FaMoneyBillWave,
  FaGoogle,
  FaAmazon,
  FaShoppingCart,
  FaGamepad,
  FaFilm,
  FaMusic,
  FaBook,
  FaUtensils,
  FaCar
} from "react-icons/fa";
import { SiGooglepay, SiPhonepe, SiPaytm } from "react-icons/si";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./Header";

const services = [
  { 
    id: 1, 
    name: "Electricity Bill", 
    icon: <FaBolt className="text-warning" />,
    route: "/electricity"
  },
  { 
    id: 2, 
    name: "House Rent", 
    icon: <FaHome className="text-success" />,
    route: "/house"
  },
  { 
    id: 3, 
    name: "Mobile Recharge", 
    icon: <FaMobileAlt className="text-primary" />,
    route: "/mobile"
  },
  { 
    id: 4, 
    name: "WiFi Bill", 
    icon: <FaWifi className="text-info" />,
    route: "/wifi"
  },
  { 
    id: 5, 
    name: "Credit Card", 
    icon: <FaCreditCard className="text-danger" />,
    route: "/creadit"
  },
  { 
    id: 6, 
    name: "Water Bill", 
    icon: <FaTint className="text-primary" />,
    route: "/water"
  },
  { 
    id: 7, 
    name: "Gas Bill", 
    icon: <FaGasPump className="text-warning" />,
    route: "/gas"
  },
  { 
    id: 8, 
    name: "DTH/Cable TV", 
    icon: <FaTv className="text-info" />,
    route: "/cable"
  },
  { 
    id: 9, 
    name: "Bus Tickets", 
    icon: <FaBus className="text-warning" />,
    route: "/bus"
  },
  { 
    id: 10, 
    name: "Flight Booking", 
    icon: <FaPlane className="text-primary" />,
    route: "/flight"
  },
  { 
    id: 14, 
    name: "Education Fee", 
    icon: <FaGraduationCap className="text-success" />,
    route: "/education"
  },
  { 
    id: 15, 
    name: "Hospital Bill", 
    icon: <FaHospital className="text-danger" />,
    route: "/hospital"
  },
  { 
    id: 16, 
    name: "Loan EMI", 
    icon: <FaMoneyBillWave className="text-warning" />,
    route: "/loan"
  },
  // { 
  //   id: 17, 
  //   name: "Amazon Pay", 
  //   icon: <FaAmazon className="text-warning" />,
  //   route: "/services/amazon"
  // },
  // { 
  //   id: 18, 
  //   name: "Online Shopping", 
  //   icon: <FaShoppingCart className="text-success" />,
  //   route: "/services/shopping"
  // },
  // { 
  //   id: 19, 
  //   name: "Gaming", 
  //   icon: <FaGamepad className="text-primary" />,
  //   route: "/services/gaming"
  // },
  // { 
  //   id: 20, 
  //   name: "Movie Tickets", 
  //   icon: <FaFilm className="text-danger" />,
  //   route: "/services/movies"
  // },
  // { 
  //   id: 22, 
  //   name: "Book Store", 
  //   icon: <FaBook className="text-success" />,
  //   route: "/services/books"
  // },
  // { 
  //   id: 23, 
  //   name: "Food Delivery", 
  //   icon: <FaUtensils className="text-warning" />,
  //   route: "/services/food"
  // },
  // { 
  //   id: 24, 
  //   name: "Cab Booking", 
  //   icon: <FaCar className="text-primary" />,
  //   route: "/services/cab"
  // }
];

export default function ServicePage() {
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();

  const handleServiceClick = (service) => {
    navigate(service.route);
  };

  return (
    <>
      <Header />
      <div className="container py-4">
        <div className="text-center mb-5">
          <div className="mb-3">
            <i className="bi bi-grid-3x3-gap-fill text-primary" style={{fontSize: '3rem'}}></i>
          </div>
          <h2 className="fw-bold text-dark mb-2">All Services</h2>
          <p className="text-muted">Choose from our wide range of services</p>
        </div>

        {/* Service Grid */}
        <div className="row g-4">
          {services.slice(0, showMore ? services.length : 12).map((service) => (
            <div className="col-6 col-md-4 col-lg-3" key={service.id}>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="card border-0 shadow-sm h-100"
                style={{
                  cursor: "pointer",
                  transition: "all 0.3s ease-in-out",
                  borderRadius: "16px"
                }}
                onClick={() => handleServiceClick(service)}
              >
                <div className="card-body text-center p-4">
                  <div
                    className="d-flex justify-content-center align-items-center mb-3 mx-auto"
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    <div style={{ fontSize: '1.8rem' }}>{service.icon}</div>
                  </div>
                  <h6 className="fw-semibold text-dark mb-0" style={{ fontSize: '0.9rem' }}>
                    {service.name}
                  </h6>
                </div>
                
                {/* Hover effect overlay */}
                <div 
                  className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                  style={{
                    background: 'linear-gradient(45deg, rgba(0,123,255,0.1), rgba(40,167,69,0.1))',
                    borderRadius: "16px",
                    opacity: 0,
                    transition: "opacity 0.3s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = 1}
                  onMouseLeave={(e) => e.target.style.opacity = 0}
                >
                  <span className="text-primary fw-bold">Click to Open</span>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Show More/Less Button */}
        <div className="text-center mt-5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary btn-lg px-5 rounded-pill shadow-lg"
            onClick={() => setShowMore(!showMore)}
            style={{
              background: 'linear-gradient(45deg, #007bff, #28a745)',
              border: 'none',
              minWidth: '200px'
            }}
          >
            {showMore ? (
              <>
                <i className="bi bi-chevron-up me-2"></i>
                Show Less
              </>
            ) : (
              <>
                <i className="bi bi-chevron-down me-2"></i>
                Show More Services
              </>
            )}
          </motion.button>
        </div>

        {/* Service Categories */}
        <div className="row mt-5 g-4">
          <div className="col-md-4">
            <div className="card border-primary border-2 h-100">
              <div className="card-body text-center">
                <FaBolt className="text-primary mb-3" style={{fontSize: '2.5rem'}} />
                <h5 className="text-primary">Bill Payments</h5>
                <p className="text-muted small">Electricity, Water, Gas, WiFi & More</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-success border-2 h-100">
              <div className="card-body text-center">
                <SiGooglepay className="text-success mb-3" style={{fontSize: '2.5rem'}} />
                <h5 className="text-success">Digital Wallets</h5>
                <p className="text-muted small">Google Pay, PhonePe, Paytm & More</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-warning border-2 h-100">
              <div className="card-body text-center">
                <FaPlane className="text-warning mb-3" style={{fontSize: '2.5rem'}} />
                <h5 className="text-warning">Travel & Entertainment</h5>
                <p className="text-muted small">Flights, Bus, Movies, Gaming & More</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}