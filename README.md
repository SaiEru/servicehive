ServiceHive

Quick start

1) Backend

- Create a `.env` file in `server/` with:

```
MONGODB_URI=mongodb://localhost:27017/servicehive
JWT_SECRET=change_me
PORT=4000
CORS_ORIGIN=http://localhost:5173
```

- Run the server:

```
cd server
npm run dev
```

2) Frontend

- Create `client/.env`:

```
VITE_API_BASE=http://localhost:4000
```

- Run the client:

```
cd client
npm run dev
```

API overview

- POST `/api/auth/signup` { name, email, password }
- POST `/api/auth/login` { email, password }
- GET `/api/events` (auth)
- POST `/api/events` { title, startTime, endTime } (auth)
- PUT `/api/events/:id` (auth)
- DELETE `/api/events/:id` (auth)
- POST `/api/events/:id/swappable` { swappable: boolean } (auth)
- GET `/api/swappable-slots` (auth)
- POST `/api/swap-request` { myEventId, targetEventId } (auth)
- POST `/api/swap-response/:id` { action: 'ACCEPT'|'REJECT' } (auth)
- GET `/api/swap-requests` (auth)

Notes

- Swap operations use MongoDB transactions; ensure your MongoDB supports them (replica set or recent local server).
- Adjust `CORS_ORIGIN` if the frontend runs on a different host/port.


