# AI Video Interview Platform

An advanced full-stack platform for conducting automated, asynchronous video interviews with AI-driven candidate evaluation and proctoring.

---

## 📖 Mandatory Requirements & Documentation

### 1. Problem Understanding
**What problem are you solving?**
We are automating the initial interview screening process. Traditional manual interviews are difficult to schedule, scale poorly for high volumes of applicants, and are heavily subject to interviewer bias. 

**Why is this system needed?**
An asynchronous, AI-evaluated platform solves scheduling conflicts by allowing candidates to interview on their own time. It standardizes baseline evaluations, ensuring every candidate gets exactly the same questions and objective scoring, saving recruiters hundreds of hours.

### 2. Architecture Overview
**High-level system architecture:**
- **Frontend**: Next.js (React), TailwindCSS, hosted on Vercel.
- **Backend**: Node.js, Express, Socket.io, hosted on Render.
- **Database**: MongoDB for user data, interview templates, and session logs.

**Media flow (frontend → backend → storage → transcription):**
1. User webcam captures video in the browser.
2. `MediaRecorder` chunks the video into 3-second segments.
3. Chunks are emitted via `Socket.io` as Base64 data.
4. Backend receives chunks and writes them to temporary `.webm` files on disk.
5. When the interview ends, `FFmpeg` merges the chunks into a final video file.
6. The audio is extracted and sent to an AI API (like Deepgram) for transcription.
7. The transcript is fed into an LLM for scoring (Confidence, Technical, Communication).

**WebSocket/event flow explanation:**
We use WebSockets instead of standard REST HTTP for video uploads. Real-time bidirectional streaming bypasses standard HTTP payload limits and prevents server timeouts (Vercel/Render frequently kill long HTTP requests). `Socket.io` maintains an active TCP connection to stream media iteratively.

### 3. Technical Decisions & Tradeoffs
- **Why chosen approach:** We separated the frontend (Next.js) and backend (Express) to scale the backend independently. Video processing is CPU-heavy and shouldn't run on the same server serving the frontend UI.
- **Why streaming over full upload:** A full file upload at the end of a 30-minute interview risks total data loss if the network fails. Streaming ensures data is captured progressively; if the user's internet drops, we still have the first 25 minutes of their interview saved.
- **Why WebSockets over WebRTC:** WebRTC is ideal for real-time video conferencing (low latency), but WebSockets are better for guaranteed data delivery and saving chunks directly to disk without needing complex STUN/TURN servers.

### 4. Failure Scenarios & Edge Cases
- **Network interruptions:** If the network drops, Socket.io attempts to reconnect automatically. The frontend continues recording and buffers chunks locally until the connection is restored.
- **Duplicate chunks:** The backend tracks `chunkNumber`. If a duplicate chunk arrives due to a reconnect retry, it is ignored or overwritten.
- **Camera/mic disconnects:** The frontend listens to media track `onmute` events. If a user unplugs their mic, a proctoring warning is immediately flagged.
- **Partial upload failures:** If the final merge fails, the raw chunks are retained on the backend so they can be stitched manually or by a recovery script.
- **WebSocket reconnects:** The system handles reconnects gracefully by re-joining the specific `sessionId` room.
- **Empty/corrupted media chunks:** The backend validates payload size before writing. FFmpeg is resilient enough to drop corrupted frames during the stitching process without failing entirely.

### 5. Recovery Mechanisms
- **How your system handles reconnects:** Socket.io's built-in heartbeat mechanism detects drops. Upon reconnect, the frontend re-syncs the current chunk index.
- **Retry/recovery logic:** For critical state updates (like submitting the final assessment), the frontend uses HTTP REST fallbacks if the socket connection is unstable.
- **Chunk recovery strategy:** Because chunks are named sequentially (e.g., `chunk_0`, `chunk_1`), the backend can properly order them during the FFmpeg merge even if they arrived out of sequence.
- **Failure handling approach:** Graceful degradation. If the AI transcription API fails, the platform still saves the video and alerts the recruiter to grade it manually.

### 6. Product Thinking
- **Recruiter experience:** Clean dashboards, instant AI scorecards with radar charts, and the ability to watch candidate videos securely without downloading them.
- **Candidate experience:** A guided hardware-check ensures their camera/mic works. A "Sandbox" mode lets them practice before the real interview. Questions are read aloud via Web Speech API for accessibility.
- **Suspicious activities:** Tracked via the browser Visibility API (tab switching) and hardware events. Logs are flagged in real-time and displayed on the recruiter's dashboard.
- **UX decisions:** Dark mode default for reduced eye strain, clear countdown timers to prevent anxiety, and a modern glassmorphism UI to build trust.

### 7. Scalability Considerations
- **What may break at scale:** Real-time FFmpeg processing on the main Node thread will block the event loop and crash the server if 50 candidates finish an interview at the exact same time.
- **Performance bottlenecks:** Storing Base64 strings in memory before converting to binary buffers is memory intensive.
- **Future improvements for high concurrency:** 
  1. Offload FFmpeg processing to a dedicated worker queue (e.g., BullMQ + Redis) or AWS MediaConvert.
  2. Use raw binary ArrayBuffers over WebSockets instead of Base64 to reduce payload size by 33%.
  3. Stream directly to cloud storage (AWS S3) instead of local server disk.

### 8. Observability & Debugging
- **Logging strategy:** HTTP requests are logged via custom middleware. Socket events log `sessionId` and `chunkNumber` for traceability.
- **Error tracking:** Centralized Express error handler catches and formats API errors.
- **How production failures can be debugged:** Every action is tied to a unique `sessionId`. By searching logs for a specific `sessionId`, developers can trace exactly when the socket connected, how many chunks were received, and where FFmpeg failed.

### 9. AI Usage Documentation
- **How AI tools were used:** AI was utilized for architectural planning, debugging complex CORS/WebSocket connectivity issues across network devices, and generating boilerplate TailwindCSS UI components.
- **Prompts/thought process:** Example prompt: *"How to handle large 1GB video uploads in Next.js without hitting the Vercel 4.5MB payload limit or 10-second timeout?"* -> This led to the architectural shift towards WebSockets.
- **Decisions (Mine vs AI):** AI initially suggested using WebRTC for the video feed. I overruled this and chose WebSockets + MediaRecorder, as WebRTC introduces unnecessary peer-to-peer complexity and STUN/TURN server costs when our only goal is to save the file to a server.

---

## 🚀 Demo & Walkthrough

### Live Link
- **Frontend App:** [https://ai-interview-bay-alpha.vercel.app](https://ai-interview-bay-alpha.vercel.app)

### System Walkthrough
1. **Authentication:** Register as either a `Candidate` or a `Recruiter`.
2. **Recruiter Flow:** Go to the Recruiter Dashboard -> Create a new Interview Template -> Add Questions & Time Limits.
3. **Candidate Flow:** 
   - Login and view assigned interviews.
   - Run the Hardware Check (Camera/Mic test).
   - Try the Sandbox Mode to practice.
   - Start the Live Interview. The system records video, tracks tab-switching (proctoring), and auto-submits.
4. **Analytics:** The Recruiter views the AI-generated scorecard, transcription, and violation logs.

### Local Setup Instructions

**Prerequisites:** Node.js (v18+), MongoDB, and FFmpeg installed locally.

**1. Clone the repository**
```bash
git clone https://github.com/Arpit6691/ai_interview.git
cd ai_interview
```

**2. Setup Backend**
```bash
cd backend
npm install
```
Create `.env` in `backend`:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
```
Run `npm run dev`

**3. Setup Frontend**
```bash
cd ../frontend
npm install
```
Create `.env.local` in `frontend`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```
Run `npm run dev` and open `http://localhost:3000`.

---
