import { useState, useEffect } from 'react';
import { Bell, Calendar, Paperclip, Loader2, ArrowLeft } from 'lucide-react';
import { client } from '../sanityClient';

export default function AllNotices() {
    const [notices, setNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalNotices, setTotalNotices] = useState(0);
    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
        const fetchNotices = async (showLoader = true) => {
            if (showLoader) setIsLoading(true);
            try {
                const start = (page - 1) * ITEMS_PER_PAGE;
                const end = start + ITEMS_PER_PAGE;
                
                // Fetch paginated notices and total count simultaneously
                const query = `{
                    "items": *[_type == "notice" && !(_id in path("drafts.**"))] | order(date desc) [$start...$end] {
                        _id, title, date, description, "fileUrl": attachment.asset->url
                    },
                    "total": count(*[_type == "notice" && !(_id in path("drafts.**"))])
                }`;
                const data = await client.fetch(query, { start, end });
                setNotices(data.items);
                setTotalNotices(data.total);
            } catch (error) {
                console.error("Error fetching notices:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotices(true);

        // Subscribe to changes to refresh the current page and total count
        const subscription = client.listen('*[_type == "notice"]').subscribe(() => fetchNotices(false));

        return () => subscription.unsubscribe();
    }, [page]);

    const totalPages = Math.ceil(totalNotices / ITEMS_PER_PAGE);

    return (
        <section className="min-h-screen py-20 px-4 max-w-7xl mx-auto w-full">
            <div className="mb-8">
                <a 
                    href="#home" 
                    className="flex items-center text-blue-600 hover:text-blue-800 font-semibold mb-6 transition-colors w-fit"
                    onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    <ArrowLeft className="h-5 w-5 mr-2" /> Back to Home
                </a>
                <div className="flex items-center space-x-3 border-b border-gray-200 pb-4">
                    <Bell className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">All Announcements</h1>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                </div>
            ) : notices.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    No announcements have been published yet.
                </div>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-500">
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
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-12 space-x-4 animate-in fade-in duration-500">
                            <button
                                onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                disabled={page === 1}
                                className={`px-5 py-2.5 rounded-xl font-semibold transition-colors ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                            >
                                Previous
                            </button>
                            <span className="text-gray-600 font-medium">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                disabled={page === totalPages}
                                className={`px-5 py-2.5 rounded-xl font-semibold transition-colors ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}