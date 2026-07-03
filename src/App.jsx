import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Hero from "./components/Hero";
import About from "./components/About";
import Student from "./components/Student";
import Teacher from "./components/Teacher";
import AllNotices from "./components/AllNotices";
import NoticeSection from './components/NoticeSection';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={
            <>
              <Hero />
              <NoticeSection />
            </>
          } />
          <Route path="about" element={<About />} />
          <Route path="student" element={<Student />} />
          <Route path="teacher" element={<Teacher />} />
          <Route path="notices" element={<AllNotices />} />
          {/* You can add a 404 page here later if you want */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
