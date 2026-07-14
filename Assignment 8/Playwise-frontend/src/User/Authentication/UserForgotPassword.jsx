import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../../config.js';
import showToast from "../../Utils/ShowToast.jsx";

export default function UserForgotPassword() {
    const [contact, setContact] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d+$/.test(value)) {
            setContact(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!contact) {
            alert("Please enter a contact number.");
            return;
        }

        if (contact.length !== 10) {
            alert("Please enter a valid 10-digit contact number.");
            return;
        }

        try {
            // Format the phone number for Twilio (adding +91 prefix)
            const formattedNumber = `+91${contact}`;

            const requestBody = {
                contact: formattedNumber
            };

            // console.log('Sending request with number:', formattedNumber);

            const response = await fetch(`${API_BASE_URL}/user/forgotPassword`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                // console.error('Server response:', errorText);
                throw new Error(`Server responded with status ${response.status}: ${errorText}`);
            }

            await response.json();
            // console.log('Server response:', data);
            navigate("/user/otp-form");
            alert('OTP sent successfully to your contact!');

        } catch (error) {
            console.error('Error details:', error);
            showToast({message: `Error occurred: ${error.message}`
                , type: "error"
            });
        }
    };

    return (
        <div className="bg-gradient-to-r from-gray-900 to-gray-500 min-h-screen flex justify-center items-center">
            <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 bg-white shadow-2xl w-full md:w-2/4 rounded-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="contact"
                            className="block text-gray-700 font-medium mb-2"
                        >
                            Enter your contact number for verification
                        </label>
                        <div className="flex items-center">
                            <span className="p-3 bg-gray-100 border-2 border-gray-500 rounded-l-lg text-gray-700">
                                +91
                            </span>
                            <input
                                id="contact"
                                type="number"
                                required
                                value={contact}
                                onChange={handleChange}
                                placeholder="Enter 10-digit number"
                                className="w-full p-3 border-2 border-l-0 border-gray-500 rounded-r-lg
                                         hover:border-gray-800 focus:outline-none focus:border-gray-900
                                         text-gray-700 [appearance:textfield]
                                         [&::-webkit-outer-spin-button]:appearance-none
                                         [&::-webkit-inner-spin-button]:appearance-none"
                                min="0"
                                maxLength="10"
                            />
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Enter 10 digits without country code</p>
                    </div>
                    <button
                        type="submit"
                        className="w-full md:w-auto px-6 py-3 text-sm font-medium
                                 text-gray-900 border border-gray-800 rounded-lg
                                 hover:bg-gray-900 hover:text-white
                                 transition-colors duration-200
                                 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Send OTP
                    </button>
                </form>
            </section>
        </div>
    );
}