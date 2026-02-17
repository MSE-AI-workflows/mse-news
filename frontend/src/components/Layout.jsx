import { LogOut, PlusSquare, User as UserIcon, Home } from 'lucide-react';
import { NCSU_LOGO_SVG } from '../constants.jsx';

export default function Layout({ children, user, onLogout, onNavigate, activeView }) {
    return (
        <div className="min-h-screen flex flex-col bg-[#f2f2f2] font-sans">
            <div className='bg-black text-white text-[10px] px-4 py-1 flex justify-end gap-4 uppercase font-bold tracking-wider'>
                <span>ncsu.edu</span>
                <span>Directory</span>
                <span>Libraries</span>
                <span>MyPack Portal</span>
            </div>

            {/* Main Header */}
            <header className="sticky top-0 z-50 bg-ncsu-red text-white shadow-lg">
            <div className="max-w-7xl mx-auto h-16 md:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => onNavigate('feed')}>
          <NCSU_LOGO_SVG />
          </div>
          <h2
  onClick={() => onNavigate('feed')}
  className="absolute left-1/2 -translate-x-1/2 font-slab font-bold text-lg md:text-xl uppercase tracking-tight cursor-pointer hover:opacity-90 transition-opacity"
>
  MSE News Portal
</h2>
    
          <div className='hidden md:flex items-center gap-6'>
            <button
              onClick={() => onNavigate(activeView === 'feed' ? 'profile' : 'feed')}
              className={`flex items-center gap-2 hover:text-white/80 transition-colors ${activeView === 'profile' ? 'underline decoration-2 underline-offset-4' : ''}`}
            >
              {activeView === 'feed' ? <UserIcon size={20} /> : <Home size={20} />}
              <span className="font-bold text-sm uppercase">
                {activeView === 'feed' ? 'Profile' : 'All News'}
              </span>
            </button>
            <button
            className='p-2 hover:bg-white/10 rounded-full transition-colors'
            onClick={onLogout}
            >
                <LogOut size={20} />
            </button>
          </div>
          </div>
            </header>
            {/* Mobile Nav Bar */}
            <nav className='md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50'>
            <button onClick={() => onNavigate('feed')} className={activeView === 'feed' ? 'text-[#CC0000]' : 'text-gray-400'}>
          <Home size={24} />
        </button>
        <button
          onClick={() => onNavigate(activeView === 'feed' ? 'profile' : 'feed')}
          className={activeView === 'profile' ? 'text-[#CC0000]' : 'text-gray-400'}
        >
          {activeView === 'feed' ? <UserIcon size={24} /> : <Home size={24} />}
        </button>
        <button onClick={onLogout} className="text-gray-400">
          <LogOut size={24} />
        </button>
            </nav>

        <main className='flex-1'>
            {children}
        </main>    

        {/* footer */}
        <footer className="bg-[#333333] text-white px-4 py-12">
  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
    {/* Left column: logo + address + phone */}
    <div className="flex flex-col space-y-3">
      <div className="w-12 h-12 flex items-center justify-center bg-gray-600 rounded-md">
        <NCSU_LOGO_SVG />
      </div>
      <p className="text-sm text-gray-400">Raleigh, NC 27695</p>
      <p className="text-sm text-gray-400">919.515.2011</p>
    </div>

    {/* Right column: MSE Quick Links */}
    <div>
      <h3 className="font-bold uppercase text-sm mb-4 border-b border-white/20 pb-2">
        MSE Quick Links
      </h3>
      <ul className="text-sm space-y-2 text-gray-300">
        <li className="hover:text-white cursor-pointer">Graduate Programs</li>
        <li className="hover:text-white cursor-pointer">Undergraduate Programs</li>
        <li className="hover:text-white cursor-pointer">Research Lab Access</li>
        <li className="hover:text-white cursor-pointer">Safety Protocols</li>
      </ul>
    </div>
  </div>
</footer>
        </div>
    )
}