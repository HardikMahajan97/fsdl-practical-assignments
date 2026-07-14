import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import showToast from "../../Utils/ShowToast.jsx";
import { API_BASE_URL } from '../../config.js';

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userId } = useParams();
    
    const [cart, setCart] = useState([]);
    const [hall, setHall] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const [customerDetails, setCustomerDetails] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: ""
    });
    
    const [paymentDetails, setPaymentDetails] = useState({
        paymentMethod: "card",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardHolderName: ""
    });

    useEffect(() => {
        // Get cart and hall data from previous page
        if (location.state) {
            setCart(location.state.cart || []);
            setHall(location.state.hall || null);
        } else {
            showToast({ message: "No booking data found", type: "error-dark" });
            navigate(-1);
        }
    }, [location, navigate]);

    const handleCustomerDetailsChange = (e) => {
        const { name, value } = e.target;
        setCustomerDetails(prev => ({ ...prev, [name]: value }));
    };

    const handlePaymentDetailsChange = (e) => {
        const { name, value } = e.target;
        setPaymentDetails(prev => ({ ...prev, [name]: value }));
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getTotalAmount = () => {
        return cart.reduce((total, item) => total + item.price, 0);
    };

    const validateForm = () => {
        const requiredFields = ['fullName', 'email', 'phone'];
        for (let field of requiredFields) {
            if (!customerDetails[field]) {
                showToast({ message: `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, type: "error-dark" });
                return false;
            }
        }

        if (paymentDetails.paymentMethod === 'card') {
            const cardFields = ['cardNumber', 'expiryDate', 'cvv', 'cardHolderName'];
            for (let field of cardFields) {
                if (!paymentDetails[field]) {
                    showToast({ message: `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, type: "error-dark" });
                    return false;
                }
            }
        }

        return true;
    };

    const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    const successfulBookings = [];
    const failedBookings = [];

    try {
        // Process each booking in sequence
        for (let i = 0; i < cart.length; i++) {
            const item = cart[i];
            
            try {
                const bookingData = {
                    date: item.date,
                    slot: item.slot,
                    customerDetails: customerDetails,
                    paymentDetails: paymentDetails,
                    sendEmail: i === cart.length - 1 // Only send email for last booking
                };

                console.log(`Processing booking ${i + 1}/${cart.length}:`, bookingData);

                const response = await fetch(`${API_BASE_URL}/booking/${userId}/create-booking/${hall._id}/${item.courtId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bookingData),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    successfulBookings.push({
                        ...data.data,
                        courtNumber: item.courtNumber,
                        slot: item.slot,
                        date: item.date
                    });
                    console.log(`✅ Booking ${i + 1} successful`);
                } else {
                    failedBookings.push({
                        courtNumber: item.courtNumber,
                        slot: item.slot,
                        date: item.date,
                        error: data.error || data.message || 'Unknown error'
                    });
                    console.log(`❌ Booking ${i + 1} failed:`, data.error);
                }

                // Small delay to avoid overwhelming the server
                if (i < cart.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

            } catch (error) {
                console.error(`Error processing booking ${i + 1}:`, error);
                failedBookings.push({
                    courtNumber: item.courtNumber,
                    slot: item.slot,
                    date: item.date,
                    error: error.message
                });
            }
        }

        // Handle results
        if (successfulBookings.length > 0) {
            showToast({ 
                message: `${successfulBookings.length} booking(s) confirmed successfully!`, 
                type: "success-dark" 
            });

            // Navigate to confirmation page
            navigate(`/user/${userId}/booking-success`, { 
                state: { 
                    successfulBookings,
                    failedBookings,
                    customerDetails,
                    hallDetails: hall,
                    totalAmount: successfulBookings.reduce((sum, booking) => sum + booking.booking.price, 0)
                } 
            });
        } else {
            showToast({ 
                message: "All bookings failed. Please try again.", 
                type: "error-dark" 
            });
            navigate(`/user/home-page/${userId}`);
        }

        // Show summary if some failed
        if (failedBookings.length > 0) {
            console.log("Failed bookings:", failedBookings);
            showToast({ 
                message: `${failedBookings.length} booking(s) failed. Check confirmation page for details.`, 
                type: "error-dark" 
            });
        }

    } catch (error) {
        console.error("Booking process error:", error);
        showToast({ 
            message: `Error processing bookings: ${error.message}`, 
            type: "error-dark" 
        });
    } finally {
        setLoading(false);
    }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                <div className="text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">No Items in Cart</h2>
                    <button 
                        onClick={() => navigate(-1)}
                        className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-center">Complete Your Booking</h1>
                    <p className="text-center opacity-90 mt-2">{hall?.name}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Section */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Customer Details */}
                        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                            <h2 className="text-2xl font-bold text-blue-200 mb-6">Customer Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={customerDetails.fullName}
                                        onChange={handleCustomerDetailsChange}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={customerDetails.email}
                                        onChange={handleCustomerDetailsChange}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={customerDetails.phone}
                                        onChange={handleCustomerDetailsChange}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={customerDetails.city}
                                        onChange={handleCustomerDetailsChange}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
                                    <textarea
                                        name="address"
                                        value={customerDetails.address}
                                        onChange={handleCustomerDetailsChange}
                                        rows={3}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                            <h2 className="text-2xl font-bold text-blue-200 mb-6">Payment Details</h2>
                            
                            {/* Payment Method Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-300 mb-3">Payment Method</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <label className="flex items-center p-4 bg-slate-900 rounded-lg border border-slate-600 cursor-pointer hover:border-blue-500">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="card"
                                            checked={paymentDetails.paymentMethod === 'card'}
                                            onChange={handlePaymentDetailsChange}
                                            className="mr-3"
                                        />
                                        <div>
                                            <div className="font-medium">Credit/Debit Card</div>
                                            <div className="text-sm text-slate-400">Visa, MasterCard, etc.</div>
                                        </div>
                                    </label>
                                    <label className="flex items-center p-4 bg-slate-900 rounded-lg border border-slate-600 cursor-pointer hover:border-blue-500">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="upi"
                                            checked={paymentDetails.paymentMethod === 'upi'}
                                            onChange={handlePaymentDetailsChange}
                                            className="mr-3"
                                        />
                                        <div>
                                            <div className="font-medium">UPI</div>
                                            <div className="text-sm text-slate-400">PayTM, PhonePe, GPay</div>
                                        </div>
                                    </label>
                                    <label className="flex items-center p-4 bg-slate-900 rounded-lg border border-slate-600 cursor-pointer hover:border-blue-500">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cash"
                                            checked={paymentDetails.paymentMethod === 'cash'}
                                            onChange={handlePaymentDetailsChange}
                                            className="mr-3"
                                        />
                                        <div>
                                            <div className="font-medium">Pay at Venue</div>
                                            <div className="text-sm text-slate-400">Cash payment</div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Card Details */}
                            {paymentDetails.paymentMethod === 'card' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Card Holder Name</label>
                                        <input
                                            type="text"
                                            name="cardHolderName"
                                            value={paymentDetails.cardHolderName}
                                            onChange={handlePaymentDetailsChange}
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Card Number</label>
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            value={paymentDetails.cardNumber}
                                            onChange={handlePaymentDetailsChange}
                                            placeholder="1234 5678 9012 3456"
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Expiry Date</label>
                                        <input
                                            type="text"
                                            name="expiryDate"
                                            value={paymentDetails.expiryDate}
                                            onChange={handlePaymentDetailsChange}
                                            placeholder="MM/YY"
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">CVV</label>
                                        <input
                                            type="text"
                                            name="cvv"
                                            value={paymentDetails.cvv}
                                            onChange={handlePaymentDetailsChange}
                                            placeholder="123"
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* UPI Details */}
                            {paymentDetails.paymentMethod === 'upi' && (
                                <div className="bg-blue-50/10 border border-blue-500/20 rounded-lg p-4">
                                    <p className="text-blue-200 text-sm">
                                        You will be redirected to your UPI app to complete the payment after confirming the booking.
                                    </p>
                                </div>
                            )}

                            {/* Cash Payment Details */}
                            {paymentDetails.paymentMethod === 'cash' && (
                                <div className="bg-green-50/10 border border-green-500/20 rounded-lg p-4">
                                    <p className="text-green-200 text-sm">
                                        Please pay the full amount at the venue before your booking time. Your booking will be confirmed upon payment.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white sticky top-6">
                            <h2 className="text-2xl font-bold mb-6">Booking Summary</h2>
                            
                            {/* Hall Details */}
                            <div className="mb-6 p-4 bg-white/10 rounded-lg">
                                <h3 className="font-semibold text-lg">{hall?.name}</h3>
                                <p className="text-sm opacity-90">{hall?.city}, {hall?.state}</p>
                                <p className="text-sm opacity-90">Mat Type: {hall?.matType}</p>
                            </div>

                            {/* Booking Items */}
                            <div className="space-y-4 mb-6">
                                {cart.map((item, index) => (
                                    <div key={index} className="bg-white/10 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-semibold">Court {item.courtNumber}</h4>
                                                <p className="text-sm opacity-90">{formatDate(item.date)}</p>
                                                <p className="text-sm opacity-90">{item.slot}</p>
                                            </div>
                                            <p className="font-bold">₹{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="border-t border-white/20 pt-4 mb-6">
                                <div className="flex justify-between items-center text-lg">
                                    <span className="font-semibold">Total Amount:</span>
                                    <span className="font-bold text-2xl">₹{getTotalAmount()}</span>
                                </div>
                                <p className="text-sm opacity-80 mt-1">{cart.length} court(s) booked</p>
                            </div>

                            {/* Confirm Booking Button */}
                            {/* Update the button to show progress */}
                            <button
                                onClick={handleBookingSubmit}
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                                    loading
                                        ? 'bg-gray-500 cursor-not-allowed'
                                        : 'bg-slate-900 hover:bg-slate-800 text-blue-300 border-2 border-blue-300 hover:scale-105'
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing bookings...
                                    </div>
                                ) : (
                                    'Confirm Booking'
                                )}
                            </button>


                            {/* Security Notice */}
                            <div className="mt-4 text-xs opacity-70 text-center">
                                <p>🔒 Your payment information is secure and encrypted</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
