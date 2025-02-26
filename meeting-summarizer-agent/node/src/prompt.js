
import { completion, completionStream } from "./openai_services.js"
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Constructs a formatted prompt for a language model based on the user's query and provided document context.
 * This function assembles a prompt with predefined sections to ensure the language model has a clear structure
 * for understanding the query and the context before generating an answer.
 *
 * @param {string} query - The user's input query.
 * @param {string} docsContext - Contextual information from documents related to the query.
 * @returns {string} A structured prompt ready to be processed by a language model.
 */
const buildFullPrompt = (context) => {
    // Define sections of the prompt for clarity and structure
    const introBoilerplate = "Provide a concise summary based strictly on the meeting context given below. Do not add information outside of what is mentioned in the context, and keep the summary brief:";
    const contextSection = "CONTEXT: ";
    const answerSection = "Final Answer: ";

    // Assemble the complete prompt using the defined sections
    const fullPrompt = `
      ${introBoilerplate}
      ${contextSection} ${context}
      ${answerSection}`;

    return fullPrompt; // Return the fully constructed prompt
};



/**
 * Fetches and returns a response from a language model based on a provided query.
 * The function gets the meeting summary of with the given context
 * @param {string} context - The Meeting Context
 * @returns {Promise<string|null>} The answer from the language model, or null in case of errors.
 */
export const getMeetingHistory = async (context, max_token = 1024) => {
    try {
        // Build the prompt to get meeting summary
        const fullPrompt = buildFullPrompt(context);
        console.log('Prompt to LLM => ', fullPrompt)
        // Get the response from the language model using the built prompt
        const answer = await completion(fullPrompt, max_token);
        console.log("Successfully fetched answer via LLM:", answer);

        return answer; // Return the fetched answer
    } catch (error) {
        console.error('Error running prompt:', error);
        return null; // Return null in case of an error
    }
};


/**
 * Streams responses from a language model as server-sent events based on a provided query.
 * The function gets the meeting summary stream with the given context
 * @param {string} context - The Meeting Context
 * @returns {Promise<Stream>} A stream of the language model's responses.
 */
export const getMeetingHistoryStream = async (context, max_token = 1024) => {
    try {

        // Build the prompt to get meeting summary
        const fullPrompt = buildFullPrompt(context);
        console.log('Prompt to LLM => ', fullPrompt);
        // Return the completion stream from the language model
        return completionStream(fullPrompt, max_token);
    } catch (error) {
        console.error('Error in runPromptStream:', error);
        return completionStream("Error processing your request. Please try again.", max_token);
    }
};
