# Student Resource Tracker

A simple MERN stack CRUD application that lets students save and organise learning resources (videos, articles, documentation, notes).

## Features

- Add, view, edit, and delete learning resources
- Filter resources by type and difficulty (Visual badges)
- Persistent storage in MongoDB
- Success/error toast notifications
- Responsive table layout

## Tech Stack

| Layer     | Technology                         |
|-----------|------------------------------------|
| Frontend  | React 18, React Router v6, Axios   |
| Backend   | Node.js, Express 4                 |
| Database  | MongoDB with Mongoose              |
| Tooling   | Vite, concurrently, nodemon        |

## Project Structure

```
student_resource_tracker/
├── backend/
│   ├── controllers/
│   │   └── resourceController.js
│   ├── models/
│   │   └── Resource.js
│   ├── routes/
│   │   └── resourceRoutes.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── resources.js
│   │   ├── components/
│   │   │   ├── NavBar.jsx
│   │   │   ├── ResourceForm.jsx
│   │   │   └── Toast.jsx
│   │   ├── pages/
│   │   │   ├── ResourceListPage.jsx
│   │   │   ├── AddResourcePage.jsx
│   │   │   └── EditResourcePage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json          ← root (concurrently)
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/) running locally **or** a MongoDB Atlas connection string

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/HardikMahajan-97/student_resource_tracker.git
cd student_resource_tracker
```

### 2. Configure the backend environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set your MongoDB URI:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/student_resource_tracker
```

> For MongoDB Atlas, replace the value with your Atlas connection string, e.g.  
> `MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/student_resource_tracker`

### 3. Install dependencies

**Option A – Install everything from the root:**

```bash
npm install          # installs concurrently at the root
npm run install:all  # installs backend and frontend dependencies
```

**Option B – Install each folder manually:**

```bash
cd backend && npm install
cd ../frontend && npm install
```

## Running the Application

### Development mode (both servers at once)

From the project root:

```bash
npm run dev
```

This starts:
- **Backend** on `http://localhost:5000` (via nodemon)
- **Frontend** on `http://localhost:3000` (via Vite with proxy to backend)

### Running individually

```bash
# Backend
cd backend
npm run dev       # development (nodemon)
# or
npm start         # production

# Frontend
cd frontend
npm run dev       # development (Vite)
```

## API Endpoints

| Method | Endpoint              | Description                       |
|--------|-----------------------|-----------------------------------|
| GET    | `/api/resources`      | List all resources (newest first) |
| GET    | `/api/resources/:id`  | Get a single resource             |
| POST   | `/api/resources`      | Create a new resource             |
| PUT    | `/api/resources/:id`  | Update a resource                 |
| DELETE | `/api/resources/:id`  | Delete a resource                 |

### Resource Schema

```json
{
  "title":       "String (required)",
  "subject":     "String (required)",
  "type":        "Video | Article | Documentation | Notes (required)",
  "link":        "String – valid URL (optional)",
  "difficulty":  "Beginner | Intermediate | Advanced (required)",
  "description": "String (optional)",
  "createdAt":   "Date (auto)"
}
```

## Screenshots

### Resource List
The home page shows all saved resources in a table with Edit and Delete actions.

### Add Resource
A form to add a new resource with client-side and server-side validation.

### Edit Resource
Pre-filled form loaded from the database, updated on submit.
