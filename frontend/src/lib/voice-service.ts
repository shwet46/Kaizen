import axios from 'axios';

// Check for native browser SpeechRecognition
export function hasNativeSpeechRecognition(): boolean {
  const w = window as any;
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

// Get supported MIME type for MediaRecorder
export function getSupportedAudioMimeType(): string | undefined {
  const mimeTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
  ];
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) {
    return undefined;
  }
  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }
  return undefined;
}

// Simple microphone access request
export async function requestMicrophoneAccess(): Promise<void> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Immediately stop the tracks to release the microphone, as we only wanted to prompt for permission
    stream.getTracks().forEach((track) => track.stop());
  } catch (error) {
    console.error("Microphone access request failed:", error);
    throw error;
  }
}

// Transcribe audio via the backend
export async function transcribeAudioBlob(blob: Blob, language: string): Promise<string> {
  const formData = new FormData();
  formData.append('audio', blob, 'audio.webm');
  formData.append('language', language);

  try {
    const response = await fetch('/api/chat/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.transcript || '';
  } catch (error) {
    console.error('Transcription service error:', error);
    throw new Error('Failed to transcribe audio. Please check the network connection and backend service.');
  }
}

export function getVoiceBotApiUrl(): string {
    return import.meta.env.VITE_BOT_API_URL || (
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:8001'
            : 'https://kaizen-bot-backend.onrender.com'
    );
}

export function speakTextLocally(text: string, lang: string): boolean {
    if (typeof SpeechSynthesisUtterance === 'undefined' || typeof window.speechSynthesis === 'undefined') {
        return false;
    }
    try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        window.speechSynthesis.speak(utterance);
        return true;
    } catch (e) {
        return false;
    }
}

export async function synthesizeSpeechAudio(text: string, lang: string): Promise<Blob> {
    const API_URL = getVoiceBotApiUrl();
    const response = await axios.post(`${API_URL}/api/voice/synthesize`,
        { text, language_code: lang },
        { responseType: 'arraybuffer' }
    );
    return new Blob([response.data], { type: 'audio/wav' });
}
