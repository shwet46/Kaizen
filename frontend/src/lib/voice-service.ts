import axios from 'axios';

/**
 * Resolves the Voice Chatbot & Speech Intelligence backend URL.
 * Prefers VITE_VOICE_CHATBOT_API if explicitly set.
 * In local development, defaults to the local Python bot.
 * Otherwise uses the deployed Render bot.
 */
export const getVoiceBotApiUrl = (): string => {
  const normalizeBaseUrl = (url: string): string =>
    url.replace(/\/+$/, '').replace(/\/api$/, '');

  if (import.meta.env.VITE_VOICE_CHATBOT_API) {
    return normalizeBaseUrl(import.meta.env.VITE_VOICE_CHATBOT_API);
  }

  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:5001';
  }

  return 'https://kaizen-bot-awcf.onrender.com';
};

/**
 * Checks for native browser SpeechRecognition support.
 */
export function hasNativeSpeechRecognition(): boolean {
  if (typeof window === 'undefined') return false;

  const speechWindow = window as Window & {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };

  return Boolean(
    speechWindow.SpeechRecognition ||
      speechWindow.webkitSpeechRecognition
  );
}

/**
 * Gets a supported MIME type for MediaRecorder.
 */
export function getSupportedAudioMimeType(): string | undefined {
  const mimeTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
    'audio/wav',
  ];

  if (
    typeof MediaRecorder === 'undefined' ||
    !MediaRecorder.isTypeSupported
  ) {
    return undefined;
  }

  return mimeTypes.find((mimeType) =>
    MediaRecorder.isTypeSupported(mimeType)
  );
}

/**
 * Requests microphone permission.
 */
export async function requestMicrophoneAccess(): Promise<void> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    stream.getTracks().forEach((track) => track.stop());
  } catch (error) {
    console.error('Microphone access request failed:', error);
    throw error;
  }
}

/**
 * Transcribes audio through the Python bot backend.
 */
export async function transcribeAudioBlob(
  audioBlob: Blob,
  language = 'en-IN'
): Promise<string> {
  const formData = new FormData();
  const filename = audioBlob.type.includes('wav')
    ? 'recording.wav'
    : 'recording.webm';

  formData.append('audio', audioBlob, filename);
  formData.append('language', language);

  const response = await axios.post(
    `${getVoiceBotApiUrl()}/api/voice/transcribe`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 35000,
    }
  );

  return (response.data?.transcript || '').trim();
}

/**
 * Synthesizes text through the Python bot backend.
 */
export async function synthesizeSpeechAudio(
  text: string,
  language = 'en-IN',
  speaker = 'meera'
): Promise<Blob> {
  const cleanText = text
    .replace(/#+\s*/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[•-]/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();

  const response = await axios.post(
    `${getVoiceBotApiUrl()}/api/voice/synthesize`,
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
 * Speaks text using browser speech synthesis.
 */
export function speakTextLocally(
  text: string,
  language: string
): boolean {
  if (
    typeof window === 'undefined' ||
    typeof SpeechSynthesisUtterance === 'undefined' ||
    typeof window.speechSynthesis === 'undefined'
  ) {
    return false;
  }

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}