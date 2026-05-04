import { useState, useEffect } from 'react';

const base = import.meta.env.BASE_URL;
const images = [
  `${base}slide1.jpeg`, 
  `${base}slide2.jpeg`, 
  `${base}slide3.jpeg`
];

export default function Hero() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-scroll every 5 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section id="Home" className="min-h-screen flex items-center pt-16 px-4 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
                
                {/* Left Side: Image Scroller (Dynamic Aspect Ratio) */}
                <div className="relative aspect-4/5 md:aspect-4/3 rounded-2xl overflow-hidden shadow-2xl group">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                index === currentIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            <img 
                                src={img} 
                                alt={`Slide ${index}`} 
                                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" 
                            />
                        </div>
                    ))}

                    {/* Navigation Dots */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    index === currentIndex ? 'bg-blue-500 w-6' : 'bg-white/50 hover:bg-white/80'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Side: About Content */}
                <div className="space-y-6">
                    <h2 className="text-blue-600 font-bold tracking-wider uppercase text-sm">About Our School</h2>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
                        Welcome to <span className="text-blue-600">SSHighschool Ghaghra</span>
                    </h1>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        Empowering minds and shaping futures since our inception. We provide a nurturing environment where students excel academically, socially, and creatively.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200">
                            Learn More
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}