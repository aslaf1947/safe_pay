import { color } from "framer-motion";
import React from "react";

export default function Footer() {
  return (
    <footer className="footer bg-light py-5 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-3 mb-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center me-2" 
                   style={{width: '32px', height: '32px', color: 'lightblue'}}>
                <i className="bi bi-credit-card"></i>
              </div>
              <span className="fs-4 fw-bold " style={{color:'blue'}}>SafePay</span>
            </div>
            <p className="text-muted">
              The most trusted digital payment platform for the modern world.
            </p>
          </div>
          <div className="col-md-3 mb-4">
            <h5 className="mb-3"  style={{color:'blue'}}>Product</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Personal</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Business</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Enterprise</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">API</a></li>
            </ul>
          </div>
          <div className="col-md-3 mb-4">
            <h5 className="mb-3"  style={{color:'blue'}}>Company</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">About</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Careers</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Press</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Contact</a></li>
            </ul>
          </div>
          <div className="col-md-3 mb-4">
            <h5 className="mb-3"  style={{color:'blue'}}>Support</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Help Center</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Privacy Policy</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Terms of Service</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Security</a></li>
            </ul>
          </div>
        </div>
        <hr className="my-4" />
        <div className="text-center text-muted">
        </div>
      </div>
    </footer>
  );
}