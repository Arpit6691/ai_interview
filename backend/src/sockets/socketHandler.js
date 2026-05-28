const fs = require('fs');
const path = require('path');
const MediaChunk = require('../models/MediaChunk');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Candidate joins a session room
    socket.on('join-session', ({ sessionId }) => {
      socket.join(`session-${sessionId}`);
      console.log(`[Socket] ${socket.id} joined session-${sessionId}`);
    });

    // Receive a video chunk from candidate
    socket.on('video-chunk', async ({ sessionId, questionId, chunkNumber, data }) => {
      try {
        const sessionDir = path.join(UPLOADS_DIR, sessionId);
        if (!fs.existsSync(sessionDir)) {
          fs.mkdirSync(sessionDir, { recursive: true });
        }

        const chunkPath = path.join(sessionDir, `q${questionId}_chunk${chunkNumber}.webm`);
        const buffer = Buffer.from(data);
        fs.writeFileSync(chunkPath, buffer);

        await MediaChunk.create({
          session: sessionId,
          question: questionId,
          chunkNumber,
          filePath: chunkPath,
          sizeBytes: buffer.length,
        });

        socket.emit('chunk-ack', { chunkNumber, questionId });
      } catch (err) {
        console.error('[Socket] Error saving chunk:', err.message);
        socket.emit('chunk-error', { error: err.message });
      }
    });

    // Proctoring alert from candidate
    socket.on('proctor-alert', ({ sessionId, type, timestamp, details }) => {
      console.log(`[Proctor] Alert for session ${sessionId}: ${type}`);
      // Broadcast to recruiter room if they're watching live
      io.to(`recruiter-watch-${sessionId}`).emit('proctor-event', { type, timestamp, details });
    });

    // Recruiter watching live session
    socket.on('watch-session', ({ sessionId }) => {
      socket.join(`recruiter-watch-${sessionId}`);
      console.log(`[Socket] Recruiter ${socket.id} watching session-${sessionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = registerSocketHandlers;
