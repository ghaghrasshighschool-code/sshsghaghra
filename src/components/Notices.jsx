import { useState, useEffect } from 'react';
import { Bell, Calendar, Paperclip, Loader2 } from 'lucide-react';
import { client } from '../sanityClient';

export default function Notices() {
    const [notices, setNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async (showLoader = true) => {
            if (showLoader) setIsLoading(true);
            try {
                const query = `*[_type == "notice" && !(_id in path("drafts.**"))] | order(date desc)[0...3] {
                    _id,
                    title,
                    date,
                    description,
                    "fileUrl": attachment.asset->url
                }`;
                const data = await client.fetch(query);
                setNotices(data);
            } catch (error) {
                console.error("Error fetching notices:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotices(true);

        // Subscribe to real-time updates for notices
        const subscription = client.listen('*[_type == "notice"]').subscribe(() => fetchNotices(false));

        return () => subscription.unsubscribe();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (notices.length === 0) return null; // Hide the section completely if no notices exist

    return (
        <section className="py-16 px-4 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 border-b border-gray-200 pb-4">
                <div className="flex items-center space-x-3">
                    <Bell className="h-8 w-8 text-blue-600" />
                    <h2 className="text-3xl font-extrabold text-slate-900">Latest Announcements</h2>
                </div>
                <a 
                    href="#notices" 
                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors flex items-center"
                    onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('notices')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    View All Announcements &rarr;
                </a>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {notices.map((notice) => (
                    <div key={notice._id} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow flex flex-col">
                        <div className="flex items-center space-x-2 text-sm font-semibold text-blue-600 mb-3">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(notice.date).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">{notice.title}</h3>
                        {notice.description && (
                            <p className="text-gray-600 mb-6 grow">{notice.description}</p>
                        )}
                        {notice.fileUrl && (
                            <a href={`${notice.fileUrl}?dl=`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center space-x-2 text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-3 rounded-xl transition-colors mt-auto">
                                <Paperclip className="h-4 w-4" />
                                <span>Download Attachment</span>
                            </a>
                        )}
                    </div>

                ))}
            </div>
        </section>
    );
}