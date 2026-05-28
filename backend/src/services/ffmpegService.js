const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Merge multiple video chunks into one file for a specific question.
 */
const mergeChunks = async (sessionId, questionId, chunkPaths = []) => {
  const outputDir = path.join(UPLOADS_DIR, sessionId);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `q_${questionId}.webm`);

  if (chunkPaths.length === 0) {
    return outputPath;
  }

  try {
    // Try real FFmpeg concat
    const { execSync } = require('child_process');
    const listFile = path.join(outputDir, `list_q_${questionId}.txt`);
    const fileContent = chunkPaths.map(p => `file '${p.replace(/\\/g, '/')}'`).join('\n');
    fs.writeFileSync(listFile, fileContent);

    execSync(
      `ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${outputPath}"`,
      { stdio: 'pipe', timeout: 60000 }
    );

    fs.unlinkSync(listFile);
    console.log(`[FFmpeg] Merged ${chunkPaths.length} chunks → ${outputPath}`);
  } catch (err) {
    console.warn('[FFmpeg] FFmpeg not available or error. Copying first chunk as fallback:', err.message);
    // Fallback: just copy the first chunk as the "merged" file
    if (chunkPaths.length > 0 && fs.existsSync(chunkPaths[0])) {
      fs.copyFileSync(chunkPaths[0], outputPath);
    } else {
      fs.writeFileSync(outputPath, Buffer.alloc(0));
    }
  }

  return outputPath;
};

/**
 * Merge all per-question videos into one full session video.
 */
const mergeSessionVideos = async (sessionId, questionVideoPaths = []) => {
  const outputDir = path.join(UPLOADS_DIR, sessionId);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `session_final.webm`);

  if (questionVideoPaths.length === 0) {
    return outputPath;
  }

  try {
    const { execSync } = require('child_process');
    const listFile = path.join(outputDir, 'session_list.txt');
    const validPaths = questionVideoPaths.filter(p => fs.existsSync(p));
    const fileContent = validPaths.map(p => `file '${p.replace(/\\/g, '/')}'`).join('\n');
    fs.writeFileSync(listFile, fileContent);

    execSync(
      `ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${outputPath}"`,
      { stdio: 'pipe', timeout: 120000 }
    );

    fs.unlinkSync(listFile);
    console.log(`[FFmpeg] Final session video created → ${outputPath}`);
  } catch (err) {
    console.warn('[FFmpeg] Final merge failed. Using first available video:', err.message);
    const valid = questionVideoPaths.find(p => fs.existsSync(p));
    if (valid) {
      fs.copyFileSync(valid, outputPath);
    } else {
      fs.writeFileSync(outputPath, Buffer.alloc(0));
    }
  }

  return outputPath;
};

module.exports = { mergeChunks, mergeSessionVideos };
