const express = require('express');
const router = express.Router();
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Issue = require('../models/Issue');
const User = require('../models/User');
const Sprint = require('../models/Sprint');

// Google Cloud Speech clients (lazy-loaded)
let speechClient = null;
let ttsClient = null;

function getSpeechClient() {
    if (!speechClient) {
        const speech = require('@google-cloud/speech');
        speechClient = new speech.SpeechClient();
    }
    return speechClient;
}

function getTTSClient() {
    if (!ttsClient) {
        const textToSpeech = require('@google-cloud/text-to-speech');
        ttsClient = new textToSpeech.TextToSpeechClient();
    }
    return ttsClient;
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get JIRA context for the bot
async function getJiraContext() {
    try {
        // Fetch all issues with assignee info
        const issues = await Issue.find({})
            .populate('assignee_id', 'display_name email role team')
            .lean();

        // Fetch all users
        const users = await User.find({}).lean();

        // Fetch sprints
        const sprints = await Sprint.find({}).lean();

        // Build context summary
        const userStats = {};

        users.forEach(user => {
            userStats[user.display_name || user.name || user.user_id] = {
                userId: user.user_id,
                email: user.email,
                role: user.role,
                team: user.team,
                department: user.department,
                skills: user.skills || [],
                totalAssigned: 0,
                completed: 0,
                inProgress: 0,
                todo: 0,
                totalStoryPoints: 0,
                completedStoryPoints: 0,
                issues: []
            };
        });

        // Process issues
        issues.forEach(issue => {
            const assigneeName = issue.assignee_id?.display_name || 'Unassigned';

            if (userStats[assigneeName]) {
                userStats[assigneeName].totalAssigned++;
                userStats[assigneeName].totalStoryPoints += issue.story_points || 0;

                if (issue.status?.toLowerCase().includes('done') || issue.status?.toLowerCase().includes('closed')) {
                    userStats[assigneeName].completed++;
                    userStats[assigneeName].completedStoryPoints += issue.story_points || 0;
                } else if (issue.status?.toLowerCase().includes('progress')) {
                    userStats[assigneeName].inProgress++;
                } else {
                    userStats[assigneeName].todo++;
                }

                userStats[assigneeName].issues.push({
                    key: issue.key,
                    title: issue.title,
                    status: issue.status,
                    priority: issue.priority,
                    storyPoints: issue.story_points,
                    type: issue.issue_type
                });
            }
        });

        // Build sprint summary
        const sprintSummary = sprints.map(s => ({
            name: s.name,
            state: s.state,
            startDate: s.start_date,
            endDate: s.end_date,
            goal: s.goal
        }));

        // Overall stats
        const totalIssues = issues.length;
        const completedIssues = issues.filter(i =>
            i.status?.toLowerCase().includes('done') || i.status?.toLowerCase().includes('closed')
        ).length;
        const inProgressIssues = issues.filter(i =>
            i.status?.toLowerCase().includes('progress')
        ).length;

        return {
            totalIssues,
            completedIssues,
            inProgressIssues,
            pendingIssues: totalIssues - completedIssues - inProgressIssues,
            userStats,
            sprints: sprintSummary,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching JIRA context:', error);
        return { error: 'Failed to fetch JIRA data' };
    }
}

// Chat endpoint - receives text, returns AI response (migrated from Sarvam to Gemini)
router.post('/message', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get JIRA context
        const jiraContext = await getJiraContext();

        // Build prompt for Gemini
        const systemPrompt = `You are a helpful JIRA assistant bot. You have access to the following JIRA data from the team's project:

## Overall Statistics:
- Total Issues: ${jiraContext.totalIssues}
- Completed: ${jiraContext.completedIssues}
- In Progress: ${jiraContext.inProgressIssues}
- Pending: ${jiraContext.pendingIssues}

## Team Member Statistics:
${Object.entries(jiraContext.userStats || {}).map(([name, stats]) => `
### ${name}
- Role: ${stats.role || 'N/A'}
- Team: ${stats.team || 'N/A'}
- Total Assigned: ${stats.totalAssigned}
- Completed: ${stats.completed}
- In Progress: ${stats.inProgress}
- To Do: ${stats.todo}
- Story Points (Total/Completed): ${stats.totalStoryPoints}/${stats.completedStoryPoints}
- Current Issues: ${stats.issues.slice(0, 5).map(i => `${i.key}: ${i.title} (${i.status})`).join(', ')}
`).join('\n')}

## Active Sprints:
${jiraContext.sprints?.filter(s => s.state === 'active').map(s => `- ${s.name}: ${s.goal || 'No goal set'}`).join('\n') || 'No active sprints'}

Answer the user's questions about work completion, remaining tasks, team performance, and project status based on this data. Be concise and helpful. If asked about specific team members, provide their detailed statistics.`;

        // Call Gemini API using SDK
        const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });
        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt + '\n\nUser Question: ' + message }]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024
            }
        });

        const aiResponse = result.response.text() ||
            'I apologize, I could not generate a response. Please try again.';

        res.json({
            response: aiResponse,
            context: {
                totalIssues: jiraContext.totalIssues,
                completedIssues: jiraContext.completedIssues
            }
        });

    } catch (error) {
        console.error('Chat error:', error.message);
        res.status(500).json({ error: 'Failed to process message', details: error.message });
    }
});

// Speech-to-Text using Google Cloud Speech-to-Text API (migrated from Sarvam AI)
router.post('/stt', async (req, res) => {
    try {
        const { audio, language = 'en-IN' } = req.body; // audio is base64 encoded

        if (!audio) {
            return res.status(400).json({ error: 'Audio data is required' });
        }

        const client = getSpeechClient();

        // Map language codes: Sarvam used 'en-IN', Google Cloud uses the same format
        const request = {
            audio: {
                content: audio, // base64 encoded audio
            },
            config: {
                encoding: 'WEBM_OPUS',
                sampleRateHertz: 48000,
                languageCode: language,
                model: 'latest_long',
                enableAutomaticPunctuation: true,
            },
        };

        const [response] = await client.recognize(request);
        const transcript = response.results
            ?.map(result => result.alternatives[0]?.transcript)
            .join(' ') || '';

        res.json({
            transcript: transcript,
            language: language
        });

    } catch (error) {
        console.error('STT error:', error.message);
        res.status(500).json({ error: 'Speech-to-text failed', details: error.message });
    }
});

// Text-to-Speech using Google Cloud Text-to-Speech API (migrated from Sarvam AI)
router.post('/tts', async (req, res) => {
    try {
        const { text, language = 'hi-IN', speaker = 'meera' } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const client = getTTSClient();

        // Map Sarvam speaker names to Google Cloud voice names
        const voiceMap = {
            'meera': { name: 'hi-IN-Wavenet-A', ssmlGender: 'FEMALE' },
            'arvind': { name: 'hi-IN-Wavenet-B', ssmlGender: 'MALE' },
            'rahul': { name: 'hi-IN-Wavenet-C', ssmlGender: 'MALE' },
        };

        // Determine language prefix for voice selection
        const langPrefix = language.split('-')[0]; // 'en' from 'en-IN', 'hi' from 'hi-IN'
        let voiceConfig;

        if (langPrefix === 'en') {
            voiceConfig = { languageCode: language, name: `${language}-Wavenet-D`, ssmlGender: 'FEMALE' };
        } else {
            const mapped = voiceMap[speaker] || voiceMap['meera'];
            voiceConfig = { languageCode: language, name: mapped.name, ssmlGender: mapped.ssmlGender };
        }

        const request = {
            input: { text: text },
            voice: voiceConfig,
            audioConfig: { audioEncoding: 'LINEAR16' }, // WAV format
        };

        const [response] = await client.synthesizeSpeech(request);

        // Return base64 encoded audio (same format as Sarvam returned)
        const audioBase64 = response.audioContent.toString('base64');

        res.json({
            audio: audioBase64,
            format: 'wav'
        });

    } catch (error) {
        console.error('TTS error:', error.message);
        res.status(500).json({ error: 'Text-to-speech failed', details: error.message });
    }
});

// Get JIRA summary endpoint
router.get('/context', async (req, res) => {
    try {
        const context = await getJiraContext();
        res.json(context);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch context' });
    }
});

module.exports = router;
