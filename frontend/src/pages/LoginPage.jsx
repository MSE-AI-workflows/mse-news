import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            MSE News Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in with your Google account
          </p>
        </div>
        <button
          onClick={login}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}