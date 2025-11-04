# SlotSwapper – Peer-to-Peer Time Slot Swapping App

## Project Goal:
**SlotSwapper** is a full-stack web application that enables users to swap their busy calendar slots with other users.  
Users can mark certain events as **"Swappable"**, browse other users’ swappable slots, and request swaps.  
If both parties accept, their time slots are exchanged automatically in both calendars.

###  Core Features
- user authentication using **JWT**
- CRUD operations for managing personal calendar events
- Swap requests between users with Accept/Reject options
- Dynamic state updates without page reloads


### 🧠 Design Choices
- **Backend:** Node.js + Expressjs
- **Database:** MongoDB (via Mongoose)  
- **Frontend:** React --Js 
- **Authentication:** JWT tokens for stateless sessions  


--- 
**create server/.env** In this file add
MONGODB_URI=mongodb://localhost:27017/projectname
JWT_SECRET=generate token from online
PORT=4000
CORS_ORIGIN=http://localhost:5173

**create client/.env** In this file add
VITE_API_BASE=http://localhost:4000

### Backend 
- open terminal
- cd server
- npm install
- npm run dev
- Then you will get the Mongodb connected message in the command line

### Frontend
-open another terminal 
-cd client
-npm install
-npm run dev
-Then you will the get the deployed localhost link at port {env.PORT}

## API Endpoints

| Method | Endpoint | Description |
|--------|-----------|--------------|
| **POST** | `/api/auth/signup` | Register a new user |
| **POST** | `/api/auth/login` | Login user and generate JWT token |
| **GET** | `/api/events` | Fetch all events for the logged-in user |
| **POST** | `/api/events` | Create a new calendar event |
| **PUT** | `/api/events/:id` | Update an event’s title, time, or status |
| **DELETE** | `/api/events/:id` | Delete an existing event |
| **GET** | `/api/swappable-slots` | Retrieve swappable slots from other users |
| **POST** | `/api/swap-request` | Request a swap between two slots |
| **POST** | `/api/swap-response/:id` | Accept or reject a swap request |

## Assumptions
Users cannot have overlapping events in their own calendars.  
Only events marked as **SWAPPABLE** are visible to other users in the marketplace.  
A swap request can only be made if both selected slots are currently **SWAPPABLE**.  

