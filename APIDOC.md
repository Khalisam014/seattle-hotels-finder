# Seattle Hotel Reservation API Documentation
This API manages the backend of the application. It will retrieve the hotels and their details from the database using SQL queries. It will also retrieve the login information of the user.

## Retrieve Hotel Information
**Request Format:**  `/hotels` with optional parameters of ‘name’,  ‘amenity’, and ‘rating’.

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** This endpoint will be used to retrieve hotel information, whether it is all the hotels or a specific one. There will be parameters to filter the hotels. It will be achieving feature 1’s goal of  an “Endpoint to retrieve all items”, feature 3’s an “Endpoint to retrieve detailed item information”, and feature 5’s “Endpoint to search database and return results”. Excluding any parameters will return all the hotels and their information. Using the parameter ‘name={name}’ will return hotels that match that name, using the parameter ‘amenity={amenity}’ will return hotels with that amenity, and using the parameter ‘rating={rating} will return hotels with a rating greater than the number provided.


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
If the user provides an invalid parameter, a response with a 400 status code and a message of “Invalid parameter name” will be returned. If a server error occurs, a response with a 500 status code and a message of “Something wrong! Try again” will be returned.


## Log in
**Request Format:**  `/login/:username/:password`

**Request Type:** GET

**Returned Data Format**: JSON

**Description:**  The endpoint confirms if the account with that username and password exists in the database, if so a success message will be returned. This endpoint essentially logs the user in. It will be achieving feature 2’s goal of an “Endpoint to check if the username and password match an entry in the database.”


**Example Request:** `login/user1/password123!`

**Example Response:**

‘Logged in successfully’


**Error Handling:**
If the user provides an incorrect username and password combination, a response with status code 200 and the message ‘Username and password don’t exist’ will be returned. If a server error occurs, a response with a 500 status code and a message of “Something wrong! Try again” will be returned.


## Success Transactions
**Request Format:** `/success?transactionId=<TRANSACTION_ID>`

**Request Type:** GET

**Returned Data Format**: JSON

**Description:**  Checks if the transaction is successful or not

**Example Request:** `/success?transactionId=123456`

**Example Response:**
```json
{
  "success": true,
  "message": "Booking successful.",
  "bookingDetails": {
    "bookingId": "123456",
    "userId": "78910",
    "hotelId": "111213",
    "checkInDate": "2024-06-01",
    "checkOutDate": "2024-06-05",
    "roomType": "Deluxe",
    "totalPrice": 299.99
  }
}
```
**Example Response #2:**
```json
{
  "success": false,
  "errorCode": "INVALID_PAYMENT",
  "message": "Payment method declined. Please try again with a different payment method or contact your bank."
}
```

**Error Handling:**
Returns a 500 internal server error if there is an issue with the transaction due to the server. Returns 400 bad request if the transaction id is invalid.
Returns 404 not found if the transaction id does not match.



## Transaction history
**Request Format:** `/transactions?userId=<USER_ID>`

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Retrieves transaction history for any given user. All thats needed is the user id, from there the system will check for the transaction history and retrieve it.

**Example Request:** `/transactions?userId=78910`

**Example Response:**

```json
{
  "success": true,
  "userId": "78910",
  "transactions": [
    {
      "bookingId": "123456",
      "hotelId": "111213",
      "checkInDate": "2024-06-01",
      "checkOutDate": "2024-06-05",
      "roomType": "Deluxe",
      "totalPrice": 299.99,
      "status": "Completed"
    },
    {
      "bookingId": "123457",
      "hotelId": "111214",
      "checkInDate": "2024-07-01",
      "checkOutDate": "2024-07-05",
      "roomType": "Standard",
      "totalPrice": 159.99,
      "status": "Cancelled"
    }
  ]
}
```


**Error Handling:**
Returns 500 internal server error with a message if there is an issue retrieving the transaction history due to the server.
Returns 400 bad request if the userid is invalid