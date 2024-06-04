# Seattle Hotel Reservation API Documentation
This API manages the backend of the application. It will retrieve the hotels and their details from the database using SQL queries. It will also retrieve the login information of the user.

## Retrieve Hotel Information
**Request Format:**  `/hotels` with optional parameters of `name`,  `amenity`, `rating`, `check_in`, and `check_out`. \
**Request Type:** GET \
**Returned Data Format**: JSON \
**Description:** This endpoint will be used to retrieve hotel information, whether it is all the hotels or a specific one. There will be parameters to filter the hotels. It will be achieving feature 1’s goal of  an “Endpoint to retrieve all items”, feature 3’s an “Endpoint to retrieve detailed item information”, and feature 5’s “Endpoint to search database and return results”. Excluding any parameters will return all the hotels and their information. Using the parameter `name={name}` will return hotels that match that name, using the parameter `amenity={amenity}` will return hotels with that amenity, and using the parameter `rating={rating}` will return hotels with a rating greater than the number provided. The parameters `check_in` and `check_out` will show rooms available at those dates. \

**Example Request #1:**  `/hotels` \
**Example Response #1:**
```json
{
  "hotels": [
    {
      "name": "The Westin Seattle",
      "address": "1900 5th Ave, Seattle, WA 98101",
      "description": "A contemporary high-rise hotel offering sleek rooms, an indoor pool, and 2 restaurants.",
      "rating": 4.5,
      "phone_number": "206-728-1000",
      "amenities": [
        "Free WiFi",
        "Swimming Pool",
        "Fitness Center",
        "Business Center",
        "Spa",
        "Restaurant",
        "Bar",
        "Room Service"
      ],
      "rooms": [
        {
          "type": "Single",
          "price_per_night": 120
        },
        {
          "type": "Double",
          "price_per_night": 180
        },
        {
          "type": "Suite",
          "price_per_night": 300
        }
      ]
    },
    {
      "name": "Hotel Max",
      "address": "620 Stewart St, Seattle, WA 98101",
      "description": "A trendy, art-focused hotel with a funky lobby, a beer happy hour, and stylish rooms.",
      "rating": 4.3,
      "phone_number": "206-728-6299",
      "amenities": [
        "Free WiFi",
        "Fitness Center",
        "Business Center",
        "Pet-Friendly",
        "Art Gallery",
        "Room Service"
      ],
      "rooms": [
        {
          "type": "Single",
          "price_per_night": 110
        },
        {
          "type": "Double",
          "price_per_night": 170
        },
        {
          "type": "Suite",
          "price_per_night": 290
        }
      ]
    },
    ....
  ]
}

```

**Example Request #2:**  `/hotels?amenity=Swimming Pool&rating=4.1` \
**Example Response #2:**
```json
{
  "hotels": [
    {
      "name": "The Westin Seattle",
      "address": "1900 5th Ave, Seattle, WA 98101",
      "description": "A contemporary high-rise hotel offering sleek rooms, an indoor pool, and 2 restaurants.",
      "rating": 4.5,
      "phone_number": "206-728-1000",
      "amenities": [
        "Free WiFi",
        "Swimming Pool",
        "Fitness Center",
        "Business Center",
        "Spa",
        "Restaurant",
        "Bar",
        "Room Service"
      ],
      "rooms": [
        {
          "type": "Single",
          "price_per_night": 120
        },
        {
          "type": "Double",
          "price_per_night": 180
        },
        {
          "type": "Suite",
          "price_per_night": 300
        }
      ]
    }
  ]
}
```

**Example Request #3:**  `/hotels?name=Hotel Max` \
**Example Response#3:**
```json
{
  "hotels": [
    {
      "name": "Hotel Max",
      "address": "620 Stewart St, Seattle, WA 98101",
      "description": "A trendy, art-focused hotel with a funky lobby, a beer happy hour, and stylish rooms.",
      "rating": 4.3,
      "phone_number": "206-728-6299",
      "amenities": [
        "Free WiFi",
        "Fitness Center",
        "Business Center",
        "Pet-Friendly",
        "Art Gallery",
        "Room Service"
      ],
      "rooms": [
        {
          "type": "Single",
          "price_per_night": 110
        },
        {
          "type": "Double",
          "price_per_night": 170
        },
        {
          "type": "Suite",
          "price_per_night": 290
        }
      ]
    }
  ]
}
```
**Error Handling:**
* If the user provides an invalid parameter, a response with a 400 status code and a message of “Invalid parameter name” will be returned.
* If `check_in` or `check_out` is provided without the other, a reponse with a 400 status code and a message "Must provide both check_in and check_out".
* If a server error occurs, a response with a 500 status code and a message of “An error occurred on the server. Try again later.” will be returned.


## Log in
**Request Format:**  `/account/login` with body parameters of `username` and `password` \
**Request Type:** POST \
**Returned Data Format**: JSON \
**Description:**  The endpoint confirms if the account with that `username` and `password` exists in the database, if so a success message will be returned. This endpoint essentially logs the user in. It will be achieving feature 2’s goal of an “Endpoint to check if the username and password match an entry in the database.” \
**Example Request:** `/account/login` \
**Example Response:**
``` json
{
  "user_id": 1,
  "username": "janedoe"
}
```

**Error Handling:**
* If the user provides an incorrect `username` and `password` combination, a response with status code 200 and the message ‘Username and password don’t exist’ will be returned.
* If a server error occurs, a response with a 500 status code and a message of “An error occurred on the server. Try again later.” will be returned.

## Create a new account
**Request Format:**  `/account/create` with body parameters of `username`, `name`, `email`, `password`, `phone_number`, and `address`. \
**Request Type:** POST \
**Returned Data Format**: JSON \
**Description:**  Creates a new user account based on the information provided. \
**Example Request:** `/account/create` \
**Example Response:** \
``` json
{
  "user_id": 1,
  "username": "janedoe"
}
```
**Error Handling:**
* If the user doesn't provide all the required body parameters, a response with a 400 status code and a message of "One or more of the body parameters are missing." will be returned.
* If the `username` provided already exists, a response with a 400 status code and a message of "Username already exists." will be returned.
* If a server error occurs, a response with a 500 status code and a message of “An error occurred on the server. Try again later.” will be returned.


## Transactions
**Request Format:** `/transaction`  with optional parameters of `reservationID` OR `userID`. \
**Request Type:** GET \
**Returned Data Format**: JSON

**Description 1:** Retrieves the details of a reservation based on the provided `reservationID`. \
**Example Request 1:** `/transaction?reservationID=1` \
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
**Description 2:** Retrieves the details of a reservation based on the provided `reservationID`. \
**Example Request 2:** `/transaction?userID=1` \
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

## Make Reservation
**Request Format:**  `/reserve` with body parameters of `user_id`, `room_id`, `check_in_date`, `check_out_date`. \
**Request Type:** POST \
**Returned Data Format**: JSON \
**Description:** Reserves the room for the logged in user. Checks if the room is available for those dates and if the user doesn't have any overlapping reservations. \
**Example Request:** `/reserve` with body parameters `"user_id": 1`, `"room_id": 14`, `"check_in_date": 2024-08-15`, `"check_out_date": 2024-08-16` \
**Example Response:** \
``` json
{
  "reservation_id": 7,
  "total_price": 240
}
```
**Error Handling:**
* If the user doesn't provide all the required body parameters, a response with a 400 status code and a message of "One or more of the body parameters are missing." will be returned.
* If the `room_id` provided doesn't exists, a response with a 400 status code and a message of "This room does not exist." will be returned.
* If the `room_id` is already reserved for the provided dates, a response with a 400 status code and a message of "This room is already reserved" will be returned.
* If the `user_id` has an overlapping reservation a response with a 400 status code and a message of "You have an overlapping reservation" will be returned.
* If a server error occurs, a response with a 500 status code and a message of “An error occurred on the server. Try again later.” will be returned.