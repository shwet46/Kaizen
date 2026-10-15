/**
 * Gemini Service (migrated from Featherless AI)
 * Uses Google Gemini API for chat completions
 * Maintains compatible interface for existing callers
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

let genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

class GeminiCompletionService {
  constructor() {
    this.geminiBillingDepleted = false;
    this.lastApiKey = process.env.GEMINI_API_KEY || '';
  }

  /**
   * Check if Gemini billing is exhausted
   */
  isDepleted() {
    // If API key changed in environment, reset depleted state
    if (this.lastApiKey !== (process.env.GEMINI_API_KEY || '')) {
      this.lastApiKey = process.env.GEMINI_API_KEY || '';
      this.geminiBillingDepleted = false;
      if (process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      }
    }
    return this.geminiBillingDepleted;
  }

  /**
   * Manually reset depleted state
   */
  resetDepleted() {
    this.geminiBillingDepleted = false;
    if (process.env.GEMINI_API_KEY) {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  /**
   * Check if an error indicates billing/credit exhaustion
   */
  isBillingError(error) {
    const message = (error?.message || '').toLowerCase();
    const status = error?.status || error?.statusCode;
    return (
      status === 402 ||
      message.includes('402') ||
      message.includes('payment required') ||
      message.includes('prepayment credits') ||
      message.includes('billing')
    );
  }

  /**
   * Generate chat completion using Gemini
   * @param {Array} messages - Array of message objects {role, content}
   * @param {Object} options - Additional options (temperature, max_tokens)
   * @returns {Object} Response in OpenAI-compatible format for backward compatibility
   */
  async generateCompletion(messages, options = {}) {
    if (!process.env.GEMINI_API_KEY) {
      const err = new Error('GEMINI_API_KEY is not configured');
      err.status = 401;
      throw err;
    }

    if (this.isDepleted()) {
      const err = new Error('Gemini prepayment credits are depleted (402 Payment Required). Please manage project billing at https://ai.studio/projects or provide a funded GEMINI_API_KEY.');
      err.status = 402;
      err.isBillingError = true;
      throw err;
    }

    try {
      if (!genAI) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      }

      const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
      const model = genAI.getGenerativeModel({ model: modelName });

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
        model: modelName,
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      };
    } catch (error) {
      const isBilling = this.isBillingError(error);
      if (isBilling) {
        this.geminiBillingDepleted = true;
        console.warn('⚠️ [Gemini] Prepayment credits depleted (402 Payment Required). Active API key has $0.00 credits on Google AI Studio.');
      } else {
        console.error('Gemini API Error:', error.message);
      }
      const status = error.status || (isBilling ? 402 : 500);
      const message = error.message || 'Gemini API request failed';
      const err = new Error(message);
      err.status = status;
      err.isBillingError = isBilling;
      throw err;
    }
  }
}

module.exports = new GeminiCompletionService();
