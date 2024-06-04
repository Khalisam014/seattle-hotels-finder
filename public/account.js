"use strict";

(function() {
  window.addEventListener("load", init);

  function init() {
    const accountInfo = document.getElementById('account-info');
    if (accountInfo) {
      fetchUserData();
    }
  }

  function fetchUserData() {
    const username = sessionStorage.getItem('username');
    if (!username) {
      location.assign('login.html');
      return;
    }

    fetch(`/account/${username}`)
      .then(response => response.json())
      .then(data => {
        if (data) {
          document.getElementById('account-username').textContent = data.username;
          document.getElementById('account-email').textContent = data.email;
          document.getElementById('account-name').textContent = data.name;
          document.getElementById('account-phone').textContent = data.phone_number;
          document.getElementById('account-address').textContent = data.address;
        }
      })
      .catch(error => console.error('Error fetching user data:', error));
  }
})();

