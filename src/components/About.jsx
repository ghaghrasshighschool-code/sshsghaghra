import { useState, useEffect } from 'react';

// Dynamically import all common image file types from the public/images directory.
// The `eager: true` option imports them immediately, and `as: 'url'` ensures we get the public URL for each image.
const imageModules = import.meta.glob('/public/images/*.{jpg,jpeg,png,svg,gif}', { eager: true, as: 'url' });
// The result is an object where keys are file paths and values are the public URLs. We just need the URLs.
const images = Object.values(imageModules);

export default function AboutSection() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section id="About" className="min-h-screen flex items-center py-16 px-4 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Left Side: Content */}
                <div className="space-y-6 order-2 lg:order-1">
                    <h2 className="text-blue-600 font-bold tracking-wider uppercase text-sm">Our Legacy</h2>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                        Building a <span className="text-blue-600">Brighter Future</span> for Every Student
                    </h1>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        At SS Highschool Ghaghra, we believe in holistic development. Our dedicated faculty and state-of-the-art facilities ensure that every child receives the best education and personal growth opportunities.
                    </p>
                    <ul className="space-y-3 text-gray-700 font-medium">
                        <li className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-blue-600 rounded-full"></div> Quality Education
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-blue-600 rounded-full"></div> Sports & Extra-curriculars
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-blue-600 rounded-full"></div> Modern Computer Lab
                        </li>
                    </ul>
                </div>

                {/* Right Side: Image Scroller */}
                <div className="relative aspect-4/5 md:aspect-4/3 rounded-2xl overflow-hidden shadow-2xl group order-1 lg:order-2">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                index === currentIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            <img 
                                src={img} 
                                alt={`About Slide ${index}`} 
                                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" 
                            />
                        </div>
                    ))}

                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    index === currentIndex ? 'bg-blue-500 w-6' : 'bg-white/50 hover:bg-white/80'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}