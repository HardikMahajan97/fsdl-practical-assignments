import {useNavigate} from "react-router-dom";
import {useState} from "react";
import API_BASE_URL from "../../config.js";
import showToast from "../../Utils/ShowToast.jsx";

export default function VendorResetPassword(){
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setUsername] = useState("");

    const handleChangeForNewPassword = (e) => {
        setNewPassword(e.target.value);
    }
    const handleChangeForConfirmPassword = (e) => {
        setConfirmPassword(e.target.value);
    }
    const handleChangeForUsername = (e) => {
        setUsername(e.target.value);
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const response = await fetch(`${API_BASE_URL}/vendor/changePassword`, {
                method : "POST",
                headers : {
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify({newPassword, confirmPassword, username}),
            });

            const data = await response.json(); // Parse the JSON response
            const {id} = data.vendor;

            if(!response.ok){
                alert("Response not ok");
            }
            if(response.ok){
                showToast("Password changed successfully", "success");
                navigate(`/vendor/home-page/${id}`);
            }
        }catch(e){
            alert("Error: " + e.message);
        }
    }

    return (
        <div
            className="bg-gradient-to-r from-gray-900 to-gray-500 min-h-screen flex justify-center items-center rounded-xl">
            <section
                className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 bg-white shadow-2xl w-full md:w-2/4 rounded-xl">
                <h1 className={"text-gray-900 font-medium mb-10 ml-32 text-2xl "}>Reset your password with new password</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="newPassword"
                            className="block text-gray-700 font-medium mb-2"
                        >
                            New Password
                        </label>
                        <div className="flex items-center">
                            <input
                                id="newPassword"
                                type="text"
                                required
                                value={newPassword}
                                onChange={handleChangeForNewPassword}
                                placeholder="Set new password"
                                className="w-full p-3 border-2 border-gray-500 rounded-lg
                                         hover:border-gray-800 focus:outline-none focus:border-gray-900
                                         text-gray-700 [appearance:textfield]
                                         [&::-webkit-outer-spin-button]:appearance-none
                                         [&::-webkit-inner-spin-button]:appearance-none"
                                min="6"
                            />
                        </div>
                    </div>

                    {/*Confirm Password*/}
                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-gray-700 font-medium mb-2"
                        >
                            Confirm Password
                        </label>
                        <div className="flex items-center">
                            <input
                                id="confirmPassword"
                                type="text"
                                required
                                value={confirmPassword}
                                onChange={handleChangeForConfirmPassword}
                                placeholder="Confirm your password"
                                className="w-full p-3 border-2 border-gray-500 rounded-lg
                                         hover:border-gray-800 focus:outline-none focus:border-gray-900
                                         text-gray-700 [appearance:textfield]
                                         [&::-webkit-outer-spin-button]:appearance-none
                                         [&::-webkit-inner-spin-button]:appearance-none"
                                min="6"
                            />
                        </div>
                    </div>

                    {/*Username*/}
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-gray-700 font-medium mb-2"
                        >
                            Username
                        </label>
                        <div className="flex items-center">
                            <input
                                id="Username"
                                type="text"
                                required
                                value={username}
                                onChange={handleChangeForUsername}
                                placeholder="Enter Username"
                                className="w-full p-3 border-2 border-gray-500 rounded-lg
                                         hover:border-gray-800 focus:outline-none focus:border-gray-900
                                         text-gray-700 [appearance:textfield]
                                         [&::-webkit-outer-spin-button]:appearance-none
                                         [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full md:w-auto px-6 py-3 text-sm font-medium
                                 text-gray-900 border border-green-600 rounded-lg
                                 bg-green-600
                                 hover:bg-green-900 hover:text-white

                                 transition-colors duration-200
                                 focus:outline-none focus:ring-gray-500"
                    >
                        Reset
                    </button>
                </form>
            </section>
        </div>
    );
}