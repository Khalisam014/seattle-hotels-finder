# Seattle Hotel Reservation API Documentation
This API manages the backend of the application. It will retrieve the hotels and their details from the database using SQL queries. It will also retrieve the login information of the user.

## Retrieve Hotel Information
**Request Format:**  `/hotels` with optional parameters of `name`,  `amenity`, and `rating`.

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** This endpoint will be used to retrieve hotel information, whether it is all the hotels or a specific one. There will be parameters to filter the hotels. It will be achieving feature 1’s goal of  an “Endpoint to retrieve all items”, feature 3’s an “Endpoint to retrieve detailed item information”, and feature 5’s “Endpoint to search database and return results”. Excluding any parameters will return all the hotels and their information. Using the parameter `name={name}` will return hotels that match that name, using the parameter `amenity={amenity}` will return hotels with that amenity, and using the parameter `rating={rating}` will return hotels with a rating greater than the number provided.


**Example Request:**  `/hotels`

**Example Response:**

```json
{
  "hotels": [
    {
      "name": "Fairmont Olympic Hotel",
      "address": "411 University St, Seattle, WA 98101",
      "phone": "+1 206-621-1700",
      "rating": 4.6,
      "amenities": [
        "Free WiFi",
        "Pool",
        "Fitness Center",
        "Pet-friendly",
        "Restaurant",
        "Spa"
      ]
    },
    {
      "name": "The Westin Seattle",
      "address": "1900 5th Ave, Seattle, WA 98101",
      "phone": "+1 206-728-1000",
      "rating": 4.3,
      "amenities": [
        "Free WiFi",
        "Pool",
        "Fitness Center",
        "Pet-friendly",
        "Restaurant",
        "Business Center"
      ]
    },
    {
      "name": "Grand Hyatt Seattle",
      "address": "721 Pine St, Seattle, WA 98101",
      "phone": "+1 206-774-1234",
      "rating": 4.6,
      "amenities": [
        "Free WiFi",
        "Fitness Center",
        "Restaurant",
        "Spa",
        "Pet-friendly",
        "Business Center"
      ]
    },
    ...
  ]
}

```

**Example Request #2:**  `/hotels?amenity=pool&rating=4.1`

**Example Response#2:**
```json
{
  "hotels": [
    {
      "name": "Fairmont Olympic Hotel",
      "address": "411 University St, Seattle, WA 98101",
      "phone": "+1 206-621-1700",
      "rating": 4.6,
      "amenities": [
        "Free WiFi",
        "Pool",
        "Fitness Center",
        "Pet-friendly",
        "Restaurant",
        "Spa"
      ]
    },
    {
      "name": "The Westin Seattle",
      "address": "1900 5th Ave, Seattle, WA 98101",
      "phone": "+1 206-728-1000",
      "rating": 4.3,
      "amenities": [
        "Free WiFi",
        "Pool",
        "Fitness Center",
        "Pet-friendly",
        "Restaurant",
        "Business Center"
      ]
    },
    ...
  ]
}
```

**Example Request #3:**  `/hotels?name=Motif Seattle`

**Example Response#3:**
```json
{
  "hotels": [
    {
      "name": "Motif Seattle",
      "address": "1415 5th Ave, Seattle, WA 98101",
      "phone": "+1 206-971-8000",
      "rating": 4.3,
      "amenities": [
        "Free WiFi",
        "Fitness Center",
        "Pet-friendly",
        "Restaurant",
        "Rooftop Bar",
        "Business Center"
      ]
    }
  ]
}
```

**Error Handling:**
* If the user provides an invalid parameter, a response with a 400 status code and a message of “Invalid parameter name” will be returned.
* If a server error occurs, a response with a 500 status code and a message of “An error occurred on the server. Try again later.” will be returned.


## Log in
**Request Format:**  `/login/:username/:password`

**Request Type:** GET

**Returned Data Format**: JSON

**Description:**  The endpoint confirms if the account with that `username` and `password` exists in the database, if so a success message will be returned. This endpoint essentially logs the user in. It will be achieving feature 2’s goal of an “Endpoint to check if the username and password match an entry in the database.”


**Example Request:** `login/user1/password123!`

**Example Response:**

‘Logged in successfully’


**Error Handling:**
* If the user provides an incorrect `username` and `password` combination, a response with status code 200 and the message ‘Username and password don’t exist’ will be returned.
* If a server error occurs, a response with a 500 status code and a message of “An error occurred on the server. Try again later.” will be returned.


## Transactions
**Request Format:** `/transaction`  with optional parameters of `reservationID` OR `userID`.

**Request Type:** GET

**Returned Data Format**: JSON

**Description 1:** Retrieves the details of a reservation based on the provided `reservationID`.

**Example Request 1:** `/transaction?reservationID=1`

**Example Response 1:**
```json
{
  "reservation_id": 1,
  "user_id": 1,
  "room_id": 1,
  "check_in_date": "2024-06-01",
  "check_out_date": "2024-06-05",
  "total_price": 800
}
```

**Description 2:** Retrieves the details of a reservation based on the provided `reservationID`.

**Example Request 2:** `/transaction?userID=1`

**Example Response 2:**
```json
{
  "user_id": 1,
  "reservations": [
    {
      "reservation_id": 1,
      "room_id": 1,
      "check_in_date": "2024-06-01",
      "check_out_date": "2024-06-05",
      "total_price": 800
    },
    {
      "reservation_id": 3,
      "room_id": 5,
      "check_in_date": "2024-07-01",
      "check_out_date": "2024-07-07",
      "total_price": 2100
    }
  ]
}
```

**Error Handling:**
* If the user doesn't provide a `reservationID` or `userID`,a response with a 400 status code and a message of "Bad Request. Please provide a valid reservation ID or user ID." will be returned.
* If the user provides an invalid `reservationID`, a response with a 400 status code and a message of "No reservation with this ID" will be returned.
* If the user provides an invalid `userID`, a response with a 400 status code and a message of "No users with this ID" will be returned.
* If a server error occurs, a response with a 500 status code and a message of “An error occurred on the server. Try again later.” will be returned

