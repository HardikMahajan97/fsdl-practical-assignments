import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import showToast from "../../Utils/ShowToast.jsx";
import { API_BASE_URL } from '../../config.js';

export default function UserLogin(){

    const [form, setFormData] = useState({
        username : '',
        password : '',
    });
    const navigate = useNavigate();
    const handleChange = (e) => {
        const {id, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [id] : value,
        }));
    }
    const handleSubmit = async (e) => {
        try{
            e.preventDefault();
            const response = await fetch(`${API_BASE_URL}/user/login`, {
                method:"POST",
                headers:{
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify(form),
            });


            const user = await response.json();
            if(response.ok){
                showToast({
                    message: "User logged in successfully",
                    type: "success",
                })
                navigate(`/user/home-page/${user.id}`);

            }else{
                showToast({
                    message: "Login failed: " + user.message,
                    type: "error",
                });
            }

        }catch(err){
            console.error("Login error: ", err);
            showToast({
                message: `Some Error occurred. It says: ${err.message}`,
                type: "error",
            });
        }
    };

    return(
        <>
            <div className="h-screen w-screen overflow-x-hidden flex flex-col items-center justify-center bg-black">
                <header className="w-screen text-center py-6 mb-4">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                        PlayWise
                    </h1>
                    <p className="text-gray-500 text-sm mt-2">Book your court, play your game</p>
                </header>

                <main className="bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-2xl w-full max-w-md">
                    <h2 className="text-3xl font-bold mb-2 text-center text-white">
                        Welcome Back
                    </h2>
                    <p className="text-center text-gray-500 mb-8 text-sm">
                        Sign in to continue to your account
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-2">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                required
                                value={form.username}
                                onChange={handleChange}
                                className="w-full bg-black border border-gray-800 rounded-lg text-white px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                                placeholder="Enter your username"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={form.password}
                                onChange={handleChange}
                                className="w-full bg-black border border-gray-800 rounded-lg text-white px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button 
                            type="submit"
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-orange-500/20"
                        >
                            Sign In
                        </button>

                        {/* Forgot Password */}
                        <div className="text-center pt-2">
                            <Link 
                                to="/user/forgot-password" 
                                className="text-orange-400 hover:text-orange-300 text-sm transition-colors"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                    </form>
                </main>

                <footer className="mt-8 text-center text-gray-600 text-sm">
                    <p>© 2025 PlayWise. All rights reserved.</p>
                </footer>
            </div>
        </>
    );
}
