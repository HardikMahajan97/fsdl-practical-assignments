import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation  } from 'react-router-dom';
import { MapPin, Wifi, Car, Users, Shield, Fan, Coffee, Gamepad, IndianRupee } from 'lucide-react';
import {showToast} from '../../../Utils/ShowToast';
import {API_BASE_URL} from '../../../config.js';

export default function UserHomePage() {
    const [listings, setListings] = useState([]);
    const { userId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const handleViewDetails = (hallId, vendorId) => {
        showToast({message: "Navigating to Hall Details", type: "info"});
        navigate(`/user/court-details/${userId}/${hallId}/${vendorId}`);
    };

    const handleMyBookings = () => {
        showToast({message: "Navigating to My Bookings", type: "info"});
        navigate(`/user/my-bookings/${userId}`);
    }

    const getAmenityIcon = (amenity) => {
        switch (amenity) {
            case 'wifi': return <Wifi className="w-4 h-4 text-gray-400" />;
            case 'parking': return <Car className="w-4 h-4 text-gray-400" />;
            case 'changing_rooms': return <Users className="w-4 h-4 text-gray-400" />;
            case 'security': return <Shield className="w-4 h-4 text-gray-400" />;
            case 'ventilation': return <Fan className="w-4 h-4 text-gray-400" />;
            case 'vending_machine': return <Coffee className="w-4 h-4 text-gray-400" />;
            case 'washroom': return <Coffee className="w-4 h-4 text-gray-400" />;
            default: return null;
        }
    };

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/listings/${userId}`);
                const result = await response.json();

                if (result.success && Array.isArray(result.halls)) {
                    setListings(result.halls);
                } else {
                    showToast({
                        message: "No halls found!",
                        type: "info-dark"
                    });
                }
            } catch (err) {
                console.error("Error fetching listings:", err);
                showToast({
                    message: "Error fetching badminton halls. Please try again later.",
                    type: "danger"
                });
            }
        };

        fetchListings();
    }, [location.key, userId]);

    return (
        <div className="min-h-screen bg-black text-white pt-20 pb-10 px-6">
            {/* Floating Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-orange-500/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                <span className="text-black font-bold text-sm"><Gamepad className="w-5 h-5 text-black" /></span>
                            </div>
                            <h1 className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent font-bold text-xl">
                                PlayWise
                            </h1>
                        </div>

                        <button onClick={handleMyBookings} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-black font-semibold px-6 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30">
                            My Bookings
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="pt-16 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="pt-12 pb-8">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
                            <span className="bg-gradient-to-r from-white via-orange-200 to-orange-400 bg-clip-text text-transparent">
                                Premium Badminton
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                                Halls Await
                            </span>
                        </h2>
                        <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
                            Discover world-class badminton facilities near you. Book your perfect court today.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {listings.map((listing) => (
                    <div
                        key={listing.hallId}
                        className="bg-black/40 border border-orange-500/30 backdrop-blur-md rounded-xl p-6 hover:shadow-lg hover:shadow-orange-500/20 transition-transform hover:scale-[1.02]"
                    >
                        <div className="h-40 mb-4 overflow-hidden rounded-lg">
                            {listing.image && (
                                <img src={listing.image} alt={listing.hallName} className="w-full h-full object-cover" />
                            )}
                        </div>

                        <h2 className="text-xl font-semibold text-orange-300 mb-2">{listing.hallName}</h2>

                        <div className="text-sm text-gray-300 mb-2 flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-orange-400" />
                            <span>{listing.city}, {listing.state}</span>
                        </div>

                        <div className="text-sm text-gray-300 mb-2 flex items-center space-x-2">
                            <Users className="w-4 h-4 text-orange-400" />
                            <span>{listing.numberOfCourts} Courts</span>
                        </div>

                        <div className="flex items-center space-x-2 mb-4">
                            <IndianRupee className="w-4 h-4 text-orange-400" />
                            <span className="text-md font-bold text-white">
                            {listing.pricePerHour || 'N/A'}
                            </span>
                            <span className="text-sm text-gray-400">/hour</span>
                        </div>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2 text-sm mb-3">
                            {listing.amenities.map((a, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center space-x-1 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700"
                                >
                                    {getAmenityIcon(a)}
                                    <span className="capitalize text-gray-300">{a.replace("_", " ")}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handleViewDetails(listing.hallId, listing.vendorId)}
                            className="w-full py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-black font-semibold rounded-lg hover:scale-105 hover:shadow-lg transition-all"
                        >
                            View Details
                        </button>
                    </div>
                ))}
            </div>

            {listings.length === 0 && (
                <div className="text-center mt-20">
                    <p className="text-gray-400 text-lg">No halls available. Please check back later.</p>
                </div>
            )}


            {/* Footer */}
            <footer className="bg-black/80 border-t border-gray-800 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                    <span className="text-black font-bold">PW</span>
                                </div>
                                <h3 className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent font-bold text-2xl">
                                    PlayWise
                                </h3>
                            </div>
                            <p className="text-gray-400 max-w-md">
                                Your premier destination for booking badminton courts. Experience the game like never before.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-orange-400 transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-orange-400 transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-orange-400 transition-colors">Support</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
                            <div className="flex space-x-4">
                                {['Facebook', 'Twitter', 'Instagram'].map((social) => (
                                    <a key={social} href="#" className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110">
                                        <span className="text-xs font-bold">{social[0]}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                        <p className="text-gray-400">
                            &copy; 2025 PlayWise. All Rights Reserved. |
                            <span className="text-orange-400"> Elevating Your Game</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}