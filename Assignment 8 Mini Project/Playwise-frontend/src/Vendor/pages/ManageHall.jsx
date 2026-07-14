import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import showToast from '../../Utils/ShowToast.jsx';
import { API_BASE_URL } from '../../config.js';

export default function ManageHall() {
    const navigate = useNavigate();
    const { vendorId, hallId } = useParams();
    
    const [formData, setFormData] = useState({
        address: "",
        city: "",
        state: "",
        name: "",
        image: "",
        pricePerHour: "",
        amenities: "",
        numberOfCourts: "",
        matType: "",
        additionalInfo: "",
    });
    
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Fetch hall details when component mounts
    useEffect(() => {
        const fetchHallDetails = async () => {
            if (!hallId) {
                showToast("Hall ID is missing!", "error");
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}home-vendor/${vendorId}/${hallId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    const hall = data.data;
                    
                    // Prefill form with existing hall data
                    setFormData({
                        address: hall.address || "",
                        city: hall.city || "",
                        state: hall.state || "",
                        name: hall.name || "",
                        image: hall.image || "",
                        pricePerHour: hall.pricePerHour || "",
                        amenities: hall.amenities || "",
                        numberOfCourts: hall.numberOfCourts || "",
                        matType: hall.matType || "",
                        additionalInfo: hall.additionalInfo || "",
                    });
                } else {
                    const errorData = await response.json();
                    showToast(errorData.message || "Failed to fetch hall details", "error");
                }
            } catch (error) {
                console.error('Error fetching hall details:', error);
                showToast(`Error fetching hall details: ${error.message}`, "error");
            } finally {
                setLoading(false);
            }
        };

        fetchHallDetails();
    }, [hallId, vendorId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);

        if (!hallId) {
            showToast("Hall ID is missing!", "error");
            setUpdating(false);
            return;
        }

        try {
            // Prepare data to match backend expectations
            const updateData = {
                name: formData.name,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                amenities: formData.amenities,
                image: formData.image,
                numberOfCourts: parseInt(formData.numberOfCourts),
                additionalInfo: formData.additionalInfo,
                pricePerHour: parseFloat(formData.pricePerHour),
                matType: formData.matType
            };

            const response = await fetch(`${API_BASE_URL}/home-vendor/${vendorId}/hall/update/${hallId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            await response.json();
            console.log(response.ok);
        
            if (response.ok) {
                showToast({ message: 'Hall updated successfully!', type: 'success'});
                // Optionally navigate back or stay on the same page
                // navigate(`/vendor/home-page/${vendorId}`);
            } else {
                showToast('Failed to update hall', "error");
            }
        } catch (error) {
            showToast({message: `Error updating hall: ${error.message}`, type: "error"});
            console.error('Error:', error);
        } finally {
            setUpdating(false);
        }
    };

    // Placeholder functions for court management
    const handleUpdateCourts = () => {
        // Navigate to update courts page
        navigate(`/vendor/hall/${hallId}/update-courts`);
        showToast({message: "Redirecting to update courts page...", type: "info"});
    };

    const handleAddCourts = () => {
        // Navigate to add courts page
        navigate(`/vendor/${vendorId}/hall/${hallId}/add-courts`);
        showToast({message: "Redirecting to add courts page...", type: "info"});
    };

    const handleGoBack = () => {
        navigate(`/vendor/home-page/${vendorId}`); // Go back to the previous page
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading hall details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center mb-6">Manage Hall Details</h1>
            
            {/* Court Management Buttons */}
            <div className="mb-6 flex gap-4 justify-center">
                <button
                    type="button"
                    onClick={handleUpdateCourts}
                    className="bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-600 transition-colors"
                >
                    Update Courts
                </button>
                <button
                    type="button"
                    onClick={handleAddCourts}
                    className="bg-purple-500 text-white py-2 px-6 rounded-md hover:bg-purple-600 transition-colors"
                >
                    Add Courts
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Hall Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Hall Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                {/* Address */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Address *</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                {/* City and State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">City *</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">State *</label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                </div>

                {/* Image */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL *</label>
                    <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com/image.jpg"
                        required
                    />
                </div>

                {/* Price Per Hour */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Price Per Hour (₹) *</label>
                    <input
                        type="number"
                        name="pricePerHour"
                        value={formData.pricePerHour}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>

                {/* Amenities */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Amenities *</label>
                    <input
                        type="text"
                        name="amenities"
                        value={formData.amenities}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Parking, AC, Locker, etc."
                        required
                    />
                </div>

                {/* Number of Courts */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Number of Courts *</label>
                    <input
                        type="number"
                        name="numberOfCourts"
                        value={formData.numberOfCourts}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        required
                    />
                </div>

                {/* Mat Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Mat Type *</label>
                    <select
                        name="matType"
                        value={formData.matType}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                    >
                        <option value="">Select Mat Type</option>
                        <option value="Wooden">Wooden</option>
                        <option value="Synthetic">Synthetic</option>
                    </select>
                </div>

                {/* Additional Info */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Additional Information</label>
                    <textarea
                        name="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                        placeholder="Any additional information about the hall..."
                    ></textarea>
                </div>

                {/* Submit Button */}
                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={updating}
                        className={`w-full text-white py-2 px-4 rounded-md transition-colors ${
                            updating 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                    >
                        {updating ? 'Updating...' : 'Update Hall Details'}
                    </button>
                </div>


                <div className="mt-6">
                    <button
                        type="button"
                        onClick={handleGoBack}
                        className={`w-full text-white py-2 px-4 rounded-md transition-colors bg-blue-500 hover:bg-blue-600`}
                    >
                        {'Go Back'}
                    </button>
                </div>
            </form>
        </div>
    );
}
