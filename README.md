# 🚀 Campus Intelligence Hub

A modern real-time notification dashboard that fetches and prioritizes campus-related announcements using an external evaluation API.

The application displays high-priority notifications such as placements, results, and events in a clean and responsive dashboard interface with integrated backend logging middleware.

---

# ✨ Features

* 🔔 Real-time priority notification feed
* 📊 Priority score-based sorting
* 🌐 External API integration
* 📝 Backend logging middleware
* 📱 Fully responsive dashboard UI
* 🎯 Notification filtering support
* ⚡ Dynamic frontend rendering
* 🔐 Secure token handling using `.env`

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* CSS3

## Backend

* Node.js
* Express.js
* Axios

## Tools

* Postman
* Git & GitHub
* VS Code

---

# 📂 Project Structure

```text
22MIS7289/
│
├── backend/
│   ├── loggingMiddleware.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── public/
│   └── package.json
│
├── output_screenshots/
│   ├── api-responses/
│   ├── backend-logs/
│   ├── frontend-dashboard/
│   ├── postman-testing/
│   └── responsive-ui/
│
├── notification_system_design.md
└── README.md
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Sahithi-Bathina/22MIS7289.git
```

---

## 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file inside backend folder:

```env
AUTH_TOKEN=your_generated_access_token
```

Start backend server:

```bash
node server.js
```

Backend runs on:

```text
http://localhost:5000
```

---

## 3️⃣ Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# 🔗 API Endpoint

## Fetch Priority Notifications

```http
GET /api/priority-notifications
```

### Sample Response

```json
{
  "success": true,
  "source": "external-api",
  "totalParsed": 20,
  "notifications": [
    {
      "type": "Placement",
      "message": "Meta Platforms Inc. hiring",
      "score": 278.84
    }
  ]
}
```

---

# 📝 Logging Middleware

The backend contains a custom logging middleware that:

* Logs incoming requests
* Tracks API activity
* Displays successful logging events
* Handles logging failures gracefully

Example terminal logs:

```bash
[2026-05-16T12:19:38.987Z] GET -> /
-> Fetching from external evaluation API...
-> External API Connected
-> Log created successfully
```

---

# 📸 Screenshots

## Postman Authentication

* Register API Success
* Auth Token Generation

## Backend

* External API Response
* Logging Middleware Terminal Output

## Frontend

* Dashboard UI
* Filtered Notifications
* Responsive Mobile View

---

# 📱 Responsive Design

The dashboard is fully responsive and adapts to:

* 💻 Desktop Screens
* 📱 Mobile Devices
* 📲 Tablets

Using:

* CSS Grid
* Flexbox
* Media Queries

---

# 🔐 Environment Variables

The project uses `.env` for secure token management.

Example:

```env
AUTH_TOKEN=your_access_token
```

`.env` is excluded from GitHub using `.gitignore`.

---

# 🎯 Key Functionalities

* Fetch notifications from external API
* Prioritize notifications by score
* Render categorized notification cards
* Real-time sync capability
* Responsive UI dashboard
* Backend request logging

---

# 👨‍💻 Author

**B Sahithi Choudary**
Roll No: 22MIS7289

GitHub Repository:
https://github.com/Sahithi-Bathina/22MIS7289

---

# ✅ Project Status

✔️ Completed
✔️ API Integrated
✔️ Logging Middleware Added
✔️ Responsive Frontend Implemented
✔️ Ready for Evaluation
