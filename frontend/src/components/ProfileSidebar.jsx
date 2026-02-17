import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, BookOpen, Bookmark, FileEdit, User } from 'lucide-react';
import api from '../api/client';

export default function ProfileSidebar({ onFilterChange, savedCountFromParent }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [draftsCount, setDraftsCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [draftsRes, savedRes] = await Promise.all([
          api.get('/drafts/my'),
          api.get('/saved-posts/my'),
        ]);
        setDraftsCount(draftsRes.data.length);
        setSavedCount(savedRes.data.length);
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };
    if (user) {
      fetchCounts();
    }
  }, [user]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const handleNavClick = (type) => {
    if (type === 'my-posts') {
      navigate('/dashboard/profile?section=posts');
    } else if (type === 'publications') {
      navigate('/dashboard/profile?section=publications');
    } else if (type === 'saved') {
      navigate('/dashboard/profile?section=saved');
    } else if (type === 'drafts') {
      navigate('/dashboard/profile?section=drafts');
    }
  };

  if (!user) return null;

  return (
    <aside className="w-full lg:w-72 space-y-4">
      {/* User Profile Card */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {/* Banner area (can add NC State banner image later) */}
        <div className="h-16 bg-ncsu-red"></div>
        
        {/* Profile content */}
        <div className="px-4 pb-4 -mt-8">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-ncsu-gray text-white flex items-center justify-center text-xl font-bold border-4 border-white mx-auto mb-3">
            {getInitials(user.name)}
          </div>
          
          {/* Name and email */}
          <div className="text-center mb-4">
            <h3 className="font-slab font-bold text-lg text-ncsu-gray mb-1">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
        <nav className="space-y-1">
          <button
            onClick={() => handleNavClick('my-posts')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            <FileText size={18} className="text-gray-500" />
            <span className="font-medium">My Posts</span>
          </button>
          
          <button
            onClick={() => handleNavClick('publications')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            <BookOpen size={18} className="text-gray-500" />
            <span className="font-medium">My Publications</span>
          </button>
          
          <button
            onClick={() => handleNavClick('saved')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            <Bookmark size={18} className="text-gray-500" />
            <span className="font-medium">Saved Posts</span>
           {(typeof savedCountFromParent === 'number' ? savedCountFromParent :savedCount) > 0 && (
            <span className="ml-auto text-xs text-gray-500 font-semibold">{(typeof savedCountFromParent === 'number' ? savedCountFromParent :savedCount)}</span>
           )}
          </button>
          
          <button
            onClick={() => handleNavClick('drafts')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            <FileEdit size={18} className="text-gray-500" />
            <span className="font-medium">Drafts</span>
            {draftsCount > 0 && (
              <span className="ml-auto text-xs text-gray-500 font-semibold">{draftsCount}</span>
            )}
          </button>
        </nav>
      </div>
    </aside>
  );
}
