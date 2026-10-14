"""
Google Cloud Speech & Text-to-Speech Service
Handles Text-to-Speech and Speech-to-Text using Google Cloud APIs
"""

import os
import io
from typing import Optional, Dict, Any


class SarvamService:
    """
    Maintains SarvamService class interface for backwards compatibility with bot/app.py,
    powered by Google Cloud Text-to-Speech and Speech-to-Text APIs.
    """
    def __init__(self):
        self.tts_client = None
        self.speech_client = None
        self.credentials_path = self._resolve_credentials()

    def _resolve_credentials(self) -> Optional[str]:
        """Resolve Google Cloud credentials to an absolute path"""
        cred_env = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        current_dir = os.path.dirname(os.path.abspath(__file__))
        bot_dir = os.path.dirname(current_dir)
        root_dir = os.path.dirname(bot_dir)

        search_paths = []
        if cred_env:
            search_paths.extend([
                cred_env,
                os.path.join(bot_dir, cred_env.lstrip('./')),
                os.path.join(root_dir, cred_env.lstrip('./')),
                os.path.abspath(cred_env)
            ])
        
        search_paths.extend([
            '/etc/secrets/gcloud-service-account.json',
            '/etc/secrets/google-credentials.json',
            os.path.join(bot_dir, 'gcloud-service-account.json'),
            os.path.join(root_dir, 'gcloud-service-account.json'),
            os.path.join(os.getcwd(), 'gcloud-service-account.json')
        ])

        for path in search_paths:
            if path and os.path.exists(path) and os.path.isfile(path):
                abs_path = os.path.abspath(path)
                os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = abs_path
                return abs_path

        return None

    def _get_creds(self):
        # 1. Check for raw JSON string in environment variable (Render friendly)
        raw_json = (
            os.getenv('GOOGLE_APPLICATION_CREDENTIALS_JSON')
            or os.getenv('GOOGLE_CREDENTIALS_JSON')
            or os.getenv('GCLOUD_SERVICE_ACCOUNT_JSON')
        )
        if raw_json:
            try:
                import json
                from google.oauth2 import service_account
                info = json.loads(raw_json)
                return service_account.Credentials.from_service_account_info(info)
            except Exception as e:
                print(f"Error parsing Google credentials from JSON env: {e}")

        # 2. Check resolved secret file path
        cred_path = self._resolve_credentials()
        if cred_path and os.path.exists(cred_path):
            try:
                from google.oauth2 import service_account
                return service_account.Credentials.from_service_account_file(cred_path)
            except Exception as e:
                print(f"Error loading credentials from {cred_path}: {e}")
        return None

    def _get_tts_client(self):
        if self.tts_client is None:
            from google.cloud import texttospeech
            creds = self._get_creds()
            if creds:
                self.tts_client = texttospeech.TextToSpeechClient(credentials=creds)
            else:
                self.tts_client = texttospeech.TextToSpeechClient()
        return self.tts_client

    def _get_speech_client(self):
        if self.speech_client is None:
            from google.cloud import speech
            creds = self._get_creds()
            if creds:
                self.speech_client = speech.SpeechClient(credentials=creds)
            else:
                self.speech_client = speech.SpeechClient()
        return self.speech_client

    def _convert_to_pcm_wav(self, audio_data: bytes) -> Optional[bytes]:
        """Convert any audio format to 16kHz mono LINEAR16 WAV using pydub/ffmpeg"""
        try:
            from pydub import AudioSegment
            segment = AudioSegment.from_file(io.BytesIO(audio_data))
            segment = segment.set_frame_rate(16000).set_channels(1).set_sample_width(2)
            out = io.BytesIO()
            segment.export(out, format="wav")
            return out.getvalue()
        except Exception as e:
            print(f"Audio conversion notice: {e}")
            return None
    
    @staticmethod
    def _clean_markdown_for_speech(text: str) -> str:
        """Strip markdown markers for natural speech synthesis"""
        import re
        if not text:
            return ""
        cleaned = re.sub(r'#+\s*', '', text)
        cleaned = re.sub(r'\*{1,3}([^*]+)\*{1,3}', r'\1', cleaned)
        cleaned = re.sub(r'`{1,3}([^`]+)`{1,3}', r'\1', cleaned)
        cleaned = re.sub(r'^[•\-\*]\s*', '', cleaned, flags=re.MULTILINE)
        cleaned = re.sub(r'[\U00010000-\U0010ffff]', '', cleaned)
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        return cleaned

    def text_to_speech(
        self, 
        text: str, 
        language: str = 'hi-IN',
        speaker: str = 'rahul',
        pitch: float = 0,
        pace: float = 1.1,
        loudness: float = 1.0
    ) -> Optional[bytes]:
        """
        Convert text to speech using Google Cloud Text-to-Speech
        
        Args:
            text: Text to convert to speech
            language: Language code (hi-IN for Hindi, en-IN for Indian English, en-US for US English)
            speaker: Voice name preference (mapped to Google Cloud voices)
            pitch: Voice pitch adjustment (-20.0 to 20.0)
            pace: Speech speed (0.25 to 4.0)
            loudness: Volume gain in dB
        
        Returns:
            Audio bytes in WAV/LINEAR16 format
        """
        try:
            from google.cloud import texttospeech
            client = self._get_tts_client()
            
            clean_text = self._clean_markdown_for_speech(text)
            synthesis_input = texttospeech.SynthesisInput(text=clean_text or text)

            # Map language code if needed
            lang_code = language if '-' in language else f"{language}-IN"
            if lang_code not in ['hi-IN', 'en-IN', 'en-US']:
                lang_code = 'en-IN'

            # Voice selection
            voice = texttospeech.VoiceSelectionParams(
                language_code=lang_code,
                ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
            )

            # Audio configuration: LINEAR16 produces uncompressed WAV-compatible PCM
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.LINEAR16,
                speaking_rate=max(0.5, min(2.0, pace)),
                pitch=max(-20.0, min(20.0, pitch))
            )

            response = client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )

            return response.audio_content

        except Exception as e:
            print(f"Google Cloud TTS Exception: {str(e)}")
            return None
    
    def speech_to_text(
        self, 
        audio_data: bytes,
        language: str = 'hi-IN',
        mime_type: Optional[str] = None
    ) -> Optional[str]:
        """
        Convert speech to text using Google Cloud Speech-to-Text.
        Automatically converts browser audio formats (WebM, OGG) to LINEAR16 WAV.
        
        Args:
            audio_data: Audio bytes (WebM, WAV, OGG, or MP3)
            language: Language code (hi-IN for Hindi, en-IN for English)
        
        Returns:
            Transcribed text string, empty string if no speech, None on error
        """
        if not audio_data or len(audio_data) < 100:
            print("Audio data too short or empty")
            return ""

        try:
            from google.cloud import speech
            client = self._get_speech_client()

            lang_code = language if '-' in language else f"{language}-IN"

            # Convert browser audio to standard 16kHz mono WAV.
            converted_wav = self._convert_to_pcm_wav(audio_data)

            if converted_wav:
                config = speech.RecognitionConfig(
                    encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                    sample_rate_hertz=16000,
                    language_code=lang_code,
                    enable_automatic_punctuation=True
                )
                audio = speech.RecognitionAudio(content=converted_wav)
            else:
                # Fallback: detect format from the browser MIME type or magic bytes.
                content_type = (mime_type or '').lower()
                if 'webm' in content_type or audio_data.startswith(b'\x1a\x45\xdf\xa3'):
                    encoding = speech.RecognitionConfig.AudioEncoding.WEBM_OPUS
                    sample_rate = 48000
                elif 'ogg' in content_type or audio_data.startswith(b'OggS'):
                    encoding = speech.RecognitionConfig.AudioEncoding.OGG_OPUS
                    sample_rate = 48000
                elif audio_data.startswith(b'RIFF'):
                    encoding = speech.RecognitionConfig.AudioEncoding.LINEAR16
                    sample_rate = 16000
                else:
                    encoding = speech.RecognitionConfig.AudioEncoding.LINEAR16
                    sample_rate = 16000

                config = speech.RecognitionConfig(
                    encoding=encoding,
                    sample_rate_hertz=sample_rate,
                    language_code=lang_code,
                    enable_automatic_punctuation=True
                )
                audio = speech.RecognitionAudio(content=audio_data)

            response = client.recognize(config=config, audio=audio)

            transcripts = []
            for result in response.results:
                if result.alternatives:
                    transcripts.append(result.alternatives[0].transcript)

            if transcripts:
                return " ".join(transcripts).strip()
            else:
                print("No speech detected in audio")
                return ""

        except Exception as e:
            print(f"Google Cloud STT Exception: {str(e)}")
            return None
    
    def get_introduction_audio(self, language: str = 'hi-IN') -> Optional[bytes]:
        """
        Generate introduction message audio
        
        Returns:
            Audio bytes for introduction
        """
        if language.startswith('hi'):
            intro_text = """नमस्ते! मैं आपकी AI बिज़नेस इनसाइट्स असिस्टेंट हूं। 
मैं आपकी टीम के Jira टिकट्स, GitHub commits, और प्रोजेक्ट स्टेटस के बारे में जानकारी दे सकती हूं।
आप मुझसे कुछ भी पूछ सकते हैं जैसे कि टीम का परफॉर्मेंस, किसी का स्टेटस, या प्रोजेक्ट की हेल्थ।"""
        else:
            intro_text = """Hello! I'm your AI Business Insights Assistant. 
I can provide information about your team's Jira tickets, GitHub commits, and project status.
You can ask me anything like team performance, individual status, or project health.
How can I help you today?"""
        
        return self.text_to_speech(intro_text, language=language)


# Test function
if __name__ == '__main__':
    from dotenv import load_dotenv
    load_dotenv()
    
    service = SarvamService()
    
    print("Testing Google Cloud Text-to-Speech...")
    audio = service.text_to_speech(
        "Hello, this is a test of Google Cloud voice synthesis.",
        language='en-IN'
    )
    
    if audio:
        print(f"TTS Success! Generated {len(audio)} bytes of audio")
        with open('test_output.wav', 'wb') as f:
            f.write(audio)
        print("Saved to test_output.wav")
    else:
        print("TTS Failed (Ensure GOOGLE_APPLICATION_CREDENTIALS is set)")
