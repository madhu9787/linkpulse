# LinkPulse - Premium URL Shortener with Analytics

LinkPulse is a high-performance, full-stack URL shortening platform featuring a modern glassmorphism UI, a built-in AI assistant, secure user authentication, and comprehensive link analytics.

**Live Deployment:** [https://urllinkpulse.vercel.app/](https://urllinkpulse.vercel.app/)

---

## Features

- **User Authentication**: Secure signup and login with JWT and BcryptJS.
- **URL Shortening**: Generate unique short links instantly, with support for custom aliases.
- **AI Integration**: Built-in "Pulse AI" Chatbot helper right on the dashboard.
- **Analytics Dashboard**: 
  - Real-time click tracking.
  - Interactive charts for click trends.
  - Detailed visit history (Date, IP, Browser, Referrer).
- **Link Expiration & Fallbacks**: Set links to automatically expire and optionally redirect elsewhere.
- **QR Code Generation**: Instant QR code download for every link.
- **Mobile Responsive**: Fluid UI that works seamlessly on all devices.

---

## Tech Stack

- **Frontend**: React, Vite, Tailwind-like custom CSS classes (Vanilla CSS)
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT & BcryptJS
- **Analytics Visualization**: Recharts
- **Icons**: React-Icons

---

## Setup Instructions

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

## Assumptions Made

- **MongoDB Instance**: The application assumes a local MongoDB instance running on port 27017 by default unless configured otherwise in the `.env` file.
- **Base Routing**: The base URL for short links is assumed to be the backend server address (e.g., `http://localhost:5000`).
- **Data Privacy**: IP addresses are tracked for analytics purposes; it's assumed the host will handle compliance depending on their deployment region.

---

## AI Planning Document

The application was built systematically using an iterative, AI-assisted workflow. AI tools were heavily utilized across all stages of the software development lifecycle to ensure high code quality and rapid iteration:

1. **Requirement Analysis & Data Modeling**
   We utilized AI to brainstorm the most optimal database structures for high-performance URL redirection. AI prompts helped us arrive at a robust Mongoose schema that separates core URL data from nested, high-volume click analytics, ensuring scalability.

2. **Backend API Scaffolding**
   AI was prompted to generate standard boilerplate code for Express.js routes, including JWT-based authentication and secure password hashing. We refined the AI's output to strictly follow RESTful principles and handle edge cases, such as custom alias collisions.

3. **Frontend UI/UX & Component Design**
   To achieve the premium glassmorphism aesthetic, we asked the AI to generate complex CSS gradients and flexbox layouts. The AI was also instructed to build modular React components, ensuring that pieces like the Analytics Dashboard, URL Cards, and Recharts graphs remained reusable and easy to maintain.

4. **Debugging and Refactoring**
   Throughout the development process, AI tools were used to identify syntax errors, optimize React state management (e.g., reducing unnecessary re-renders), and solve complex CSS responsiveness issues across mobile and desktop views.

5. **Integrated AI Chatbot Implementation**
   The built-in "Pulse AI" Chatbot was developed by consulting AI on the best practices for handling contextual chat history within a React application, resulting in a seamless and interactive user experience right on the dashboard.

---

## Architecture Diagram

![Architecture Diagram](./output%20images/architecture.png)

---

## Sample Output

*Please refer to the `output images` folder for sample output images.*

### Home Page & Dashboard
![Screenshot 1](./output%20images/screenshot_1.png)
![Screenshot 2](./output%20images/screenshot_2.png)
![Screenshot 3](./output%20images/screenshot_3.png)
![Screenshot 4](./output%20images/screenshot_4.png)

### Database View
![Screenshot 5](./output%20images/screenshot_5.png)
![Screenshot 6](./output%20images/screenshot_6.png)
![Screenshot 7](./output%20images/screenshot_7.png)

### Additional Views
![Screenshot 8](./output%20images/screenshot_8.png)
![Screenshot 9](./output%20images/screenshot_9.png)
![Screenshot 10](./output%20images/screenshot_10.png)

### Sample DB Entries

**URL Document:**
```json
{
  "_id": {
    "$oid": "6a1e0c27372ebd78b5065b95"
  },
  "originalUrl": "https://portfolio-madhumitha.vercel.app/",
  "shortCode": "JJdn_ca",
  "user": {
    "$oid": "6a1df3d4e775a6598e27e8ef"
  },
  "clickCount": 7,
  "expiresAt": null,
  "createdAt": {
    "$date": "2026-06-01T22:48:07.769Z"
  },
  "updatedAt": {
    "$date": "2026-06-03T13:35:56.607Z"
  },
  "__v": 0,
  "lastVisited": {
    "$date": "2026-06-03T13:35:56.606Z"
  },
  "isFavorite": false
}
```

**User Document:**
```json
{
  "_id": {
    "$oid": "6a1df3d4e775a6598e27e8ef"
  },
  "username": "madhumitha",
  "email": "madhumitha805632@gmail.com",
  "password": "$2b$10$VgBC4daSdwAkc5pShbm3jewSEW7y2Bz4W7Rno9wBP4w96LjoQxFk.",
  "createdAt": {
    "$date": "2026-06-01T21:04:20.210Z"
  },
  "updatedAt": {
    "$date": "2026-06-03T05:56:34.463Z"
  },
  "__v": 0
}
```

---

## Explanatory Video

**https://youtu.be/jAG7Kk5mFYo**

*(This video demonstrates the application features, database entries, and overall user flow.)*



This project is a part of a hackathon run by https://katomaran.com
