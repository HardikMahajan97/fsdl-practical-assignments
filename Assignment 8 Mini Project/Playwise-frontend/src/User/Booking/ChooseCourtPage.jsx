import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import showToast from "../../Utils/ShowToast.jsx";
import { API_BASE_URL } from '../../config.js';

const ChooseCourtPage = () => {
    const { vendorId, hallId, userId } = useParams();
    const [hall, setHall] = useState(null);
    const [courts, setCourts] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHallDetails = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/halls/${vendorId}/${hallId}/get-all-courts`);
                const json = await response.json();
                if (!response.ok) {
                    showToast({ message: `Error fetching hall details: ${response.statusText}`, type: "error-dark" });
                    setLoading(false);
                    return;
                }
                if (json.success && json.data && json.data.length > 0) {
                    const hallData = json.data[0].hallId;  // This is the populated hall object!
                    setHall(hallData);
                    setCourts(json.data);
                } else {
                    showToast({ message: "No courts found for this hall", type: "error-dark" });
                }
            } catch (error) {
                showToast({ message: error.message, type: "error-dark" });
            } finally {
                setLoading(false);
            }
        };

        fetchHallDetails();
    }, []);

    const handleAddToCart = (court) => {
        if (!selectedDate || !selectedSlot) {
            showToast({ message: "Please select a date and slot first", type: "error-dark" });
            return;
        }

        // Check if this court is already in cart for the same date and slot
        const existingItem = cart.find(
            item => item.courtId === court._id && item.date === selectedDate && item.slot === selectedSlot
        );

        if (existingItem) {
            showToast({ message: `Court ${court.number} is already in your cart for this slot!`, type: "error-dark" });
            return;
        }

        const bookingItem = {
            courtId: court._id,
            courtName: court.name,
            slot: selectedSlot,
            date: selectedDate,
            price: court.hallId.pricePerHour,
            hallName: court.hallId.name,
        };

        setCart((prev) => [...prev, bookingItem]);
        showToast({ message: `Court ${court.number} added to cart!`, type: "success-dark" });
    };

    const removeFromCart = (index) => {
        setCart((prev) => prev.filter((_, i) => i !== index));
        showToast({ message: "Item removed from cart", type: "success-dark" });
    };

    const proceedToCheckout = () => {
        console.log("In proceedToCheckout");
        navigate(`/user/${userId}/${hallId}/checkout`, { state: { cart, hall } });
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + item.price, 0);
    };

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-300 border-t-transparent"></div>
                    <span className="text-orange-200 text-lg">Loading courts...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gradient-to-br from-orange-400 via-orange-300 to-orange-500 text-white py-12">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-2">Book Your Court</h1>
                    <p className="text-lg opacity-90">{hall?.name}</p>
                    <p className="text-sm opacity-80">₹{hall?.pricePerHour}/hour per court</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Side - Date, Slot & Courts Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Date & Slot Selection */}
                        <div className="bg-gray-800 border-2 border-orange-300/20 rounded-xl p-6">
                            <h2 className="text-2xl font-semibold text-orange-200 mb-6">Select Date & Time</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-orange-200 mb-2 font-medium">Select Date:</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        min={getTodayDate()}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full bg-gray-900 border-2 border-orange-300/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-orange-300"
                                    />
                                </div>

                                <div>
                                    <label className="block text-orange-200 mb-2 font-medium">Select Time Slot:</label>
                                    <select
                                        value={selectedSlot}
                                        onChange={(e) => setSelectedSlot(e.target.value)}
                                        className="w-full bg-gray-900 border-2 border-orange-300/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-orange-300"
                                    >
                                        <option value="">-- Choose a Slot --</option>
                                        <option value="6AM - 7AM">6AM - 7AM</option>
                                        <option value="7AM - 8AM">7AM - 8AM</option>
                                        <option value="8AM - 9AM">8AM - 9AM</option>
                                        <option value="9AM - 10AM">9AM - 10AM</option>
                                        <option value="10AM - 11AM">10AM - 11AM</option>
                                        <option value="11AM - 12PM">11AM - 12PM</option>
                                        <option value="12PM - 1PM">12PM - 1PM</option>
                                        <option value="1PM - 2PM">1PM - 2PM</option>
                                        <option value="2PM - 3PM">2PM - 3PM</option>
                                        <option value="3PM - 4PM">3PM - 4PM</option>
                                        <option value="4PM - 5PM">4PM - 5PM</option>
                                        <option value="5PM - 6PM">5PM - 6PM</option>
                                        <option value="6PM - 7PM">6PM - 7PM</option>
                                        <option value="7PM - 8PM">7PM - 8PM</option>
                                        <option value="8PM - 9PM">8PM - 9PM</option>
                                        <option value="9PM - 10PM">9PM - 10PM</option>
                                    </select>
                                </div>
                            </div>

                            {selectedDate && selectedSlot && (
                                <div className="mt-4 p-3 bg-orange-300/10 rounded-lg border border-orange-300/20">
                                    <p className="text-orange-200 text-sm">
                                        <span className="font-semibold">Selected:</span> {formatDate(selectedDate)} at {selectedSlot}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Courts Selection */}
                        <div className="bg-gray-800 border-2 border-orange-300/20 rounded-xl p-6">
                            <h2 className="text-2xl font-semibold text-orange-200 mb-6">Available Courts</h2>
                            
                            {courts.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-400 text-lg">No courts available for this venue.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {courts.map((court) => (
                                        <div 
                                            key={court._id} 
                                            className="bg-gray-900 border-2 border-orange-300/20 p-4 rounded-lg hover:border-orange-300/40 transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-3"> 
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white">Court: {court.number}</h3>
                                                    <p className="text-gray-400 text-sm">
                                                        {court.hallId.matType} Mat  {/* Accessing populated data! */}
                                                    </p>
                                                </div>
                                                <span className="text-blue-300 font-semibold">
                                                    ₹{court.hallId.pricePerHour}/hr  {/* Accessing populated data! */}
                                                </span>
                                            </div>
                                            
                                            <button
                                                onClick={() => handleAddToCart(court)}
                                                disabled={!selectedDate || !selectedSlot}
                                                className={`w-full py-2 rounded-lg font-semibold transition-all ${
                                                    !selectedDate || !selectedSlot
                                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                                        : 'bg-orange-400 hover:bg-orange-500 text-white hover:scale-105'
                                                }`}
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Cart Summary */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-orange-400 via-orange-300 to-orange-400 rounded-xl p-6 text-white sticky top-6">
                            <h2 className="text-2xl font-semibold mb-6">Booking Summary</h2>
                            
                            {cart.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
                                    </svg>
                                    <p className="opacity-70">Your cart is empty</p>
                                    <p className="text-sm opacity-60 mt-1">Select date, time and add courts to proceed</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4 mb-6">
                                        {cart.map((item, index) => (
                                            <div key={index} className="bg-white/10 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-semibold">{item.courtName}</h4>
                                                        <p className="text-sm opacity-80">{formatDate(item.date)}</p>
                                                        <p className="text-sm opacity-80">{item.slot}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold">₹{item.price}</p>
                                                        <button
                                                            onClick={() => removeFromCart(index)}
                                                            className="text-xs text-red-200 hover:text-red-100 mt-1"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t-2 border-white/20 pt-4 mb-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold">Total Amount:</span>
                                            <span className="text-2xl font-bold">₹{getTotalPrice()}</span>
                                        </div>
                                        <p className="text-sm opacity-70 mt-1">{cart.length} court(s) selected</p>
                                    </div>

                                    <button
                                        onClick={proceedToCheckout}
                                        className="w-full bg-gray-900 hover:bg-gray-800 text-orange-300 font-bold py-4 rounded-xl transition-all hover:scale-105 border-2 border-orange-300"
                                    >
                                        Proceed to Checkout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChooseCourtPage;
