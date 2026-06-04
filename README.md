# LinkPulse - Premium URL Shortener with Real-Time Data Analytics

LinkPulse is a high-performance, full-stack URL shortening platform that allows users to instantly shorten long URLs (with custom aliases) and QR code generation, track real-time click data, and manage custom aliases. It features a sleek modern UI, a built-in AI assistant, secure user authentication, and an interactive analytics dashboard.

**Live Deployment:** [https://urllinkpulse.vercel.app/](https://urllinkpulse.vercel.app/)

*Deployment Infrastructure:*
- **Frontend:** Deployed on Vercel
- **Backend:** Deployed on Render ([https://linkpulse-r376.onrender.com](https://linkpulse-r376.onrender.com))

---

## Features

- **User Authentication**: Secured signup and login with strict password validation.
- **Premium Landing Page**: A beautifully designed home page with quick links, detailed service descriptions, and feature overviews.
- **Advanced URL Shortening**: 
  - Password-protected links.
  - Custom alias names ensuring uniqueness across all users.
  - Set specific expiry dates for links.
- **Instant QR Codes**: Immediate QR code generation for every link with download support.
- **Bulk Creation**: Support for bulk URL shortening via CSV upload.
- **Comprehensive Analytics Dashboard**:
  - **Public Stat Sharing**: Share analytics data publicly via a link so anyone can view it without signing in.
  - **Visual Data**: Interactive charts for clicks per day, device types, browsers, and countries.
  - **Visit History**: Detailed recent visit history including date and time.
- **Robust Link Management**:
  - Filter and sort links (newly added, oldest, recent, and most clicked).
  - Add links to favorites.
  - Edit or delete URLs after creation.
  - Dashboard indicators for total click counts and expiry notifications.
- **AI Integration**: Built-in AI Chatbot to assist with any doubts and questions.
- **Mobile Responsive**: Fluid UI that works seamlessly on all devices, providing a smooth workflow.

---

## Tech Stack

- **Frontend**: React, Vite, CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT & BcryptJS
- **Analytics Charts**: Recharts (used for all interactive data visualizations)
- **Icons**: React-Icons
- **AI Integration**: SambaNova AI
- **Utilities**: QR Code Generator, CSV Parsing (for bulk upload)

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
   SAMBANOVA_API_KEY=your_sambanova_api_key
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
3. (Optional) Create a `.env` file to specify the backend URL if running on a different port/host:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Visit `http://localhost:5173` in your browser.

---

## Assumptions Made

- **Authentication**: It is assumed that users will sign up with valid email addresses. JWT tokens are stored securely on the client side and will expire appropriately to maintain session security.
- **Analytics Tracking**: IP addresses and user agents are sufficient for basic location and device tracking. It is assumed the host will handle GDPR/CCPA compliance for tracking behavior depending on the deployment region.
- **URL Uniqueness**: Short codes and custom aliases are treated as globally unique. The system will handle concurrent custom alias requests by rejecting duplicates on a first-come, first-served basis.
- **Deployment**: The frontend and backend can be hosted on separate domains. CORS is properly configured on the backend to accept requests from the designated frontend domain.
- **Scalability**: The database is capable of handling high read-throughput for redirects. As traffic scales, it is assumed the database will be indexed and sharded based on the shortCode.
- **User Behavior**: It is assumed users will predominantly manage links and view deep analytics on desktop devices, while basic URL redirection and QR code scanning will be highly mobile-centric.

---

## AI Planning Document

The application was built systematically using an iterative, AI-assisted workflow. *Note: The use of specialized UI libraries such as Recharts (for analytics visualization) and React-Icons was explicitly allowed and documented during this planning phase to accelerate development and provide a premium user interface.*

### 1. Problem Statement
Users need a fast, reliable, and visually appealing platform to shorten long URLs while gaining deep, real-time insights into how, when, and where those links are being accessed.

### 2. Goals
- Provide an intuitive, premium glassmorphism UI.
- Ensure instantaneous and reliable URL redirection.
- Deliver comprehensive, real-time analytics for every link.
- Integrate an AI assistant to intuitively guide users.

### 3. User Flow
1. **Authentication**: The user begins with a secured signup or login process featuring strict password validation.
2. **Landing Page**: The user is welcomed by a premium landing page displaying quick links, about services, and detailed feature overviews.
3. **URL Shortening**: The user shortens URLs by adding password protection, an exact expiry date, and a custom alias name (ensuring uniqueness across all users).
4. **QR & Bulk Uploads**: Upon generation, an immediate QR code is displayed for download. The user can also perform bulk URL shortening via CSV uploads.
5. **Analytics & Public Sharing**: The user can view the analytics dashboard featuring visual charts for clicks per day, devices, browsers, countries, and recent visit history (with date and time). They can also generate an open link to share these full stats publicly, allowing anyone to view the data without signing in.
6. **Link Management**: The user manages links directly from the dashboard—filtering by newly added, old, recent, or most clicked. They can add to favorites, edit the URL later, or delete it completely. The dashboard dynamically displays the click count and expiry notifications.
7. **AI Assistance**: Throughout this smooth, mobile-responsive workflow, an AI chatbot is available at any time to help answer questions and resolve doubts.

### 4. Feature List
- **User Authentication**: Secured signup and login with strict password validation.
- **Premium Landing Page**: A beautifully designed home page with quick links, detailed service descriptions, and feature overviews.
- **Advanced URL Shortening**: Password-protected links, custom alias names, and specific expiry dates.
- **Instant QR Codes**: Immediate QR code generation with download support.
- **Bulk Creation**: Support for bulk URL shortening via CSV upload.
- **Comprehensive Analytics Dashboard**: Public stat sharing via a view-only link, interactive visual charts (clicks, devices, browsers, countries), and detailed visit history.
- **Robust Link Management**: Filter and sort links, favorites, edit/delete options, and dashboard indicators for total clicks and expiry.
- **AI Integration**: Built-in SambaNova AI Chatbot to assist with any doubts and questions.
- **Mobile Responsive**: Fluid UI that works seamlessly on all devices.

### 5. Database Design Overview
A NoSQL approach (MongoDB) was chosen for flexibility and scale.
- **Users**: Stores encrypted passwords and user profile metadata.
- **URLs**: Stores original URLs, short codes, aliases, expiration dates, and access passwords.
- **Clicks/Analytics**: Stores individual click events referenced to URLs, capturing timestamp, IP, device type, browser, and location data.

### 6. API Design Overview
The application follows RESTful API principles.
- **`/api/auth`**: Registration, login, and token validation.
- **`/api/urls`**: URL creation (single and bulk), editing, deletion, and retrieval.
- **`/api/analytics`**: Aggregation of click data for visual charts.
- **`/:shortCode`**: The root redirection endpoint that logs analytics asynchronously before performing the 302 redirect.

### 7. Security Considerations
- User passwords are encrypted using BcryptJS.
- Protected API routes require a valid JWT.
- Input validation is implemented to sanitize custom aliases and URLs, preventing XSS and NoSQL injection.
- Links can be individually password-protected by the creator.

### 8. Analytics Collection Strategy
Click data is collected synchronously during the redirect phase but processing is kept minimal to ensure redirects are instantaneous. Data points like IP geolocation and User-Agent parsing are extracted to populate the Recharts visualizations dynamically.

### 9. Deployment Strategy
- **Frontend**: Deployed on Vercel for fast edge caching and continuous delivery.
- **Backend**: Hosted on Render to manage the Node.js API environment and handle traffic securely.
- **Database**: MongoDB Atlas is used for cloud-based, highly available data storage.

### 10. Future Improvements
- Implement Redis caching for the most frequently accessed short URLs to reduce database load.
- Add team collaboration features for shared link management workspaces.
- Provide webhooks for enterprise users to receive real-time click notifications.

---

## Architecture Diagram

![Architecture Diagram](./output%20images/architecture.png)

### Architecture Flow 

1. **Client / Presentation Layer (React + Vite on Vercel):** 
   This is the user-facing interface. It handles routing, UI rendering, dynamic charting (using Recharts), and state management. When a user creates a link or chats with the AI, this layer communicates asynchronously with the backend API.

2. **Application / API Layer (Node.js + Express on Render):** 
   This central hub handles all business logic:
   - **Authentication:** Validates JWT tokens and Bcrypt password hashes.
   - **URL Management:** Validates custom aliases, checks passwords/expiry dates, and generates short codes.
   - **Redirection Engine:** When a short link is clicked, this engine intercepts the request, extracts visitor analytics (IP, device, browser, date/time), logs it to the database, and performs an instant `302 Found` redirect.
   - **AI Integration:** Acts as a secure proxy to forward user prompts to the SambaNova AI service and return the responses.

3. **Data Access Layer (MongoDB Atlas):** 
   The cloud-based NoSQL database stores all persistent data across optimized collections: `Users` (profiles), `URLs` (metadata and settings), and `Clicks` (granular, high-volume analytics tracking points).

4. **External Services:** 
   The system securely connects with the SambaNova AI API to power the interactive Chatbot on the dashboard.

---

## Sample Output and Evidence

*Please refer to the `output images` folder for sample output images.*

### Website Images

#### 1. Account Creation Page
![Account Creation Page](./output%20images/screenshot_10.png)

#### 2. Landing Page
![Landing Page](./output%20images/screenshot_1.png)

#### 3. About 
![About Services](./output%20images/about_services.png)

#### 4. Services
![Services](./output%20images/screenshot_4.png)

#### 5. Quick Links and Features
![Quick Links and Features](./output%20images/quick_links.png)

#### 6. Dashboard 
![Dashboard](./output%20images/screenshot_2.png)

#### 7. Shorten URL 
![Shorten URL](./output%20images/screenshot_8.png)

#### 8. Analytics Overview 
![Analytics Overview](./output%20images/screenshot_3.png)

#### 9. AI Agent
![AI Agent](./output%20images/screenshot_9.png)

### Database View
![Database View 1](./output%20images/screenshot_5.png)
![Database View 2](./output%20images/screenshot_6.png)
![Database View 3](./output%20images/screenshot_7.png)

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

**Analytics Document:**
```json
{
  "_id": {
    "$oid": "6a1df4ffe775a6598e27e8f1"
  },
  "url": {
    "$oid": "6a1df4ebe775a6598e27e8fe"
  },
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, L_",
  "ipAddress": "::1",
  "timestamp": {
    "$date": "2026-06-01T21:09:19.103Z"
  },
  "createdAt": {
    "$date": "2026-06-01T21:09:19.106Z"
  },
  "updatedAt": {
    "$date": "2026-06-01T21:09:19.106Z"
  },
  "__v": 0
}
```

---

## Explanatory Video

Want to see LinkPulse in action? Watch the full demo video by clicking the link below! 
This comprehensive walkthrough demonstrates all application features, live database entries, and the complete user workflow from start to finish.

🎥 **[Watch the Full Demo Video Here](https://youtu.be/jAG7Kk5mFYo)**

---

This project is a part of a hackathon run by [Katomaran](https://katomaran.com).
