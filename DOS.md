# DOs - VenueMatch Dating App

## For Users

1. **DO check in** to a venue before trying to discover people — the app only works when you're at a real location
2. **DO fill out your hobbies and interests** — the matching algorithm uses these to calculate your compatibility score with others
3. **DO write a genuine bio** — it's the first thing people read about you
4. **DO check out** when you leave a venue — this resets your swipes and keeps the system clean
5. **DO use the block feature** if someone makes you uncomfortable — your safety comes first
6. **DO report inappropriate behavior** — admins review every report
7. **DO keep your privacy settings updated** — you control what others see about you
8. **DO respond to matches quickly** — chats are venue-locked, so you can only message while both at the same place
9. **DO select at least 3 hobbies** during registration — more hobbies = better match scoring
10. **DO use a strong password** — minimum 6 characters, mix of letters and numbers

## For Admins

1. **DO review reports regularly** — user safety depends on admin moderation
2. **DO keep the admin secret key secure** — never share `ADMIN_REGISTER_SECRET`
3. **DO create venues with accurate addresses** — users rely on venue info to check in
4. **DO monitor dashboard stats** — track active users, suspended accounts, and open reports
5. **DO use soft-delete for venues** — never hard-delete, always use the toggle or soft-delete API
6. **DO set proper venue types** — restaurant, cafe, bar, club, gym, park, library, mall, coworking, event
7. **DO suspend before banning** — give users a warning first
8. **DO add venue tags** — helps users find the right places
9. **DO set venue operating hours** — so users know when venues are open
10. **DO back up your MongoDB** regularly — use `mongodump` or Atlas backups

## For Developers

1. **DO use environment variables** for all secrets (MONGO_URI, JWT_SECRET, ADMIN_REGISTER_SECRET)
2. **DO run `npm install`** in all three directories (backend, admin-frontend, user-frontend)
3. **DO start the backend first** before any frontend — both frontends depend on port 5000
4. **DO use the correct ports** — Backend: 5000, Admin: 3000, User: 3001
5. **DO test API endpoints** with Postman or Thunder Client before building frontend features
6. **DO follow the existing code style** — consistent naming, error handling patterns
7. **DO use `auth` middleware for admin routes** and `userAuth` for user routes
8. **DO handle errors gracefully** — always return `{ status: false, message: "..." }`
9. **DO commit frequently** with descriptive messages
10. **DO read the MUST-READS.md** before making any changes
