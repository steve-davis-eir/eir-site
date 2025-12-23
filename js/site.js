/**
 * Eir Site - Interactive JavaScript
 * Replaces Wix runtime functionality for standalone deployment
 */

(function() {
  'use strict';

  // ============================================
  // MOBILE MENU FUNCTIONALITY
  // ============================================

  function initMobileMenu() {
    // Find all hamburger buttons (there may be multiple for different breakpoints)
    const hamburgerButtons = document.querySelectorAll(
      '[aria-label="Open Site Navigation"], [aria-label="open navigation menu"]'
    );

    // Find mobile menu container
    const mobileMenu = document.querySelector('[role="dialog"][aria-label="Site navigation"]');

    // Find close button inside mobile menu (Wix uses "Back to site" label)
    const closeButton = mobileMenu ? mobileMenu.querySelector('[aria-label="Back to site"], [aria-label="Close navigation menu"], [aria-label="close navigation menu"]') : null;

    // Find overlay
    const overlay = document.querySelector('[id*="overlay-"][id*="comp-kd5px"]');

    if (!mobileMenu) {
      console.log('Mobile menu not found on this page');
      return;
    }

    // Initial state - hide mobile menu
    mobileMenu.style.display = 'none';
    mobileMenu.style.visibility = 'hidden';
    mobileMenu.setAttribute('aria-hidden', 'true');

    if (overlay) {
      overlay.style.display = 'none';
    }

    function openMenu() {
      mobileMenu.style.display = 'block';
      mobileMenu.style.visibility = 'visible';
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      if (overlay) {
        overlay.style.display = 'block';
      }

      // Focus the close button for accessibility
      if (closeButton) {
        setTimeout(() => closeButton.focus(), 100);
      }
    }

    function closeMenu() {
      mobileMenu.style.display = 'none';
      mobileMenu.style.visibility = 'hidden';
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      if (overlay) {
        overlay.style.display = 'none';
      }
    }

    // Add click handlers to hamburger buttons
    hamburgerButtons.forEach(function(button) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openMenu();
      });

      // Make sure it's keyboard accessible
      button.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openMenu();
        }
      });
    });

    // Close button handler
    if (closeButton) {
      closeButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
      });

      closeButton.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          closeMenu();
        }
      });
    }

    // Close menu when clicking on overlay
    if (overlay) {
      overlay.addEventListener('click', closeMenu);
    }

    // Close menu when clicking on a navigation link
    const menuLinks = mobileMenu.querySelectorAll('a[href]');
    menuLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        closeMenu();
      });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileMenu.style.display !== 'none') {
        closeMenu();
      }
    });

    console.log('Mobile menu initialized');
  }

  // ============================================
  // FORM SUBMISSION FUNCTIONALITY
  // ============================================

  function initForms() {
    const forms = document.querySelectorAll('form');

    forms.forEach(function(form) {
      // Find submit button - could be button[type="submit"], button[type="button"], or just button
      const submitButton = form.querySelector(
        'button[type="submit"], input[type="submit"], button[data-hook="submit-button"], [data-testid="buttonElement"]'
      );

      if (!submitButton) {
        console.log('No submit button found for form:', form.id);
        return;
      }

      // Handle form submission
      function handleSubmit(e) {
        e.preventDefault();

        // Get all form inputs
        const formData = new FormData(form);
        const data = {
          timestamp: new Date().toISOString(),
          page: window.location.pathname,
          formId: form.id || 'unknown',
          fields: {}
        };

        // Collect all input values
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(function(input) {
          const name = input.name || input.id || input.getAttribute('aria-label') || 'field';
          if (input.type === 'checkbox') {
            data.fields[name] = input.checked;
          } else if (input.type === 'radio') {
            if (input.checked) {
              data.fields[name] = input.value;
            }
          } else if (input.value) {
            data.fields[name] = input.value;
          }
        });

        // Basic validation
        const emailInput = form.querySelector('input[type="email"]');
        if (emailInput && !emailInput.value) {
          showMessage(form, 'Please enter your email address', 'error');
          emailInput.focus();
          return;
        }

        if (emailInput && !isValidEmail(emailInput.value)) {
          showMessage(form, 'Please enter a valid email address', 'error');
          emailInput.focus();
          return;
        }

        // Store in localStorage
        try {
          const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
          submissions.push(data);
          localStorage.setItem('formSubmissions', JSON.stringify(submissions));
          console.log('Form submission stored:', data);
        } catch (err) {
          console.error('Failed to store form submission:', err);
        }

        // Show success message
        showMessage(form, 'Thank you! Your submission has been received.', 'success');

        // Update button text temporarily
        const buttonTextEl = submitButton.querySelector('span, .StylableButton2545352419__label') || submitButton;
        const originalText = buttonTextEl.textContent;
        buttonTextEl.textContent = 'Thank you!';
        submitButton.disabled = true;

        // Reset form and button after delay
        setTimeout(function() {
          buttonTextEl.textContent = originalText;
          submitButton.disabled = false;
          form.reset();
          hideMessage(form);
        }, 4000);
      }

      // Listen for both submit event and button click
      form.addEventListener('submit', handleSubmit);

      // Also listen for button click in case it's type="button"
      submitButton.addEventListener('click', function(e) {
        // Only handle if form submit didn't already fire
        if (!e.defaultPrevented) {
          handleSubmit(e);
        }
      });
    });

    console.log('Forms initialized:', forms.length);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showMessage(form, message, type) {
    // Remove existing message if any
    hideMessage(form);

    // Create message element
    const msgEl = document.createElement('div');
    msgEl.className = 'form-message form-message--' + type;
    msgEl.textContent = message;
    msgEl.style.cssText = type === 'success'
      ? 'background: #d4edda; color: #155724; padding: 12px 16px; margin: 12px 0; border-radius: 4px; font-size: 14px;'
      : 'background: #f8d7da; color: #721c24; padding: 12px 16px; margin: 12px 0; border-radius: 4px; font-size: 14px;';

    // Insert after form or before submit button
    const submitButton = form.querySelector('button, input[type="submit"]');
    if (submitButton && submitButton.parentNode) {
      submitButton.parentNode.insertBefore(msgEl, submitButton);
    } else {
      form.appendChild(msgEl);
    }
  }

  function hideMessage(form) {
    const existing = form.querySelector('.form-message');
    if (existing) {
      existing.remove();
    }
  }

  // ============================================
  // SMOOTH SCROLLING FOR ANCHOR LINKS
  // ============================================

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || targetId === '#top') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const target = document.querySelector(targetId);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }

  // ============================================
  // FIX BROKEN IMAGE PATHS
  // ============================================

  function fixBrokenImages() {
    document.querySelectorAll('img').forEach(function(img) {
      img.addEventListener('error', function() {
        // Try to fix common path issues
        const src = this.src;
        if (src.includes('assets/images/')) {
          this.src = src.replace('assets/images/', 'images/');
        }
      });
    });
  }

  // ============================================
  // INITIALIZE ON DOM READY
  // ============================================

  function init() {
    console.log('Eir site JavaScript initializing...');
    initMobileMenu();
    initForms();
    initSmoothScroll();
    fixBrokenImages();
    console.log('Eir site JavaScript initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
