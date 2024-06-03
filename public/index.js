"use strict";

(function() {
  window.addEventListener("load", init);

  let slideIndex = 0;
  let slides = [];
  let slideInterval;
  let username = sessionStorage.getItem('username');

  const SIX_SECONDS = 6000;

  function init() {
    setupPage();
    updateGreeting();
  }

  function updateGreeting() {
    const greeting = id('user-greeting');
    if (greeting) {
      const username = sessionStorage.getItem('username');
      greeting.textContent = username ? `Welcome, ${username}` : '';
    }
  }
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
      initSlideshow();
      setupSlideshowEvents();
    }

    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }

    if (createForm) {
      createForm.addEventListener('submit', handleCreateAccount);
    }
  }

  function handleProfile() {
    if (!username) {
      location.assign('login.html');
    } else {
      setupDropdownToggle();
    }
  }

  function setupDropdownToggle() {
    const dropdown = qs('.dropdown-menu');
    dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
  }

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

  function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    fetch('/account/login', {
      method: 'POST',
      body: formData
    }).then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok. Status: ' + response.status);
        }
        return response.text();
    }).then(text => {
      if (text.includes("successfully")) {
        sessionStorage.setItem('username', formData.get('username'));
        updateGreeting();
        location.assign('/index.html');
      }
    }).catch(err => {
      console.error('Error with login request:', err);
    });
  }

  function handleCreateAccount(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    fetch('/account/create', {
      method: 'POST',
      body: formData
    }).then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok. Status: ' + response.status);
      }
      return response.json();
    }).then(result => {
      if (result.username) {
        sessionStorage.setItem('username', formData.get('username'));
        location.assign('/index.html');
      } else {
        console.error('Account creation failed: ' + result);
      }
    }).catch(err => {
      console.error('Error with account creation:', err);
    });
  }

  function signOut() {
    updateGreeting();
    username = null;
    sessionStorage.removeItem('username');
    location.reload();
  }

  function initSlideshow() {
    slideInterval = setInterval(nextSlide, SIX_SECONDS);
    showSlides();
  }

  function nextSlide() {
    slideIndex = (slideIndex + 1) % slides.length;
    showSlides();
  }

  function showSlides() {
    Array.from(slides).forEach(slide => slide.style.opacity = '0');
    slides[slideIndex].style.opacity = '1';
  }

  function setupSlideshowEvents() {
    const slideshowContainer = id('slideshow');
    slideshowContainer.onmouseover = () => clearInterval(slideInterval);
    slideshowContainer.onmouseout = () => slideInterval = setInterval(nextSlide, SIX_SECONDS);
  }

  function qs(selector) {
    return document.querySelector(selector);
  }

  function id(id) {
    return document.getElementById(id);
  }

})();
