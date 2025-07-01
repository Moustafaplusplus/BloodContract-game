import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-cover bg-[position:80%_center] sm:bg-center bg-no-repeat flex flex-col justify-between text-white px-4 sm:px-10 py-8"
      style={{
        backgroundImage: "url('/hitman-landing.png')",
      }}
    >
      {/* Header Top */}
      <div className="space-y-2 text-center sm:text-right rtl">
        <h1
          className="text-[36px] sm:text-[64px] text-red-600 drop-shadow-[0_0_30px_rgba(255,0,0,0.7)]"
          style={{ fontFamily: 'BouyaMessy' }}
        >
          عودة قاتل مأجور
        </h1>
        <p className="text-sm sm:text-base tracking-widest text-red-300 font-mono uppercase drop-shadow-[0_0_6px_rgba(255,0,0,0.5)]">
          HITMAN RETURNS
        </p>
      </div>

      {/* Buttons Bottom */}
      <div className="flex flex-col gap-4 w-full sm:w-64 mx-auto sm:mx-0">
        <button
          onClick={() => navigate('/login')}
          className="border-2 border-red-500 text-red-500 hover:bg-red-600 hover:text-white font-bold py-3 rounded-lg transition shadow-md hover:shadow-red-500/50"
        >
          تسجيل الدخول
        </button>
        <button
          onClick={() => navigate('/register')}
          className="border-2 border-red-500 text-red-500 hover:bg-red-600 hover:text-white font-bold py-3 rounded-lg transition shadow-md hover:shadow-red-500/50"
        >
          تسجيل حساب جديد
        </button>
      </div>
    </div>
  );
}
