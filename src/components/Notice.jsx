import { Calendar, FileText, Download, Bell, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { client } from '../sanityClient';

export default function Notice() {
    const [notices, setNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const query = `*[_type == "notice" && !(_id in path("drafts.**"))] | order(date desc) {
                    "id": _id,
                    title,
                    date,
                    description,
                    "attachmentUrl": attachment.asset->url
                }`;
                const data = await client.fetch(query);
                setNotices(data);
            } catch (error) {
                console.error("Error fetching notices:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotices();
    }, []);

    return (
        <section id="Notices" className="py-20 px-4 max-w-7xl mx-auto w-full">
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-full mb-4">
                    <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-blue-600 font-bold tracking-wider uppercase text-sm">Official Updates</h2>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">
                    Latest <span className="text-blue-600">Notices</span> & Announcements
                </h1>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                </div>
            )}

            {!isLoading && notices.length === 0 && (
                <div className="text-center py-20 text-gray-500 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    No new announcements at this time. Check back later!
                </div>
            )}

            {!isLoading && notices.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {notices.map((notice) => (
                        <div 
                            key={notice.id}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-100 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs font-semibold">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(notice.date).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                                {notice.title}
                            </h3>
                            
                            <p className="text-slate-600 text-sm mb-6 line-clamp-3">
                                {notice.description}
                            </p>

                            {notice.attachmentUrl && (
                                <a 
                                    href={`${notice.attachmentUrl}?dl=`}
                                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 underline underline-offset-4"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Attachment
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}