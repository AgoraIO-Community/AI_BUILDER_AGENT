
// Imports OpenAI library and initializes dotenv to load environment variables
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// Configures OpenAI client with API key from environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


/**
 * Clarifies the user's question based on a conversation context, using OpenAI's chat completion.
 * 
 * @param {string} conversationContext - The context of the conversation.
 * @return {Promise<string|null>} The clarified question or null if an error occurs.
 */
export const getClarifiedQuestion = async (conversationContext, max_token) => {
    try {
        const userContext = `Based on the provided conversation context, is the user implicitly or explicitly asking for structured information about the meeting such as a summary, highlights, or minutes? Respond with 'yes' or 'no' , converation context is  :\n\n${conversationContext}`;
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
 * Generates a completion based on the given prompt using OpenAI's GPT model.
 * 
 * @param {string} prompt - The prompt to be processed.
 * @return {Promise<string>} The generated completion text.
 */
export const completion = async (prompt, max_token) => {
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
    const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: max_token,
        messages: [{ role: "user", content: prompt }],
        stream: true,
        response_format: { type: 'text' }
    });
    return stream;
}
