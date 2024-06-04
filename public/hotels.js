/*
 * Name: Cadence Lamphiear and Sama Khalid
 * Date: May 30, 2024
 * Section: AD Max & Allan
 *
 * This is the JS for display and interacting with those hotels. The user reservations
 * are managed through this.
 */
'use strict';
(function() {
  window.addEventListener('load', init);

  let selectedAmenity = undefined;
  let selectedCheckIn = undefined;
  let selectedCheckOut = undefined;
  let selectedTravelers = undefined;
  let view = 'list';

  const THREE = 3;

  /**
   * The function called on page load. Add many event listeners.
   */
  function init() {
    getHotels();
    setAmenityEventListeners();
    qs('#search-bar button').addEventListener('click', () => {
      let checkIn = id('start-date').value;
      let checkOut = id('end-date').value;
      let travelers = id('travelers').value;
      searchByDateTravelers(checkIn, checkOut, travelers);
    });

    id('list-icon').addEventListener('click', switchView);
    id('menu-icon').addEventListener('click', switchView);

    qs('#searching button').addEventListener('click', () => {
      let hotel = id('search').value;
      getHotels(selectedAmenity, selectedCheckIn, selectedCheckOut, hotel);
    });

    qs('#hotel-container button').addEventListener('click', () => {
      id('hotel-overlay').classList.remove('overlay');
      id('hotel-container').classList.add('hidden');
    });
    qs('#price-container button').addEventListener('click', () => {
      id('price-overlay').classList.remove('overlay');
      id('price-container').classList.add('hidden');
    });
  }

  /**
   * Creates the correct query string, then fetches the hotels that match the filters.
   * @param {String} amenity - amenity to filter
   * @param {Date} checkIn - check in date
   * @param {Date} checkOut - check out date
   * @param {String} hotelSearch - hotel to search for
   */
  function getHotels(amenity, checkIn, checkOut, hotelSearch) {
    let fetchStr = '/hotels?';
    if (amenity) {
      fetchStr = fetchStr + 'amenity=' + amenity + '&';
    }

    if (checkIn && checkOut) {
      fetchStr = fetchStr + 'check_in=' + checkIn + '&check_out=' + checkOut + '&';
    }

    if (hotelSearch) {
      fetchStr = fetchStr + 'name=' + hotelSearch + '&';
    }

    fetch(fetchStr)
      .then(statusCheck)
      .then(res => res.json())
      .then((data) => {
        displayHotels(data);
      })
      .catch(handleError);
  }

  /**
   * Creates the tags and displays the hotel.
   * @param {Object} data - the hotel data to display
   */
  function displayHotels(data) {
    id('hotels').innerHTML = '';
    for (let element of data.hotels) {
      for (let room of element.rooms) {
        let article = gen('article');
        article.id = room.room_id;
        if (view === 'list') {
          article.classList.add('article-list');
        } else {
          article.classList.add('article-menu');
        }

        let image = gen('img');
        let formattedName = element.name.toLowerCase().replace(/\s+/g, '-');
        image.src = 'img/' + formattedName + '.jpg';
        image.alt = element.name;
        image.addEventListener('click', moreInfo);

        let div = gen('div');
        div.appendChild(getHotelInfo(element.name, element.description, room.type));
        div.appendChild(ratingPrice(element.rating, room.price_per_night));

        article.appendChild(image);
        article.appendChild(div);

        if (!selectedTravelers || selectedTravelers < THREE ||
          (selectedTravelers === THREE && room.type !== 'Single') ||
          (selectedTravelers > THREE && room.type === 'Suite')) {
          id('hotels').appendChild(article);
        }
      }
    }
  }

  /**
   * A helper function to create the hotel info.
   * @param {String} name - the hotel name
   * @param {String} description - the hotel description
   * @param {String} type - the room type
   * @returns {Object} the hotel info object to append
   */
  function getHotelInfo(name, description, type) {
    let hotelInfo = gen('div');
    hotelInfo.classList.add('hotel-info');

    let hotelName = gen('h2');
    hotelName.textContent = name;

    let desc = gen('p');
    desc.textContent = description;

    let span = gen('span');
    span.textContent = type;

    let room = gen('p');
    room.appendChild(span);
    if (type === 'Single') {
      room.appendChild(document.createTextNode(', fits 1-2 travelers'));
    } else if (type === 'Double') {
      room.appendChild(document.createTextNode(', fits 2-3 travelers'));
    } else if (type === 'Suite') {
      room.appendChild(document.createTextNode(', fits 2-5 travelers'));
    }

    hotelInfo.appendChild(hotelName);
    hotelInfo.appendChild(desc);
    hotelInfo.appendChild(room);

    return hotelInfo;
  }

  /**
   * A helper function to create the hotel rating and price.
   * @param {Number} rating - the hotel rating
   * @param {Number} price - the room's price per night
   * @returns {Object} - the rating and price object to append
   */
  function ratingPrice(rating, price) {
    let rpDiv = gen('div');
    rpDiv.classList.add('rating-price');

    let span1 = gen('span');
    span1.textContent = rating;

    let outOf5 = gen('p');
    outOf5.appendChild(span1);
    outOf5.appendChild(document.createTextNode(' out of 5 rating'));

    let div = gen('div');

    let span2 = gen('span');
    span2.textContent = '$' + price;

    let perNight = gen('p');
    perNight.appendChild(span2);
    perNight.appendChild(document.createTextNode(' per night'));

    let button = gen('button');
    button.textContent = 'Reserve';
    button.addEventListener('click', reserveRoom);

    div.appendChild(perNight);
    div.appendChild(button);
    rpDiv.appendChild(outOf5);
    rpDiv.appendChild(div);
    return rpDiv;
  }

  /**
   * Sets the selected check in, check out, and the number of travelers, and gets the
   * hotels with those filters.
   * @param {Date} checkIn - the room check in date
   * @param {Date} checkOut - the room check out date
   * @param {Number} travelers - the number of travelers
   */
  function searchByDateTravelers(checkIn, checkOut, travelers) {
    selectedCheckIn = checkIn;
    selectedCheckOut = checkOut;
    selectedTravelers = travelers;
    getHotels(selectedAmenity, checkIn, checkOut);
  }

  /**
   * Sets the amenity event listeners. Sets the button color and the filters the hotels.
   */
  function setAmenityEventListeners() {
    const amenities = ['pet-friendly', 'family-friendly', 'hot-tub', 'pool', 'spa',
      'free-parking', 'breakfast', 'valet-parking'];

    for (let amenity of amenities) {
      id(amenity).addEventListener('click', () => {
        const element = id(amenity);
        if (element.classList.contains('clicked')) {
          element.classList.remove('clicked');
          selectedAmenity = undefined;
          getHotels();
        } else {
          amenities.forEach(amen => id(amen).classList.remove('clicked'));
          selectedAmenity = amenity.replace('-', ' ')
            .replace(/\b\w/g, letter => letter.toUpperCase());
          element.classList.add('clicked');
          getHotels(selectedAmenity, selectedCheckIn, selectedCheckOut, selectedTravelers);
        }
      });
    }
  }

  /**
   * Reserves a room for the selected dates, but the user must be logged in.
   */
  function reserveRoom() {
    let roomId = this.parentNode.parentNode.parentNode.parentNode.id;
    if (selectedCheckIn && selectedCheckOut && sessionStorage.getItem('user_id')) {
      let body = new FormData();
      body.append('user_id', sessionStorage.getItem('user_id'));
      body.append('room_id', roomId);
      body.append('check_in_date', selectedCheckIn);
      body.append('check_out_date', selectedCheckOut);
      fetch('/reserve', {
        method: 'POST',
        body: body
      })
        .then(statusCheck)
        .then(res => res.json())
        .then(displayPrice)
        .catch(handleError);
    } else {
      handleError('Please search for your desired dates and make sure you are logged in.');
    }
  }

  /**
   * Displays the total price in a pop up after the reservation is complete.
   * @param {Number} data - the total price
   */
  function displayPrice(data) {
    qs('#price-container p').textContent = '$' + data.total_price + ' total';
    id('price-overlay').classList.add('overlay');
    id('price-container').classList.remove('hidden');
  }

  /**
   * Switches the view to list or menu.
   */
  function switchView() {
    id('list-icon').classList.toggle('hidden');
    id('menu-icon').classList.toggle('hidden');

    if (id('list-icon').classList.contains('hidden')) {
      view = 'list';
      qsa('.article-menu').forEach((element) => {
        element.classList.add('article-list');
        element.classList.remove('article-menu');
      });
      id('hotels').classList.remove('hotel-menu');
    } else {
      view = 'menu';
      qsa('.article-list').forEach((element) => {
        element.classList.remove('article-list');
        element.classList.add('article-menu');
      });
      id('hotels').classList.add('hotel-menu');
    }
  }

  /**
   * Gets the details for the hotel clicked.
   */
  function moreInfo() {
    let name = this.parentNode.querySelector('h2').textContent;
    fetch('/hotels?name=' + name)
      .then(statusCheck)
      .then(res => res.json())
      .then(displayMoreInfo)
      .catch(handleError);
  }

  /**
   * Displays more details for the hotel in a pop up.
   * @param {Object} data - the hotel information
   */
  function displayMoreInfo(data) {
    qs('#hotel-container h2').textContent = data.hotels[0].name;
    id('description').textContent = data.hotels[0].description;
    id('address').textContent = data.hotels[0].address;
    id('phone-number').textContent = data.hotels[0].phone_number;

    qs('#hotel-container ul').innerHTML = '';
    for (let amenity of data.hotels[0].amenities) {
      let list = gen('li');
      list.textContent = amenity;
      qs('#hotel-container ul').append(list);
    }

    id('hotel-overlay').classList.add('overlay');
    id('hotel-container').classList.remove('hidden');
  }

  /**
   * Displays the error is a popup.
   * @param {String} err - the error message
   */
  function handleError(err) {
    id('popup-overlay').classList.add('overlay');
    id('popup-container').classList.remove('hidden');
    id('error-text').textContent = err;
  }

  /**
   * A shortcut for getting the element by the ID.
   * @param {String} name - the given ID
   * @returns {Element} - the object representing the element with the given ID
   */
  function id(name) {
    return document.getElementById(name);
  }

  /**
   * A shortcut for getting the element by query selector.
   * @param {String} selector - the tag to select
   * @returns {Element} - the object representing the first element with the given ID
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns the array of elements that match the given CSS selector.
   * @param {string} query - CSS query selector
   * @returns {object[]} array of DOM objects matching the query.
   */
  function qsa(query) {
    return document.querySelectorAll(query);
  }

  /**
   * Returns the response if the status is ok, other throws an error.
   * @param {Response} response - the response to check
   * @returns {Response} - response
   */
  async function statusCheck(response) {
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response;
  }

  /**
   * A shortcut for creating an element.
   * @param {String} tagName - The tag that you want to create
   * @returns {Element} - An element with the desired tag
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }
})();