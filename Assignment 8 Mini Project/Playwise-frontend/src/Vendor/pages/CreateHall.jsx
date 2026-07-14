import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import showToast from '../../Utils/ShowToast.jsx';  
import { API_BASE_URL } from '../../config.js';

export default function CreateHall() {
    const navigate = useNavigate();
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
    
    const { vendorId, hallId } = useParams();
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form Data:", formData);
        
        if (!vendorId || hallId) {
            alert("Vendor ID is missing!");
            return;
        }
        
        try {
            // Prepare data to match backend expectations
            const submitData = {
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
            
            const response = await fetch(`${API_BASE_URL}/home-vendor/${vendorId}/create-hall`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData),
            });
            
            console.log(`The data after backend's response:`, response);
            const data = await response.json();
            console.log(data);
            
            if (response.ok) {
                showToast('Hall created successfully! Verification pending.', "success");
                navigate(`/vendor/home-page/${vendorId}`);
            } else {
                showToast(data.message || 'Failed to create hall', "error");
            }
        } catch (e) {
            showToast(`Error occurred while creating hall: ${e.message}`, "error");
            console.error('Error:', e);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center mb-6">Add Court Details</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Court Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Court Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        rows={4}
                        placeholder="Any additional information about the court..."
                    ></textarea>
                </div>

                {/* Submit Button */}
                <div className="mt-6">
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Submit Court Details
                    </button>
                </div>
            </form>
        </div>
    );
}
