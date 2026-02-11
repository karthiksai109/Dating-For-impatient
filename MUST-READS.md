# MUST READS - VenueMatch Dating App

## Architecture Overview

This app has **3 separate servers** that must all be running:

| Server | Port | Directory | Command |
|--------|------|-----------|---------|
| Backend API | 5000 | `Dating-For-impatient/` | `node src/index.js` |
| Admin Frontend | 3000 | `Dating-For-impatient-Frontend/admin-frontend/` | `npm start` |
| User Frontend | 3001 | `Dating-For-impatient-Frontend/user-frontend/` | `npm start` |

## Critical Security Rules

1. **NEVER expose user email or phone** to other users through any API endpoint
2. **Admin registration requires `ADMIN_REGISTER_SECRET`** — this is set in `.env`
3. **Two separate JWT middleware exist**:
   - `auth.js` → for admin routes (decodes `adminId`)
   - `userAuth.js` → for user routes (decodes `userId`)
4. **Passwords are hashed** with bcryptjs (10 salt rounds) — never store plain text
5. **TTL indexes** auto-delete expired ephemeral matches and messages — don't manually clean

## The Venue-Lock System (Core Innovation)

### How It Works
```
User arrives at restaurant → Checks in via API → activeVenueId set
                                                → VenuePresence created (4hr TTL)
                                                → Can now discover people at same venue
                                                → Swipe right/left on profiles
                                                → If mutual like → Match created
                                                → Can chat ONLY while both at venue

User leaves restaurant → Checks out via API → activeVenueId = null
                                             → VenuePresence deleted
                                             → Swipe history RESET
                                             → Chat access LOCKED
                                             → Fresh start at next venue
```

### Key Rules
- **Discovery**: Only shows users with the SAME `activeVenueId`
- **Swiping**: Target must be at your venue (verified server-side)
- **Messaging**: Both sender AND receiver must be at the match's venue
- **Checkout**: Resets `swipedRight` and `swipedLeft` arrays for fresh start

## Interest-Based Match Scoring

The discover endpoint calculates a **match score** for each profile:

```
Match Score = (Common Interests / Your Total Interests) × 100
```

- Combines both `hobbies` and `interests` arrays
- Case-insensitive comparison
- Profiles are **sorted by match score** (best matches first)
- Common interests are highlighted in the UI

## Database Models (8 Total)

| Model | Purpose | TTL? |
|-------|---------|------|
| User | User profiles, auth, swipe tracking | No |
| Admin | Admin accounts (separate from users) | No |
| Venue | Venue locations with geolocation | No |
| Match | Permanent match records | No |
| EphemeralMatch | Venue-locked active matches | Yes (24h) |
| EphemeralMessage | Venue-locked messages | Yes (matches expiry) |
| VenuePresence | Who is at which venue | Yes (4h) |
| Report | User reports for admin review | No |

## Environment Variables Required

```
MONGO_URI=           # MongoDB connection string
JWT_SECRET=          # Secret for JWT token signing
ADMIN_REGISTER_SECRET= # Secret key for admin registration
PORT=5000            # Backend port
```

## API Response Format

All APIs follow this consistent format:

```json
// Success
{ "status": true, "message": "description", "data": { ... } }

// Error
{ "status": false, "message": "error description" }
```

## Frontend State Management

- **AuthContext** manages: `user`, `venue`, `loading` state
- **Token** stored in `localStorage` as `user_token`
- **User data** cached in `localStorage` as `user_data`
- **Axios interceptors** auto-attach token and handle 401 redirects

## Common Commands Reference

```bash
# Start everything (run in separate terminals)
cd Dating-For-impatient && node src/index.js
cd Dating-For-impatient-Frontend/admin-frontend && npm start
cd Dating-For-impatient-Frontend/user-frontend && npm start

# Install dependencies
cd Dating-For-impatient && npm install
cd Dating-For-impatient-Frontend/admin-frontend && npm install
cd Dating-For-impatient-Frontend/user-frontend && npm install

# Git
git add .
git commit -m "your message"
git push origin main
```

## Testing Flow

1. Start backend → Register admin → Login admin → Create venues
2. Start user frontend → Register 2+ users → Login as user 1
3. Check in to a venue → See no profiles (only you there)
4. Login as user 2 in incognito → Check in to SAME venue
5. User 1 sees user 2 in discover → Swipe right
6. User 2 sees user 1 in discover → Swipe right → MATCH!
7. Both can now chat while at the venue
8. One user checks out → Chat locks → Swipes reset

## File Naming Conventions

- **Models**: camelCase (e.g., `userRegisterModel.js`, `venueModel.js`)
- **Controllers**: camelCase (e.g., `authController.js`, `matchController.js`)
- **Middleware**: camelCase (e.g., `auth.js`, `userAuth.js`)
- **React Components**: PascalCase (e.g., `Discover.js`, `Navbar.js`)
- **React Contexts**: PascalCase (e.g., `AuthContext.js`)
