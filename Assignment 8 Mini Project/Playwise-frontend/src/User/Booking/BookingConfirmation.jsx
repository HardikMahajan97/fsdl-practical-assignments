import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {showToast} from "../../Utils/ShowToast.jsx";

const BookingConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {userId} = useParams();
    
    const [successfulBookings, setSuccessfulBookings] = useState([]);
    const [failedBookings, setFailedBookings] = useState([]);
    const [customerDetails, setCustomerDetails] = useState(null);
    const [hallDetails, setHallDetails] = useState(null);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        if (location.state) {
            setSuccessfulBookings(location.state.successfulBookings || []);
            setFailedBookings(location.state.failedBookings || []);
            setCustomerDetails(location.state.customerDetails || null);
            setHallDetails(location.state.hallDetails || null);
            setTotalAmount(location.state.totalAmount || 0);
        } else {
            showToast({ message: "No booking confirmation data found", type: "error-dark" });
            navigate(`/user/home-page/${userId}`);
        }
    }, [location, navigate, userId]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadReceipt = () => {
        // Simple download as text - you can enhance this with PDF generation
        const receiptContent = `
            BOOKING CONFIRMATION
            ====================

            Hall: ${hallDetails?.name}
            Address: ${hallDetails?.address}, ${hallDetails?.city}, ${hallDetails?.state}

            Customer Details:
            Name: ${customerDetails?.fullName}
            Email: ${customerDetails?.email}
            Phone: ${customerDetails?.phone}

            Bookings:
            ${successfulBookings.map((booking, index) => `
            ${index + 1}. Court ${booking.courtNumber}
            Date: ${formatDate(booking.date)}
            Time: ${booking.slot}
            Price: ₹${booking.booking?.price || 0}
            `).join('\n')}

            Total Amount: ₹${totalAmount}

            Thank you for booking with us!
        `;

        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `booking-confirmation-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showToast({ message: "Receipt downloaded successfully!", type: "success-dark" });
    };

    const handleBackToHome = () => {
        navigate(`/user/home-page/${userId}`);
    };

    if (!customerDetails || !hallDetails) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                <div className="text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Loading...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-green-400 mb-2">Booking Confirmed!</h1>
                    <p className="text-slate-300 text-lg">
                        {successfulBookings.length} court(s) booked successfully
                    </p>
                    {failedBookings.length > 0 && (
                        <p className="text-yellow-400 text-sm mt-2">
                            ({failedBookings.length} booking(s) failed)
                        </p>
                    )}
                </div>

                {/* Confirmation Details Card */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden mb-6">
                    {/* Hall Information */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                        <h2 className="text-2xl font-bold mb-2">{hallDetails.name}</h2>
                        <p className="text-blue-100">
                            {hallDetails.address}, {hallDetails.city}, {hallDetails.state}
                        </p>
                        <p className="text-blue-100 text-sm mt-1">Mat Type: {hallDetails.matType}</p>
                    </div>

                    {/* Customer Details */}
                    <div className="p-6 border-b border-slate-700">
                        <h3 className="text-xl font-semibold text-blue-200 mb-4">Customer Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-slate-400 text-sm">Name</p>
                                <p className="text-white font-medium">{customerDetails.fullName}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Email</p>
                                <p className="text-white font-medium">{customerDetails.email}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Phone</p>
                                <p className="text-white font-medium">{customerDetails.phone}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Booking Date</p>
                                <p className="text-white font-medium">{new Date().toLocaleDateString('en-GB')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Successful Bookings */}
                    <div className="p-6">
                        <h3 className="text-xl font-semibold text-green-400 mb-4">
                            ✓ Confirmed Bookings
                        </h3>
                        <div className="space-y-4">
                            {successfulBookings.map((booking, index) => (
                                <div key={index} className="bg-slate-900 rounded-lg p-4 border border-green-500/20">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-semibold text-white mb-2">
                                                Court {booking.courtNumber}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                                <div>
                                                    <p className="text-slate-400">Date</p>
                                                    <p className="text-white font-medium">{formatDate(booking.date)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">Time</p>
                                                    <p className="text-white font-medium">{booking.slot}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">Price</p>
                                                    <p className="text-green-400 font-bold">₹{booking.booking?.price || 0}</p>
                                                </div>
                                            </div>
                                            {booking.booking?._id && (
                                                <div className="mt-2">
                                                    <p className="text-slate-400 text-xs">Booking ID</p>
                                                    <p className="text-blue-400 text-xs font-mono">{booking.booking._id}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                                Confirmed
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Failed Bookings */}
                    {failedBookings.length > 0 && (
                        <div className="p-6 bg-slate-900/50 border-t border-slate-700">
                            <h3 className="text-xl font-semibold text-red-400 mb-4">
                                ✕ Failed Bookings
                            </h3>
                            <div className="space-y-3">
                                {failedBookings.map((booking, index) => (
                                    <div key={index} className="bg-slate-800 rounded-lg p-4 border border-red-500/20">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-white font-semibold mb-1">
                                                    Court {booking.courtNumber}
                                                </h4>
                                                <p className="text-sm text-slate-400">
                                                    {formatDate(booking.date)} at {booking.slot}
                                                </p>
                                                <p className="text-sm text-red-400 mt-1">
                                                    Reason: {booking.error}
                                                </p>
                                            </div>
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                                                Failed
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Total Amount */}
                    <div className="p-6 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-t border-slate-700">
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-semibold text-white">Total Amount Paid</span>
                            <span className="text-3xl font-bold text-green-400">₹{totalAmount}</span>
                        </div>
                    </div>
                </div>

                {/* Important Information */}
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-blue-200 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Important Information
                    </h3>
                    <ul className="space-y-2 text-blue-100 text-sm">
                        <li>• A confirmation email has been sent to {customerDetails.email}</li>
                        <li>• Please arrive 10 minutes before your booking time</li>
                        <li>• Bring a valid ID proof for verification</li>
                        <li>• Carry this confirmation (digital or printed) to the venue</li>
                        <li>• Cancellation policy: Contact the venue for cancellation terms</li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print Confirmation
                    </button>
                    <button
                        onClick={handleDownloadReceipt}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Receipt
                    </button>
                    <button
                        onClick={handleBackToHome}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Back to Home
                    </button>
                </div>

                {/* Contact Support */}
                <div className="text-center mt-8 text-slate-400 text-sm">
                    <p>Need help? Contact us at support@badmintonbooking.com or call +91-XXXXXXXXXX</p>
                </div>
            </div>

            <style>{`
                @media print {
                    body {
                        background: white;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default BookingConfirmation;
