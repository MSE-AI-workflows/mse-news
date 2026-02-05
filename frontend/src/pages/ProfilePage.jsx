import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
    const { user } = useAuth();
    return (
        <div className="min-h-screen bg-[#f2f2f2] font-sans">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-slab font-bold text-ncsu-gray mb-6 uppercase tracking-tight">Profile</h1>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200 max-w-2xl">
                    <p className="text-ncsu-gray font-sans"><strong className="font-slab">Name:</strong> {user?.name}</p>
                    <p className="text-ncsu-gray font-sans mt-2"><strong className="font-slab">Email:</strong> {user?.email}</p>
                </div>
            </div>
        </div>
    )
}