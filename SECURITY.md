# Security Policy - VenueMatch

## Privacy by Design

VenueMatch is built with privacy as a core principle, not an afterthought.

### What is NEVER exposed to other users
- Email addresses
- Phone numbers
- Passwords (hashed with bcryptjs, 10 salt rounds)
- Swipe history (who you liked/passed)
- Block lists
- Internal user IDs in readable format

### What users control
- Whether their age is visible (`privacySettings.showAge`)
- Whether their bio is visible (`privacySettings.showBio`)

### What only admins can see
- Full user profiles including email
- User status (Active/Suspended/Banned)
- All reports and moderation history
- Venue management and statistics
- System-wide dashboard metrics

## Authentication

- **JWT tokens** with 7-day expiry
- **Separate middleware** for admin (`auth.js`) and user (`userAuth.js`) routes
- **Admin registration** requires a secret key (`ADMIN_REGISTER_SECRET`)
- **Password hashing** with bcryptjs (10 salt rounds)
- **Token validation** on every protected route

## Data Lifecycle

- **Ephemeral matches** auto-delete after 24 hours (MongoDB TTL index)
- **Ephemeral messages** auto-delete when their match expires
- **Venue presence** auto-expires after 4 hours if no heartbeat
- **Swipe history** resets when user checks out of a venue

## Reporting Vulnerabilities

If you discover a security vulnerability, please:
1. Do NOT open a public issue
2. Email the maintainer directly
3. Include steps to reproduce
4. Allow 48 hours for initial response
