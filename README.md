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

## ⚙️ Setup Instructions

### 🔹 Prerequisites
Make sure you have:
- [Node.js](https://nodejs.org/) and npm installed  
- [MongoDB](https://www.mongodb.com/) running locally or via MongoDB Atlas  

### 🔹 Backend Setup
```bash
# Clone the repository
git clone https://github.com/your-username/SlotSwapper.git
cd SlotSwapper

# Install backend dependencies
npm install

# Create a .env file in the root directory
# Example .env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Run the backend server
npm run dev
