import './App.css'
import VendorSignup from "./Vendor/Authentication/VendorSignup.jsx"
import VendorLogin from "./Vendor/Authentication/VendorLogin.jsx"
import {BrowserRouter, Route, Routes} from "react-router-dom";
import { Toaster } from 'react-hot-toast';


import VendorForgotPassword from "./Vendor/Authentication/VendorForgotPassword.jsx";
import VendorVerification from "./Vendor/Authentication/VendorVerification.jsx";
import VendorHomePage from "./Vendor/pages/Home Page/VendorHomePage.jsx";
import CreateHall from "./Vendor/pages/CreateHall.jsx";
import VendorResetPassword from "./Vendor/Authentication/VendorResetPassword.jsx";
import ManageHall from "./Vendor/pages/ManageHall.jsx";
import CreateCourt from './Vendor/pages/CreateCourt.jsx';

import UserSignup from "./User/Authentication/UserSignup.jsx";
import UserHomePage from "./User/pages/User Home page/UserHomePage.jsx";
import UserLogin from "./User/Authentication/UserLogin.jsx";
import UserForgotPassword from "./User/Authentication/UserForgotPassword.jsx";
import UserVerification from "./User/Authentication/UserVerification.jsx";
import UserResetPassword from "./User/Authentication/UserResetPassword.jsx";
import HallDetails from "./User/pages/HallDetails.jsx";
import ChooseCourtPage from "./User/Booking/ChooseCourtPage.jsx";
import CheckoutPage from "./User/Booking/CheckoutPage.jsx";
import BookingConfirmation from './User/Booking/BookingConfirmation.jsx';
import MyBookings from "./User/pages/User Home page/MyBookings.jsx";
import LandingPage from "./LandingPage.jsx";

function App() {

  return (
    <>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/vendor/signup" element={<VendorSignup />} />
                <Route path="/vendor/login" element={<VendorLogin />} />
                <Route path="/vendor/forgot-password" element={<VendorForgotPassword/>} />
                <Route path="/vendor/otp-form" element={<VendorVerification/>} />
                <Route path="/vendor/home-page/:vendorId" element={<VendorHomePage/>} />
                <Route path="/vendor/create-hall/:vendorId" element={<CreateHall/>} />
                <Route path="/vendor/reset-password" element={<VendorResetPassword/> } />
                <Route path="/vendor/:vendorId/hall/:hallId/manage" element={<ManageHall/>} />
                <Route path="/vendor/:vendorId/hall/:hallId/add-courts" element={<CreateCourt/>} />

                <Route path="/user/signup" element={<UserSignup />} />
                <Route path="/user/login" element={<UserLogin />} />
                <Route path="/user/forgot-password" element={<UserForgotPassword />} />
                <Route path="/user/otp-form" element={<UserVerification/>} />
                <Route path="/user/reset-password" element={<UserResetPassword />} />

                <Route path="/user/home-page/:userId" element={<UserHomePage />} />
                <Route path="/user/my-bookings/:userId" element={<MyBookings/>} />
                <Route path="/user/court-details/:userId/:hallId/:vendorId" element={<HallDetails/>} />
                <Route path="/user/:userId/book/:hallId" element={<ChooseCourtPage/>} />
                <Route path="/user/:userId/:hallId/checkout" element={<CheckoutPage/>} />
                <Route path="/user/:userId/booking-success" element={<BookingConfirmation/>} />

            </Routes>
        </BrowserRouter>
        <Toaster position="top-center" />
    </>
  );

}

export default App;
