# VenueMatch - Dating App for Impatient People

> **The world's first venue-locked dating app.** Match with people at the same place, chat only while you're both there, and protect your privacy like never before.

## What Makes This App Revolutionary

| Feature | Tinder/Bumble | **VenueMatch** |
|---------|--------------|----------------|
| Discovery | Anywhere, random radius | **Only at your current venue** |
| Matching | Based on distance | **Based on shared location + interests** |
| Messaging | Anytime, anywhere | **Venue-locked: only while both at same place** |
| Privacy | Email/phone visible | **Email & phone NEVER shown to users** |
| Context Reset | Permanent swipe history | **Fresh start at every new venue** |
| Interest Matching | Basic preferences | **Scored % match based on shared hobbies** |
| Admin Control | Limited | **Full admin dashboard with user/venue/report management** |

## Core Innovation: Venue-Locked Everything

1. **Check in** to a restaurant, cafe, bar, gym, or any venue
2. **Discover** only people who are at that same venue right now
3. **Swipe** with interest-based match scoring (% compatibility)
4. **Match** and chat — but ONLY while both of you are at the venue
5. **Leave** the venue → swipes reset, chats lock, fresh start at next place

This creates **authentic, in-the-moment connections** instead of endless swiping from your couch.

## Tech Stack

### Backend (Node.js + Express + MongoDB)
- **Express.js** REST API with 30+ endpoints
- **MongoDB** with Mongoose ODM (8 models)
- **JWT** authentication for both users and admins
- **bcryptjs** password hashing
- **Role-based access control** (user vs admin middleware)
- **TTL indexes** for ephemeral matches and messages
- **2dsphere geolocation** indexes for venue proximity
- **Venue presence tracking** with automatic expiry

### Frontend - User App (React.js)
- **React 19** with React Router v7
- **Context API** for global auth state
- **Axios** with interceptors for token management
- **Dark theme** with gradient accents
- **Mobile-first responsive** design
- **Swipe animations** for profile discovery
- **Real-time chat** with 3-second polling

### Frontend - Admin Dashboard (React.js)
- **Admin authentication** with secret key registration
- **Dashboard** with system statistics
- **User management** (view, edit, suspend, ban)
- **Venue management** (CRUD, toggle active/inactive)
- **Report management** (view, review, close)

## Project Structure

```
Dating-For-impatient/
├── src/                          # Backend
│   ├── Controllers/
│   │   ├── adminController.js    # Admin auth & dashboard
│   │   ├── authController.js     # User register/login/profile
│   │   ├── checkinController.js  # Venue check-in/out/heartbeat
│   │   ├── matchController.js    # Swipe/match/discover
│   │   ├── messageController.js  # Venue-locked messaging
│   │   ├── reportController.js   # User reporting
│   │   ├── userController.js     # Admin user management
│   │   └── venueController.js    # Admin venue management
│   ├── Middleware/
│   │   ├── auth.js               # Admin JWT middleware
│   │   ├── adminmidlleware.js    # Admin role check
│   │   └── userAuth.js           # User JWT middleware
│   ├── Models/
│   │   ├── adminModel.js         # Admin schema
│   │   ├── userRegisterModel.js  # User schema (enhanced)
│   │   ├── venueModel.js         # Venue schema (with geo)
│   │   ├── matchModel.js         # Permanent match records
│   │   ├── ephemeralMatch.js     # TTL venue-locked matches
│   │   ├── ephemeralMessage.js   # TTL venue-locked messages
│   │   ├── venuPresence.js       # User presence at venue
│   │   └── reportModel.js        # User reports
│   ├── Routes/
│   │   └── route.js              # All API routes
│   └── index.js                  # Express server entry
├── Dating-For-impatient-Frontend/
│   ├── admin-frontend/           # Admin React app (port 3000)
│   └── user-frontend/            # User React app (port 3001)
│       └── src/
│           ├── context/AuthContext.js
│           ├── components/
│           │   ├── Navbar.js
│           │   └── ProtectedRoute.js
│           └── pages/
│               ├── Login.js
│               ├── Register.js
│               ├── Venues.js
│               ├── Discover.js
│               ├── Matches.js
│               ├── Chats.js
│               └── Profile.js
├── .env                          # Environment variables
├── .gitignore
└── README.md
```

## API Endpoints (30+)

### User Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/userregister` | Register new user |
| POST | `/api/userlogin` | Login user |
| GET | `/api/me` | Get my profile |
| PATCH | `/api/me` | Update my profile |

### Venue Check-in
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/venues/nearby` | Get nearby venues |
| POST | `/api/venues/checkin` | Check in to venue |
| POST | `/api/venues/checkout` | Check out (resets swipes) |
| POST | `/api/venues/heartbeat` | Keep presence alive |
| GET | `/api/venues/:id/people` | Get venue people count |

### Matching & Swiping
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/discover` | Get venue profiles (sorted by interest match %) |
| POST | `/api/swipe/right` | Like a profile |
| POST | `/api/swipe/left` | Pass on a profile |
| GET | `/api/matches` | Get venue matches |
| GET | `/api/matches/all` | Get all matches |

### Messaging (Venue-Locked)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chats` | Get chat list |
| POST | `/api/messages` | Send message (venue-locked) |
| GET | `/api/messages/:matchId` | Get messages (venue-locked) |

### Safety
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/block` | Block a user |
| POST | `/api/unblock` | Unblock a user |
| POST | `/api/report` | Report a user |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/adminregister` | Register admin (secret key) |
| POST | `/api/adminlogin` | Admin login |
| GET | `/api/adminme` | Admin profile |
| GET | `/api/dashboard` | Dashboard stats |
| GET | `/api/admin/users` | All users |
| PATCH | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Ban user |
| CRUD | `/api/venues/*` | Venue management |
| GET/PATCH | `/api/admin/reports/*` | Report management |

## Setup & Run

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend
```bash
cd Dating-For-impatient
npm install
```

Create `.env`:
```
MONGO_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-jwt-secret-key
ADMIN_REGISTER_SECRET=your-admin-secret
PORT=5000
```

```bash
node src/index.js
```

### 2. Admin Frontend
```bash
cd Dating-For-impatient-Frontend/admin-frontend
npm install
npm start    # Runs on port 3000
```

### 3. User Frontend
```bash
cd Dating-For-impatient-Frontend/user-frontend
npm install
npm start    # Runs on port 3001
```

## Why This Is The Best Dating App

1. **Privacy First**: Email and phone are NEVER exposed to other users. Only admins can see full details.
2. **Venue-Locked**: No more catfishing or ghosting — you're both physically at the same place.
3. **Fresh Starts**: Swipe history resets when you leave a venue. No permanent rejections.
4. **Interest Matching**: Profiles are sorted by compatibility score based on shared hobbies/interests.
5. **Ephemeral Messaging**: Messages expire with TTL — conversations are in-the-moment.
6. **Admin Control**: Full dashboard with user management, venue control, and report handling.
7. **Safety**: Block, report, and admin moderation built in from day one.
8. **Real Context**: You know exactly where someone is — at the same restaurant, cafe, or event as you.

## Development Timeline

- **Phase 1**: Admin system (auth, dashboard, user management) ✅
- **Phase 2**: Venue management (CRUD, geolocation, presence) ✅
- **Phase 3**: User auth (register, login, profile, privacy) ✅
- **Phase 4**: Venue check-in/out with presence tracking ✅
- **Phase 5**: Swipe system with interest-based matching ✅
- **Phase 6**: Venue-locked messaging system ✅
- **Phase 7**: User frontend (all pages, dark theme UI) ✅
- **Phase 8**: Safety features (block, report, admin moderation) ✅
- **Phase 9**: Documentation and deployment ✅

## License

MIT

---

Built with passion by Karthik Sai | SBS Corp Internship Project
