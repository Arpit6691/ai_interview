# AI Video Interview Platform

An advanced full-stack platform for conducting automated, asynchronous video interviews with AI-driven candidate evaluation and proctoring.

## Features

- **Role-based Authentication**: Separate dashboards for `Recruiter` and `Candidate`.
- **Custom Interview Creation**: Recruiters can create custom interview templates with time limits per question.
- **Automated Video Recording**: Candidates record their answers sequentially.
- **Background AI Processing**: 
  - **FFmpeg Integration**: Merges individual video question chunks into a seamless session video.
  - **Transcriptions**: Generates precise speech-to-text transcripts of candidate answers.
  - **AI Scorecard**: Evaluates communication, confidence, and technical knowledge.
- **Proctoring**: Tracks browser tab-switching and flags suspicious activities during the assessment.
- **Detailed Analytics**: Recruiters and candidates can view radar charts, transcripts, and proctoring logs.

## Tech Stack

### Frontend
- Next.js (App Router)
- React
- TailwindCSS
- Recharts (for analytics)
- Socket.io-client (for real-time streaming)

### Backend
- Node.js & Express
- MongoDB & Mongoose
- Socket.io (for streaming video chunks)
- FFmpeg (for video manipulation)
- Deepgram SDK (for AI Transcriptions - Optional)

## Project Structure

```
├── backend/                  # Node.js Express server
│   ├── src/
│   │   ├── controllers/      # API logic
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # Express routes
│   │   ├── services/         # AI and FFmpeg services
│   │   └── sockets/          # WebRTC/Socket.io stream handlers
│   └── server.js             # Entry point
│
└── frontend/                 # Next.js Application
    ├── src/
    │   ├── app/              # App router pages (auth, candidate, recruiter)
    │   ├── components/       # Reusable React components
    │   └── context/          # Global AuthContext
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster (or local MongoDB)
- FFmpeg installed on your machine (for local development)

### 1. Clone the repository
```bash
git clone https://github.com/Arpit6691/ai_interview.git
cd ai_interview
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
DEEPGRAM_API_KEY=your_deepgram_key_optional
CLIENT_URL=http://localhost:3000
```
Start the backend server:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```
Start the frontend server:
```bash
npm run dev
```

### 4. Access the App
Open `http://localhost:3000` in your browser. You can register either as a candidate or a recruiter to test the flows.

## License
MIT License
