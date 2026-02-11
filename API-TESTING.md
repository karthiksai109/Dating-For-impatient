# API Testing Guide - VenueMatch

## Prerequisites
- Backend running on `http://localhost:5000`
- Use Postman, Thunder Client, or curl

## 1. Admin Setup

### Register Admin
```
POST http://localhost:5000/api/adminregister
Body: { "name": "Admin", "email": "admin@test.com", "password": "admin123", "secretKey": "YOUR_ADMIN_SECRET" }
```

### Login Admin
```
POST http://localhost:5000/api/adminlogin
Body: { "email": "admin@test.com", "password": "admin123" }
→ Save the token from response
```

### Create a Venue (as Admin)
```
POST http://localhost:5000/api/venues
Headers: Authorization: Bearer <admin_token>
Body: {
  "name": "The Coffee House",
  "type": "cafe",
  "description": "Cozy cafe downtown",
  "city": "New York",
  "state": "NY",
  "addressLine1": "123 Main St",
  "capacity": 50,
  "tags": ["coffee", "wifi", "cozy"]
}
```

## 2. User Flow

### Register User 1
```
POST http://localhost:5000/api/userregister
Body: {
  "name": "Alice",
  "email": "alice@test.com",
  "password": "alice123",
  "confirmpassword": "alice123",
  "dateOfBirth": "2000-01-15",
  "gender": "female",
  "interestedIn": "everyone",
  "hobbies": ["Travel", "Music", "Cooking"],
  "bio": "Love exploring new cafes!"
}
```

### Register User 2
```
POST http://localhost:5000/api/userregister
Body: {
  "name": "Bob",
  "email": "bob@test.com",
  "password": "bob123",
  "confirmpassword": "bob123",
  "dateOfBirth": "1998-06-20",
  "gender": "male",
  "interestedIn": "everyone",
  "hobbies": ["Travel", "Music", "Fitness"],
  "bio": "Gym enthusiast who loves coffee"
}
```

### Login User 1
```
POST http://localhost:5000/api/userlogin
Body: { "email": "alice@test.com", "password": "alice123" }
→ Save token as user1_token
```

### Check In to Venue (User 1)
```
POST http://localhost:5000/api/venues/checkin
Headers: Authorization: Bearer <user1_token>
Body: { "venueId": "<venue_id_from_step_above>" }
```

### Login & Check In User 2
```
POST http://localhost:5000/api/userlogin
Body: { "email": "bob@test.com", "password": "bob123" }
→ Save token as user2_token

POST http://localhost:5000/api/venues/checkin
Headers: Authorization: Bearer <user2_token>
Body: { "venueId": "<same_venue_id>" }
```

### Discover Profiles (User 1)
```
GET http://localhost:5000/api/discover
Headers: Authorization: Bearer <user1_token>
→ Should see Bob with match score based on shared hobbies
```

### Swipe Right (User 1 likes User 2)
```
POST http://localhost:5000/api/swipe/right
Headers: Authorization: Bearer <user1_token>
Body: { "targetUserId": "<bob_user_id>" }
```

### Swipe Right (User 2 likes User 1) → MATCH!
```
POST http://localhost:5000/api/swipe/right
Headers: Authorization: Bearer <user2_token>
Body: { "targetUserId": "<alice_user_id>" }
→ Response should say "it's a match!" with ephemeralMatchId
```

### Send Message (User 1)
```
POST http://localhost:5000/api/messages
Headers: Authorization: Bearer <user1_token>
Body: { "matchId": "<ephemeral_match_id>", "text": "Hey! Love this cafe too!" }
```

### Get Messages (User 2)
```
GET http://localhost:5000/api/messages/<ephemeral_match_id>
Headers: Authorization: Bearer <user2_token>
→ Should see Alice's message
```

### Check Out (User 1)
```
POST http://localhost:5000/api/venues/checkout
Headers: Authorization: Bearer <user1_token>
→ Swipes reset, chat access locked
```

## 3. Expected Behaviors

- Discovery only shows users at SAME venue
- Messaging fails if either user leaves venue
- Swipe history resets on checkout
- Email/phone never appear in discover responses
- Match score calculated from shared hobbies
- Profiles sorted by match score (best first)
