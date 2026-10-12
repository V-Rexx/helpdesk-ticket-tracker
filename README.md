# Helpdesk Ticket Tracker

A MERN app where employees raise support tickets and IT agents work them through to resolution.

**Stack:** MongoDB (Mongoose), Express 5, React 19 (Vite), Node.js, JWT auth, Jest + Supertest.

## Features

- Register / log in with JWT; passwords hashed with bcrypt
- Role-based access control with two roles, **user** and **agent**
- Users raise tickets and see only their own; agents see every ticket
- Ticket workflow: Open → In progress → Resolved (agents can reopen)
- Agents assign tickets to other agents
- Comments on each ticket from the owner and agents
- Search by title, filter by status and priority, pagination
- Input validation, consistent error messages, and API tests

## Run it locally

You need Node.js 20+ and MongoDB (local install, or a free MongoDB Atlas cluster).

```bash
# 1. Backend
cd server
npm install
cp .env.example .env        # set MONGO_URI and JWT_SECRET
npm run seed                # demo accounts + 3 sample tickets
npm run dev                 # http://localhost:5001 (5000 is taken by macOS AirPlay)

# 2. Frontend (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

Demo logins: `agent@demo.com / agent123` and `user@demo.com / user123`.
Log in as each one in two different browsers to see the role difference.

## Tests

```bash
cd server
npm test
```

Tests start a temporary in-memory MongoDB (it downloads once, about 100 MB), so your real data is never touched. They cover auth, ownership, filters, RBAC (401 vs 403), the status workflow, assignment rules and comments.

## API

All ticket routes need `Authorization: Bearer <token>`.

| Method | Route | Who | What |
|---|---|---|---|
| POST | `/api/auth/register` | anyone | create account (always role `user`) |
| POST | `/api/auth/login` | anyone | get a token |
| GET | `/api/auth/me` | logged in | current user |
| GET | `/api/tickets` | logged in | list (users: own only). Query: `status`, `priority`, `search`, `page`, `limit` |
| POST | `/api/tickets` | logged in | create ticket |
| GET | `/api/tickets/:id` | owner or agent | ticket with comments |
| PATCH | `/api/tickets/:id/status` | agent | change status `{ status }` |
| PATCH | `/api/tickets/:id/assign` | agent | assign `{ agentId }` (or `null`) |
| POST | `/api/tickets/:id/comments` | owner or agent | add comment `{ text }` |
| GET | `/api/users/agents` | agent | list agents for the assign dropdown |

## Project structure

```
server/src/
  app.js              Express app, routes, central error handler
  server.js           connects to MongoDB and starts the server
  seed.js             demo data
  models/User.js      user schema + password hashing
  models/Ticket.js    ticket schema, embedded comments, allowed status moves
  middleware/auth.js  requireAuth (401) and allowRoles (403)
  routes/             auth, tickets, users
server/tests/api.test.js
client/src/
  api.js              fetch helper that adds the token
  AuthContext.jsx     login state shared across the app
  pages/              Login, Register, TicketList, NewTicket, TicketDetail
```

## Design decisions (interview notes)

**Why are comments embedded but users referenced?**
Comments are always shown with their ticket and never searched on their own, so embedding them means one read returns everything. Users change independently (name, role), so tickets store only the user's id and `populate()` fetches the details. If comments could grow into the thousands I would move them to their own collection, because a MongoDB document is capped at 16 MB.

**How does RBAC work?**
The role is stored on the user and put inside the JWT at login. `requireAuth` checks the token and sets `req.user`. `allowRoles("agent")` checks `req.user.role` and returns 403 if it doesn't match. Routes opt in, for example `router.patch("/:id/status", allowRoles("agent"), ...)`.

**401 vs 403?**
401 means "you're not logged in" (no token, bad token or expired token). 403 means "you're logged in but your role can't do this".

**Why check roles on the server if React already hides the buttons?**
Hiding a button only changes the page. Anyone can call the API directly with Postman or curl, so the server is the real gatekeeper. The React checks are only for a cleaner screen.

**Why is the role in the token?**
It saves a database lookup on every request. The trade-off is that a role change only takes effect after the user logs in again, which is fine with 1-day tokens.

**Why can't someone register as an agent?**
The register route ignores any `role` in the request body. Agents are created by an admin process (here, the seed script). There's a test that tries this and checks the role is still `user`.

**Why return 404, not 403, when a user opens someone else's ticket?**
A 403 would confirm the ticket exists. A 404 reveals nothing.

**Why validate status changes?**
The allowed moves live in one place (`Ticket.ALLOWED_MOVES`), so a ticket can't jump from Open straight to Resolved or into an unknown status.

**Why escape the search text?**
The search uses a regex. Escaping special characters means input like `.*` is treated as plain text instead of a pattern.

**Why indexes on `status` and `createdBy`?**
Those are the fields the list page filters on most: agents filter by status, users always filter by owner. Without an index MongoDB scans every ticket.

**How are errors handled?**
Express 5 passes errors thrown inside async routes to the central error handler in `app.js`, which turns Mongoose validation errors into 400s and anything unexpected into a 500 without leaking details.

## Possible next steps
- Rate-limit the login route
- Email notification when a ticket is resolved
