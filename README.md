# Expense Tracker

A full-stack expense tracking application built with React, Node.js, Express, and MongoDB.

## Features

- **Authentication**: Email/password login, Google OAuth sign-in, user registration
- **Dashboard**: Summary cards (income, expense, balance), pie chart, recent transactions
- **Income Management**: Add, edit, delete income with categories
- **Expense Management**: Add, edit, delete expenses with categories
- **Date Filters**: View data by All time, This month, Last month, or This year
- **Excel Export**: Download transactions as Excel file
- **Protected Routes**: Dashboard pages require authentication

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Recharts, Firebase Auth, Axios
- **Backend**: Node.js, Express 5, MongoDB (Atlas), JWT
- **Database**: MongoDB Atlas

## Setup

### Backend

1. Navigate to backend: `cd backend`
2. Install dependencies: `npm install`
3. Create `.env` file with:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=8000
   GOOGLE_CLIENT_ID=your_google_oauth_client_id  # For Google login
   ```
4. Add your IP to MongoDB Atlas Network Access whitelist
5. Start: `npm run dev`

### Frontend

1. Navigate to frontend: `cd frontend/expensetracker`
2. Install dependencies: `npm install`
3. Optional: Create `.env` with `VITE_API_URL=http://localhost:8000/api/v1` (if backend runs on different URL)
4. Start: `npm run dev`

### Google Login

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add to Firebase Console: Authentication → Sign-in method → Enable Google
4. Add `GOOGLE_CLIENT_ID` to backend `.env`

## Project Structure

```
├── backend/           # Express API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── middleware/
└── frontend/expensetracker/   # React app
    └── src/
        ├── pages/
        ├── components/
        └── api/
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register user |
| POST | /api/v1/auth/login | Login |
| POST | /api/v1/auth/google | Google OAuth login |
| GET | /api/v1/transactions | List transactions (type, limit, startDate, endDate) |
| GET | /api/v1/transactions/summary | Get income/expense summary |
| POST | /api/v1/transactions | Add transaction |
| PATCH | /api/v1/transactions/:id | Update transaction |
| DELETE | /api/v1/transactions/:id | Delete transaction |
