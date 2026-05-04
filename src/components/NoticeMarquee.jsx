import { useState, useEffect } from 'react';
import { client } from '../sanityClient';
import { Bell } from 'lucide-react';

export default function NoticeMarquee() {
    const [notices, setNotices] = useState([]);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const data = await client.fetch(`*[_type == "notice" && !(_id in path("drafts.**"))] | order(date desc) [0...5] { title }`);
                setNotices(data);
            } catch (error) {
                console.error("Error fetching notices for marquee:", error);
            }
        };

        fetchNotices();

        const subscription = client.listen('*[_type == "notice"]').subscribe(fetchNotices);

        return () => subscription.unsubscribe();
    }, []);

    if (notices.length === 0) return null;

    const scrollingText = notices.map(n => n.title).join("   |   ");

    return (
        <>
            <style>
                {`
                    @keyframes marquee-scroll {
                        0% { transform: translateX(100vw); }
                        100% { transform: translateX(-100%); }
                    }
                    .animate-marquee-slow {
                        display: inline-block;
                        white-space: nowrap;
                        animation: marquee-scroll 30s linear infinite;
                    }
                    .animate-marquee-slow:hover {
                        animation-play-state: paused;
                    }
                `}
            </style>
            <div className="fixed top-16 z-40 w-full bg-blue-600 text-white h-10 flex items-center border-b border-blue-700 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 w-full flex items-center overflow-hidden">
                    <div className="flex items-center space-x-2 bg-blue-800 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter mr-4 shrink-0 z-10 shadow-sm">
                        <Bell className="h-3 w-3" />
                        <span>Latest Updates</span>
                    </div>
                    
                    <div className="relative flex overflow-hidden w-full pointer-events-auto cursor-default">
                        <div className="animate-marquee-slow">
                            <span className="text-sm font-semibold italic">
                                {scrollingText} &nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}