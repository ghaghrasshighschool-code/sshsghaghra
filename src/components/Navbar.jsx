import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
export default function Navbar() {
    const [ mobileMenuOpen, setMobileMenuOpen ] = useState(false);

    return <nav className="fixed top-0 z-50 w-full h-16 transition-all duration-300 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">

                {/* navbar logo here */}
                <div className="flex items-center space-x-2 group cursor-pointer ">
                    <div>
                        <img src={`${import.meta.env.BASE_URL}images.png`}
                        alt="sshsghaghra"
                        className="h-8 w-8 sm:h-10 sm:w-10 transition-transform group-hover:scale-110"
                        />
                    </div>
                    <span className="font-bold text-lg sm:text-xl md:text-2xl tracking-tight">
                        <span className="text-blue-600">
                            SSHighschool
                        </span>
                        <span className="text-slate-800">
                            Ghaghra
                        </span>
                    </span>
                </div>

                {/* items of navbar here */}
                <div className="hidden md:flex items-center space-x-8">
                    {['Home', 'About', 'Contact', 'Student', 'Teacher'].map((item) => (
                        item === 'Contact' ? (
                            <a
                                key={item}
                                href="#Contact"
                                className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors relative group"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById('Contact')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                {item}
                                <span className="absolute -bottom-1 left-0 h-0.5 bg-blue-600 transition-all w-0 group-hover:w-full"></span>
                            </a>
                        ) : (
                            <NavLink 
                                key={item} 
                                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} 
                                className={({ isActive }) => `text-sm font-semibold transition-colors relative group ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                            >
                                {({ isActive }) => (
                                    <>
                                        {item}
                                        <span className={`absolute -bottom-1 left-0 h-0.5 bg-blue-600 transition-all ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                                    </>
                                )}
                            </NavLink>
                        )
                    ))}
                </div>


            <button
                className="md:hidden flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
                {mobileMenuOpen ? (
                    <X className="h-6 w-6 text-blue-600" />
                ) : (
                    <Menu className="h-6 w-6 text-gray-800" />
                )}
            </button>            {mobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-xl py-6 px-4 space-y-4 flex flex-col animate-in slide-in-from-top duration-300">
                    {['Home', 'About', 'Contact', 'Student', 'Teacher'].map((item) => (
                        item === 'Contact' ? (
                            <a
                                key={item}
                                href="#Contact"
                                className="font-semibold text-lg border-b border-gray-50 pb-2 text-gray-800 hover:text-blue-600"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setMobileMenuOpen(false);
                                    document.getElementById('Contact')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                {item}
                            </a>
                        ) : (
                            <NavLink 
                                key={item} 
                                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} 
                                className={({ isActive }) => `font-semibold text-lg border-b border-gray-50 pb-2 ${isActive ? 'text-blue-600' : 'text-gray-800 hover:text-blue-600'}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item}
                            </NavLink>
                        )
                    ))}
                </div>
            )}
            
        </div>
    </div>
</nav>
}