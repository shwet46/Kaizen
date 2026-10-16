import axios from 'axios';

/**
 * Resolves the Voice Chatbot & Speech Intelligence backend URL.
 * Prefers VITE_VOICE_CHATBOT_API if explicitly set.
 * In local development (localhost / 127.0.0.1), defaults to local Python bot on port 5001.
 * Otherwise falls back to cloud production deployment.
 */
export const getVoiceBotApiUrl = (): string => {
  if (import.meta.env.VITE_VOICE_CHATBOT_API) {
    return import.meta.env.VITE_VOICE_CHATBOT_API.replace(/\/$/, '');
  }
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:5001';
  }
  return 'https://kaizen-bot-awcf.onrender.com';
};

/**
 * Transcribes audio blob using Google Cloud Speech-to-Text via backend bot API.
 */
export async function transcribeAudioBlob(audioBlob: Blob, language = 'en-IN'): Promise<string> {
  const apiUrl = getVoiceBotApiUrl();
  const formData = new FormData();
  const filename = audioBlob.type.includes('wav') ? 'recording.wav' : 'recording.webm';
  formData.append('audio', audioBlob, filename);
  formData.append('language', language);

  const response = await axios.post(`${apiUrl}/api/voice/transcribe`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 35000,
  });

  return (response.data?.transcript || '').trim();
}

/**
 * Synthesizes text into high-fidelity speech audio using Google Cloud Text-to-Speech.
 */
export async function synthesizeSpeechAudio(
  text: string,
  language = 'en-IN',
  speaker = 'meera'
): Promise<Blob> {
  const apiUrl = getVoiceBotApiUrl();
  const cleanText = text
    .replace(/#+\s*/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[•-]/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();

  const response = await axios.post(
    `${apiUrl}/api/voice/synthesize`,
    {
      text: cleanText || text,
      language,
      speaker,
    },
    {
      responseType: 'blob',
      timeout: 30000,
    }
  );

  return response.data;
}

/**
 * Checks if browser has native Web Speech Recognition support.
 */
export function hasNativeSpeechRecognition(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

/**
 * Supported MIME type selector for MediaRecorder fallback across browsers.
 */
export function getSupportedAudioMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
    'audio/wav',
  ];
  for (const candidate of candidates) {
    if (MediaRecorder.isTypeSupported(candidate)) {
      return candidate;
    }
  }
  return '';
}
