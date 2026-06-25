import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Tools from '../pages/Tools';
import Category from '../pages/Category';
import ToolDetail from '../pages/ToolDetail';
import Blog from '../pages/Blog';
import BlogPost from '../pages/BlogPost';
import About from '../pages/About';
import Contact from '../pages/Contact';
import StaticPages from '../pages/StaticPages';
import AuthorPage from '../pages/AuthorPage';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Main Hubs */}
          <Route path="/" element={<Home />} />
          <Route path="/tools.html" element={<Tools />} />
          <Route path="/tools" element={<Tools />} />
          
          {/* Static Info Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/about.html" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/contact.html" element={<Contact />} />
          
          {/* Blog Clustering */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/" element={<Blog />} />
          <Route path="/blog/:postId" element={<BlogPost />} />
          
          {/* Authors */}
          <Route path="/authors/:authorId" element={<AuthorPage />} />
          
          {/* Legal / Institutional Static Pages */}
          <Route path="/privacy-policy" element={<StaticPages slug="privacy-policy" />} />
          <Route path="/privacy-policy.html" element={<StaticPages slug="privacy-policy" />} />
          <Route path="/terms" element={<StaticPages slug="terms" />} />
          <Route path="/terms.html" element={<StaticPages slug="terms" />} />
          <Route path="/cookie-policy" element={<StaticPages slug="cookie-policy" />} />
          <Route path="/cookie-policy.html" element={<StaticPages slug="cookie-policy" />} />
          <Route path="/disclaimer" element={<StaticPages slug="disclaimer" />} />
          <Route path="/disclaimer.html" element={<StaticPages slug="disclaimer" />} />
          <Route path="/security" element={<StaticPages slug="security" />} />
          <Route path="/security.html" element={<StaticPages slug="security" />} />
          <Route path="/status" element={<StaticPages slug="status" />} />
          <Route path="/status.html" element={<StaticPages slug="status" />} />
          
          {/* Dynamic Hierarchy: Category Hubs & Tool Detail Pages */}
          <Route path="/:categorySlug" element={<Category />} />
          <Route path="/:categorySlug/:toolSlug" element={<ToolDetail />} />
          
          {/* 404 Catch-All */}
          <Route path="*" element={<StaticPages slug="404" />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
