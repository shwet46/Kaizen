import { useState, useRef, useCallback, useEffect } from 'react';
import {
  transcribeAudioBlob,
  hasNativeSpeechRecognition,
  getSupportedAudioMimeType,
  requestMicrophoneAccess,
} from '@/lib/voice-service';

export interface UseVoiceDictationOptions {
  language?: string;
  onTranscriptUpdate?: (fullText: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export function useVoiceDictation(options: UseVoiceDictationOptions = {}) {
  const { language = 'en-IN', onTranscriptUpdate, onError } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [recordingMode, setRecordingMode] = useState<'browser' | 'gcp' | null>(null);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const speechRecognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const baseTextRef = useRef<string>('');
  const accumulatedFinalRef = useRef<string>('');
  const isExplicitStopRef = useRef<boolean>(false);
  const isSwitchingFallbackRef = useRef<boolean>(false);
  const activeFieldRef = useRef<string | null>(null);
  const isRecordingRef = useRef(false);

  // Sync ref
  useEffect(() => {
    activeFieldRef.current = activeField;
  }, [activeField]);

  // Clean up all resources
  const cleanupStream = useCallback(() => {
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {}
      mediaStreamRef.current = null;
    }
  }, []);

  const cleanupAll = useCallback(() => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.onend = null;
        speechRecognitionRef.current.onerror = null;
        speechRecognitionRef.current.onresult = null;
        speechRecognitionRef.current.abort();
      } catch {}
      speechRecognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }
    cleanupStream();
    setIsRecording(false);
    isRecordingRef.current = false;
    setRecordingMode(null);
    setActiveField(null);
    setInterimTranscript('');
    setIsTranscribing(false);
  }, [cleanupStream]);

  // Stop recording cleanly
  const stop = useCallback(() => {
    isExplicitStopRef.current = true;
    setInterimTranscript('');

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
      setIsRecording(false);
      isRecordingRef.current = false;
      setRecordingMode(null);
      setActiveField(null);
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
      // onstop handler handles final GCP transcription and cleanup
    }
  }, []);

  // Cancel and discard
  const cancel = useCallback(() => {
    isExplicitStopRef.current = true;
    cleanupAll();
  }, [cleanupAll]);

  // Start MediaRecorder + Google Cloud STT Fallback
  const startMediaRecorderFallback = useCallback(
    async (fieldKey?: string) => {
      isSwitchingFallbackRef.current = false;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const mimeType = getSupportedAudioMimeType() || 'audio/webm';
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        audioChunksRef.current = [];

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = async () => {
          cleanupStream();
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mimeType || 'audio/webm',
          });

          if (audioBlob.size > 100 && !isExplicitStopRef.current) {
            // Already explicitly stopped or naturally stopping
          }

          setIsTranscribing(true);
          try {
            const transcript = await transcribeAudioBlob(audioBlob, language);
            if (transcript) {
              const fullText = baseTextRef.current
                ? `${baseTextRef.current.trim()} ${transcript}`.trim()
                : transcript;
              accumulatedFinalRef.current = fullText;
              onTranscriptUpdate?.(fullText, true);
            }
          } catch (err: any) {
            const msg = 'Google Cloud Speech transcription service unreachable.';
            setErrorMessage(msg);
            onError?.(msg);
          } finally {
            setIsTranscribing(false);
            setIsRecording(false);
            isRecordingRef.current = false;
            setRecordingMode(null);
            setActiveField(null);
          }
        };

        recorder.start(250);
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        isRecordingRef.current = true;
        setRecordingMode('gcp');
        if (fieldKey) setActiveField(fieldKey);
      } catch (err: any) {
        console.error('Microphone error in MediaRecorder fallback:', err);
        const msg =
          err?.name === 'NotAllowedError'
            ? 'Microphone access denied. Please grant permission in your browser.'
            : 'Could not access microphone.';
        setErrorMessage(msg);
        onError?.(msg);
        cleanupAll();
      }
    },
    [cleanupStream, cleanupAll, language, onError, onTranscriptUpdate]
  );

  // Start dictation
  const start = useCallback(
    async (initialBaseText = '', fieldKey = 'default') => {
      cleanupAll();
      setErrorMessage(null);
      isExplicitStopRef.current = false;
      isSwitchingFallbackRef.current = false;
      baseTextRef.current = initialBaseText;
      accumulatedFinalRef.current = initialBaseText;
      setActiveField(fieldKey);

      // Check native browser Web Speech API
      if (hasNativeSpeechRecognition()) {
        try {
          await requestMicrophoneAccess();
          const w = window as any;
          const SpeechRecognitionClass = w.SpeechRecognition || w.webkitSpeechRecognition;
          const recognition = new SpeechRecognitionClass();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = language;

          recognition.onresult = (event: any) => {
            let sessionFinal = '';
            let sessionInterim = '';

            for (let i = 0; i < event.results.length; i++) {
              const res = event.results[i];
              const transcript = res[0]?.transcript || '';
              if (res.isFinal) {
                sessionFinal += transcript + ' ';
              } else {
                sessionInterim += transcript;
              }
            }

            const spokenFinal = sessionFinal.trim();
            const spokenInterim = sessionInterim.trim();

            const combinedSpoken = (spokenFinal + ' ' + spokenInterim).trim();
            if (combinedSpoken) {
              const fullText = baseTextRef.current
                ? `${baseTextRef.current.trim()} ${combinedSpoken}`.trim()
                : combinedSpoken;
              onTranscriptUpdate?.(fullText, Boolean(spokenFinal && !spokenInterim));
            }

            setInterimTranscript(spokenInterim);
          };

          recognition.onerror = (event: any) => {
            console.log('SpeechRecognition event error:', event.error);
            if (event.error === 'no-speech' || event.error === 'aborted') {
              return;
            }
            if (event.error === 'not-allowed') {
              const msg = 'Microphone permission was denied. Please allow microphone in browser.';
              setErrorMessage(msg);
              onError?.(msg);
              cleanupAll();
              return;
            }

            // Fallback to MediaRecorder + Google Cloud STT
            isSwitchingFallbackRef.current = true;
            try {
              recognition.abort();
            } catch {}
            startMediaRecorderFallback(fieldKey);
          };

          recognition.onend = () => {
            if (isSwitchingFallbackRef.current) return;

            // If user did not click stop, keep listening through natural speech pauses
            if (!isExplicitStopRef.current && isRecordingRef.current) {
              try {
                recognition.start();
                return;
              } catch {}
            }

            setIsRecording(false);
            isRecordingRef.current = false;
            setRecordingMode(null);
            setActiveField(null);
            setInterimTranscript('');
          };

          speechRecognitionRef.current = recognition;
          setIsRecording(true);
          isRecordingRef.current = true;
          setRecordingMode('browser');
          recognition.start();
          return;
        } catch (err) {
          console.warn('Web Speech API failed to initialize, falling back to Google Cloud STT:', err);
          speechRecognitionRef.current = null;
          isRecordingRef.current = false;
          setIsRecording(false);
          setRecordingMode(null);
        }
      }

      // If Web Speech API not present or failed to start
      await startMediaRecorderFallback(fieldKey);
    },
    [cleanupAll, language, onError, onTranscriptUpdate, startMediaRecorderFallback]
  );

  // Toggle dictation on a specific field
  const toggle = useCallback(
    (fieldKey: string, currentText = '') => {
      if (isRecording && activeField === fieldKey) {
        stop();
      } else {
        start(currentText, fieldKey);
      }
    },
    [isRecording, activeField, stop, start]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupAll();
    };
  }, [cleanupAll]);

  return {
    isRecording,
    recordingMode,
    activeField,
    interimTranscript,
    isTranscribing,
    errorMessage,
    start,
    stop,
    toggle,
    cancel,
    clearError: () => setErrorMessage(null),
  };
}
