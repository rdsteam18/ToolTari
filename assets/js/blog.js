// ========== BLOG.JS - Dynamic Blog Loading System ==========
// Fetches blog data from JSON and renders blog cards dynamically

(function() {
  'use strict';

  // DOM Elements
  const blogContainer = document.getElementById('blogContainer');
  const loadingElement = document.getElementById('loadingIndicator');
  const errorElement = document.getElementById('errorMessage');
  const resultsCount = document.getElementById('resultsCount');
  const filterButtons = document.querySelectorAll('.filter-btn');

  // State
  let allBlogs = [];
  let currentCategory = 'all';

  // Fetch blog data from JSON
  async function fetchBlogs() {
    try {
      const response = await fetch('/data/blog.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      allBlogs = data;
      return data;
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
      // Fallback data
      return getFallbackBlogs();
    }
  }

  // Fallback blogs in case JSON fails to load
  function getFallbackBlogs() {
    return [
      {
        id: "compress-pdf-online",
        title: "How to Compress PDF Online (Free & Easy)",
        description: "Learn how to reduce PDF file size without losing quality. Step-by-step guide with tips and best practices.",
        slug: "/blog/compress-pdf-online.html",
        category: "pdf",
        date: "2025-04-25",
        readTime: "5 min read",
        featured: true
      },
      {
        id: "reduce-image-size",
        title: "How to Reduce Image Size Online for Free",
        description: "Simple guide to compress JPG, PNG, and WebP images while maintaining quality.",
        slug: "/blog/reduce-image-size.html",
        category: "image",
        date: "2025-04-24",
        readTime: "4 min read",
        featured: true
      },
      {
        id: "pdf-tools-guide",
        title: "Complete Guide to Free Online PDF Tools",
        description: "Discover the best free PDF tools for merging, splitting, compressing, and converting documents.",
        slug: "/blog/pdf-tools-guide.html",
        category: "general",
        date: "2025-04-23",
        readTime: "8 min read",
        featured: true
      }
    ];
  }

  // Sort blogs by date (newest first)
  function sortBlogsByDate(blogs) {
    return [...blogs].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Filter blogs by category
  function filterBlogsByCategory(blogs, category) {
    if (category === 'all') return blogs;
    return blogs.filter(blog => blog.category === category);
  }

  // Get featured blogs (top 3)
  function getFeaturedBlogs(blogs) {
    return blogs.filter(blog => blog.featured).slice(0, 3);
  }

  // Format date to readable format
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Get category icon
  function getCategoryIcon(category) {
    const icons = {
      'pdf': 'fa-file-pdf',
      'image': 'fa-image',
      'general': 'fa-newspaper',
      'utility': 'fa-tools',
      'security': 'fa-shield-alt'
    };
    return icons[category] || 'fa-book';
  }

  // Get category color
  function getCategoryColor(category) {
    const colors = {
      'pdf': '#ef4444',
      'image': '#10b981',
      'general': '#667eea',
      'utility': '#f59e0b',
      'security': '#8b5cf6'
    };
    return colors[category] || '#6b7280';
  }

  // Render blog cards
  function renderBlogs(blogs) {
    if (!blogContainer) return;

    if (!blogs || blogs.length === 0) {
      blogContainer.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search"></i>
          <h3>No blogs found</h3>
          <p>Try a different category or check back later for new content.</p>
        </div>
      `;
      if (resultsCount) resultsCount.style.display = 'none';
      return;
    }

    const sortedBlogs = sortBlogsByDate(blogs);
    const featuredBlogs = getFeaturedBlogs(sortedBlogs);
    const regularBlogs = sortedBlogs.filter(blog => !blog.featured);

    let html = '';

    // Featured section
    if (featuredBlogs.length > 0 && currentCategory === 'all') {
      html += `
        <div class="featured-section">
          <div class="section-header">
            <i class="fas fa-star"></i>
            <h2>Featured Articles</h2>
          </div>
          <div class="featured-grid">
            ${featuredBlogs.map(blog => `
              <div class="featured-card">
                <div class="featured-badge"><i class="fas fa-star"></i> Featured</div>
                <span class="blog-category" style="background: ${getCategoryColor(blog.category)}20; color: ${getCategoryColor(blog.category)};">
                  <i class="fas ${getCategoryIcon(blog.category)}"></i> ${blog.category.toUpperCase()}
                </span>
                <h3>${escapeHtml(blog.title)}</h3>
                <p>${escapeHtml(blog.description)}</p>
                <div class="blog-meta">
                  <span><i class="fas fa-calendar-alt"></i> ${formatDate(blog.date)}</span>
                  <span><i class="fas fa-clock"></i> ${blog.readTime || '5 min read'}</span>
                </div>
                <a href="${blog.slug}" class="read-more">Read Article <i class="fas fa-arrow-right"></i></a>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Regular blogs grid
    if (regularBlogs.length > 0) {
      html += `
        <div class="all-posts-section">
          <div class="section-header">
            <i class="fas fa-newspaper"></i>
            <h2>${currentCategory === 'all' ? 'Latest Posts' : `${currentCategory.toUpperCase()} Guides`}</h2>
          </div>
          <div class="blog-grid">
            ${regularBlogs.map(blog => `
              <div class="blog-card">
                <span class="blog-category" style="background: ${getCategoryColor(blog.category)}20; color: ${getCategoryColor(blog.category)};">
                  <i class="fas ${getCategoryIcon(blog.category)}"></i> ${blog.category.toUpperCase()}
                </span>
                <h3>${escapeHtml(blog.title)}</h3>
                <p>${escapeHtml(blog.description.substring(0, 120))}${blog.description.length > 120 ? '...' : ''}</p>
                <div class="blog-meta">
                  <span><i class="fas fa-calendar-alt"></i> ${formatDate(blog.date)}</span>
                  <span><i class="fas fa-clock"></i> ${blog.readTime || '5 min read'}</span>
                </div>
                <a href="${blog.slug}" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    blogContainer.innerHTML = html;

    // Update results count
    if (resultsCount) {
      resultsCount.style.display = 'block';
      resultsCount.innerHTML = `<i class="fas fa-list"></i> Showing ${regularBlogs.length + (currentCategory === 'all' ? featuredBlogs.length : 0)} articles`;
    }
  }

  // Apply filters and render
  function applyFilters() {
    let filtered = filterBlogsByCategory(allBlogs, currentCategory);
    renderBlogs(filtered);
  }

  // Handle category filter click
  function initFilters() {
    if (!filterButtons.length) return;

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        currentCategory = category;

        // Update active state
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Apply filters
        applyFilters();
      });
    });
  }

  // Show loading state
  function showLoading() {
    if (loadingElement) loadingElement.style.display = 'flex';
    if (blogContainer) blogContainer.style.display = 'none';
    if (errorElement) errorElement.style.display = 'none';
  }

  // Hide loading state
  function hideLoading() {
    if (loadingElement) loadingElement.style.display = 'none';
    if (blogContainer) blogContainer.style.display = 'block';
  }

  // Show error
  function showError() {
    if (errorElement) {
      errorElement.style.display = 'block';
      errorElement.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <p>Unable to load blog posts. Please refresh the page.</p>
      `;
    }
    if (loadingElement) loadingElement.style.display = 'none';
  }

  // Escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  // Initialize blog system
  async function init() {
    showLoading();

    try {
      const blogs = await fetchBlogs();
      allBlogs = blogs;
      initFilters();
      applyFilters();
      hideLoading();
    } catch (error) {
      console.error('Init error:', error);
      showError();
      hideLoading();
    }
  }

  // Start initialization
  init();
})();
