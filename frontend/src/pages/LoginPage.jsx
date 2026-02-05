import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2] font-sans">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="text-center text-3xl font-slab font-bold text-ncsu-gray uppercase tracking-tight">
            MSE News Portal
          </h2>
          <p className="mt-2 text-center text-sm text-ncsu-gray/80">
            Sign in with your Google account
          </p>
        </div>
        <button
          onClick={login}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold uppercase tracking-wide text-white bg-ncsu-red hover:opacity-90 transition-opacity"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}