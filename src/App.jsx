import About from "./components/About"
import Hero from "./components/Hero"
import Navbar from "./components/Navbar"
import Contact from "./components/Contact"
import { useEffect } from "react";
import Student from "./components/Student"
import { Routes, Route, useLocation } from "react-router-dom"
import Teacher from "./components/Teacher.jsx"
import Notice from "./components/Notice.jsx"
import AllNotices from "./components/AllNotices"

function App() {
  const { pathname } = useLocation();

  // Automatically scroll to top whenever the URL changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
      {/* Ensure the container has min-height so it intersects with the observer even if routes are loading */}
      <div className="scroll-reveal opacity-0 translate-y-10 transition-all duration-1000 ease-out pb-12 min-h-[50vh]">
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Notice />
            </>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/student" element={<Student />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/notices" element={<AllNotices />} />
        </Routes>
      </div>
      <Contact />
    </div>
  );
}

export default App
