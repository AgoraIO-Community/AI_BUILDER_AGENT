
// Imports OpenAI library and initializes dotenv to load environment variables
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// Configures OpenAI client with API key from environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generates an embedding vector for the given text input using OpenAI's embedding model.
 * 
 * @param {string} input - The text input to be embedded.
 * @return {Promise<Float32Array>} The embedding vector as a Float32Array.
 */
export const generateEmbedding = async (input) => {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input,
        encoding_format: "float",
    });
    const vector = response.data[0].embedding;
    return vector;
}

/**
 * Generates a completion based on the given prompt using OpenAI's GPT model.
 * 
 * @param {string} prompt - The prompt to be processed.
 * @return {Promise<string>} The generated completion text.
 */
export const completion = async (prompt) => {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0].message.content;
}

/**
 * Clarifies the user's question based on a conversation context, using OpenAI's chat completion.
 * 
 * @param {string} conversationContext - The context of the conversation.
 * @return {Promise<string|null>} The clarified question or null if an error occurs.
 */
export const getClarifiedQuestion = async (lastMsgContext, conversationContext, max_token) => {
    try {

        const userContext = `Given the recent messages, what is the user's primary concern or intent in their last message? Does it continue the discussion or indicate an end to the conversation , summarize it one line ? Here is the conversation context:\n\n${lastMsgContext}`;
        console.log("user clarification context =>", userContext)
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: userContext }],
            max_tokens: max_token
        });
        console.log('Clarification response: =>', response.choices[0].message.content);
        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("Failed to get clarification from OpenAI:", error);
        return null;
    }
}

/**
 * Streams a response from the OpenAI chat model for the given prompt, showing usage statistics.
 * 
 * @param {string} prompt - The prompt to be processed.
 * @return {Promise<Object>} A stream of responses from the chat model.
 */
export const completionStream = async (prompt, max_token) => {
    const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: max_token,
        messages: [{ role: "user", content: prompt }],
        stream: true,
        stream_options: { include_usage: true },
        response_format: { type: 'text' }
    });
    return stream;
}
