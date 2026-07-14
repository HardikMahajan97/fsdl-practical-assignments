
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import showToast from '../../../Utils/ShowToast.jsx';
import API_BASE_URL from '../../../config.js';

export default function VendorHomePage() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { vendorId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                console.log(vendorId);
                const response = await fetch(`${API_BASE_URL}/home-vendor/${vendorId}`);
                const data = await response.json();

                // Check if the response is array or not, if not then destructure the values in the object to be passed on as arrays.
                const listingsArray = Array.isArray(data)
                    ? data
                    : Object.values(data).filter(item => item && typeof item === 'object');

                setListings(listingsArray);
                setError(null);
            } catch (error) {
                console.error("Failed to fetch listings:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [vendorId]);

    const handleAddNewHall = () => {
        showToast(`Redirecting to create hall page... with vendor ID: ${vendorId}`, "success");
        console.log(`Navigating to create hall page with vendor ID: ${vendorId}`);
        navigate(`/vendor/create-hall/${vendorId}`);
    };

    // TODO: Implement manage court functionality
    const handleManageCourt = (hallId) => {
        navigate(`/vendor/${vendorId}/hall/${hallId}/manage`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-300 border-t-transparent"></div>
                    <span className="text-orange-200 text-lg">Loading your dashboard...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gradient-to-br from-orange-400 via-orange-300 to-orange-500 text-white py-12">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <h1 className="text-4xl font-bold mb-2">Vendor Dashboard</h1>
                        <p className="text-lg opacity-90">Manage your badminton courts and bookings</p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {error && (
                    <div className="bg-red-900/30 border-2 border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                            </svg>
                            Error loading listings: {error}
                        </div>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-800 border-2 border-orange-300/20 rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-orange-300 mb-2">{listings.length}</div>
                        <div className="text-gray-300">Total Halls</div>
                    </div>
                    <div className="bg-gray-800 border-2 border-orange-300/20 rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-orange-300 mb-2">0</div>
                        <div className="text-gray-300">Active Bookings</div>
                    </div>
                    <div className="bg-gray-800 border-2 border-orange-300/20 rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-orange-300 mb-2">₹0</div>
                        <div className="text-gray-300">Today&apos;s Revenue</div>
                    </div>
                    <div className="bg-gray-800 border-2 border-orange-300/20 rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-orange-300 mb-2">100%</div>
                        <div className="text-gray-300">Availability</div>
                    </div>
                </div>

                {/* Add New Hall Button */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-semibold text-orange-200">Your Badminton Halls</h2>
                    <button
                        onClick={handleAddNewHall}
                        className="flex items-center bg-orange-400 hover:bg-orange-500 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105"
                    >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                        Add New Hall
                    </button>
                </div>

                {/* Main Content */}
                {listings.length === 0 ? (
                    <div className="bg-gray-800 border-2 border-orange-300/20 rounded-xl p-12 text-center">
                        <svg className="w-20 h-20 mx-auto mb-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                        </svg>
                        <h3 className="text-2xl font-bold text-orange-200 mb-4">No Halls Found</h3>
                        <p className="text-gray-300 mb-8 text-lg">
                            You haven&apos;t added any badminton halls yet. Start by creating your first hall to begin accepting bookings!
                        </p>
                        <button
                            onClick={handleAddNewHall}
                            className="bg-orange-400 hover:bg-orange-500 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105"
                        >
                            Create Your First Hall
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((listing, index) => (
                            <div
                                key={listing._id || index}
                                className="bg-gray-800 border-2 border-orange-300/20 rounded-xl p-6 hover:border-orange-300/40 transition-all duration-200 hover:shadow-lg hover:shadow-orange-300/10"
                            >
                                {/* Hall Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-orange-400 rounded-lg flex items-center justify-center mr-3">
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M21 8V7l-3 2-3-2v1l3 2 3-2zm0 4V9l-3 2-3-2v3l3 2 3-2zm0 4v-3l-3 2-3-2v1l3 2 3-2zM9 2v20l-6-4V6l6-4z"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">
                                                {listing.Name || listing.name || `Hall ${index + 1}`}
                                            </h3>
                                            <div className="flex items-center text-orange-300">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                                </svg>
                                                <span className="text-sm">{listing.city || 'Location not set'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-orange-300">₹{listing.pricePerHour || 0}</div>
                                        <div className="text-gray-400 text-sm">per hour</div>
                                    </div>
                                </div>

                                {/* Hall Details */}
                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Courts:</span>
                                        <span className="text-white font-medium">{listing.numberOfCourts || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Status:</span>
                                        <span className="text-green-400 font-medium">Active</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Today&apos;s Bookings:</span>
                                        <span className="text-white font-medium">0</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handleManageCourt(listing._id)}
                                        className="flex-1 bg-orange-400 hover:bg-orange-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:scale-105"
                                    >
                                        Manage Hall
                                    </button>
                                    <button className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors duration-200">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-gray-800 border-t-2 border-orange-300/20 text-gray-300 text-center py-6 mt-12">
                <p>&copy; 2025 PlayWise. All Rights Reserved.</p>
            </footer>
        </div>
    );
}
