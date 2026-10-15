import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    MessageSquareText,
    Mic,
    MicOff,
    X,
    Volume2,
    Send,
    User,
    Sparkles,
    Square,
    Copy,
    Check,
    ThumbsUp,
    ThumbsDown,
    RotateCcw,
    Loader2,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_VOICE_CHATBOT_API || 'https://kaizen-bot-awcf.onrender.com';
// Axios timeout constants (ms)
const GREETING_TIMEOUT_MS = 8000;  // greeting can be slow on cold start
const CHAT_TIMEOUT_MS = 30000;     // chat queries can be slow on free tier

interface Message {
    id: string;
    type: 'user' | 'assistant';
    text: string;
    audio?: string;
    timestamp: Date;
    isVoice?: boolean;
}

interface VoiceChatbotProps {
    openSignal?: number;
}

interface BrowserSpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null;
    onerror: ((event: { error: string }) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
    abort: () => void;
}

interface SpeechRecognitionWindow extends Window {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
}

export const VoiceChatbot: React.FC<VoiceChatbotProps> = ({ openSignal = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingMode, setRecordingMode] = useState<'browser' | 'gcp' | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [textInput, setTextInput] = useState('');
    const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
    const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [feedbackState, setFeedbackState] = useState<Record<string, 'up' | 'down'>>({});
    const [sttNotice, setSttNotice] = useState<string | null>(null);
    const [dynamicSuggestions, setDynamicSuggestions] = useState<Array<{ label: string; query: string; bg: string; text: string; border: string }>>([]);
    const [greetingLoading, setGreetingLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const objectUrlRef = useRef<string | null>(null);
    const speechRecognitionRef = useRef<BrowserSpeechRecognition | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    const addMessage = useCallback((type: 'user' | 'assistant', text: string, audio?: string, isVoice?: boolean) => {
        const newMessage: Message = {
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            type,
            text,
            audio,
            timestamp: new Date(),
            isVoice
        };
        setMessages(prev => [...prev, newMessage]);
    }, []);

    useEffect(() => {
        if (openSignal > 0) setIsOpen(true);
    }, [openSignal]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isProcessing]);

    // Initial greeting — fetched dynamically from the bot backend
    useEffect(() => {
        if (!isOpen || messages.length > 0) return;

        setGreetingLoading(true);

        // Use a race between the actual API call and a local fallback timeout
        // This prevents a blank screen when the bot service is cold-starting on Render
        const fallbackGreeting = '### Welcome to **Kaizen Intelligence**\n\nI am your live AI business delivery and engineering analytics copilot.\n\n💡 *Type your question below or click the microphone to get started.*';

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, GREETING_TIMEOUT_MS);

        axios.get(`${API_URL}/api/context/greeting`, {
            signal: controller.signal,
            timeout: GREETING_TIMEOUT_MS
        })
            .then(res => {
                clearTimeout(timeoutId);
                addMessage('assistant', res.data.greeting || fallbackGreeting);
            })
            .catch(() => {
                clearTimeout(timeoutId);
                // Fallback if backend is unreachable or cold-starting
                addMessage('assistant', fallbackGreeting);
            })
            .finally(() => setGreetingLoading(false));
    }, [isOpen, messages.length, addMessage]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 250);
        }
    }, [isOpen]);

    const playResponseAudio = useCallback((messageId: string, audioBase64?: string) => {
        if (!audioBase64 || !audioRef.current) return;
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        const url = URL.createObjectURL(base64ToBlob(audioBase64, 'audio/wav'));
        objectUrlRef.current = url;
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
        setIsPlayingAudio(messageId);
        audioRef.current.onended = () => setIsPlayingAudio(null);
    }, []);

    const sendTextMessage = async (query: string, isVoiceQuery: boolean = false) => {
        const trimmed = query.trim();
        if (!trimmed || isProcessing) return;

        addMessage('user', trimmed, undefined, isVoiceQuery);
        setIsProcessing(true);
        setSttNotice(null);

        try {
            const response = await axios.post(`${API_URL}/api/text/chat`, {
                query: trimmed,
                language: 'en-IN',
                with_audio: true
            }, { timeout: CHAT_TIMEOUT_MS });

            const { response_text, response_audio } = response.data;
            if (!response_text || typeof response_text !== 'string') {
                throw new Error('The chatbot returned an empty response');
            }
            const assistantId = Date.now().toString() + Math.random().toString(36).slice(2);

            const newAssistantMsg: Message = {
                id: assistantId,
                type: 'assistant',
                text: response_text,
                audio: response_audio,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, newAssistantMsg]);

            if (response_audio) {
                playResponseAudio(assistantId, response_audio);
            }
        } catch (error) {
            console.error('Text chat failed:', error);
            let message: string;
            if (axios.isAxiosError(error)) {
                if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                    message = '### ⏳ Service Warming Up\n\nThe AI service is starting up (this can take ~30s on the free tier). Please try again in a moment.';
                } else if (error.response?.data?.error) {
                    message = error.response.data.error;
                } else {
                    message = '### ⚡ Assistant Connectivity Notice\n\nI could not reach the live backend service. Please ensure the Python bot server is running.';
                }
            } else {
                message = '### ⚡ Assistant Connectivity Notice\n\nI could not reach the live backend service. Please ensure the Python bot server is running.';
            }
            addMessage('assistant', message);
        } finally {
            setIsProcessing(false);
            inputRef.current?.focus();
        }
    };

    // ===== TEXT CHAT SUBMIT =====
    const handleTextSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const query = textInput.trim();
        if (!query || isProcessing) return;
        setTextInput('');
        await sendTextMessage(query);
    };

    // ===== SPEECH TO TEXT ENGINE =====
    const startRecording = async () => {
        setSttNotice(null);
        const speechWindow = window as SpeechRecognitionWindow;
        const SpeechRecognitionClass = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

        // 1. Try Browser Native Web Speech API
        if (SpeechRecognitionClass) {
            try {
                const recognition = new SpeechRecognitionClass();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-IN';

                recognition.onresult = (event) => {
                    let fullFinal = '';
                    let fullInterim = '';
                    for (let i = 0; i < event.results.length; i++) {
                        const item = event.results[i];
                        const text = item[0]?.transcript || '';
                        if (item.isFinal) {
                            fullFinal += text + ' ';
                        } else {
                            fullInterim += text;
                        }
                    }
                    const combined = (fullFinal + fullInterim).replace(/\s+/g, ' ').trim();
                    if (combined) {
                        setTextInput(combined);
                    }
                };

                recognition.onerror = (event) => {
                    console.log('Speech recognition event:', event.error);
                    // Do not treat normal pauses as hard errors
                    if (event.error === 'no-speech' || event.error === 'aborted') {
                        return;
                    }
                    if (event.error === 'not-allowed') {
                        setSttNotice('Microphone access was denied. Please allow microphone permissions.');
                        stopRecording();
                    } else {
                        // Fallback to MediaRecorder + Google Cloud STT
                        startMediaRecorderFallback();
                    }
                };

                recognition.onend = () => {
                    setIsRecording(false);
                    setRecordingMode(null);
                    speechRecognitionRef.current = null;
                };

                recognition.start();
                speechRecognitionRef.current = recognition;
                setIsRecording(true);
                setRecordingMode('browser');
                return;
            } catch (err) {
                console.warn('Web Speech API failed to initialize, falling back to Google Cloud STT:', err);
            }
        }

        // 2. Fallback to MediaRecorder + Google Cloud Speech-to-Text
        await startMediaRecorderFallback();
    };

    const startMediaRecorderFallback = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = async () => {
                const mimeType = recorder.mimeType || 'audio/webm';
                const audioBlob = new Blob(chunks, { type: mimeType });
                stream.getTracks().forEach(track => track.stop());
                mediaStreamRef.current = null;

                // Send to backend Google Cloud STT
                await transcribeAudioWithGCP(audioBlob);
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingMode('gcp');
        } catch (error) {
            console.error('Microphone access failed:', error);
            setSttNotice('Could not access microphone. Please check browser permissions.');
            setIsRecording(false);
            setRecordingMode(null);
        }
    };

    const transcribeAudioWithGCP = async (audioBlob: Blob) => {
        setIsProcessing(true);
        setSttNotice('Transcribing speech with Google Cloud STT...');
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');
            formData.append('language', 'en-IN');

            const response = await axios.post(`${API_URL}/api/voice/transcribe`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const transcript = response.data?.transcript || '';
            if (transcript.trim()) {
                setTextInput(transcript.trim());
                setSttNotice(null);
            } else {
                setSttNotice('No speech detected. Please speak into the microphone and try again.');
            }
        } catch (err) {
            console.error('GCP STT failed:', err);
            setSttNotice('Google Cloud transcription service was unreachable. Please type your question.');
        } finally {
            setIsProcessing(false);
        }
    };

    const stopRecording = () => {
        if (speechRecognitionRef.current) {
            speechRecognitionRef.current.stop();
            speechRecognitionRef.current = null;
        }
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setMediaRecorder(null);
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        setIsRecording(false);
        setRecordingMode(null);
        inputRef.current?.focus();
    };

    const handleVoiceDoneAndSubmit = async () => {
        stopRecording();
        setTimeout(() => {
            const query = textInput.trim();
            if (query) {
                setTextInput('');
                void sendTextMessage(query, true);
            }
        }, 300);
    };

    // ===== AUDIO PLAYBACK & GCP TTS =====
    const base64ToBlob = (base64: string, mimeType: string): Blob => {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    };

    const playOrSynthesizeAudio = async (messageId: string, text: string, audioBase64?: string) => {
        if (isPlayingAudio === messageId) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            setIsPlayingAudio(null);
            return;
        }

        if (audioBase64 && audioRef.current) {
            const blob = base64ToBlob(audioBase64, 'audio/wav');
            const url = URL.createObjectURL(blob);
            audioRef.current.src = url;
            audioRef.current.play().catch(() => {});
            setIsPlayingAudio(messageId);
            audioRef.current.onended = () => setIsPlayingAudio(null);
            return;
        }

        // On-demand Google Cloud TTS synthesis
        try {
            setLoadingAudioId(messageId);
            const cleanText = text
                .replace(/#+\s*/g, '')
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .replace(/`([^`]+)`/g, '$1')
                .replace(/[•-]/g, ' ')
                .replace(/\n+/g, ' ');

            const res = await axios.post(`${API_URL}/api/voice/synthesize`, {
                text: cleanText,
                language: 'en-IN'
            }, { responseType: 'blob' });

            if (audioRef.current) {
                const url = URL.createObjectURL(res.data);
                audioRef.current.src = url;
                audioRef.current.play().catch(() => {});
                setIsPlayingAudio(messageId);
                audioRef.current.onended = () => setIsPlayingAudio(null);
            }
        } catch (err) {
            console.error('GCP TTS synthesis failed:', err);
        } finally {
            setLoadingAudioId(null);
        }
    };

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleFeedback = (id: string, type: 'up' | 'down') => {
        setFeedbackState(prev => ({
            ...prev,
            [id]: prev[id] === type ? undefined : type
        } as Record<string, 'up' | 'down'>));
    };

    const handleClearChat = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlayingAudio(null);
        setMessages([]);
        setTextInput('');
    };

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // ===== RICH MARKDOWN & BADGES RENDERER =====
    const renderFormattedText = (rawText: string) => {
        const lines = rawText.split('\n');
        const elements: React.ReactNode[] = [];
        let listItems: string[] = [];

        const flushList = (keyPrefix: string) => {
            if (listItems.length > 0) {
                elements.push(
                    <ul key={`${keyPrefix}-list`} className="space-y-1.5 my-2">
                        {listItems.map((item, idx) => {
                            const formattedItem = formatInlineStyles(item);
                            return (
                                <li key={idx} className="flex items-start gap-2 text-[13px] text-[#202124] leading-relaxed">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1A73E8] mt-2 shrink-0" />
                                    <div className="flex-1" dangerouslySetInnerHTML={{ __html: formattedItem }} />
                                </li>
                            );
                        })}
                    </ul>
                );
                listItems = [];
            }
        };

        const formatInlineStyles = (str: string) => {
            let res = str;
            // Bold
            res = res.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[#111827]">$1</strong>');
            // Inline code badges
            res = res.replace(/`([^`]+)`/g, '<span class="inline-flex items-center px-1.5 py-0.5 rounded bg-[#E8F0FE] text-[#1A73E8] font-mono text-[11px] font-semibold border border-[#4285F4]/30">$1</span>');
            // Status badges: Done, In Progress, Critical, High Priority
            res = res.replace(/\b(Done|completed)\b/g, '<span class="inline-flex items-center px-1.5 py-0.2 rounded-full bg-[#E6F4EA] text-[#137333] text-[10px] font-semibold border border-[#34A853]/30">Done</span>');
            res = res.replace(/\b(In Progress|in_progress)\b/g, '<span class="inline-flex items-center px-1.5 py-0.2 rounded-full bg-[#FEF7E0] text-[#B06000] text-[10px] font-semibold border border-[#FBBC05]/40">In Progress</span>');
            res = res.replace(/\b(Critical|Critical Priority)\b/g, '<span class="inline-flex items-center px-1.5 py-0.2 rounded-full bg-[#FCE8E6] text-[#C5221F] text-[10px] font-semibold border border-[#EA4335]/30">Critical</span>');
            res = res.replace(/\b(High Priority|High)\b/g, '<span class="inline-flex items-center px-1.5 py-0.2 rounded-full bg-[#FEF7E0] text-[#B06000] text-[10px] font-semibold border border-[#FBBC05]/30">High Priority</span>');
            // Italic markers *(...)* and *...*
            res = res.replace(/\*\((.*?)\)\*/g, '<span class="text-[11px] text-[#64748B] italic">($1)</span>');
            res = res.replace(/(^|[^\*])\*([^\*]+)\*/g, '$1<em class="text-[#4B5563]">$2</em>');
            return res;
        };

        lines.forEach((line, i) => {
            const trimmed = line.trim();

            // Heading 3: ### Heading
            if (trimmed.startsWith('### ')) {
                flushList(`pre-h3-${i}`);
                const headingText = trimmed.replace(/^###\s+/, '');
                elements.push(
                    <div
                        key={`h3-${i}`}
                        className="text-[14px] font-semibold text-[#111827] pb-1.5 mb-2 mt-2 border-b border-[#202124]/10 flex items-center gap-1.5"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-[#1A73E8] shrink-0" />
                        <span dangerouslySetInnerHTML={{ __html: formatInlineStyles(headingText) }} />
                    </div>
                );
                return;
            }

            // Bullet list item
            if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                listItems.push(trimmed.replace(/^[•\-\*]\s+/, ''));
                return;
            }

            // Flush pending list
            flushList(`pre-p-${i}`);

            // Recommendation highlight callout box
            if (trimmed.startsWith('💡')) {
                const calloutText = trimmed.replace(/^💡\s*/, '');
                elements.push(
                    <div
                        key={`callout-${i}`}
                        className="mt-3 p-2.5 rounded-xl bg-[#E6F4EA]/70 border-l-3 border-[#34A853] text-[12px] text-[#137333] font-medium leading-relaxed flex items-start gap-2 shadow-xs"
                    >
                        <span className="shrink-0 text-sm">💡</span>
                        <div className="flex-1" dangerouslySetInnerHTML={{ __html: formatInlineStyles(calloutText) }} />
                    </div>
                );
                return;
            }

            // Empty line
            if (!trimmed) {
                elements.push(<div key={`sp-${i}`} className="h-1.5" />);
                return;
            }

            // Standard paragraph
            elements.push(
                <p
                    key={`p-${i}`}
                    className="text-[13px] text-[#374151] leading-relaxed my-1"
                    dangerouslySetInnerHTML={{ __html: formatInlineStyles(trimmed) }}
                />
            );
        });

        flushList('final');
        return elements;
    };

    // Fetch dynamic suggestion pills from backend on first open
    useEffect(() => {
        if (!isOpen || dynamicSuggestions.length > 0) return;
        axios.get(`${API_URL}/api/context/suggestions`, { timeout: GREETING_TIMEOUT_MS })
            .then(res => {
                if (Array.isArray(res.data.suggestions)) {
                    setDynamicSuggestions(res.data.suggestions);
                }
            })
            .catch(() => {
                // Show sensible static suggestions as fallback when bot is cold-starting
                setDynamicSuggestions([
                    { label: 'Team Velocity', query: 'How is the team performing?', bg: 'bg-[#E8F0FE]', text: 'text-[#1A73E8]', border: 'border-[#4285F4]/30' },
                    { label: "Shweta's Status", query: 'What is Shweta working on?', bg: 'bg-[#F0E9FF]', text: 'text-[#7E57C2]', border: 'border-[#7E57C2]/30' },
                    { label: "Maitri's Status", query: 'What is Maitri working on?', bg: 'bg-[#E6F4EA]', text: 'text-[#137333]', border: 'border-[#34A853]/30' },
                    { label: 'Project Health', query: 'Is the project on track?', bg: 'bg-[#E6F4EA]', text: 'text-[#137333]', border: 'border-[#34A853]/30' },
                    { label: 'Blockers & Risks', query: 'Are there any blockers?', bg: 'bg-[#FEF7E0]', text: 'text-[#B06000]', border: 'border-[#FBBC05]/40' },
                ]);
            });
    }, [isOpen, dynamicSuggestions.length]);

    const suggestions = dynamicSuggestions;

    const handleSuggestionClick = (query: string) => {
        setTextInput('');
        void sendTextMessage(query);
    };

    return (
        <>
            {/* FLOATING TRIGGER BUTTON */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-13 h-13 rounded-full bg-[#202124] text-white flex items-center justify-center cursor-pointer hover:bg-[#303134] hover:scale-105 active:scale-95 transition-all duration-200 z-50 shadow-lg border-2 border-[#202124] group"
                    aria-label="Open Kaizen AI Assistant"
                    title="Open Kaizen Intelligence"
                >
                    <MessageSquareText className="w-5.5 h-5.5 text-white group-hover:scale-110 transition-transform" />
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#34A853] rounded-full border-2 border-white animate-pulse" />
                </button>
            )}

            {/* CHATBOT MODAL INTERFACE */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 bg-[#202124]/40 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center sm:p-4"
                    >
                        <motion.div
                            initial={{ y: 20, opacity: 0, scale: 0.98 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 20, opacity: 0, scale: 0.98 }}
                            transition={{ type: "spring", damping: 25, stiffness: 350 }}
                            className="w-full sm:max-w-xl bg-white rounded-2xl flex flex-col overflow-hidden h-[90vh] sm:h-[80vh] border border-[#202124]/15 shadow-2xl"
                            role="dialog"
                            aria-modal="true"
                        >
                            {/* MODAL HEADER */}
                            <div className="px-5 py-3.5 bg-white border-b border-[#202124]/10 flex items-center justify-between shrink-0 shadow-xs">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-[#1A73E8]/10 to-[#34A853]/10 border border-[#202124]/10 p-1.5 shrink-0 shadow-xs">
                                        <img
                                            src="/icon.svg"
                                            alt="Kaizen"
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3
                                                className="text-lg font-normal text-[#202124] tracking-tight leading-none"
                                                style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                                            >
                                                Kaizen Intelligence
                                            </h3>
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#E6F4EA] text-[#137333] text-[10px] font-sans font-medium border border-[#34A853]/20">
                                                <span className="w-1.5 h-1.5 bg-[#34A853] rounded-full animate-pulse" />
                                                Live Telemetry
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-[#5F6368] font-sans mt-0.5">
                                            Executive Delivery Copilot • Jira & GitHub Analytics
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={handleClearChat}
                                        className="p-1.5 rounded-lg text-[#5F6368] hover:text-[#202124] hover:bg-[#F8FBFF] border border-transparent hover:border-[#202124]/10 transition-colors cursor-pointer"
                                        aria-label="Reset Conversation"
                                        title="Clear conversation"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-1.5 rounded-lg text-[#5F6368] hover:text-[#202124] hover:bg-[#F8FBFF] border border-transparent hover:border-[#202124]/10 transition-colors cursor-pointer"
                                        aria-label="Close"
                                        title="Close (Esc)"
                                    >
                                        <X className="w-4.5 h-4.5" />
                                    </button>
                                </div>
                            </div>

                            {/* MESSAGES SCROLL CONTAINER */}
                            <div
                                className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[#F8FBFF]/70"
                                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(32,33,36,0.15) transparent' }}
                            >
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        {/* Avatar */}
                                        {message.type === 'assistant' ? (
                                            <div className="w-8 h-8 rounded-xl bg-white border border-[#202124]/12 flex items-center justify-center p-1.5 shrink-0 mt-0.5 shadow-xs">
                                                <img src="/icon.svg" alt="Kaizen" className="w-full h-full object-contain" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-xl bg-[#202124] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                                                <User className="w-4 h-4 text-white" />
                                            </div>
                                        )}

                                        {/* RESPONSE CARD CONTAINER */}
                                        <div
                                            className={`max-w-[85%] ${
                                                message.type === 'user'
                                                    ? 'bg-[#202124] text-white rounded-2xl rounded-tr-xs px-4 py-3 border border-[#202124] shadow-xs'
                                                    : 'bg-white text-[#202124] rounded-2xl rounded-tl-xs px-4.5 py-3.5 border border-[#E2E8F0] shadow-[0_4px_16px_rgba(0,0,0,0.05)]'
                                            }`}
                                        >
                                            {/* Assistant Header Tag */}
                                            {message.type === 'assistant' && (
                                                <div className="mb-2 pb-1.5 border-b border-[#202124]/6 flex items-center justify-between text-[11px] font-sans">
                                                    <div className="flex items-center gap-1.5 font-semibold text-[#1A73E8]">
                                                        <Sparkles className="h-3.5 w-3.5" />
                                                        <span>Kaizen Intelligence</span>
                                                    </div>
                                                    <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Message Content */}
                                            <div className="text-[13px] leading-relaxed font-sans">
                                                {message.type === 'assistant' ? (
                                                    renderFormattedText(message.text)
                                                ) : (
                                                    <div className="whitespace-pre-wrap font-sans text-sm">{message.text}</div>
                                                )}
                                            </div>

                                            {/* Assistant Action Bar */}
                                            {message.type === 'assistant' && (
                                                <div className="mt-3.5 pt-2 border-t border-[#202124]/8 flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        {/* Listen with GCP Voice Button */}
                                                        <button
                                                            onClick={() => playOrSynthesizeAudio(message.id, message.text, message.audio)}
                                                            disabled={loadingAudioId === message.id}
                                                            className="flex items-center gap-1.5 text-[11px] font-sans font-medium px-2.5 py-1 rounded-full transition-all cursor-pointer border hover:opacity-90 disabled:opacity-50"
                                                            style={{
                                                                background: isPlayingAudio === message.id ? '#E8F0FE' : '#F8FBFF',
                                                                borderColor: isPlayingAudio === message.id ? '#4285F4' : 'rgba(32,33,36,0.12)',
                                                                color: isPlayingAudio === message.id ? '#1A73E8' : '#475569'
                                                            }}
                                                            title="Listen with Google Cloud Text-to-Speech"
                                                        >
                                                            {loadingAudioId === message.id ? (
                                                                <>
                                                                    <Loader2 className="w-3 h-3 animate-spin text-[#1A73E8]" />
                                                                    <span>Synthesizing...</span>
                                                                </>
                                                            ) : isPlayingAudio === message.id ? (
                                                                <>
                                                                    <div className="flex gap-0.5 items-center">
                                                                        <motion.div animate={{ scaleY: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 h-3 bg-[#1A73E8] rounded-full" />
                                                                        <motion.div animate={{ scaleY: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.15 }} className="w-0.5 h-3 bg-[#1A73E8] rounded-full" />
                                                                        <motion.div animate={{ scaleY: [0.4, 0.9, 0.4] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.3 }} className="w-0.5 h-3 bg-[#1A73E8] rounded-full" />
                                                                    </div>
                                                                    <span>Playing (Stop)</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Volume2 className="w-3.5 h-3.5 text-[#1A73E8]" />
                                                                    <span>Listen Voice</span>
                                                                </>
                                                            )}
                                                        </button>

                                                        {/* Copy Button */}
                                                        <button
                                                            onClick={() => handleCopy(message.id, message.text)}
                                                            className="flex items-center gap-1 text-[11px] font-sans text-[#64748B] hover:text-[#202124] px-2 py-1 rounded-md hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                                                            title="Copy response to clipboard"
                                                        >
                                                            {copiedId === message.id ? (
                                                                <>
                                                                    <Check className="w-3 h-3 text-[#137333]" />
                                                                    <span className="text-[#137333] font-medium">Copied</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="w-3 h-3" />
                                                                    <span>Copy</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* Feedback Rating */}
                                                    <div className="flex items-center gap-1 text-[#94A3B8]">
                                                        <button
                                                            onClick={() => handleFeedback(message.id, 'up')}
                                                            className={`p-1 rounded-md hover:bg-[#F1F5F9] transition-colors cursor-pointer ${
                                                                feedbackState[message.id] === 'up' ? 'text-[#1A73E8] bg-[#E8F0FE]' : 'hover:text-[#202124]'
                                                            }`}
                                                            title="Helpful insight"
                                                        >
                                                            <ThumbsUp className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleFeedback(message.id, 'down')}
                                                            className={`p-1 rounded-md hover:bg-[#F1F5F9] transition-colors cursor-pointer ${
                                                                feedbackState[message.id] === 'down' ? 'text-[#EA4335] bg-[#FCE8E6]' : 'hover:text-[#202124]'
                                                            }`}
                                                            title="Needs improvement"
                                                        >
                                                            <ThumbsDown className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* User message timestamp */}
                                            {message.type === 'user' && (
                                                <div className="flex items-center justify-end gap-1.5 mt-1.5 text-[10px] text-white/60 font-mono">
                                                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    {message.isVoice && <span>• 🎤 Voice</span>}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Greeting loading shimmer */}
                                {greetingLoading && messages.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-white border border-[#202124]/12 flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                                            <img src="/icon.svg" alt="Kaizen" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="bg-white rounded-2xl rounded-tl-xs px-4 py-3 border border-[#E2E8F0] shadow-xs flex items-center gap-3">
                                            <div className="flex gap-1 items-center">
                                                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-2 rounded-full bg-[#4285F4]" />
                                                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }} className="w-2 h-2 rounded-full bg-[#34A853]" />
                                                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }} className="w-2 h-2 rounded-full bg-[#EA4335]" />
                                            </div>
                                            <span className="text-[12px] text-[#475569] font-sans font-medium">Loading live telemetry...</span>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Thinking indicator */}
                                {isProcessing && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-white border border-[#202124]/12 flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                                            <img src="/icon.svg" alt="Kaizen" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="bg-white rounded-2xl rounded-tl-xs px-4 py-3 border border-[#E2E8F0] shadow-xs flex items-center gap-3">
                                            <div className="flex gap-1 items-center">
                                                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-2 rounded-full bg-[#4285F4]" />
                                                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }} className="w-2 h-2 rounded-full bg-[#34A853]" />
                                                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }} className="w-2 h-2 rounded-full bg-[#EA4335]" />
                                            </div>
                                            <span className="text-[12px] text-[#475569] font-sans font-medium">Querying live Jira & GitHub metrics...</span>
                                        </div>
                                    </motion.div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* QUICK SUGGESTION PILLS */}
                            {messages.length <= 2 && !isProcessing && (
                                <div className="px-5 py-2.5 bg-white border-t border-[#202124]/6 shrink-0">
                                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-sans font-semibold tracking-wider text-[#64748B] mb-1.5">
                                        <Sparkles className="w-3 h-3 text-[#4285F4]" />
                                        Suggested Deliverable Queries
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                                        {suggestions.map((s, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSuggestionClick(s.query)}
                                                className={`text-[11px] font-sans font-medium px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border} hover:opacity-80 transition-all cursor-pointer shadow-2xs`}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* INPUT BAR */}
                            <div className="px-4 py-3 bg-white border-t border-[#202124]/10 shrink-0">
                                {/* Error/STT notice banner */}
                                {sttNotice && (
                                    <div className="mb-2 px-3 py-1.5 rounded-lg bg-[#FEF7E0] border border-[#FBBC05]/40 text-[#B06000] text-xs font-sans flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            <span>{sttNotice}</span>
                                        </div>
                                        <button onClick={() => setSttNotice(null)} className="text-[#B06000] hover:text-[#202124] text-xs">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}

                                {/* Recording audio visualizer */}
                                <AnimatePresence>
                                    {isRecording && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mb-2 px-3.5 py-2 rounded-xl bg-[#FCE8E6] border border-[#EA4335]/30 flex items-center justify-between shadow-2xs"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex gap-0.5 items-center">
                                                    <motion.div animate={{ scaleY: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 h-4 bg-[#EA4335] rounded-full" />
                                                    <motion.div animate={{ scaleY: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} className="w-0.5 h-4 bg-[#EA4335] rounded-full" />
                                                    <motion.div animate={{ scaleY: [0.2, 0.9, 0.2] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-0.5 h-4 bg-[#EA4335] rounded-full" />
                                                    <motion.div animate={{ scaleY: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.3 }} className="w-0.5 h-4 bg-[#EA4335] rounded-full" />
                                                    <motion.div animate={{ scaleY: [0.4, 0.8, 0.4] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.15 }} className="w-0.5 h-4 bg-[#EA4335] rounded-full" />
                                                </div>
                                                <span className="text-xs text-[#C5221F] font-sans font-medium">
                                                    {recordingMode === 'browser' ? 'Listening in real-time...' : 'Recording with Google Cloud STT...'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={handleVoiceDoneAndSubmit}
                                                    className="px-2.5 py-1 rounded-md bg-[#137333] text-white hover:bg-[#0d5926] text-xs font-sans font-medium flex items-center gap-1 cursor-pointer transition-colors"
                                                >
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Done & Send
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={stopRecording}
                                                    className="px-2 py-1 rounded-md bg-[#EA4335] text-white hover:bg-[#C5221F] text-xs font-sans font-medium flex items-center gap-1 cursor-pointer transition-colors"
                                                >
                                                    <Square className="w-3 h-3 fill-white" />
                                                    Stop
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Form with Text Input + Voice Button + Send Button */}
                                <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
                                    <div className="flex-1 relative">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={textInput}
                                            onChange={(e) => setTextInput(e.target.value)}
                                            placeholder={isRecording ? 'Transcribing your voice live...' : 'Ask about team velocity, Jira KAN-108, Shweta, commits...'}
                                            disabled={isProcessing}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FBFF] border border-[#202124]/15 text-[13px] text-[#202124] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#202124] focus:ring-1 focus:ring-[#202124]/20 transition-all font-sans"
                                        />
                                    </div>

                                    {/* Microphone recording button */}
                                    <button
                                        type="button"
                                        onClick={isRecording ? stopRecording : startRecording}
                                        disabled={isProcessing}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                                            isRecording
                                                ? 'bg-[#EA4335] text-white border-[#EA4335] animate-pulse shadow-xs'
                                                : 'bg-white text-[#475569] hover:text-[#202124] hover:bg-[#F8FBFF] border-[#202124]/15 hover:border-[#202124]/30'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        title={isRecording ? 'Stop voice recording' : 'Click to speak (Speech-to-Text)'}
                                    >
                                        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#1A73E8]" />}
                                    </button>

                                    {/* Send button */}
                                    <button
                                        type="submit"
                                        disabled={!textInput.trim() || isProcessing}
                                        className="w-10 h-10 rounded-xl bg-[#202124] text-white flex items-center justify-center transition-all cursor-pointer shrink-0 hover:bg-[#303134] disabled:opacity-30 disabled:cursor-not-allowed border border-[#202124] shadow-xs"
                                        title="Send message"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>

                                <div className="flex items-center justify-between text-[10px] text-[#94A3B8] font-sans mt-2 px-1">
                                    <span>Speech-to-Text & Live Delivery Intelligence</span>
                                    <span>Press Esc to close</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hidden audio element for GCP TTS playback */}
            <audio ref={audioRef} className="hidden" />
        </>
    );
};

export default VoiceChatbot;
