import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import showToast from '../../../Utils/ShowToast.jsx';
import { API_BASE_URL } from '../../../config.js';

const MyBookings = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [pastBookings, setPastBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                if (!userId) {
                    showToast({ message: "User ID not found", type: "error-dark" });
                    navigate('/');
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/booking/${userId}/get-my-bookings`);
                const json = await response.json();

                if (!response.ok) {
                    showToast({ message: json.error || "Failed to fetch bookings", type: "error-dark" });
                    return;
                }

                if (json.success && json.data) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const upcoming = [];
                    const past = [];

                    json.data.forEach(booking => {
                        const bookingDate = new Date(booking.date);
                        bookingDate.setHours(0, 0, 0, 0);

                        if (bookingDate >= today) {
                            upcoming.push(booking);
                        } else {
                            past.push(booking);
                        }
                    });

                    setUpcomingBookings(upcoming);
                    setPastBookings(past);
                } else {
                    showToast({ message: "No bookings found", type: "error-dark" });
                }
            } catch (error) {
                console.error("Error fetching bookings:", error);
                showToast({ message: `Error: ${error.message}`, type: "error-dark" });
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [userId, navigate]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    console.log(formatDate);

    const formatDateShort = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (bookingDate, paymentStatus) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bookingDateObj = new Date(bookingDate);
        bookingDateObj.setHours(0, 0, 0, 0);
        console.log(paymentStatus);

        if (bookingDateObj < today) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-400 border border-gray-600">
                    Completed
                </span>
            );
        } else if (bookingDateObj.getTime() === today.getTime()) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse">
                    Today
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    Upcoming
                </span>
            );
        }
    };

    const getPaymentBadge = (status) => {
        if (status === 'Completed') {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                    ✓ Paid
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">
                    ⏳ Pending
                </span>
            );
        }
    };

    const BookingCard = ({ booking, isPast }) => (
        <div className={`bg-gray-900 rounded-lg p-5 border transition-all hover:border-orange-500 ${
            isPast ? 'border-gray-800 opacity-60' : 'border-orange-500/30'
        }`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">
                        {booking.hallId?.name || 'Hall Name Not Available'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                        {booking.hallId?.address || 'Address not available'}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(booking.date, booking.paymentStatus)}
                    {getPaymentBadge(booking.paymentStatus)}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-black/50 rounded-md p-3">
                    <p className="text-gray-500 text-xs mb-1">Court</p>
                    <p className="text-white font-semibold">
                        {booking.courtId?.[0]?.number || booking.courtId?.number || 'N/A'}
                    </p>
                </div>
                <div className="bg-black/50 rounded-md p-3">
                    <p className="text-gray-500 text-xs mb-1">Date</p>
                    <p className="text-white font-semibold text-sm">
                        {formatDateShort(booking.date)}
                    </p>
                </div>
                <div className="bg-black/50 rounded-md p-3">
                    <p className="text-gray-500 text-xs mb-1">Time</p>
                    <p className="text-white font-semibold text-sm">
                        {booking.slot}
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-800">
                <div>
                    <p className="text-gray-500 text-xs">Amount</p>
                    <p className="text-orange-400 font-bold text-lg">₹{booking.price}</p>
                </div>
                <div className="text-right">
                    <p className="text-gray-500 text-xs">Booking ID</p>
                    <p className="text-orange-400 text-xs font-mono">{booking._id}</p>
                </div>
            </div>
        </div>
    );

    BookingCard.propTypes = {
        booking: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            hallId: PropTypes.object,
            courtId: PropTypes.oneOfType([
                PropTypes.array,
                PropTypes.object
            ]),
            date: PropTypes.string.isRequired,
            slot: PropTypes.string.isRequired,
            price: PropTypes.number.isRequired,
            paymentStatus: PropTypes.string
        }).isRequired,
        isPast: PropTypes.bool.isRequired
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
                    <span className="text-orange-400 text-lg">Loading your bookings...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-3 flex items-center gap-2 text-orange-100 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <h1 className="text-3xl font-bold mb-1">My Bookings</h1>
                    <p className="text-orange-100 text-sm">
                        {upcomingBookings.length} upcoming • {pastBookings.length} completed
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Upcoming Bookings Section */}
                {upcomingBookings.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-2xl font-bold text-orange-400">Upcoming Bookings</h2>
                            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-semibold">
                                {upcomingBookings.length}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {upcomingBookings.map((booking) => (
                                <BookingCard key={booking._id} booking={booking} isPast={false} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Past Bookings Section */}
                {pastBookings.length > 0 && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-2xl font-bold text-gray-400">Past Bookings</h2>
                            <span className="px-3 py-1 bg-gray-800 text-gray-400 rounded-full text-sm font-semibold">
                                {pastBookings.length}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {pastBookings.map((booking) => (
                                <BookingCard key={booking._id} booking={booking} isPast={true} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {upcomingBookings.length === 0 && pastBookings.length === 0 && (
                    <div className="text-center py-20">
                        <svg className="w-20 h-20 mx-auto mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-2xl font-semibold text-gray-500 mb-2">No Bookings Yet</h3>
                        <p className="text-gray-600 mb-6">Start booking your badminton courts now</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-all"
                        >
                            Book a Court
                        </button>
                    </div>
                )}

                {/* Stats Summary */}
                {(upcomingBookings.length > 0 || pastBookings.length > 0) && (
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Total Bookings</p>
                                    <p className="text-white text-2xl font-bold">
                                        {upcomingBookings.length + pastBookings.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Upcoming</p>
                                    <p className="text-white text-2xl font-bold">{upcomingBookings.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Total Spent</p>
                                    <p className="text-white text-2xl font-bold">
                                        ₹{[...upcomingBookings, ...pastBookings].reduce((sum, b) => sum + b.price, 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
