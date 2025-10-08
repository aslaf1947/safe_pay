import React,{useState} from 'react'
import { Link, useNavigate } from 'react-router-dom';

function Login() {
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const navigate = useNavigate();

    const handleLogin=(e)=>{
        e.preventDefault();
        let param={ 
            email:email,    
            password:password
        }
        fetch("http://localhost:4000/safepay/login",{
            method:"POST",
            headers:{
                Accept:"application/json",
                "Content-Type":"application/json"
            },
            body:JSON.stringify(param)
        }).then((res)=>res.json())
        .then((data)=>{
            console.log(data)
            localStorage.setItem("ourstorage", JSON.stringify(data.user));
            setEmail('');
            setPassword('');
            navigate("/");
        })
    }
  return (
    <>
      <style jsx>{`
        body {
          background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .safepay-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          max-width: 480px;
          margin: 2rem auto;
        }
        .safepay-header {
          background: linear-gradient(135deg, #4285f4 0%, #1976d2 100%);
          padding: 3rem 2rem 2rem;
          text-align: center;
          position: relative;
        }
        .back-button {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .back-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateX(-2px);
        }
        .safepay-logo {
          width: 48px;
          height: 48px;
          background: white;
          border-radius: 8px;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #4285f4;
          font-size: 20px;
        }
        .safepay-title {
          color: white;
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .safepay-subtitle {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          font-weight: 400;
        }
        .safepay-form {
          padding: 2rem;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 14px;
        }
        .input-wrapper {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          width: 20px;
          height: 20px;
          z-index: 2;
        }
        .form-input {
          width: 100%;
          padding: 16px 16px 16px 50px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.2s;
          background: #f9fafb;
          box-sizing: border-box;
        }
        .form-input:focus {
          outline: none;
          border-color: #4285f4;
          background: white;
          box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
        }
        .form-input::placeholder {
          color: #9ca3af;
        }
        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          z-index: 2;
        }
        .password-toggle:hover {
          color: #4285f4;
        }
        .create-btn {
          width: 100%;
          background: linear-gradient(135deg, #4285f4 0%, #1976d2 100%);
          color: white;
          border: none;
          padding: 16px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 1rem;
        }
        .create-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
        }
        .signin-link {
          text-align: center;
          margin-top: 1.5rem;
          color: #6b7280;
          font-size: 14px;
        }
        .signin-link a {
          color: #4285f4;
          text-decoration: none;
          font-weight: 500;
        }
        .signin-link a:hover {
          text-decoration: underline;
        }
      `}</style>
      
      <div className="min-vh-100 d-flex align-items-center" style={{background: 'linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%)'}}>
        <div className="container">
          <div className="safepay-card">
            <div className="safepay-header">
              <button 
                type="button" 
                className="back-button"
                onClick={() => window.history.back()}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="safepay-logo">SP</div>
              <h1 className="safepay-title">Welcome to SafePay</h1>
              <p className="safepay-subtitle">Sign in to your account</p>
            </div>
            
            <div className="safepay-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <input 
                    type="email" 
                    className="form-input"
                    placeholder="Enter your email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <svg className="input-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <input 
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="Enter your password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    style={{paddingRight: '50px'}}
                    required
                  />
                  <button 
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button 
                onClick={handleLogin} 
                type="submit" 
                className="create-btn"
              >
                Login
              </button>

              <div className="signin-link">
                Don't have an account? <Link to="/register" onClick={(e) => e.preventDefault()}>Sign Up</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login