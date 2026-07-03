import { Outlet, useLocation } from 'react-router-dom';
import Navbar from "./Navbar";
import NoticeMarquee from "./NoticeMarquee";
import Contact from "./Contact";
import { useEffect } from 'react';

export default function Layout() {
    const { pathname } = useLocation();

    // Scroll to top on page change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="relative min-h-screen text-slate-700 overflow-x-hidden pt-28 bg-slate-50">
            <Navbar />
            <NoticeMarquee />
            <main className="min-h-[50vh]">
                <Outlet />
            </main>
            <Contact />
        </div>
    );
}