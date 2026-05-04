import About from "./components/About"
import Hero from "./components/Hero"
import Navbar from "./components/Navbar"
import Contact from "./components/Contact"
import NoticeMarquee from "./components/NoticeMarquee"
import { useEffect } from "react";
import Student from "./components/Student";
import Teacher from "./components/Teacher.jsx";
import Notice from "./components/Notice.jsx";
import AllNotices from "./components/AllNotices";

function App() {
  // No longer using react-router-dom for page navigation,
  // so useLocation and the pathname-based useEffect are removed.

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
          entry.target.classList.remove("opacity-0", "translate-y-10");
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll(".scroll-reveal");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen text-black overflow-x-hidden">
      {/* Animated Background Layer */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 animate-pulse-slow opacity-20"         
          style={{ backgroundImage: `url('${import.meta.env.BASE_URL.replace(/\/$/, '')}/bg.jpg')` }}
        ></div>
      </div>

      <Navbar />
      <NoticeMarquee />

      {/* All sections are now rendered on a single page with unique IDs for navigation */}
      <div id="home" className="scroll-reveal opacity-0 translate-y-10 transition-all duration-1000 ease-out pb-12 min-h-[50vh] pt-10">
        <Hero />
        <Notice />
      </div>

      <div id="about" className="scroll-reveal opacity-0 translate-y-10 transition-all duration-1000 ease-out pb-12 min-h-[50vh] pt-10">
        <About />
      </div>

      <div id="student" className="scroll-reveal opacity-0 translate-y-10 transition-all duration-1000 ease-out pb-12 min-h-[50vh] pt-10">
        <Student />
      </div>

      <div id="teacher" className="scroll-reveal opacity-0 translate-y-10 transition-all duration-1000 ease-out pb-12 min-h-[50vh] pt-10">
        <Teacher />
      </div>

      <div id="notices" className="scroll-reveal opacity-0 translate-y-10 transition-all duration-1000 ease-out pb-12 min-h-[50vh] pt-10">
        <AllNotices />
      </div>
      <Contact />
    </div>
  );
}

export default App
