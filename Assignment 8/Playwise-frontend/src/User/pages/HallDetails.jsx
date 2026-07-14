import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import showToast from "../../Utils/ShowToast.jsx";
import { API_BASE_URL } from '../../config.js';

const HallDetails = () => {
    const { userId, hallId, vendorId } = useParams();
    const [hall, setHall] = useState(null);
    const [courts, setCourts] = useState([null]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHallDetails = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/home-vendor/${vendorId}/${hallId}`);
                if (!response.ok) {
                    showToast({
                        message: `Error fetching hall details: ${response.statusText}`,
                        type: "error-dark"
                    });
                }
                const json = await response.json();
                const hall = json.data;
                const courts = hall.numberOfCourts;
                if (!hall || !courts) {
                    showToast({
                        message: "No hall details found",
                        type: "error-dark"
                    });
                    return;
                }
                setHall(hall);
                setCourts(courts);
            } catch (error) {
                showToast({
                    message: `Error fetching hall details: ${error.message}`,
                    type: "error-dark"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchHallDetails();
    }, [userId, hallId, vendorId]);

    const handleChooseCourts = () => {
        navigate(`/user/${userId}/book/${hallId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0c0c0c] text-white flex items-center justify-center">
                <p className="text-xl font-bold animate-pulse">Loading hall details...</p>
            </div>
        );
    }

    if (!hall) {
        return (
            <div className="min-h-screen bg-[#0c0c0c] text-white flex items-center justify-center">
                <p className="text-xl font-bold">No such hall details found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-[#1a1a1a] border border-orange-500 rounded-xl shadow-xl p-6 mb-8">
                    <div className="flex space-x-4 overflow-x-auto rounded-md mb-4">
                        {hall.image.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Hall ${index}`}
                                className="h-32 w-48 object-cover rounded-lg border border-gray-600"
                            />
                        ))}
                    </div>
                    <h2 className="text-3xl font-extrabold text-orange-400 text-center tracking-wide uppercase">{hall.name}</h2>
                </div>

                {/* Main content */}
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left section: Hall info */}
                    <div className="bg-[#141414] border border-gray-800 rounded-lg p-6 shadow-md flex-1 space-y-6">

                        <div>
                            <h3 className="text-lg font-semibold text-orange-400">📍 Location:</h3>
                            <p className="text-gray-300">{hall.address}, {hall.city}, {hall.state}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-orange-400">💰 Price per Hour:</h3>
                            <p className="text-gray-300">₹{hall.pricePerHour}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-orange-400">🎯 Amenities:</h3>
                            <p className="text-gray-300">{hall.amenities}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-orange-400">🏸 Number of Courts:</h3>
                            <p className="text-gray-300">{hall.numberOfCourts}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-orange-400">🧵 Mat Type:</h3>
                            <p className="text-gray-300">{hall.matType}</p>
                        </div>

                        {hall.additionalInfo && (
                            <div>
                                <h3 className="text-lg font-semibold text-orange-400">📌 Additional Info:</h3>
                                <p className="text-gray-300">{hall.additionalInfo}</p>
                            </div>
                        )}

                        <div className="mt-6">
                            <button
                                onClick={handleChooseCourts}
                                className="bg-orange-500 hover:bg-orange-600 text-black font-semibold px-6 py-2 rounded-lg shadow-md transition duration-200"
                            >
                                Choose Court, Slot & Date
                            </button>
                        </div>
                    </div>

                    {/* Right section: Contact details */}
                    <div className="bg-gradient-to-br from-orange-800 via-orange-700 to-orange-600 text-black rounded-lg p-6 w-full md:w-1/3 shadow-lg">
                        <h3 className="text-xl font-bold mb-4">📞 Contact Details</h3>
                        <ul className="space-y-2">
                            <li><strong>Name:</strong> {hall.vendorId.name || "PlayWise"}</li>
                            <li><strong>Email:</strong> {hall.vendorId.email}</li>
                            <li><strong>Phone:</strong> {hall.vendorId.contact}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HallDetails;
