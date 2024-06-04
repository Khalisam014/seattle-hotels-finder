/**
 * Name: Cadence Lamphiear & Sama Khalid
 * Date: May 3, 2024
 * Section: AD Max & Allan
 * This is the javascript for when the user looks at their account.
 * It allows the user to see all of their information like their username,
 * login, name, etc.
 */

"use strict";

(function() {
  window.addEventListener("load", init);

  /**
   * This function is in charge of intizalizing the account page
   * making sure the html is accessed before fetching any information.
   */
  function init() {
    const accountInfo = document.getElementById('account-info');
    if (accountInfo) {
      fetchUserData();
    }
  }

  /**
   * This function fetched the users information and displays it.
   */
  function fetchUserData() {
    const username = sessionStorage.getItem('username');
    if (!username) {
      location.assign('login.html');
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

