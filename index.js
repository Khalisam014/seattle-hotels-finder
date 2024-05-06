/*
 * Name: Cadence Lamphiear & Sama Khalid
 * Date: May 3, 2024
 * Section: AD Max & Allan
 *
 * This is the JS for my index.html and login.html. It deals with the picture
 * slideshow, drop down menu, and login stuff.
 */

"use strict";

(function() {
  window.addEventListener("load", init);

  let slideIndex = 0;
  let slides = [];
  let slideInterval;
  let username = sessionStorage.getItem('username');

  const SIX_SECONDS = 6000;

  /**
   * Initializes the event listeners for dropdown toggling, document clicking,
   * and slideshow initialization.
   */
  function init() {
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
      id('profile-icon').addEventListener('click', handleProfile);
      setupOutsideClickListener();
      slides = document.getElementsByClassName("slide");
      initSlideshow();
      setupSlideshowEvents();

      const signOutLink = id('sign-out-link');
      if (signOutLink) {
        signOutLink.addEventListener('click', signOut);
      }
    } else if (window.location.pathname === '/login.html') {
      id('login-form').addEventListener('submit', (evnt) => {
        evnt.preventDefault();
        signIn();
      });
    }
  }

  /**
   * If the user needs to sign in or if the dropdown can be toggled.
   */
  function handleProfile() {
    if (username === null) {
      location.assign('login.html');
    } else {
      setupDropdownToggle();
    }
  }

  /**
   * Sets up the dropdown toggle functionality.
   */
  function setupDropdownToggle() {
    const dropdown = qs('.dropdown-menu');
    if (dropdown) {
      dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
    }
  }

  /**
   * Sets up an event listener on the window to close the dropdown if the user clicks
   * outside of the profile icon.
   */
  function setupOutsideClickListener() {
    window.onclick = function(event) {
      if (!event.target.matches('#profile-icon')) {
        const dropdowns = document.getElementsByClassName("dropdown-menu");
        Array.from(dropdowns).forEach(function(dropdown) {
          if (dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
          }
        });
      }
    };
  }

  /**
   * Saves the username when the user logs in (doesn't do much else yet)
   */
  function signIn() {
    username = id('username').value;
    sessionStorage.setItem('username', username);
    location.assign('index.html');
  }

  /**
   * Handles signing out the user.
   */
  function signOut() {
    username = null;
    sessionStorage.removeItem('username');
  }

  /**
   * Initializes the slideshow by starting the automatic slide transition interval.
   */
  function initSlideshow() {
    slideInterval = setInterval(nextSlide, SIX_SECONDS);
    showSlides();
  }

  /**
   * Advances the slideshow to the next slide.
   */
  function nextSlide() {
    slideIndex = (slideIndex + 1) % slides.length;
    showSlides();
  }

  /**
   * Updates the slideshow's visibility for the current slide.
   */
  function showSlides() {
    Array.from(slides).forEach(slide => {
      slide.style.opacity = '0';
    });
    slides[slideIndex].style.opacity = '1';
  }

  /**
   * Sets up hover events on the slideshow container to pause and resume the slideshow.
   */
  function setupSlideshowEvents() {
    const slideshowContainer = document.getElementById('slideshow');
    slideshowContainer.onmouseover = () => {
      clearInterval(slideInterval);
    };
    slideshowContainer.onmouseout = () => {
      slideInterval = setInterval(nextSlide, SIX_SECONDS);
    };
  }

  /**
   * Retrieves the first element from the DOM that matches the specified CSS selector.
   * @param {string} selector - the CSS selector to match against elements in the DOM.
   * @returns {Element|null} The first element of the selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} id - element ID
   * @return {object} DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }

})();
