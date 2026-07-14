import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import showToast from '../../Utils/ShowToast.jsx';
import { API_BASE_URL } from '../../config.js';

export default function CreateCourt() {
    const navigate = useNavigate();
    const { vendorId, hallId } = useParams();
    
    const [formData, setFormData] = useState({
        number: ""
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Only allow positive numbers
        if (value === "" || (Number(value) > 0 && Number.isInteger(Number(value)))) {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        console.log("Handle submit called, formData:", formData, `hallId: ${hallId}`, `vendorId: ${vendorId}`);
        e.preventDefault();
        setIsSubmitting(true);

        if (!hallId || !vendorId) {
            showToast({message: "Missing hall or vendor information!", type: 'error'});
            setIsSubmitting(false);
            return;
        }
        console.log(`Submitting court number: ${formData.number} for hallId: ${hallId}, vendorId: ${vendorId}`);

        if (!formData.number || Number(formData.number) <= 0) {
            showToast({message: "Please enter a valid court number", type: 'error'});
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/halls/${vendorId}/${hallId}/courts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    number: parseInt(formData.number)
                }),
            });

            await response.json();
            if (response.ok) {
                showToast({message: 'Court added successfully!', type: 'success'});
                setFormData({ number: "" }); // Reset form
                // Optionally navigate back to manage hall page
                navigate(`/vendor/${vendorId}/hall/${hallId}/manage`);
            } else {
                showToast({message: 'Failed to add court', type: 'error'});
            }
        } catch (error) {
            showToast({message: `Error adding court: ${error.message}`, type: 'error'});
            console.error('Error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate(`/vendor/${vendorId}/hall/${hallId}/manage`);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Add New Court
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter the court number for your badminton hall
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white shadow-lg rounded-lg border border-gray-200">
                    <form className="px-8 py-8 space-y-6" >
                        <div>
                            <label 
                                htmlFor="number" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Court Number
                            </label>
                            <div className="relative">
                                <input
                                    id="number"
                                    name="number"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={formData.number}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                                    placeholder="Enter court number (e.g., 1, 2, 3...)"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-medium text-gray-600">#</span>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Court numbers must be unique within this hall
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className={`flex-1 py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                                    isSubmitting || !formData.number
                                        ? 'bg-gray-300 cursor-not-allowed' 
                                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg'
                                }`}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Adding Court...
                                    </span>
                                ) : (
                                    'Add Court'
                                )}
                            </button>
                            
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                className="flex-1 py-3 px-4 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                                Important Information
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Court numbers must be unique within this hall</li>
                                    <li>You cannot exceed the maximum number of courts for this hall</li>
                                    <li>Court numbers should be positive integers only</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
