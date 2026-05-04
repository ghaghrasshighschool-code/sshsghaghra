import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
    const base = import.meta.env.BASE_URL;

    return (
        <footer id="Contact" className="bg-slate-900 text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    
                    {/* School Info */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <img src={`${base}images.png`} alt="Logo" className="h-10 w-10 brightness-0 invert" />
                            <span className="font-bold text-xl tracking-tight">SSHighschool Ghaghra</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Dedicated to excellence in education and the holistic development of every student since our establishment.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                                <img 
                                    src={`${base}facebook.svg`}
                                    alt="Facebook" 
                                    className="h-5 w-5 opacity-70 hover:opacity-100 transition-opacity brightness-0 invert" 
                                />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                                <img 
                                    src={`${base}x.svg`}
                                    alt="X" 
                                    className="h-5 w-5 opacity-70 hover:opacity-100 transition-opacity brightness-0 invert" 
                                />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                                <img 
                                    src={`${base}instagram.svg`}
                                    alt="Instagram" 
                                    className="h-5 w-5 opacity-70 hover:opacity-100 transition-opacity brightness-0 invert" 
                                />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            {['Home', 'About', 'Student', 'Teacher', 'Admissions'].map((item) => (
                                <li key={item}>
                                    <a 
                                        href={`#${item.toLowerCase()}`} 
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Details */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3 text-gray-400">
                                <MapPin className="h-5 w-5 text-blue-500 shrink-0" />
                                <span className="text-sm">Main Road, Ghaghra, Gumla, Jharkhand - 835208</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-400">
                                <Phone className="h-5 w-5 text-blue-500 shrink-0" />
                                <span className="text-sm">+91 12345 67890</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-400">
                                <Mail className="h-5 w-5 text-blue-500 shrink-0" />
                                <span className="text-sm">info@sshsghaghra.edu.in</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter/Map Placeholder */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Location</h3>
                        <div className="w-full h-40 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3679.143464537168!2d84.7745!3d23.1234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDA3JzI0LjIiTiA4NMKwNDYnMjguMiJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="pt-8 border-t border-slate-800 text-center">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} SS Highschool Ghaghra. All rights reserved.
                    </p>
                    <p className="text-gray-600 text-xs mt-2">
                        Designed with excellence for our future leaders.
                    </p>
                </div>
            </div>
        </footer>
    );
}
