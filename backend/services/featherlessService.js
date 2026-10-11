/**
 * Gemini Service (migrated from Featherless AI)
 * Uses Google Gemini API for chat completions
 * Maintains compatible interface for existing callers
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiCompletionService {
  /**
   * Generate chat completion using Gemini
   * @param {Array} messages - Array of message objects {role, content}
   * @param {Object} options - Additional options (temperature, max_tokens)
   * @returns {Object} Response in OpenAI-compatible format for backward compatibility
   */
  async generateCompletion(messages, options = {}) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

      // Convert OpenAI-style messages to Gemini format
      // Extract system prompt and user messages
      let systemInstruction = '';
      const geminiMessages = [];

      for (const msg of messages) {
        if (msg.role === 'system') {
          systemInstruction += (systemInstruction ? '\n' : '') + msg.content;
        } else {
          geminiMessages.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        }
      }

      // Build generation config
      const generationConfig = {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.max_tokens || 1000,
      };

      // If we have a system instruction, include it
      let result;
      if (geminiMessages.length === 1) {
        // Single-turn: use simple generateContent
        const prompt = systemInstruction 
          ? `${systemInstruction}\n\n${geminiMessages[0].parts[0].text}`
          : geminiMessages[0].parts[0].text;

        result = await model.generateContent({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig
        });
      } else {
        // Multi-turn: use chat
        const chat = model.startChat({
          history: geminiMessages.slice(0, -1),
          generationConfig
        });
        const lastMessage = geminiMessages[geminiMessages.length - 1];
        result = await chat.sendMessage(lastMessage.parts[0].text);
      }

      const responseText = result.response.text();

      // Return in OpenAI-compatible format for backward compatibility
      return {
        choices: [
          {
            message: {
              role: 'assistant',
              content: responseText
            },
            finish_reason: 'stop'
          }
        ],
        model: 'gemini-3.8-flash',
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      };
    } catch (error) {
      console.error('Gemini API Error:', error.message);
      const status = error.status || 500;
      const message = error.message || 'Gemini API request failed';
      const err = new Error(message);
      err.status = status;
      throw err;
    }
  }
}

module.exports = new GeminiCompletionService();
