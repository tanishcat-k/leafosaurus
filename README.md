# Leafosaurus

Plant care web app (MERN). Identify a plant from a photo, get care info for it,
keep a diary and do health check-ins.

## Folders
- `server/` Express + MongoDB API
- `client/` React (Vite) frontend

## Setup (needs Node 18+ and MongoDB running locally)

Server:
1. `cd server`
2. `npm install`
3. copy `.env.example` to `.env` and fill it in
4. `npm run seed` (adds the plant species to the database)
5. `npm run dev`

Client (in a second terminal):
1. `cd client`
2. `npm install`
3. `npm run dev`

Open http://localhost:5173

## Plant identification
The /api/identify route uses the Pl@ntNet API. Get a free key from
https://my.plantnet.org and put it in `.env` as PLANTNET_API_KEY.
Without a key the server sends back a demo answer (Monstera) so you can still test the flow.
Check the Pl@ntNet docs, the request format may change.

## API routes
| Method | Route | What it does |
|---|---|---|
| POST | /api/auth/signup | create account |
| POST | /api/auth/login | log in |
| GET | /api/auth/me | current user |
| GET | /api/species?q= | search species |
| POST | /api/identify | identify plant from photo |
| GET / POST | /api/plants | list / add plants |
| GET / DELETE | /api/plants/:id | plant with diary / delete |
| POST | /api/plants/:id/water | mark as watered |
| POST | /api/plants/:id/logs | add note or photo |
| POST | /api/plants/:id/checkins | health check-in |

## Ideas to try yourself
- store images on Cloudinary instead of the uploads folder
- send email reminders in `server/jobs/reminders.js`
- edit/rename a plant
- add more species in `server/seed.js`
- deploy (Render for server, Vercel for client)
