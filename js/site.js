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
    // Find all hamburger buttons - the aria-label is on the SVG inside, so find buttons containing that SVG
    const hamburgerSvgs = document.querySelectorAll('svg[aria-label="Open Site Navigation"]');
    const hamburgerButtons = [];
    hamburgerSvgs.forEach(function(svg) {
      // Walk up to find the button parent
      let parent = svg.parentElement;
      while (parent && parent.tagName !== 'BUTTON') {
        parent = parent.parentElement;
      }
      if (parent && parent.tagName === 'BUTTON') {
        hamburgerButtons.push(parent);
        // Also add the SVG itself to handle clicks on it directly
        hamburgerButtons.push(svg);
      }
    });

    // Find mobile menu container
    const mobileMenu = document.querySelector('[role="dialog"][aria-label="Site navigation"]');

    // Find close button inside mobile menu (Wix uses "Back to site" label on the SVG)
    let closeButton = null;
    if (mobileMenu) {
      const closeSvg = mobileMenu.querySelector('svg[aria-label="Back to site"]');
      if (closeSvg) {
        let parent = closeSvg.parentElement;
        while (parent && parent.tagName !== 'BUTTON') {
          parent = parent.parentElement;
        }
        closeButton = parent;
      }
    }

    // Find overlay
    const overlay = document.querySelector('[id*="overlay-"]');

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
  // FIX CHECKBOXES
  // ============================================

  function initCheckboxes() {
    // Wix checkboxes have hidden inputs with overlay styling
    // Make the whole label area clickable
    const checkboxLabels = document.querySelectorAll('[data-hook="checkbox-core"]');

    checkboxLabels.forEach(function(label) {
      const checkbox = label.querySelector('input[type="checkbox"]');
      if (!checkbox) return;

      // Ensure checkbox is clickable
      label.style.cursor = 'pointer';

      // Handle clicks on the label and its children
      label.addEventListener('click', function(e) {
        // Don't double-toggle if clicking directly on the input
        if (e.target === checkbox) return;

        e.preventDefault();
        e.stopPropagation();
        checkbox.checked = !checkbox.checked;

        // Update data-checked attribute on wrapper
        const wrapper = label.closest('[data-hook="checkbox-wrapper"]');
        if (wrapper) {
          wrapper.setAttribute('data-checked', checkbox.checked.toString());
        }

        // Trigger change event
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    console.log('Checkboxes initialized:', checkboxLabels.length);
  }

  // ============================================
  // DROPDOWN FUNCTIONALITY
  // ============================================

  function initDropdowns() {
    // Define dropdown options for known fields
    const dropdownOptions = {
      'Training Type': ['Cycling', 'Running', 'Triathlon', 'Swimming', 'Other'],
      'Primary Goal': ['Improve Performance', 'Train Smarter', 'Recovery Optimization', 'Race Preparation', 'General Fitness']
    };

    // Flag to prevent document click from closing menu immediately after opening
    var justOpened = false;

    // Find all dropdown buttons (Wix combobox pattern)
    const dropdownButtons = document.querySelectorAll('[role="combobox"]');
    console.log('Found dropdown buttons:', dropdownButtons.length);

    dropdownButtons.forEach(function(button) {
      const label = button.getAttribute('aria-label');
      console.log('Processing dropdown:', label);
      const options = dropdownOptions[label];

      if (!options) {
        console.log('No options defined for:', label);
        return;
      }
      console.log('Creating dropdown menu for:', label);

      // Create hidden select for form submission
      const select = document.createElement('select');
      select.name = label.toLowerCase().replace(/\s+/g, '_');
      select.style.display = 'none';
      select.innerHTML = '<option value="">Select...</option>' +
        options.map(function(opt) {
          return '<option value="' + opt + '">' + opt + '</option>';
        }).join('');

      // Insert select near the button
      button.parentNode.insertBefore(select, button.nextSibling);

      // Create dropdown menu
      const menu = document.createElement('div');
      menu.className = 'custom-dropdown-menu';
      menu.style.cssText = 'display:none;position:absolute;background:#ffffff;border:1px solid #333;border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,0.25);z-index:999999;min-width:200px;max-height:200px;overflow-y:auto;color:#000;';

      options.forEach(function(opt) {
        const item = document.createElement('div');
        item.className = 'custom-dropdown-item';
        item.textContent = opt;
        item.style.cssText = 'padding:12px 16px;cursor:pointer;color:#000;background:#fff;font-size:14px;';
        item.addEventListener('mouseenter', function() {
          this.style.background = '#e0e0e0';
        });
        item.addEventListener('mouseleave', function() {
          this.style.background = '#fff';
        });
        item.addEventListener('click', function(e) {
          e.stopPropagation();
          // Update button text
          const textEl = button.querySelector('[data-hook="dropdown-base-text"]');
          if (textEl) {
            textEl.textContent = opt;
          }
          // Update hidden select
          select.value = opt;
          // Close menu
          menu.style.display = 'none';
          button.setAttribute('aria-expanded', 'false');
        });
        menu.appendChild(item);
      });

      // Append menu to body to avoid overflow:hidden clipping
      document.body.appendChild(menu);

      // Position menu function
      function positionMenu() {
        const rect = button.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = (rect.bottom + 2) + 'px';
        menu.style.left = rect.left + 'px';
        menu.style.width = rect.width + 'px';
      }

      // Toggle dropdown on button click - use capture to fire before other handlers
      function handleDropdownClick(e) {
        console.log('Dropdown clicked:', label);
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const isOpen = menu.style.display === 'block';
        console.log('Menu is currently open:', isOpen);
        // Close all other dropdowns first
        document.querySelectorAll('.custom-dropdown-menu').forEach(function(m) {
          m.style.display = 'none';
        });
        if (!isOpen) {
          positionMenu();
          menu.style.display = 'block';
          button.setAttribute('aria-expanded', 'true');
          justOpened = true;
          setTimeout(function() { justOpened = false; }, 100);
          console.log('Menu opened');
        } else {
          menu.style.display = 'none';
          button.setAttribute('aria-expanded', 'false');
          console.log('Menu closed');
        }
      }
      button.addEventListener('click', handleDropdownClick, true);
      // Also add mousedown handler as backup
      button.addEventListener('mousedown', function(e) {
        if (e.button === 0) { // Left click only
          setTimeout(function() {
            if (menu.style.display !== 'block') {
              handleDropdownClick(e);
            }
          }, 10);
        }
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
      // Don't close if we just opened
      if (justOpened) {
        console.log('Ignoring document click - just opened');
        return;
      }
      // Don't close if clicking inside a dropdown menu
      if (e.target.closest('.custom-dropdown-menu')) {
        return;
      }
      document.querySelectorAll('.custom-dropdown-menu').forEach(function(menu) {
        menu.style.display = 'none';
      });
      document.querySelectorAll('[role="combobox"]').forEach(function(btn) {
        btn.setAttribute('aria-expanded', 'false');
      });
    });

    console.log('Dropdowns initialized');
  }

  // ============================================
  // INITIALIZE ON DOM READY
  // ============================================

  function init() {
    console.log('Eir site JavaScript initializing...');
    initMobileMenu();
    initForms();
    initDropdowns();
    initCheckboxes();
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
