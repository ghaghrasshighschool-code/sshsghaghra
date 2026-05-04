import { useState, useEffect } from 'react';
import { BookOpen, FileText, ArrowLeft, Folder, Download, Loader2 } from 'lucide-react';
import { client } from '../sanityClient';


export default function Student() {
    const [classesData, setClassesData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeClass, setActiveClass] = useState(null);
    const [activeSubject, setActiveSubject] = useState(null);

    // Fetch and group the notes from Sanity on page load
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                // Grab all notes and resolve their attached file's URL
                const query = `*[_type == "note"] {
                    title,
                    className,
                    subject,
                    "fileUrl": file.asset->url
                }`;
                const notes = await client.fetch(query);
                
                // Group the flat array into: Classes -> Subjects -> Notes
                const grouped = [];
                notes.forEach(note => {
                    let cls = grouped.find(c => c.name === note.className);
                    if (!cls) {
                        cls = { id: note.className.toLowerCase().replace(/\s+/g, '-'), name: note.className, subjects: [] };
                        grouped.push(cls);
                    }
                    let sub = cls.subjects.find(s => s.name === note.subject);
                    if (!sub) {
                        sub = { name: note.subject, notes: [] };
                        cls.subjects.push(sub);
                    }
                    sub.notes.push({ title: note.title, url: note.fileUrl });
                });
                
                // Sort the classes numerically (e.g., Class 2 before Class 10)
                grouped.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
                setClassesData(grouped);
            } catch (error) {
                console.error("Error fetching notes from Sanity:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotes();
    }, []);

    return (
        <section id="Student" className="min-h-screen py-20 px-4 max-w-7xl mx-auto w-full">
            <div className="text-center mb-12">
                <h2 className="text-blue-600 font-bold tracking-wider uppercase text-sm">Student Portal</h2>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">
                    Study Materials & <span className="text-blue-600">Notes</span>
                </h1>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center py-20 animate-in fade-in duration-500">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                </div>
            )}

            {!isLoading && !activeClass && classesData.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    No study materials have been uploaded yet.
                </div>
            )}

            {/* Level 1: Display Classes */}
            {!isLoading && !activeClass && classesData.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
                    {classesData.map((cls) => (
                        <div 
                            key={cls.id}
                            onClick={() => setActiveClass(cls)}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group"
                        >
                            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Folder className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{cls.name}</h3>
                            <p className="text-gray-500">{cls.subjects.length} Subjects available</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Level 2: Display Subjects for the selected Class */}
            {activeClass && !activeSubject && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button 
                        onClick={() => setActiveClass(null)}
                        className="flex items-center text-blue-600 hover:text-blue-800 font-semibold mb-6 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" /> Back to Classes
                    </button>
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">{activeClass.name} Subjects</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {activeClass.subjects.map((sub, idx) => (
                            <div 
                                key={idx}
                                onClick={() => setActiveSubject(sub)}
                                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group"
                            >
                                <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{sub.name}</h3>
                                <p className="text-gray-500">{sub.notes.length} Notes available</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Level 3: Display Notes for the selected Subject */}
            {activeSubject && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button 
                        onClick={() => setActiveSubject(null)}
                        className="flex items-center text-blue-600 hover:text-blue-800 font-semibold mb-6 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" /> Back to {activeClass.name} Subjects
                    </button>
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">{activeSubject.name} Notes</h2>
                    <div className="space-y-4">
                        {activeSubject.notes.map((note, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <span className="font-medium text-slate-700">{note.title}</span>
                                </div>
                                {note.url && (
                                    <a 
                                        href={`${note.url}?dl=`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-2 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors shrink-0"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span className="hidden sm:inline">Download</span>
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}