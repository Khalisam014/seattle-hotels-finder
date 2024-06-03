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

const CLIENT_ERROR = 400;
const SERVER_ERROR = 500;
const SERVER_ERROR_MSG = 'An error occurred on the server. Try again later.';

app.get('/hotels', async (req, res) => {
  try {
    let name = req.query.name;
    let amenity = req.query.amenity;
    let rating = req.query.rating;
    let db = await getDBConnection();

    if (name || amenity || rating) {
      let result = await getFilteredResult(db, name, amenity, rating);
      res.json(result);
    } else { // return all hotels
      let hotelQuery = 'SELECT * FROM hotels';
      let hotels = await db.all(hotelQuery);
      let result = await organizeHotelData(db, hotels);
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
      res.type('text').send('Logged in successfully');
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
  console.log(req.body);
  try {
    let username = req.body.username;
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let phone_number = req.body.phone_number;
    let address = req.body.address;

    if (username && name && email && password && phone_number && address) {
      let db = await getDBConnection();
      let prevUsername = await db.get('SELECT * FROM users WHERE username = ?', username);
      if (prevUsername) {
        return res.status(400).send('Username already exists');
      }
      if (!prevUsername) {
        let query = 'INSERT INTO users (username, name, email, password, phone_number, address) ' +
          'VALUES (?,?,?,?,?,?)';
        await db.run(query, username, name, email, password, phone_number, address);
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
    let reservationID = req.query.reservationID;
    let userID = req.query.userID;
    let db = await getDBConnection();

    if (reservationID) {
      let query = 'SELECT * FROM reservations WHERE reservation_id = ?';
      let result = await db.get(query, reservationID);
      if (result) {
        res.json(result);
      } else {
        res.status(CLIENT_ERROR).type('text')
          .send('No reservation with this ID');
      }
    } else if (userID) {
      let query = 'SELECT * FROM reservations WHERE user_id = ?';
      let result = await db.all(query, userID);
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
    let user_id = req.body.user_id;
    let room_id = req.body.room_id;
    let check_in_date = req.body.check_in_date;
    let check_out_date = req.body.check_out_date;

    if (user_id && room_id && check_in_date && check_out_date) {
      let db = await getDBConnection();
      let errorText = await isReservationValid(db, user_id, room_id, check_in_date, check_out_date);
      if (errorText === '') {
        let total_price = await findTotalPrice(db, room_id, check_in_date, check_out_date);
        let query = 'INSERT INTO reservations (user_id, room_id, check_in_date, check_out_date,' +
          'total_price) VALUES (?,?,?,?,?)';
        let result = await db.run(query, user_id, room_id, check_in_date, check_out_date, total_price);
        res.json({'reservation_id': result.lastID, 'total_price': total_price});
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
})

/**
 * A helper function for the '/hotels' endpoint. Filters based on the parameters.
 * @param {Object} db - The database object for the connection.
 * @param {String} name - the hotel name
 * @param {String} amenity - the amenity to find
 * @param {Number} rating - the rating that the hotel must have more than
 * @returns {JSON} - the json to be sent back
 */
async function getFilteredResult(db, name, amenity, rating) {
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
  return await organizeHotelData(db, result, amenity);
}

/**
 * A helper function to sort out the hotel information so all the amenities of the
 * hotel are included in the object.
 * @param {Object} db - the database object for the connection
 * @param {JSON} hotels - an object array of hotels and their inforamtion
 * @param {String} amenity - the amenity to filter by, if needed, otherwise undefined
 * @returns {JSON} - the organized JSON of the hotels
 */
async function organizeHotelData(db, hotels, amenity) {
  let result = {'hotels': []};
  for (const element of hotels) {
    let amenityQuery = 'SELECT amenity_name FROM amenities WHERE hotel_id = ?';
    let amenities = await db.all(amenityQuery, element.hotel_id);
    let amenityNames = amenities.map(amen => amen.amenity_name);
    if (!amenity || amenityNames.includes(amenity)) {
      let hotel = {
        'name': element.name,
        'address': element.address,
        'description': element.description,
        'rating': element.rating,
        'phone_number': element.phone_number,
        'amenities': amenityNames
      }
      result.hotels.push(hotel);
    }
  }
  return result;
}

/**
 * Reformats the reservations to be more clear and less repetitive.
 * @param {JSON} result - the reservation data to reformat
 * @returns {JSON} - the reformatted JSON
 */
function formatUserTransactionData(result) {
  let userTransactions = {'user_id': result[0].user_id, 'reservations': []};
  for (const element of result) {
    let reservation = {
      'reservation_id': element.reservation_id,
      'room_id': element.room_id,
      'check_in_date': element.check_in_date,
      'check_out_date': element.check_out_date,
      'total_price': element.total_price
    }
    userTransactions['reservations'].push(reservation);
  }
  return userTransactions;
}

/**
 * Checks if the rooms isn't already reserved and if the user doesn't have
 * overlapping reservations. Returns the error message if needed, otherwise
 * empty string.
 * @param {Object} db - the database object for the connection
 * @param {Number} user_id - the user's id
 * @param {Number} room_id - the id of the room that is trying to be reserved.
 * @param {Date} check_in_date - the check in date trying to be reserved
 * @param {Date} check_out_date - the check out date trying to be reserved
 * @returns {String} - the error message, otherwise empty string.
 */
async function isReservationValid(db, user_id, room_id, check_in_date, check_out_date) {
  let roomExists = await db.get('SELECT * FROM rooms WHERE room_id = ?', room_id);
  if (!roomExists) {
    return 'This room does not exist.';
  }

  let roomQuery = `
    SELECT * FROM reservations
    WHERE room_id = ?
    AND (
      (check_in_date < ? AND check_out_date > ?) OR
      (check_in_date < ? AND check_out_date > ?) OR
      (check_in_date >= ? AND check_out_date <= ?)
    )`;
  let roomAvailable = await db.get(roomQuery, room_id, check_out_date,
    check_in_date, check_out_date, check_in_date, check_in_date, check_out_date);
  console.log(roomAvailable);
  if (roomAvailable) {
    return 'This room is already reserved';
  }

  let userQuery = 'SELECT check_in_date, check_out_date FROM reservations WHERE user_id = ?';
  let results = await db.all(userQuery, user_id);

  for (let element of results) {
    if ((element.check_in_date <= check_out_date && element.check_out_date >= check_in_date) ||
        (element.check_in_date <= check_out_date && element.check_out_date >= check_in_date) ||
        (element.check_in_date >= check_in_date && element.check_out_date <= check_out_date)) {
      return 'You have an overlapping reservation';
    }
  }

  return '';
}

/**
 * Calculates and returns the total price for the reservation.
 * @param {Object} db - the database object for the connect
 * @param {Number} room_id - the room to check price for
 * @param {Date} check_in_date - the check in date for the reservation
 * @param {Date} check_out_date - the check out date for the reservation
 * @returns {Number} - the total price for the reservation
 */
async function findTotalPrice(db, room_id, check_in_date, check_out_date) {
  let query = 'SELECT price_per_night FROM rooms WHERE room_id = ?';
  let result = await db.get(query, room_id);

  let checkInDate = new Date(check_in_date);
  let checkOutDate = new Date(check_out_date);
  let timeDifference = checkOutDate - checkInDate;
  let days = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

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
