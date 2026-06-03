# LinkPulse - Premium URL Shortener with Analytics

LinkPulse is a high-performance full-stack URL shortening platform featuring a beautiful, modern glassmorphism UI, a built-in AI assistant, secure user authentication, and comprehensive link analytics.

## 🚀 Features

- **User Authentication**: Secure signup and login with JWT and BcryptJS.
- **URL Shortening**: Generate unique short links instantly, with support for custom aliases.
- **AI Integration**: Built-in "Pulse AI" Chatbot helper right on the dashboard.
- **Analytics Dashboard**: 
  - Real-time click tracking.
  - Interactive charts for click trends.
  - Detailed visit history (Date, IP, Browser, Referrer).
- **Link Expiration & Fallbacks**: Set links to automatically expire and optionally redirect elsewhere.
- **QR Code Generation**: Instant QR code download for every link.
- **Mobile Responsive**: Stunning UI that works fluidly on all devices.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind-like custom CSS classes (Vanilla CSS)
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT & BcryptJS
- **Analytics Visualization**: Recharts
- **Icons**: React-Icons

---

## 📝 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Running locally on default port 27017, or MongoDB Atlas)

### Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/linkpulse
   JWT_SECRET=your_super_secret_key
   CLIENT_URL=http://localhost:5173
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:5173` in your browser.

---

## 🧠 Assumptions Made

- **MongoDB Instance**: The application assumes a local MongoDB instance running on port 27017 by default unless configured otherwise in the `.env` file.
- **Base Routing**: The base URL for short links is assumed to be the backend server address (e.g., `http://localhost:5000`).
- **Data Privacy**: IP addresses are tracked for analytics purposes; it's assumed the host will handle compliance depending on their deployment region.

---

## 🤖 AI Planning Document

The application was built systematically using an AI-assisted workflow:
1. **Requirement Analysis & Data Modeling**: First, the core database models (User, Url, Analytics) were designed to support fast redirection and nested click-tracking data.
2. **Backend API Construction**: Express routes were scaffolded for authentication (`/auth`), URL management (`/urls`), analytics retrieval, and a custom `/chat` endpoint for the AI assistant.
3. **Frontend UI/UX Design**: The interface was built with a strong focus on aesthetics (glassmorphism, vivid gradients, and smooth micro-animations). Tailwind-inspired utility classes were created in plain CSS.
4. **Feature Implementation**: AI tools were used to generate clean, modular React components for the Dashboard, URL cards, dynamic Charts, and the AI Chatbot.
5. **Polishing & Responsiveness**: The layout was rigorously tested and adjusted using flexbox/grid layouts to ensure a premium feel across both desktop and mobile viewing.

---

## 📊 Architecture Diagram

```mermaid
graph TD
    Client[Frontend: React/Vite App] -->|HTTP Requests| API[Backend: Express.js API]
    API -->|Auth/Token| JWT[JWT Middleware]
    API -->|Read/Write| DB[(MongoDB)]
    
    subgraph Frontend Components
        Home --> Auth
        Auth --> Dashboard
        Dashboard --> AnalyticsView
        Dashboard --> AIChatbot
    end
    
    subgraph Backend Routes
        API --> AuthRoute[/api/auth]
        API --> URLRoute[/api/urls]
        API --> RedirectRoute[/:shortCode]
        API --> ChatRoute[/api/chat]
    end
```

---

## 📸 Sample Output 

*(Note to Evaluator: Actual screenshots, DB entries, and logs are demonstrated in the video link below)*

- **Sample DB Entry (URL Object)**:
  ```json
  {
    "_id": "647b1f...",
    "originalUrl": "https://example.com/very-long-url",
    "shortCode": "my-alias",
    "clickCount": 12,
    "user": "647a0c...",
    "createdAt": "2026-06-03T10:00:00Z"
  }
  ```
- **Sample Server Log**: 
  `[INFO] GET /my-alias - Redirecting to https://example.com/very-long-url (IP: 127.0.0.1)`

---

## 🎥 Explanatory Video

**[INSERT YOUR LOOM OR YOUTUBE LINK HERE]**

*(This video demonstrates the application features, code structure, database entries, and overall user flow.)*

---

This project is a part of a hackathon run by https://katomaran.com
