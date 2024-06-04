/**
 * Name: Cadence Lamphiear & Sama Khalid
 * Date: May 3, 2024
 * Section: AD Max & Allan
 * This is the main javascript file that is in charge of toggling
 * in between different views, like the main view, login view, creating a new
 * account view. Also in charge of signing out.
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
   * This function is in charge of initializing the main, login, and create
   * pages. And is also initializing the greeting for the user to know if they
   * are logged in or not.
   */
  function init() {
    setupPage();
    updateGreeting();
  }

  /**
   * This function is in charge of displaying welcome user when the
   * user is logged in and not displaying it when the user isn't logged in.
   */
  function updateGreeting() {
    const greeting = id('user-greeting');
    if (greeting) {
      greeting.textContent = username ? `Welcome, ${username}` : '';
    }
  }

  /**
   * This function is in charge of setting up all of the pages.
   */
  function setupPage() {
    const profileIcon = id('profile-icon');
    const loginForm = id('login-form');
    const createForm = id('create-form');
    const signOutLink = id('sign-out-link');

    if (profileIcon && signOutLink) {
      profileIcon.addEventListener('click', handleProfile);
      setupOutsideClickListener();
      signOutLink.addEventListener('click', signOut);
      slides = document.getElementsByClassName("slide");
      slideInterval = initSlideshow(slideInterval);
    }

    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }

    if (createForm) {
      createForm.addEventListener('submit', handleCreateAccount);
    }
  }

  /**
   * This function is in charge of making sure when the user is logged in
   * the drop down menu is clickable and if not, the user is taken to the login
   * page to login.
   */
  function handleProfile() {
    if (!username) {
      location.assign('login.html');
    } else {
      setupDropdownToggle();
    }
  }

  /**
   * This function is in charge of handling the drop down menu.
   */
  function setupDropdownToggle() {
    const dropdown = qs('.dropdown-menu');
    dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
  }

  /**
   * This function is in charge of closing the drop down menu whenever
   * the user clicks outside of it.
   */
  function setupOutsideClickListener() {
    window.onclick = function(event) {
      if (!event.target.matches('#profile-icon')) {
        const dropdowns = document.getElementsByClassName("dropdown-menu");
        Array.from(dropdowns).forEach(dropdown => {
          if (dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
          }
        });
      }
    };
  }

  /**
   * This function is in charge of logging the user out upon request from the user.
   * @param {Event} event - The event object associated with the form submission.
   */
  function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    fetch('/account/login', {
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok. Status: ' + response.status);
        }
        return response.text();
      })
      .then(text => {
        if (text.includes("successfully")) {
          sessionStorage.setItem('username', formData.get('username'));
          updateGreeting();
          location.assign('/index.html');
        }
      })
      .catch(err => {
        console.error('Error with login request:', err);
      });
  }

  /**
   * This function is in charge of creating an account and fetching
   * the information required to make that happen.
   * @param {Event} event - The event object associated with the form submission.
   */
  function handleCreateAccount(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    fetch('/account/create', {
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok. Status: ' + response.status);
        }
        return response.json();
      })
      .then(result => {
        if (result.username) {
          sessionStorage.setItem('username', formData.get('username'));
          location.assign('/index.html');
        } else {
          console.error('Account creation failed: ' + result);
        }
      })
      .catch(err => {
        console.error('Error with account creation:', err);
      });
  }

  /**
   * This function is in charge of finalizing the user signing out.
   */
  function signOut() {
    updateGreeting();
    username = null;
    sessionStorage.removeItem('username');
    location.reload();
  }

  /**
   * This function is in charge of setting the interval for how long
   * the slideshow takes before changing the slide.
   * @param {number} interval - The interval for the slideshow in milliseconds.
   * @returns {any} The interval for the slideshow in milliseconds
   */
  function initSlideshow(interval) {
    interval = setInterval(nextSlide, SIX_SECONDS);
    showSlides();
    return interval;
  }

  /**
   * This function is in charge of moving to the next slide
   * in the slideshow.
   */
  function nextSlide() {
    slideIndex = (slideIndex + 1) % slides.length;
    showSlides();
  }

  /**
   * This function is in charge of setting up the slideshow.
   */
  function showSlides() {
    Array.from(slides).forEach(slide => {
      slide.style.opacity = '0';
    });
    slides[slideIndex].style.opacity = '1';
  }

  /**
   * Retrieves the first element from the DOM that matches
   * the specified CSS selector.
   * @param {string} selector - The CSS selector to match against elements in the DOM.
   * @returns {Element|null} The first element matching the selector or null.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Retrieves an element from the DOM by its id.
   * @param {string} id - The id of the DOM element.
   * @returns {HTMLElement|null} The DOM element associated with the id or null.
   */
  function id(id) {
    return document.getElementById(id);
  }

})();
