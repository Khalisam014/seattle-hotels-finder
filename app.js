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

const EIGHT_THOUSAND = 8000;
const ZERO = 0;
const ONE = 1;

const INVALID_PARAM_ERROR = 400;
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
      let result = {'hotels' : []};
      for (const element of hotels) {
        let amenityQuery = 'SELECT amenity_name FROM amenities WHERE hotel_id = ?';
        let amenities = await db.all(amenityQuery, element.hotel_id);
        let amenityNames = amenities.map(a => a.amenity_name);
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
      res.json(result);
    }
    await db.close();
  } catch (err) {
    console.error(err);
    res.status(SERVER_ERROR).type('text')
      .send(SERVER_ERROR_MSG);
  }
});

app.get('/login/:username/:password', async (req, res) => {
  try {
    let username = req.params.username;
    let password = req.params.password;
    let db = await getDBConnection();

    let query = 'SELECT * FROM users WHERE username = ? AND password = ?'
    let result = await db.get(query, username, password);
    await db.close();
    if (result) {
      res.type('text').send('Logged in successfully');
    } else {
      res.status(INVALID_PARAM_ERROR).type('text')
        .send('Username and password do not exist');
    }
  } catch (err) {
    res.status(SERVER_ERROR).type('text')
      .send(SERVER_ERROR_MSG);
  }
})

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

  if (amenity) {
    let hotels = {'hotels': []};
    for (const element of result) {
      let amenityQuery = 'SELECT amenity_name FROM amenities WHERE hotel_id = ?';
      let amenities = await db.all(amenityQuery, element.hotel_id);
      let amenityNames = amenities.map(a => a.amenity_name);

      if (amenityNames.includes(amenity)) {
        let hotel = {
          'name': element.name,
          'address': element.address,
          'description': element.description,
          'rating': element.rating,
          'phone_number': element.phone_number,
          'amenities': amenityNames
        }
        hotels.hotels.push(hotel);
      }
    }
    return hotels;
  } else {
    return result;
  }
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
