import {useState} from "react";
import {useNavigate} from "react-router-dom";
import API_BASE_URL from "../../config.js";

export default function VendorVerification(){
    const [Otp, setOtp] = useState("");

    const handleChange = (e) => {
        e.preventDefault();
        setOtp(e.target.value);
    }
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const response = await fetch(`${API_BASE_URL}/vendor/verify`, {
                method: "POST",
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({Otp:Otp}),
            });
            console.log("Response is : " + response);
            if(response.ok){
                alert("Vendor Verification successful");
                navigate("/vendor/reset-password");
            }else{
                const errorText = await response.text();
                alert("Some error occurred! Maybe from our side. It says: " + errorText);
            }
        }
        catch(e){
            console.log("Error: " + e.message);
            alert("Error: " + e.message);
        }
    }
    return (
        <div className="bg-gradient-to-r from-gray-900 to-gray-500 min-h-screen flex justify-center items-center rounded-xl">
            <section
                className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 bg-white shadow-2xl w-full md:w-2/4 rounded-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="otp"
                            className="block text-gray-700 font-medium mb-2"
                        >
                            Enter your 6-digit OTP for verification
                        </label>
                        <div className="flex items-center">
                            <input
                                id="otp"
                                type="number"
                                required
                                value={Otp}
                                onChange={handleChange}
                                placeholder="Enter 6-digit OTP"
                                className="w-full p-3 border-2 border-gray-500 rounded-lg
                                         hover:border-gray-800 focus:outline-none focus:border-gray-900
                                         text-gray-700 [appearance:textfield]
                                         [&::-webkit-outer-spin-button]:appearance-none
                                         [&::-webkit-inner-spin-button]:appearance-none"
                                min="0"
                                maxLength="6"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full md:w-auto px-6 py-3 text-sm font-medium
                                 text-gray-900 border border-gray-800 rounded-lg
                                 hover:bg-gray-900 hover:text-white
                                 transition-colors duration-200
                                 focus:outline-none focus:ring-gray-500"
                    >
                        Verify
                    </button>
                </form>
            </section>
        </div>
    )
}