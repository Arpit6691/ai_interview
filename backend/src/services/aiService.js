const fs = require('fs');
const path = require('path');

/**
 * AI Service - Handles transcription and candidate evaluation.
 * Falls back gracefully when no external API key is configured.
 */

// Transcribe audio/video file using Deepgram or fallback
const transcribeAudio = async (videoPath, questionText = '') => {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;

    if (apiKey && apiKey.length > 10) {
      // Real Deepgram transcription
      const { Deepgram } = require('@deepgram/sdk');
      const deepgram = new Deepgram(apiKey);
      const audioSource = { stream: fs.createReadStream(videoPath), mimetype: 'audio/webm' };
      const response = await deepgram.transcription.preRecorded(audioSource, {
        punctuate: true,
        utterances: true,
        smart_format: true,
      });
      const transcript = response.results?.channels?.[0]?.alternatives?.[0];
      return {
        text: transcript?.transcript || '[No speech detected]',
        confidence: transcript?.confidence || 0,
      };
    } else {
      // Fallback: generate a plausible mock transcript
      console.log(`[AI] No Deepgram key found — using mock transcript for: ${path.basename(videoPath)}`);
      await new Promise((r) => setTimeout(r, 500)); // simulate async delay
      return {
        text: `The candidate provided a response to the question: "${questionText}". They discussed their background, technical skills, and relevant project experience. They mentioned working with modern web frameworks, cloud services, and demonstrated confidence in problem-solving approaches.`,
        confidence: 0.91,
      };
    }
  } catch (err) {
    console.error('[AI] Transcription error:', err.message);
    return { text: '[Transcription unavailable]', confidence: 0 };
  }
};

// Evaluate candidate session based on transcripts and proctoring data
const evaluateSession = async (transcripts = [], warningsCount = 0) => {
  try {
    await new Promise((r) => setTimeout(r, 300)); // simulate async AI evaluation

    // Score simulation (replace with GPT call if needed)
    const baseScore = transcripts.length > 0 ? 75 : 40;
    const warningPenalty = Math.min(warningsCount * 5, 30);
    const variability = Math.floor(Math.random() * 15);

    const communication = Math.min(100, baseScore + variability - warningPenalty);
    const confidence = Math.min(100, baseScore + Math.floor(Math.random() * 10) - warningPenalty);
    const technical = Math.min(100, baseScore + Math.floor(Math.random() * 20) - warningPenalty);
    const overall = Math.round((communication + confidence + technical) / 3);

    return {
      scores: { overall, communication, confidence, technical },
      feedback: `The candidate demonstrated ${overall >= 75 ? 'strong' : 'moderate'} communication skills across all questions. Their answers showed ${technical >= 70 ? 'solid' : 'developing'} technical knowledge with ${confidence >= 70 ? 'confident' : 'hesitant'} delivery.`,
      suggestions: [
        overall < 70 ? 'Consider additional technical preparation before the next round.' : 'Strong candidate — recommend for next round.',
        warningsCount > 2 ? 'Proctoring flagged multiple tab-switch events. Review recording.' : 'Proctoring compliance was satisfactory.',
        'Encourage more concise responses to maximize clarity under time constraints.',
      ],
    };
  } catch (err) {
    console.error('[AI] Evaluation error:', err.message);
    return {
      scores: { overall: 0, communication: 0, confidence: 0, technical: 0 },
      feedback: 'AI evaluation unavailable.',
      suggestions: [],
    };
  }
};

module.exports = { transcribeAudio, evaluateSession };
