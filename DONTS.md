# DON'Ts - VenueMatch Dating App

## For Users

1. **DON'T share your email or phone** in your bio — the app hides these for a reason
2. **DON'T try to message someone** who has left the venue — chats are venue-locked by design
3. **DON'T create fake profiles** — admins can suspend or ban accounts
4. **DON'T skip filling out hobbies** — you'll get 0% match scores with everyone
5. **DON'T stay checked in** when you've left a venue — it wastes other users' time
6. **DON'T harass other users** — reports go directly to admins who can ban you
7. **DON'T use the same password** as your email account — security matters
8. **DON'T ignore the match score** — higher % means more shared interests
9. **DON'T expect permanent chat history** — messages are ephemeral and expire
10. **DON'T register if you're under 18** — the app enforces age verification

## For Admins

1. **DON'T share the admin secret key** with unauthorized people
2. **DON'T hard-delete user accounts** — always use suspend/ban status changes
3. **DON'T ignore open reports** — user safety is the top priority
4. **DON'T expose user emails or phones** to other users through any API
5. **DON'T create venues without proper addresses** — users need accurate location info
6. **DON'T disable all venues at once** — users need at least some active venues
7. **DON'T modify the JWT_SECRET** in production — it will invalidate all active tokens
8. **DON'T skip reviewing suspended users** — they may need to be unbanned or permanently banned
9. **DON'T delete the admin account** — always keep at least one admin
10. **DON'T bypass the secret key** for admin registration — it's a critical security layer

## For Developers

1. **DON'T hardcode secrets** in source code — always use `.env` files
2. **DON'T commit `.env` files** to git — they're in `.gitignore` for a reason
3. **DON'T commit `node_modules/`** — run `npm install` instead
4. **DON'T mix admin and user middleware** — `auth.js` is for admins, `userAuth.js` is for users
5. **DON'T skip error handling** — every controller must have try/catch
6. **DON'T expose sensitive fields** in API responses — always `.select("-password")`
7. **DON'T change the port numbers** without updating CORS in `index.js`
8. **DON'T use `findByIdAndDelete`** for users — use status change to "Banned" instead
9. **DON'T remove TTL indexes** from ephemeral models — they auto-clean expired data
10. **DON'T modify the user model** without updating the auth controller validation
11. **DON'T skip running all three servers** — backend (5000), admin (3000), user (3001)
12. **DON'T use `res.send()` without status code** — always be explicit
13. **DON'T forget to test both happy path and error cases** for every API
14. **DON'T deploy without setting proper environment variables** on the server
15. **DON'T ignore MongoDB connection errors** — check your MONGO_URI first
