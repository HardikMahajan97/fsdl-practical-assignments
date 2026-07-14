# AttendTrack — MERN Attendance Management System

A full-stack MERN application that processes student attendance reports, filters students below 75% attendance, generates formal parent letters as PDFs via LaTeX compilation, and dispatches them via email — all asynchronously with audit logging.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                        │
│  Login → Upload CSV/Excel → View Report → Dispatch Letters  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP / REST
┌────────────────────────▼────────────────────────────────────┐
│                   EXPRESS API (Node.js)                      │
│  Auth (JWT) · File Parse · Report CRUD · Queue Enqueue      │
└────┬──────────────┬──────────────────────────────┬──────────┘
     │              │                              │
┌────▼───┐   ┌──────▼──────┐              ┌───────▼───────┐
│ MongoDB│   │  Bull Queue │              │   Redis       │
│ Reports│   │  (async)    │              │   (job store) │
│ Users  │   └──────┬──────┘              └───────────────┘
│ Logs   │          │
└────────┘   ┌──────▼──────────────────────────────────┐
             │          Worker (same process)            │
             │  1. Generate LaTeX → compile to PDF       │
             │  2. Send email (parent + CC teacher)      │
             │  3. Update DB status + write audit log    │
             └─────────────────────────────────────────┘
```

---

## Features

- **File Ingestion**: CSV and Excel (.xlsx/.xls) upload with flexible column detection
- **In-Memory Processing**: O(n) parse and filter, no temp disk writes during processing
- **Robust Data Model**: Per-student, per-subject attendance with threshold tracking
- **LaTeX Letter Generation**: Fixed professional template compiled to PDF via `pdflatex`
- **Async Email Dispatch**: Bull queue with exponential backoff retry (3 attempts)
- **Role-Based Auth**: Admin and Teacher roles only — students have no access
- **Full Audit Trail**: Every email attempt logged to MongoDB with message IDs
- **Live Status Tracking**: Report page polls for letter status updates in real-time
- **Queue Monitor**: Admin dashboard showing waiting/active/completed/failed job counts

---

## Project Structure

```
attendance-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Login, register, user management
│   │   └── reportController.js   # Upload, process, dispatch
│   ├── middleware/
│   │   ├── auth.js               # JWT authenticate + authorize
│   │   └── errorHandler.js       # Global error handler + AppError
│   ├── models/
│   │   ├── User.js               # Admin / Teacher schema
│   │   ├── AttendanceReport.js   # Report + embedded students
│   │   └── EmailLog.js           # Per-email audit log
│   ├── queues/
│   │   └── letterQueue.js        # Bull queue: PDF gen + email send
│   ├── routes/
│   │   ├── auth.js
│   │   └── reports.js
│   ├── services/
│   │   ├── fileParser.js         # CSV/Excel → student objects
│   │   ├── latexService.js       # LaTeX template + pdflatex compile
│   │   └── emailService.js       # Nodemailer + HTML email
│   ├── utils/
│   │   └── logger.js             # Winston: console + file logs
│   ├── logs/                     # app.log / error.log / audit.log
│   ├── uploads/
│   │   └── letters/              # Generated PDFs stored here
│   ├── seed.js                   # Create initial admin user
│   ├── server.js                 # Express app entry point
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.js    # JWT session management
│   │   ├── components/
│   │   │   └── Sidebar.js        # Navigation sidebar
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js      # Stats + recent reports
│   │   │   ├── Upload.js         # Dropzone + config form
│   │   │   ├── Reports.js        # Paginated report list
│   │   │   ├── ReportDetail.js   # Students + letter status + logs
│   │   │   ├── Users.js          # Admin: create/deactivate users
│   │   │   └── QueueMonitor.js   # Admin: Bull queue stats
│   │   ├── utils/
│   │   │   └── api.js            # Axios instance
│   │   ├── App.js                # Router + layout
│   │   └── index.js
│   ├── public/index.html
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml
├── sample_attendance.csv         # Test file
└── README.md
```

---

## Prerequisites

| Dependency | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18 | Backend + Frontend build |
| MongoDB | ≥ 6 | Database |
| Redis | ≥ 6 | Bull queue job store |
| pdflatex | Any | LaTeX → PDF compilation |
| npm | ≥ 9 | Package management |

### Install pdflatex

**Ubuntu / Debian:**
```bash
sudo apt-get install texlive-latex-extra texlive-fonts-recommended
```

**macOS (via Homebrew):**
```bash
brew install --cask mactex
```

**Windows:**
Download and install [MiKTeX](https://miktex.org/download) or use Docker (recommended).

---

## Quick Start (Local Development)

### 1. Clone and configure

```bash
git clone <repo-url>
cd attendance-system
```

### 2. Backend setup

```bash
cd backend
cp .env .env
# Edit .env with your values (SMTP, MongoDB URI, etc.)
npm install
```

**Edit `.env` — required fields:**
```env
MONGO_URI=mongodb://localhost:27017/attendance_system
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=change_this_to_a_long_random_string

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password     # Gmail App Password (not your login password)
EMAIL_FROM_ADDRESS=your_email@gmail.com

SCHOOL_NAME=Greenwood Public School
SCHOOL_ADDRESS=123 Education Lane, Mumbai, Maharashtra - 400001
SCHOOL_PHONE=+91-22-1234-5678
SCHOOL_EMAIL=admin@greenwood.edu
PRINCIPAL_NAME=Dr. Rajesh Kumar
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords → Generate

### 3. Seed the database

```bash
cd backend
node seed.js
```

Output:
```
✅ Admin user created:
   Email   : admin@school.edu
   Password: Admin@1234

✅ Sample teacher created:
   Email   : anjali@school.edu
   Password: Teacher@1234
```

### 4. Start backend

```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
```

### 5. Frontend setup

```bash
cd frontend
npm install
npm start
# Opens http://localhost:3000
```

---

## Docker Deployment (Recommended for Production)

```bash
# Copy and edit env file
cp backend/.env backend/.env
# Edit backend/.env with production values

# Build and start all services
docker-compose up --build -d

# Seed the admin user
docker exec attendance_backend node seed.js

# View logs
docker-compose logs -f backend
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017
- Redis: localhost:6379

---

## CSV / Excel File Format

### Required Columns

| Column Name | Aliases | Type | Description |
|---|---|---|---|
| `roll_number` | `roll`, `rollno` | string | Student roll number |
| `student_name` | `name`, `student` | string | Full student name |
| `parent_email` | `parent_mail`, `guardian_email` | email | Parent's email address |
| `overall_attendance` | `overall`, `attendance` | number (%) | Overall attendance percentage |

### Optional Columns

| Column Name | Description |
|---|---|
| `parent_name` | Parent/Guardian name |
| `class` | Class name |
| `section` | Section |

### Subject Attendance (Pairs — recommended)

```
Physics_total, Physics_attended
Mathematics_total, Mathematics_attended
Chemistry_total, Chemistry_attended
```

### Example CSV

```csv
roll_number,student_name,parent_name,parent_email,class,section,overall_attendance,Mathematics_total,Mathematics_attended,Physics_total,Physics_attended
01,Aditya Verma,Mr. Suresh Verma,parent@email.com,X,A,92.5,40,38,40,36
02,Chirag Mehta,Mr. Anand Mehta,parent2@email.com,X,A,61.2,40,24,40,25
```

A ready-to-use sample is at `sample_attendance.csv`.

---

## API Reference

### Auth

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login, returns JWT |
| POST | `/api/auth/register` | Admin | Create teacher/admin |
| GET | `/api/auth/me` | Any | Get current user |
| GET | `/api/auth/users` | Admin | List all users |
| PATCH | `/api/auth/users/:id/deactivate` | Admin | Deactivate user |

### Reports

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/reports/upload` | Admin/Teacher | Upload CSV/Excel file |
| GET | `/api/reports` | Admin/Teacher | List reports (paginated) |
| GET | `/api/reports/:id` | Admin/Teacher | Get report with all students |
| GET | `/api/reports/:id/students/below` | Admin/Teacher | Only below-threshold students |
| POST | `/api/reports/:id/dispatch` | Admin/Teacher | Queue letter generation + email |
| GET | `/api/reports/:id/logs` | Admin/Teacher | Email audit logs for report |
| GET | `/api/reports/queue/stats` | Admin | Bull queue statistics |
| DELETE | `/api/reports/:id` | Admin/Teacher | Delete report + logs |

---

## Async Processing Flow

```
POST /api/reports/:id/dispatch
          │
          ▼
   enqueueLetterJobs()
   ├── For each student below threshold:
   │   └── queue.add({ reportId, rollNumber, teacherEmail })
   │         Job ID: "{reportId}-{rollNumber}"  (idempotent)
   └── Report status → "letters_queued"

          │  (returns immediately to client)
          │
          ▼  [Worker processes concurrently, 3 at a time]

   Job Worker:
   ├── 1. Find student in report (DB lookup)
   ├── 2. Set letterStatus = "generating"
   ├── 3. generateStudentLetter()
   │       ├── Build LaTeX source from template
   │       ├── Write .tex to temp directory
   │       ├── Run pdflatex (twice for refs)
   │       └── Move .pdf to uploads/letters/
   ├── 4. Set letterStatus = "generated"
   ├── 5. sendAttendanceLetter()
   │       ├── Build HTML email body
   │       ├── Attach PDF
   │       ├── Send to parent email + CC teacher
   │       └── Log to EmailLog collection
   ├── 6. Set letterStatus = "sent"
   └── 7. Check if all students done → report status = "completed"

   On failure:
   └── Exponential backoff retry (5s → 10s → 20s), max 3 attempts
       └── After 3 failures: letterStatus = "failed", error logged
```

---

## Logging

All logs are written to `backend/logs/`:

| File | Contents |
|---|---|
| `app.log` | All log levels (debug through error) |
| `error.log` | Errors only — for alerting |
| `audit.log` | Info+ — login events, uploads, dispatches, completions |

Log format:
```
[2024-01-15 14:32:11] INFO: Email dispatched | meta={"jobId":"123","rollNumber":"05","to":"parent@email.com"}
[2024-01-15 14:32:15] ERROR: LaTeX compilation failed | meta={"filename":"letter_abc_05","error":"undefined control sequence"}
```

---

## Security

- **JWT** with 8-hour expiry; stored in localStorage
- **Role guards**: Admin, Teacher. No student role exists — enforced at middleware
- **Rate limiting**: 200 req/15min globally; 20 req/15min on login endpoint
- **Helmet.js**: Secure HTTP headers
- **Input validation**: express-validator on all auth routes
- **File validation**: Extension + MIME type check; 10 MB size limit
- **Bcrypt**: Password hashing with cost factor 12
- **CORS**: Restricted to `CLIENT_URL` origin

---

## Adding Your Letter Template

The LaTeX template is in `backend/services/latexService.js` in the `generateLatexSource()` function.

To customise:
1. Open `latexService.js`
2. Edit the `generateLatexSource` function — it returns a raw LaTeX string
3. All student/school variables are injected via the `escapeLaTeX()` helper
4. Restart the backend — changes apply to all new letters immediately

Available template variables:
- `student.name`, `student.rollNumber`, `student.parentName`, `student.parentEmail`
- `student.overallAttendance`, `student.subjects[]`
- `report.threshold`, `report.fromDate`, `report.toDate`
- `schoolInfo.name`, `schoolInfo.address`, `schoolInfo.principalName`

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `pdflatex: command not found` | Install TeX Live: `sudo apt-get install texlive-latex-extra` |
| Redis connection refused | Start Redis: `redis-server` or use Docker |
| Email not sending | Verify SMTP credentials; for Gmail use App Password |
| PDF not generated | Check `backend/logs/error.log` for LaTeX errors |
| File parse errors | Ensure CSV has required columns; check encoding is UTF-8 |
| JWT expired | Tokens last 8h; log in again |

---

## License

MIT — free to use for educational institutions.
