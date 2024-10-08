/*
 * Name: Cadence Lamphiear & Sama Khalid
 * Date: May 25, 2024
 * Section: AD Max & Allan
 *
 * This is the JS for my server. It create endpoints that read and update data from
 * the final_project.db database. It will have endpoints to GET the information in the
 * database, as well as create new entries.
 */

'use strict';

const express = require('express');
const app = express();

const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const multer = require('multer');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

const EIGHT_THOUSAND = 5501;
const TWENTY_FOUR = 24;
const SIX_TY = 60;
const ONE_THOUSAND = 1000;

const CLIENT_ERROR = 400;
const SERVER_ERROR = 500;
const FOUR_O_FOUR = 404;
const SERVER_ERROR_MSG = 'An error occurred on the server. Try again later.';

app.get('/hotels', async (req, res) => {
  try {
    let name = req.query.name;
    let amenity = req.query.amenity;
    let rating = req.query.rating;
    let checkIn = req.query.check_in;
    let checkOut = req.query.check_out;
    let db = await getDBConnection();

    if ((checkIn && !checkOut) || (checkIn && !checkOut)) {
      res.status(CLIENT_ERROR).type('text')
        .send('Must provide both check_in and check_out');
    } else if (name || rating) {
      let result = await getFilteredResult(db, name, amenity, rating, checkIn, checkOut);
      res.json(result);
    } else { // return all hotels
      let hotelQuery = 'SELECT * FROM hotels';
      let hotels = await db.all(hotelQuery);
      let result = await organizeHotelData(db, hotels, amenity, checkIn, checkOut);
      res.json(result);
    }
    await db.close();
  } catch (err) {
    console.error(err);
    res.status(SERVER_ERROR).type('text')
      .send(SERVER_ERROR_MSG);
  }
});

app.post('/account/login', async (req, res) => {
  try {
    let username = req.body.username;
    let password = req.body.password;
    let db = await getDBConnection();

    let query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    let result = await db.get(query, username, password);
    await db.close();
    if (result) {
      res.json({'user_id': result.user_id, 'username': result.username});
    } else {
      res.status(CLIENT_ERROR).type('text')
        .send('Username and password do not exist');
    }
  } catch (err) {
    res.status(SERVER_ERROR).type('text')
      .send(SERVER_ERROR_MSG);
  }
});

app.post('/account/create', async (req, res) => {
  try {
    let username = req.body.username;
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let phoneNumber = req.body.phoneNumber;
    let address = req.body.address;
    if (username && name && email && password && phoneNumber && address) {
      let db = await getDBConnection();
      let prevUsername = await db.get('SELECT * FROM users WHERE username = ?', username);
      if (!prevUsername) {
        let query = 'INSERT INTO users (username, name, email, password, phone_number, address) ' +
          'VALUES (?,?,?,?,?,?)';
        await db.run(query, username, name, email, password, phoneNumber, address);
        res.json({'username': username});
      } else {
        res.status(CLIENT_ERROR).type('text')
          .send('Username already exists');
      }
      await db.close();
    } else {
      res.status(CLIENT_ERROR).type('text')
        .send('One or more of the body parameters are missing.');
    }
  } catch (err) {
    res.status(SERVER_ERROR).type('text')
      .send(SERVER_ERROR_MSG);
  }
});

app.get('/transaction', async (req, res) => {
  try {
    let db = await getDBConnection();

    if (req.query.reservationID) {
      let query = 'SELECT * FROM reservations WHERE reservation_id = ?';
      if (await db.get(query, req.query.reservationID)) {
        res.json(await db.get(query, req.query.reservationID));
      } else {
        res.status(CLIENT_ERROR).type('text')
          .send('No reservation with this ID');
      }
    } else if (req.query.userID) {
      let result = await db.all('SELECT * FROM reservations WHERE user_id = ?', req.query.userID);
      if (result.length > 0) {
        let userTransactions = formatUserTransactionData(result);
        res.json(userTransactions);
      } else {
        res.status(CLIENT_ERROR).type('text')
          .send('No users with this ID');
      }
    } else {
      res.status(CLIENT_ERROR).type('text')
        .send('Bad Request. Please provide a valid reservation ID or user ID.');
    }
    await db.close();
  } catch (err) {
    res.status(SERVER_ERROR).type('text')
      .send(SERVER_ERROR_MSG);
  }
});

app.post('/reserve', async (req, res) => {
  try {
    let userId = req.body.user_id;
    let roomId = req.body.room_id;
    let checkIn = req.body.check_in_date;
    let checkOut = req.body.check_out_date;

    if (userId && roomId && checkIn && checkOut) {
      let db = await getDBConnection();
      let errorText = await isReservationValid(db, userId, roomId, checkIn, checkOut);
      if (errorText === '') {
        let totalPrice = await findTotalPrice(db, roomId, checkIn, checkOut);
        let query = 'INSERT INTO reservations (user_id, room_id, check_in_date, check_out_date,' +
          'total_price) VALUES (?,?,?,?,?)';
        let result = await db.run(query, userId, roomId, checkIn, checkOut, totalPrice);
        res.json({'reservation_id': result.lastID, 'total_price': totalPrice});
      } else {
        res.status(CLIENT_ERROR).type('text')
          .send(errorText);
      }
      await db.close();
    } else {
      res.status(CLIENT_ERROR).type('text')
        .send('One or more of the body parameters are missing.');
    }
  } catch (err) {
    console.error(err);
    res.status(SERVER_ERROR).type('text')
      .send(SERVER_ERROR_MSG);
  }
});

app.get('/account/:username', async (req, res) => {
  try {
    let username = req.params.username;
    let db = await getDBConnection();

    let query = 'SELECT * FROM users WHERE username = ?';
    let userResult = await db.get(query, username);
    if (!userResult) {
      res.status(FOUR_O_FOUR).send('User not found');
      return;
    }

    let user = {
      username: userResult.username,
      email: userResult.email,
      name: userResult.name,
      phoneNumber: userResult.phoneNumber,
      address: userResult.address
    };

    res.json(user);
    await db.close();
  } catch (err) {
    console.error(err);
    res.status(SERVER_ERROR).send('An error occurred while fetching user data');
  }
});

/**
 * A helper function for the '/hotels' endpoint. Filters based on the parameters.
 * @param {Object} db - The database object for the connection.
 * @param {String} name - the hotel name
 * @param {String} amenity - the amenity to find
 * @param {Number} rating - the rating that the hotel must have more than
 * @param {Date} checkIn - the check in date
 * @param {Date} checkOut - the check out date
 * @returns {JSON} - the json to be sent back
 */
async function getFilteredResult(db, name, amenity, rating, checkIn, checkOut) {
  let result;
  if (name && rating) {
    let query = 'SELECT * FROM hotels WHERE name LIKE ? AND rating >= ?';
    result = await db.all(query, '%' + name + '%', rating);
  } else if (name) {
    let query = 'SELECT * FROM hotels WHERE name LIKE ?';
    result = await db.all(query, '%' + name + '%');
  } else if (rating) {
    let query = 'SELECT * FROM hotels WHERE rating >= ?';
    result = await db.all(query, rating);
  }
  return organizeHotelData(db, result, amenity, checkIn, checkOut);
}

/**
 * A helper function to sort out the hotel information so all the amenities of the
 * hotel are included in the object.
 * @param {Object} db - the database object for the connection
 * @param {JSON} hotels - an object array of hotels and their inforamtion
 * @param {String} amenity - the amenity to filter by, if needed, otherwise undefined
 * @param {Date} checkIn - the check in date
 * @param {Date} checkOut - the check out date
 * @returns {JSON} - the organized JSON of the hotels
 */
async function organizeHotelData(db, hotels, amenity, checkIn, checkOut) {
  let result = {'hotels': []};
  for (const element of hotels) {
    let amenityQuery = 'SELECT amenity_name FROM amenities WHERE hotel_id = ?';
    let amenities = await db.all(amenityQuery, element.hotel_id);
    let roomQuery = 'SELECT room_id, type, price_per_night FROM rooms WHERE hotel_id = ?';
    let rooms = await db.all(roomQuery, element.hotel_id);
    let availableRooms = [];
    if (checkIn && checkOut) {
      for (let room of rooms) {
        if (await isReservationValid(db, undefined, room.room_id, checkIn, checkOut) === '') {
          availableRooms.push(room);
        }
      }
    } else {
      availableRooms = rooms;
    }
    let amenityNames = amenities.map(amen => amen.amenity_name);
    if (!amenity || amenityNames.includes(amenity)) {
      result.hotels.push(getHotelObject(element, amenityNames, availableRooms));
    }
  }
  return result;
}

/**
 * A helper function to put together the hotel object.
 * @param {Object} element - the hotel information
 * @param {String[]} amenityNames - the hotel's amenities
 * @param {Object} availableRooms - the hotel's available rooms
 * @returns {Object} - all the hotel information together
 */
function getHotelObject(element, amenityNames, availableRooms) {
  let hotel = {
    'name': element.name,
    'address': element.address,
    'description': element.description,
    'rating': element.rating,
    'phone_number': element.phone_number,
    'amenities': amenityNames,
    'rooms': availableRooms
  };
  return hotel;
}

/**
 * Reformats the reservations to be more clear and less repetitive.
 * @param {JSON} result - the reservation data to reformat
 * @returns {JSON} - the reformatted JSON
 */
function formatUserTransactionData(result) {
  let userTransactions = {'user_id': result[0].userId, 'reservations': []};
  for (const element of result) {
    let reservation = {
      'reservation_id': element.reservation_id,
      'room_id': element.roomId,
      'check_in_date': element.checkInDate,
      'check_out_date': element.checkOutDate,
      'total_price': element.totalPrice
    };
    userTransactions['reservations'].push(reservation);
  }
  return userTransactions;
}

/**
 * Checks if the rooms isn't already reserved and if the user doesn't have
 * overlapping reservations. Returns the error message if needed, otherwise
 * empty string.
 * @param {Object} db - the database object for the connection
 * @param {Number} userId - the user's id
 * @param {Number} roomId - the id of the room that is trying to be reserved.
 * @param {Date} checkInDate - the check in date trying to be reserved
 * @param {Date} checkOutDate - the check out date trying to be reserved
 * @returns {String} - the error message, otherwise empty string.
 */
async function isReservationValid(db, userId, roomId, checkInDate, checkOutDate) {
  let roomExists = await db.get('SELECT * FROM rooms WHERE room_id = ?', roomId);
  if (!roomExists) {
    return 'This room does not exist.';
  }
  if (await findRoomQuery(db, checkInDate, checkOutDate, roomId)) {
    return 'This room is already reserved';
  }
  if (userId !== undefined) {
    let userQuery = 'SELECT check_in_date, check_out_date FROM reservations WHERE user_id = ?';
    let results = await db.all(userQuery, userId);
    for (let element of results) {
      if ((element.checkInDate <= checkOutDate && element.checkOutDate >= checkInDate) ||
          (element.checkInDate <= checkOutDate && element.checkOutDate >= checkInDate) ||
          (element.checkInDate >= checkInDate && element.checkOutDate <= checkOutDate)) {
        return 'You have an overlapping reservation';
      }
    }
  }
  return '';
}

/**
 * A helper function to determine whether the room is available.
 * @param {Object} db - the database object for the connect
 * @param {Date} checkInDate - the check in date for the reservation
 * @param {Date} checkOutDate - the check out date for the reservation
 * @param {Number} roomId - the room to check price for
 * @returns {Object} - returns the room if there is overlapping time.
 */
async function findRoomQuery(db, checkInDate, checkOutDate, roomId) {
  let roomQuery = `
  SELECT * FROM reservations
  WHERE room_id = ?
  AND (
    (check_in_date == ? AND check_out_date == ?) OR
    (check_in_date < ? AND check_out_date > ?) OR
    (check_in_date <= ? AND check_out_date >= ?) OR
    (check_in_date < ? AND check_out_date >= ?)
  )`;
  let roomAvailable = await db.get(
    roomQuery,
    roomId,
    checkInDate,
    checkOutDate,
    checkInDate,
    checkOutDate,
    checkInDate,
    checkInDate,
    checkOutDate,
    checkOutDate
  );
  return roomAvailable;
}

/**
 * Calculates and returns the total price for the reservation.
 * @param {Object} db - the database object for the connect
 * @param {Number} roomId - the room to check price for
 * @param {Date} checkInDate - the check in date for the reservation
 * @param {Date} checkOutDate - the check out date for the reservation
 * @returns {Number} - the total price for the reservation
 */
async function findTotalPrice(db, roomId, checkInDate, checkOutDate) {
  let query = 'SELECT price_per_night FROM rooms WHERE room_id = ?';
  let result = await db.get(query, roomId);

  let checkInDateOne = new Date(checkInDate);
  let checkOutDateOne = new Date(checkOutDate);
  let timeDifference = checkOutDateOne - checkInDateOne;
  let days = Math.ceil(timeDifference / (ONE_THOUSAND * SIX_TY * SIX_TY * TWENTY_FOUR));

  return days * result.price_per_night;
}

/**
 * Establishes a database connection to the database and returns the database object.
 * Any errors that occur should be caught in the function that calls this one.
 * @returns {Object} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'final_project.db', // THIS IS NOT THE TABLE NAME
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static('public'));
const PORT = process.env.PORT || EIGHT_THOUSAND;
app.listen(PORT);
