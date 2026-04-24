// /assets/js/ui.js
// UI Interactions, Scroll Effects, Mobile Menu, Animations

(function() {
  'use strict';
  
  // DOM Elements
  const header = document.getElementById('mainHeader');
  const mobileToggle = document.getElementById('mobileToggle');
  const mainNav = document.getElementById('mainNav');
  const ctaButtons = document.querySelectorAll('#ctaHeaderBtn, #heroCtaBtn, #finalCtaBtn');
  const allToolButtons = document.querySelectorAll('.btn-tool-use');
  
  // ========== STICKY HEADER GLASS EFFECT ==========
  function handleHeaderScroll() {
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  
  window.addEventListener('scroll', handleHeaderScroll);
  handleHeaderScroll(); // initial check
  
  // ========== MOBILE MENU TOGGLE ==========
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      mainNav.classList.toggle('nav-open');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        if (mainNav.classList.contains('nav-open')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-times');
        } else {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });
    
    // Close menu when clicking on a link (mobile)
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('nav-open');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      });
    });
    
    // Close menu when clicking outside (optional)
    document.addEventListener('click', function(event) {
      if (mainNav.classList.contains('nav-open') && 
          !mainNav.contains(event.target) && 
          !mobileToggle.contains(event.target)) {
        mainNav.classList.remove('nav-open');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });
  }
  
  // ========== SMOOTH SCROLL FOR ANCHOR LINKS ==========
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // ========== CTA BUTTONS SCROLL TO TOOLS ==========
  if (ctaButtons.length) {
    ctaButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const toolsSection = document.getElementById('all-tools');
        if (toolsSection) {
          toolsSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          const popularSection = document.getElementById('popular-tools');
          if (popularSection) popularSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }
  
  // ========== SCROLL REVEAL OBSERVER ==========
  const revealElements = document.querySelectorAll('.scroll-reveal');
  
  if (revealElements.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // fallback: reveal all immediately
    revealElements.forEach(el => el.classList.add('revealed'));
  }
  
  // ========== TOOL BUTTON INTERACTION (GLOBAL DELEGATION) ==========
  document.body.addEventListener('click', (e) => {
    const toolBtn = e.target.closest('.btn-tool-use');
    if (toolBtn) {
      const toolName = toolBtn.getAttribute('data-toolname') || 
                       toolBtn.closest('.tool-card')?.querySelector('.tool-name')?.innerText || 
                       'this tool';
      showToolNotification(toolName);
    }
  });
  
  function showToolNotification(toolName) {
    // Create temporary toast-style notification
    const toast = document.createElement('div');
    toast.className = 'tool-toast-notification';
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas fa-check-circle" style="color: #10b981;"></i>
        <span>✨ ${toolName} is ready! No login required. All processing happens in your browser.</span>
      </div>
    `;
    document.body.appendChild(toast);
    
    // trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  
  // Add toast styles dynamically (if not in CSS)
  if (!document.querySelector('#ui-js-styles')) {
    const style = document.createElement('style');
    style.id = 'ui-js-styles';
    style.textContent = `
      .tool-toast-notification {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: white;
        backdrop-filter: blur(12px);
        background: rgba(255, 255, 255, 0.95);
        border-radius: 50px;
        padding: 0.9rem 1.8rem;
        box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        border: 1px solid rgba(79, 70, 229, 0.2);
        font-weight: 500;
        pointer-events: none;
      }
      .tool-toast-notification.show {
        transform: translateX(-50%) translateY(0);
      }
      .toast-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: #1e293b;
      }
      @media (max-width: 640px) {
        .tool-toast-notification {
          width: 90%;
          border-radius: 1rem;
          text-align: center;
        }
        .toast-content {
          justify-content: center;
          flex-wrap: wrap;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // ========== ADD HOVER EFFECT CLASSES FOR TOOL CARDS DYNAMIC ==========
  // Preload subtle image hover effect - nothing heavy
  
  // ========== HEADER ACTIVE LINK HIGHLIGHT ==========
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    let currentSection = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionBottom = sectionTop + section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
        currentSection = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href').substring(1);
      if (href === currentSection) {
        link.classList.add('active');
      }
    });
  }
  
  window.addEventListener('scroll', updateActiveNavLink);
  updateActiveNavLink();
  
  // Add active style
  const activeStyle = document.createElement('style');
  activeStyle.textContent = `
    .nav-links a.active {
      color: var(--primary);
      font-weight: 600;
    }
    .nav-links a.active::after {
      width: 100%;
    }
  `;
  document.head.appendChild(activeStyle);
  
  // ========== PREVENT MULTIPLE RAPID SCROLLS ==========
  let isScrolling = false;
  window.addEventListener('wheel', () => {
    isScrolling = true;
    clearTimeout(window.scrollTimer);
    window.scrollTimer = setTimeout(() => {
      isScrolling = false;
    }, 100);
  });
  
  console.log('UI.js loaded — ToolTari interactive elements ready');
})();
