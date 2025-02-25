
// Imports OpenAI library and initializes dotenv to load environment variables
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// Configures OpenAI client with API key from environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});



/**
 * Generates a completion based on the given prompt using OpenAI's GPT model.
 * 
 * @param {string} prompt - The prompt to be processed.
 * @return {Promise<string>} The generated completion text.
 */
export const completion = async (prompt, max_token) => {
    console.log("open api key", openai.apiKey)
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: max_token,
        messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0].message.content;
}

/**
 * Streams a response from the OpenAI chat model for the given prompt, showing usage statistics.
 * 
 * @param {string} prompt - The prompt to be processed.
 * @return {Promise<Object>} A stream of responses from the chat model.
 */
export const completionStream = async (prompt, max_token) => {
    console.log("open api key", openai.apiKey)
    const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: max_token,
        messages: [{ role: "user", content: prompt }],
        stream: true,
        response_format: { type: 'text' }
    });
    return stream;
}
