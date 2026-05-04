import { Mail, BookOpen, User, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { client } from '../sanityClient';

export default function Teacher() {
    const [teachersData, setTeachersData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTeachers = async (showLoader = true) => {
            if (showLoader) setIsLoading(true);
            try {
                const query = `*[_type == "teacher" && !(_id in path("drafts.**"))] | order(name asc) {
                    "id": _id,
                    name,
                    subject,
                    email,
                    role,
                    "imageUrl": image.asset->url
                }`;
                const data = await client.fetch(query, {}, { useCdn: !showLoader });
                setTeachersData(data);
            } catch (error) {
                console.error("Error fetching teachers from Sanity:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTeachers(true);
        const subscription = client.listen('*[_type == "teacher"]').subscribe(() => fetchTeachers(false));
        return () => subscription.unsubscribe();
    }, []);

    return (
        <section id="Teacher" className="min-h-screen py-20 px-4 max-w-7xl mx-auto w-full">
            <div className="text-center mb-12">
                <h2 className="text-blue-600 font-bold tracking-wider uppercase text-sm">Faculty Directory</h2>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">
                    Meet Our <span className="text-blue-600">Teachers</span>
                </h1>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                </div>
            )}

            {!isLoading && teachersData.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    Our faculty directory is currently being updated.
                </div>
            )}

            {/* Teachers Grid */}
            {!isLoading && teachersData.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                    {teachersData.map((teacher) => (
                        <div 
                            key={teacher.id}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all group"
                        >
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-blue-100 overflow-hidden">
                                    {teacher.imageUrl ? (
                                        <img src={teacher.imageUrl} alt={teacher.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-8 w-8" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">{teacher.name}</h3>
                                    <p className="text-blue-600 text-sm font-medium">{teacher.role}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3 mt-4 pt-4 border-t border-gray-50">
                                <div className="flex items-center text-gray-600">
                                    <BookOpen className="h-4 w-4 mr-3 text-gray-400 shrink-0" />
                                    <span className="text-sm">{teacher.subject}</span>
                                </div>
                                {teacher.email && (
                                    <div className="flex items-center text-gray-600">
                                        <Mail className="h-4 w-4 mr-3 text-gray-400 shrink-0" />
                                        <a href={`mailto:${teacher.email}`} className="text-sm hover:text-blue-600 transition-colors">
                                            {teacher.email}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}