# Contributing to VenueMatch

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch: `git checkout -b feat/your-feature`
4. Make your changes
5. Commit with descriptive messages: `git commit -m "feat: add your feature"`
6. Push to your fork: `git push origin feat/your-feature`
7. Open a Pull Request

## Commit Message Convention

We follow conventional commits:

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `style:` — Formatting, no code change
- `refactor:` — Code restructuring
- `test:` — Adding tests
- `chore:` — Maintenance tasks

## Code Style

- Use `camelCase` for variables and functions
- Use `PascalCase` for React components and models
- Always handle errors with try/catch
- Always return `{ status: true/false, message: "..." }` from APIs
- Never expose sensitive user data (email, phone, password)

## Branch Strategy

- `main` — Production-ready code
- `develop` — Integration branch
- `feat/*` — Feature branches
- `fix/*` — Bug fix branches

## Testing

Before submitting a PR, ensure:
1. Backend starts without errors
2. All API endpoints return correct responses
3. Admin frontend loads and functions
4. User frontend loads and functions
5. Venue check-in/out flow works end-to-end
6. Matching and messaging flow works
