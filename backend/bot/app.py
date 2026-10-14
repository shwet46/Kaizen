"""
Main Flask Application - Voice & Text Chatbot Backend
Provides API endpoints for voice and text-based business insights
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
import os
import sys
import io
import base64

# Fix encoding for Windows consoles
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# Load environment variables from bot directory and root directory
bot_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(bot_dir)
if bot_dir not in sys.path:
    sys.path.insert(0, bot_dir)
load_dotenv(os.path.join(bot_dir, '.env'))
load_dotenv(os.path.join(root_dir, '.env'))

# Import services
from services.sarvam_service import SarvamService
from services.mongodb_service import MongoDBService
from services.insights_engine import InsightsEngine

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Top-level Health endpoints for Render deployment monitoring
@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'service': 'Kaizen Voice Intelligence Bot API',
        'status': 'online',
        'version': '1.0.0'
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'kaizen-bot'
    })

# Initialize services
sarvam_service = SarvamService()
mongodb_service = MongoDBService()
insights_engine = InsightsEngine(mongodb_service)

# ============= API ENDPOINTS =============

@app.route('/api/context/greeting', methods=['GET'])
def get_greeting():
    """Return a dynamic greeting built from live TEAM_DATA at request time"""
    try:
        from services.insights_engine import TEAM_DATA

        # Compute live stats from TEAM_DATA
        members = list(TEAM_DATA.values())
        total_tickets = sum(m['total_tickets'] for m in members)
        completed_count = sum(m['completed_count'] for m in members)
        velocity_pct = round((completed_count / total_tickets) * 100, 1) if total_tickets else 0
        total_commits = sum(m['commits'] for m in members)

        active_engineers = []
        for m in members:
            ticket = m.get('active_ticket', {})
            role_abbrev = m['role'].split()[-1]  # last word, e.g. "Architect"
            active_engineers.append(f"{m['name']} *({role_abbrev})*")

        active_tickets = [
            m['active_ticket']['key']
            for m in members
            if m.get('active_ticket') and m['active_ticket'].get('status') == 'In Progress'
        ]

        blockers_count = sum(
            1 for m in members
            if 'critical' in m.get('blockers', '').lower() and 'zero' not in m.get('blockers', '').lower()
        )
        blockers_text = f"{blockers_count} critical blocker(s)" if blockers_count > 0 else "zero critical blockers"

        engineers_str = ', '.join(active_engineers)
        tickets_str = ', '.join(f'`{t}`' for t in active_tickets)

        greeting = (
            f"### Welcome to **Kaizen Intelligence**\n\n"
            f"I am your live AI business delivery and engineering analytics copilot.\n\n"
            f"I monitor and analyze our live delivery pipeline in real-time:\n\n"
            # f"• **Sprint Velocity** — {completed_count} of {total_tickets} deliverables completed ({velocity_pct}% velocity)\n"
            # f"• **Active Engineers** — {engineers_str}\n"
            # f"• **Jira & GitHub** — Active tickets ({tickets_str}), {total_commits} commits, and {blockers_text}\n"
            # f"• **AWS Architecture** — Multi-Tier VPC, EKS Kubernetes, Aurora Postgres & Redis\n\n"
            f"💡 *Type your question below or click the microphone to dictate with Speech-to-Text.*"
        )

        return jsonify({'greeting': greeting})

    except Exception as e:
        print(f"Greeting error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/context/suggestions', methods=['GET'])
def get_suggestions():
    """Return dynamic quick-action suggestion pills based on live TEAM_DATA"""
    try:
        from services.insights_engine import TEAM_DATA

        suggestions = []
        colors = [
            {"bg": "bg-[#E8F0FE]", "text": "text-[#1A73E8]", "border": "border-[#4285F4]/30"},
            {"bg": "bg-[#F0E9FF]", "text": "text-[#7E57C2]", "border": "border-[#7E57C2]/30"},
            {"bg": "bg-[#E6F4EA]", "text": "text-[#137333]", "border": "border-[#34A853]/30"},
            {"bg": "bg-[#FEF7E0]", "text": "text-[#B06000]", "border": "border-[#FBBC05]/40"},
        ]

        # Team velocity pill
        suggestions.append({
            "label": "Team Velocity",
            "query": "How is the team performing?",
            **colors[0]
        })

        # Per-member active ticket pill
        for i, (key, m) in enumerate(TEAM_DATA.items()):
            ticket = m.get('active_ticket', {})
            ticket_key = ticket.get('key', '')
            role_short = m['role'].split()[-1]
            suggestions.append({
                "label": f"{m['name']}'s Status",
                "query": f"What is {m['name']} working on?",
                **(colors[(i + 1) % len(colors)])
            })
            if ticket_key:
                suggestions.append({
                    "label": f"Jira {ticket_key}",
                    "query": f"Tell me about {ticket_key}",
                    **(colors[i % len(colors)])
                })

        # Static useful pills
        suggestions.append({
            "label": "Project Health",
            "query": "Is the project on track?",
            **colors[2]
        })
        suggestions.append({
            "label": "Blockers & Risks",
            "query": "Are there any blockers?",
            **colors[3]
        })


        return jsonify({'suggestions': suggestions})

    except Exception as e:
        print(f"Suggestions error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'services': {
            'sarvam': 'connected',
            'mongodb': 'connected',
            'insights': 'ready'
        }
    })

@app.route('/api/voice/introduction', methods=['GET'])
def get_introduction():
    """Get introduction audio"""
    try:
        language = request.args.get('language', 'en-IN')
        
        # Generate introduction audio
        audio_bytes = sarvam_service.get_introduction_audio(language)
        
        if audio_bytes:
            # Return audio file
            return send_file(
                io.BytesIO(audio_bytes),
                mimetype='audio/wav',
                as_attachment=False,
                download_name='introduction.wav'
            )
        else:
            return jsonify({'error': 'Failed to generate introduction'}), 500
    
    except Exception as e:
        print(f"Introduction error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/voice/transcribe', methods=['POST'])
def transcribe_audio():
    """Convert speech to text"""
    try:
        # Get audio data from request
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        audio_bytes = audio_file.read()
        mime_type = audio_file.mimetype

        language = request.form.get('language', 'en-IN')
        
        # Transcribe using Google Cloud STT
        transcript = sarvam_service.speech_to_text(audio_bytes, language, mime_type)
        
        return jsonify({
            'transcript': transcript or '',
            'language': language
        })
    
    except Exception as e:
        print(f"Transcription error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/voice/synthesize', methods=['POST'])
def synthesize_speech():
    """Convert text to speech"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        language = data.get('language', 'en-IN')
        speaker = data.get('speaker', 'meera')
        
        # Generate speech using Google Cloud TTS
        audio_bytes = sarvam_service.text_to_speech(
            text,
            language=language,
            speaker=speaker
        )
        
        if audio_bytes:
            # Return audio file
            return send_file(
                io.BytesIO(audio_bytes),
                mimetype='audio/wav',
                as_attachment=False,
                download_name='response.wav'
            )
        else:
            return jsonify({'error': 'Speech synthesis failed'}), 500
    
    except Exception as e:
        print(f"Synthesis error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/insights/query', methods=['POST'])
def process_query():
    """Process business insights query"""
    try:
        data = request.get_json()
        
        if not data or not isinstance(data.get('query'), str) or not data['query'].strip():
            return jsonify({'error': 'No query provided'}), 400
        
        query = data['query']
        language = data.get('language', 'en')
        return_audio = data.get('return_audio', False)
        
        # Process query through insights engine
        response_text = insights_engine.process_query(query, language)
        
        result = {
            'query': query,
            'response': response_text,
            'language': language
        }
        
        # Optionally generate audio response
        if return_audio:
            audio_bytes = sarvam_service.text_to_speech(
                response_text,
                language=f'{language}-IN'
            )
            if audio_bytes:
                # Encode audio as base64
                audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
                result['audio'] = audio_base64
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Query processing error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/text/chat', methods=['POST'])
def text_chat():
    """Text-based chat endpoint - processes text query and returns text + optional audio"""
    try:
        data = request.get_json()
        
        if not data or not isinstance(data.get('query'), str) or not data['query'].strip():
            return jsonify({'error': 'No query provided'}), 400
        
        query = data['query']
        language = data.get('language', 'en-IN')
        lang_code = language.split('-')[0]
        
        # Process query through insights engine
        response_text = insights_engine.process_query(query, lang_code)
        
        # Optionally generate TTS audio
        response_audio = None
        if data.get('with_audio', False):
            audio_bytes = sarvam_service.text_to_speech(response_text, language=language)
            if audio_bytes:
                response_audio = base64.b64encode(audio_bytes).decode('utf-8')
        
        return jsonify({
            'query': query,
            'response_text': response_text,
            'response_audio': response_audio,
            'language': language
        })
    
    except Exception as e:
        print(f"Text chat error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/voice/chat', methods=['POST'])
def voice_chat():
    """Complete voice chat flow: STT -> Insights -> TTS"""
    try:
        # Get audio data
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        audio_bytes = audio_file.read()
        mime_type = audio_file.mimetype
        
        language = request.form.get('language', 'en-IN')
        lang_code = language.split('-')[0]  # Extract 'en' from 'en-IN'
        
        # Step 1: Transcribe audio
        transcript = sarvam_service.speech_to_text(audio_bytes, language, mime_type)
        
        if transcript is None:
            # STT completely failed (error, not just silence)
            fallback = "I had trouble recognizing the audio. Please try speaking again."
            audio = sarvam_service.text_to_speech(fallback, language=language)
            return jsonify({
                'transcript': '',
                'response_text': fallback,
                'response_audio': base64.b64encode(audio).decode('utf-8') if audio else None,
                'language': language
            })
        
        if not transcript.strip():
            # No speech detected
            fallback = "I didn't detect any speech. Please try speaking again."
            audio = sarvam_service.text_to_speech(fallback, language=language)
            return jsonify({
                'transcript': '',
                'response_text': fallback,
                'response_audio': base64.b64encode(audio).decode('utf-8') if audio else None,
                'language': language
            })
        
        # Step 2: Process query
        response_text = insights_engine.process_query(transcript, lang_code)
        
        # Step 3: Generate speech
        response_audio = sarvam_service.text_to_speech(
            response_text,
            language=language
        )
        
        # Return both text and audio
        return jsonify({
            'transcript': transcript,
            'response_text': response_text,
            'response_audio': base64.b64encode(response_audio).decode('utf-8') if response_audio else None,
            'language': language
        })
    
    except Exception as e:
        print(f"Voice chat error: {e}")
        return jsonify({'error': str(e)}), 500

# ============= ERROR HANDLERS =============

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# ============= MAIN =============

if __name__ == '__main__':
    port = int(os.getenv('PORT') or os.getenv('BOT_PORT', 5001))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print("=" * 60)
    print("  VOICE CHATBOT BACKEND - STARTING")
    print("=" * 60)
    print(f"  Server running on port: {port}")
    print(f"  Google Cloud STT/TTS: Enabled")
    print(f"  MongoDB: Connected")
    print(f"  Insights Engine: Ready")
    print("")
    print("  API Endpoints:")
    print("    GET  /api/health")
    print("    GET  /api/voice/introduction")
    print("    POST /api/voice/transcribe")
    print("    POST /api/voice/synthesize")
    print("    POST /api/insights/query")
    print("    POST /api/text/chat")
    print("    POST /api/voice/chat")
    print("")
    print("  Press CTRL+C to stop")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=port, debug=debug)
