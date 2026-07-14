import {useState} from "react";
import API_BASE_URL from "../../config.js";

export default function VendorSignup(){
    const [formdata, setformData] = useState({
        Name: '',
        email: '',
        password: '',
        username: '',
        contact: '',
        age: '',
        city: '',
        location: '',
    });
    const handleChange = (e) => {
        const { id, value } = e.target;// Get the id of the input and its value
        console.log(`${id}: ${value}`);
        setformData((prev) => ({
            ...prev,
            [id]: value, // Update the specific field in formdata using the id
        }));
    };
    const handleSubmitForm = async (e) => {
        e.preventDefault();
        try{
            const response = await fetch(`${API_BASE_URL}/vendor/signup`, {
                method:"POST",
                headers:{
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify(formdata),
            });
            await response.json();
            if(response.ok){
                alert("Vendor Signup Successfull");
            }
            else{
                alert("Some error occurred");
            }
            console.log(formdata);
        }catch(e){

            alert("An error occurred. Retry or please wait while we solve it!"+e);
        }

    }
    return (
        <>
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 p-6">
                {/* Header */}
                <header className="w-full text-center py-4 text-white font-bold text-2xl">
                    <h1>Let&#39;s Onboard to PlayWise!</h1>
                </header>

                {/* Main VendorSignup Section */}
                <main className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
                    <h2 className="text-indigo-600 text-3xl font-bold mb-6 text-center">Join the Action!</h2>
                    <form className="space-y-6" onSubmit={handleSubmitForm}>
                        {/* Name and Email */}
                        <div className="flex flex-wrap -mx-3">
                            <div className="w-full md:w-1/2 px-3 mb-4">
                                <label htmlFor="grid-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    id="Name"
                                    type="text"
                                    required
                                    value={formdata.Name}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2"
                                    placeholder="Your Name"
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-3 mb-4">
                                <label htmlFor="grid-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={formdata.email}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2"
                                    placeholder="Your Email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="grid-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={formdata.password}
                                onChange={handleChange}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2"
                                placeholder="Create Password"
                            />
                            <p className="text-gray-500 text-xs mt-1">Make it strong and secure.</p>
                        </div>

                        {/*Username*/}
                        <div>
                            <label htmlFor="grid-username" className="block text-sm font-medium text-gray-700 mb-1">Set Username</label>
                            <input
                                id="username"
                                type="text"
                                required
                                value={formdata.username}
                                onChange={handleChange}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2"
                                placeholder="Set Username"
                            />
                            <p className="text-gray-500 text-xs mt-1">Username should be unique.</p>
                        </div>
                        {/* Contact and Age */}
                        <div className="flex flex-wrap -mx-3">
                            <div className="w-full md:w-1/2 px-3 mb-4">
                                <label htmlFor="grid-contact" className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                                <input
                                    id="contact"
                                    type="text"
                                    required
                                    value={formdata.contact}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2"
                                    placeholder="Your Contact"
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-3 mb-4">
                                <label htmlFor="grid-age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                <input
                                    id="age"
                                    type="number"
                                    required
                                    value={formdata.age}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2"
                                    placeholder="Your Age"
                                />
                            </div>
                        </div>

                        {/* City and Location */}
                        <div className="flex flex-wrap -mx-3">
                            <div className="w-full md:w-1/2 px-3 mb-4">
                                <label htmlFor="grid-city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    id="city"
                                    type="text"
                                    required
                                    value={formdata.city}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2"
                                    placeholder="Your City"
                                />
                            </div>
                            <div className="w-full md:w-1/2 px-3 mb-4">
                                <label htmlFor="grid-location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                    id="location"
                                    type="text"
                                    required
                                    value={formdata.location}
                                    onChange={handleChange}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2"
                                    placeholder="Your Location"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition">
                            Sign Up
                        </button>
                    </form>
                </main>

                {/* Footer */}
                <footer className="w-full text-center py-4 mt-6 text-white">
                    <p>&copy; 2025 PlayWise. All rights reserved.</p>
                </footer>
            </div>
        </>
    )
}

