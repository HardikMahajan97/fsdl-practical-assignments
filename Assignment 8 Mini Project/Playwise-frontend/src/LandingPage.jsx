import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-black">
      <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 mb-4">
        PlayWise
      </h1>
      <p className="text-gray-400 text-xl mb-12">Book your court, play your game</p>
      
      <div className="space-x-6">
        <button 
          onClick={() => navigate('/user/login')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold"
        >
          User Login
        </button>
        <button 
          onClick={() => navigate('/vendor/login')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold"
        >
          Vendor Login
        </button>
      </div>
    </div>
  );
}