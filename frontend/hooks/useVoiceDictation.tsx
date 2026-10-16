
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

// --- Constants ---
const VAD_THRESHOLD = 0.2; // Voice Activity Detection sensitivity
const VAD_SILENCE_TIMEOUT_MS = 2000; // ms of silence to trigger end of speech
const API_ENDPOINT = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// --- Type Definitions ---
type RecordingMode = 'browser' | 'gcp';
type DictationStatus = 'idle' | 'listening' | 'transcribing' | 'error';

interface VoiceDictationOptions {
  language?: string;
  onTranscriptUpdate?: (transcript: string) => void;
  onError?: (error: string) => void;
}

interface VoiceDictationResult {
  isRecording: boolean;
  isTranscribing: boolean;
  interimTranscript: string;
  finalTranscript: string;
  status: DictationStatus;
  recordingMode: RecordingMode;
  errorMessage: string | null;
  activeField: string | null;
  toggle: (field: string, initialText?: string) => void;
  stop: () => void;
  cancel: () => void;
  clearError: () => void;
}

// --- Main Hook ---
export const useVoiceDictation = (
  options: VoiceDictationOptions = {}
): VoiceDictationResult => {
  const { language = 'en-US', onTranscriptUpdate, onError } = options;

  // --- State ---
  const [activeField, setActiveField] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordingMode, setRecordingMode] = useState<RecordingMode>('browser');

  // --- Refs for various objects that don't need to trigger re-renders ---
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<number | null>(null);
  const vadNodeRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // --- Error Handling ---
  const handleError = useCallback((message: string, isSilent = false) => {
    setErrorMessage(message);
    setIsRecording(false);
    setIsTranscribing(false);
    if (onError && !isSilent) {
      onError(message);
    }
    console.error('Voice Dictation Error:', message);
  }, [onError]);

  const clearError = () => setErrorMessage(null);

  // --- Audio Processing & GCP Transcription ---
  const sendToGCP = useCallback(async (audioBlob: Blob) => {
    if (!audioBlob.size) {
      handleError('No audio data recorded.', true);
      return;
    }

    setIsRecording(false);
    setIsTranscribing(true);
    setRecordingMode('gcp');

    const formData = new FormData();
    formData.append('audio', audioBlob, `dictation.${audioBlob.type.split('/')[1]}`);
    formData.append('language', language);

    try {
      const response = await axios.post(`${API_ENDPOINT}/api/voice/transcribe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { transcript, error } = response.data;

      if (error) {
        throw new Error(error);
      }

      if (transcript) {
        const newFinalTranscript = finalTranscript ? `${finalTranscript} ${transcript}` : transcript;
        setFinalTranscript(newFinalTranscript);
        if (onTranscriptUpdate) {
          onTranscriptUpdate(newFinalTranscript);
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Transcription via GCP failed.';
      handleError(`GCP Error: ${msg}`);
    } finally {
      setIsTranscribing(false);
    }
  }, [language, finalTranscript, onTranscriptUpdate, handleError]);

  // --- Silence Detection (VAD) ---
  const setupVAD = useCallback((stream: MediaStream) => {
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const source = audioContext.createMediaStreamSource(stream);
    const vadNode = audioContext.createScriptProcessor(2048, 1, 1);

    vadNode.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0);
      const rms = Math.sqrt(input.reduce((sum, val) => sum + val * val, 0) / input.length);

      if (rms > VAD_THRESHOLD) {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      } else if (!silenceTimerRef.current) {
        silenceTimerRef.current = window.setTimeout(() => {
          if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        }, VAD_SILENCE_TIMEOUT_MS);
      }
    };

    source.connect(vadNode);
    vadNode.connect(audioContext.destination);
    vadNodeRef.current = vadNode;
  }, []);

  // --- Browser Speech Recognition ---
  const startBrowserRecognition = useCallback(() => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      handleError('Browser Speech Recognition is not supported.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let interim = '';
      let final = finalTranscript;
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript.trim() + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInterimTranscript(interim);
      setFinalTranscript(final.trim());
      if (onTranscriptUpdate) onTranscriptUpdate(final.trim());
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        handleError(`Browser STT Error: ${event.error}`);
      }
    };

    recognition.onend = () => {
        if (isRecording) {
            recognition.start(); // Restart if still recording
        }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setRecordingMode('browser');

  }, [language, finalTranscript, onTranscriptUpdate, handleError, isRecording]);


  // --- Media Recorder for GCP ---
  const startMediaRecorder = useCallback(async (stream: MediaStream) => {
    let mimeType = 'audio/webm';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'audio/ogg';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        handleError('No supported audio format found for recording (WebM, Ogg).');
        return;
      }
    }

    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      sendToGCP(audioBlob);
    };

    mediaRecorder.start();
  }, [handleError, sendToGCP]);

  // --- Main Control Functions ---
  const start = useCallback(async (field: string, initialText = '') => {
    clearError();
    setActiveField(field);
    setFinalTranscript(initialText);
    setInterimTranscript('');
    setIsRecording(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      // Always start media recorder for potential GCP use
      startMediaRecorder(stream);

      // Also start browser recognition for live feedback
      startBrowserRecognition();

      // Setup Voice Activity Detection
      setupVAD(stream);

    } catch (err) {
      handleError('Microphone access was denied. Please allow access in your browser settings.');
    }
  }, [clearError, startMediaRecorder, startBrowserRecognition, setupVAD, handleError]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (vadNodeRef.current) {
      vadNodeRef.current.disconnect();
      vadNodeRef.current = null;
    }
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
    }
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const cancel = useCallback(() => {
    setInterimTranscript('');
    if (isRecording) {
      stop();
    }
    setIsTranscribing(false);
    setActiveField(null);
  }, [isRecording, stop]);

  const toggle = useCallback((field: string, initialText = '') => {
    if (isRecording && activeField === field) {
      stop();
    } else {
      start(field, initialText);
    }
  }, [isRecording, activeField, stop, start]);

  // --- Cleanup ---
  useEffect(() => {
    return () => {
      stop(); // Cleanup on unmount
    };
  }, [stop]);


  // --- Return values ---
  return {
    isRecording,
    isTranscribing,
    interimTranscript,
    finalTranscript,
    status: isRecording ? 'listening' : isTranscribing ? 'transcribing' : errorMessage ? 'error' : 'idle',
    recordingMode,
    errorMessage,
    activeField,
    toggle,
    stop,
    cancel,
    clearError,
  };
};
