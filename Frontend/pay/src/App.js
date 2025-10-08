// import logo from './logo.svg';
// import './App.css';
// import Home from './User/Home';
// import { BrowserRouter, Route, Routes } from "react-router-dom";
// import Register from './User/Register';
// import Login from './User/Login';
// import { useState } from 'react';
// import Profile from './User/Profile';
// import Group from './User/Group';
// import GroupView from './User/GroupView';
// import GroupDetails from './User/GroupDetails';
// import Expense from './User/Expense';
// import UserBalances from './User/UserBalances';
// import Service from './User/Service';
// import GroupBalances from './User/GroupBalances';
// import GroupSettlement from './User/GroupSettlement';
// import WaterBillService from './User/Water';
// import MobileRechargeService from './User/Mobile';
// import HouseRentBill from './User/House';
// import WifiBill from './User/Wifi';
// import CreditCardBill from './User/Creaditcard';
// import GasBillService from './User/Gas';
// import CableDthBill from './User/Cable';
// import Electricity from './User/Electricity';
// import TransactionHistory from './User/History';
// import FlightBookingService from './User/Flight';
// import BusBooking from './User/Bus';
// import EducationFees from './User/Education';
// import HospitalBill from './User/hospital';
// import LoanEMIPayment from './User/Loan';
// import GroupFeed from './User/GroupFeed';
// import Dashboard from './Admin/Dashboard';
// import AdminGroups from './Admin/AdminGroups';
// import AdminTransactions from './Admin/AdminTransactions';
// import AdminActivityLogs from './Admin/AdminActivityLogs';
// import AdminUsers from './Admin/AdminUsers';


// function App() {
//   const [auth,setAuth]=useState(JSON.parse(localStorage.getItem("ourstorage")));

//   return (
//     <>
//     <BrowserRouter>
//     {auth==null?(
//       <>
//       <Routes>
//       <Route path="/" element={<Home/>}/>
//       <Route path='/register' element={<Register/>}/>
//       <Route path='/login' element={<Login/>}/>
//       </Routes>
//       </>
//     ):auth.usertype==0?(
//       <>
//       <Routes>
//       <Route path="/" element={<Home/>}/>
//       <Route path='/profile' element={<Profile/>}/>
//       <Route path='/group' element={<Group/>}/>
//       <Route path='/my-groups' element={<GroupView/>}/>
//       <Route path='/groups/:groupId/feed' element={<GroupFeed/>}/>
//       <Route path="/group/:groupId" element={<GroupDetails />} />
//       <Route path="/groups/:groupId/add-expense" element={<Expense/>} />
//       <Route path="/userbalances" element={<UserBalances />} />
//       <Route path="/groups/:groupId/balances" element={<GroupBalances />} />
//       <Route path="/groups/:groupId/settlement" element={<GroupSettlement />} />
//       <Route path='/service' element={<Service/>}/>
//       <Route path='/electricity' element={<Electricity/>}/>
//       <Route path='/water' element={<WaterBillService/>}/>
//       <Route path='/mobile'element={<MobileRechargeService/>}/>
//       <Route path='/house'element={<HouseRentBill/>}/>
//       <Route path='/wifi'element={<WifiBill/>}/>
//       <Route path='/creadit'element={<CreditCardBill/>}/>
//       <Route path='/gas' element={<GasBillService/>}/>
//       <Route path='/cable'element={<CableDthBill/>}/>
//       <Route path='/history' element={<TransactionHistory/>}/>
//       <Route path='/flight' element={<FlightBookingService/>}/>
//       <Route path='/bus' element={<BusBooking/>}/>
//       <Route path='/education' element={<EducationFees/>}/>
//       <Route path='/hospital' element={<HospitalBill/>}/>
//       <Route path='/loan' element={<LoanEMIPayment/>}/>
//       </Routes>
//       </>
//     ):auth.usertype==1?(
//     <>
//     <Routes>
      
//       <Route path="/" element={<Dashboard/>} />
//       {/* users route for admin */}
//       <Route path="/adminusers" element={<AdminUsers/>} />
//       {/* groups route for admin */}
//       <Route path="/admingroups" element={<AdminGroups/>} />
//       {/* transactions route for admin */}
//       <Route path="/admintransactions" element={<AdminTransactions/>} />
//       {/* activityLogs route for admin */}
//       <Route path="/adminactivityLogs" element={<AdminActivityLogs/>} />

//     </Routes>
//     </>
//     ):null}
//     </BrowserRouter>
//     </>
//   );
// }

// export default App;

import logo from './logo.svg';
import './App.css';
import Home from './User/Home';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Register from './User/Register';
import Login from './User/Login';
import { useState } from 'react';
import Profile from './User/Profile';
import Group from './User/Group';
import GroupView from './User/GroupView';
import GroupDetails from './User/GroupDetails';
import Expense from './User/Expense';
import UserBalances from './User/UserBalances';
import Service from './User/Service';
import GroupBalances from './User/GroupBalances';
import GroupSettlement from './User/GroupSettlement';
import WaterBillService from './User/Water';
import MobileRechargeService from './User/Mobile';
import HouseRentBill from './User/House';
import WifiBill from './User/Wifi';
import CreditCardBill from './User/Creaditcard';
import GasBillService from './User/Gas';
import CableDthBill from './User/Cable';
import Electricity from './User/Electricity';
import TransactionHistory from './User/History';
import FlightBookingService from './User/Flight';
import BusBooking from './User/Bus';
import EducationFees from './User/Education';
import HospitalBill from './User/hospital';
import LoanEMIPayment from './User/Loan';
import GroupFeed from './User/GroupFeed';
import Dashboard from './Admin/Dashboard';
import AdminGroups from './Admin/AdminGroups';
import AdminTransactions from './Admin/AdminTransactions';
import AdminActivityLogs from './Admin/AdminActivityLogs';
import AdminUsers from './Admin/AdminUsers';
import Notifications from './User/Notification';

function App() {
  // Safely parse localStorage value
  const stored = localStorage.getItem("ourstorage");
  let initialAuth = null;
  try {
    initialAuth = stored ? JSON.parse(stored) : null;
  } catch (e) {
    initialAuth = null;
  }
  const [auth, setAuth] = useState(initialAuth);

  return (
    <>
      <BrowserRouter>
        {auth == null ? (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        ) : auth.usertype === 0 ? (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/group" element={<Group />} />
            <Route path="/my-groups" element={<GroupView />} />
            <Route path="/groups/:groupId/feed" element={<GroupFeed />} />
            <Route path="/group/:groupId" element={<GroupDetails />} />
            <Route path="/groups/:groupId/add-expense" element={<Expense />} />
            <Route path="/userbalances" element={<UserBalances />} />
            <Route path="/groups/:groupId/balances" element={<GroupBalances />} />
            <Route path="/groups/:groupId/settlement" element={<GroupSettlement />} />
            <Route path="/service" element={<Service />} />
            <Route path="/electricity" element={<Electricity />} />
            <Route path="/water" element={<WaterBillService />} />
            <Route path="/mobile" element={<MobileRechargeService />} />
            <Route path="/house" element={<HouseRentBill />} />
            <Route path="/wifi" element={<WifiBill />} />
            <Route path="/creadit" element={<CreditCardBill />} />
            <Route path="/gas" element={<GasBillService />} />
            <Route path="/cable" element={<CableDthBill />} />
            <Route path="/history" element={<TransactionHistory />} />
            <Route path="/flight" element={<FlightBookingService />} />
            <Route path="/bus" element={<BusBooking />} />
            <Route path="/education" element={<EducationFees />} />
            <Route path="/hospital" element={<HospitalBill />} />
            <Route path="/loan" element={<LoanEMIPayment />} />
            <Route path="/notifications" element={<Notifications/>} />
          </Routes>
        ) : auth.usertype === 1 ? (
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/adminusers" element={<AdminUsers />} />
            <Route path="/admingroups" element={<AdminGroups />} />
            <Route path="/admintransactions" element={<AdminTransactions />} />
            <Route path="/adminactivityLogs" element={<AdminActivityLogs />} />
          </Routes>
        ) : null}
      </BrowserRouter>
    </>
  );
}

export default App;
