// ========== UI.JS - Header & Footer Injection ==========

(function() {
  'use strict';
  
  // Header HTML template
  const headerHTML = `
    <header class="site-header" id="mainHeader">
      <div class="container header-container">
        <a href="/" class="logo">
          <img src="https://blogger.googleusercontent.com/img/a/AVvXsEjY2rjUWolqqXCrlJIvA8jXQqcUBMVsqEQq9CziuNUqzhW3Asha4BTbHljQobuky8iF9DmcKIdydU5HaxXso3sUI5HrxtlHUPTvp_VBFAoxwzOp8ka_H0Uqfdj2Ns_OSSqmww7c8mV_EuvIRxCy0udJTufLUj0phIkLXnrys4NCSPA7YBrZJa_LGH8A" alt="ToolTari Logo" class="logo-img">
          <span class="logo-text">ToolTari</span>
        </a>
        <nav class="main-nav">
          <ul class="nav-links" id="navLinks">
            <li><a href="/" class="nav-link">Home</a></li>
            <li><a href="/tools.html" class="nav-link">Tools</a></li>
            <li><a href="/about.html" class="nav-link">About</a></li>
            <li><a href="/contact.html" class="nav-link">Contact</a></li>
          </ul>
        </nav>
        <div class="header-actions">
          <a href="/tools.html" class="btn-cta">Use Tools <i class="fas fa-arrow-right"></i></a>
          <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Menu">
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>
    </header>
  `;
  
  // Footer HTML template
  const footerHTML = `
    <footer class="site-footer">
      <div class="container footer-container">
        <div class="footer-brand">
          <div class="footer-logo">
            <img src="https://blogger.googleusercontent.com/img/a/AVvXsEjY2rjUWolqqXCrlJIvA8jXQqcUBMVsqEQq9CziuNUqzhW3Asha4BTbHljQobuky8iF9DmcKIdydU5HaxXso3sUI5HrxtlHUPTvp_VBFAoxwzOp8ka_H0Uqfdj2Ns_OSSqmww7c8mV_EuvIRxCy0udJTufLUj0phIkLXnrys4NCSPA7YBrZJa_LGH8A" alt="ToolTari" class="footer-logo-img">
            <span>ToolTari</span>
          </div>
          <p class="footer-tagline">Free tools for everyone, anywhere</p>
        </div>
        <div class="footer-links">
          <a href="/about.html">About</a>
          <a href="/contact.html">Contact</a>
          <a href="/privacy-policy.html">Privacy Policy</a>
          <a href="/terms.html">Terms of Service</a>
        </div>
        <div class="footer-social">
          <a href="https://www.instagram.com/tooltari.in/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <i class="fab fa-instagram"></i>
          </a>
          <a href="https://www.youtube.com/@rdsteam1824/" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <i class="fab fa-youtube"></i>
          </a>
          <a href="https://github.com/rdsteam18/tooltari" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <i class="fab fa-github"></i>
          </a>
        </div>
        <div class="footer-copyright">
          <p>© 2025 ToolTari. All rights reserved. Free online tools.</p>
        </div>
      </div>
    </footer>
  `;
  
  // Inject header at the beginning of body
  function injectHeader() {
    const body = document.body;
    if (body && !document.querySelector('.site-header')) {
      body.insertAdjacentHTML('afterbegin', headerHTML);
      initMobileMenu();
      initHeaderScroll();
      setActiveNavLink();
    }
  }
  
  // Inject footer at the end of body
  function injectFooter() {
    const body = document.body;
    if (body && !document.querySelector('.site-footer')) {
      body.insertAdjacentHTML('beforeend', footerHTML);
    }
  }
  
  // Mobile menu toggle functionality
  function initMobileMenu() {
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (toggleBtn && navLinks) {
      toggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        navLinks.classList.toggle('active');
        const icon = toggleBtn.querySelector('i');
        if (icon) {
          if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
          } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
          }
        }
      });
      
      // Close menu when clicking a link
      const links = navLinks.querySelectorAll('a');
      links.forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('active');
          const icon = toggleBtn.querySelector('i');
          if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
          }
        });
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', function(event) {
        if (navLinks.classList.contains('active') && 
            !navLinks.contains(event.target) && 
            !toggleBtn.contains(event.target)) {
          navLinks.classList.remove('active');
          const icon = toggleBtn.querySelector('i');
          if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
          }
        }
      });
    }
  }
  
  // Header scroll effect (glass morphism)
  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (header) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });
    }
  }
  
  // Set active navigation link based on current page
  function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.remove('active');
      
      if (href === currentPath) {
        link.classList.add('active');
      } else if (currentPath === '/' && href === '/') {
        link.classList.add('active');
      } else if (currentPath.includes('/tools/') && href === '/tools.html') {
        link.classList.add('active');
      } else if (href !== '/' && currentPath.includes(href.replace('/', '')) && href !== '/') {
        link.classList.add('active');
      }
    });
  }
  
  // Initialize all UI components when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectHeader();
      injectFooter();
    });
  } else {
    injectHeader();
    injectFooter();
  }
})();
