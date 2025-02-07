import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PdfReader } from "pdfreader";
import { completion, generateEmbedding, completionStream } from "./openai_services.js"
import supabase from "./supabase.js";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Reads and extracts text from a specified PDF file located within a predefined directory.
 * This function constructs the file path based on a provided slug, reads the file, and extracts text,
 * cleaning it from typical PDF formatting characters.
 *
 * @param {string} slug - The unique identifier for the PDF file to be read.
 * @returns {Promise<string|null>} The extracted text as a string or null if an error occurs.
 */
export const fetchCustomDataPdf = async (slug) => {
    try {
        // Determine the directory of the current module
        const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
        // Build the file path for the PDF using the slug
        const pdfFilePath = path.join(moduleDirectory, '../assets/pdfs', `${slug}.pdf`);

        // Read the PDF file into a buffer
        const pdfBuffer = await fs.readFile(pdfFilePath);
        const pdfReader = new PdfReader();

        return new Promise((resolve, reject) => {
            let accumulatedText = "";

            // Parse the PDF buffer
            pdfReader.parseBuffer(pdfBuffer, (err, item) => {
                if (err) {
                    // Reject the promise if there's an error in reading the PDF
                    reject("Error reading PDF: " + err);
                } else if (!item) {
                    // Resolve the promise with cleaned text when no more items are found
                    resolve(accumulatedText.replace(/[\u2022\u2023\u25E6\u2043\u2219\-•◦]/g, '').trim());
                } else if (item.text) {
                    // Accumulate text found within the PDF
                    accumulatedText += item.text + " ";
                }
            });
        });
    } catch (error) {
        // Log and return null if there's an error in reading the file
        console.error('Error reading the PDF file:', error);
        return null;
    }
};


/**
 * Constructs a formatted prompt for a language model based on the user's query and provided document context.
 * This function assembles a prompt with predefined sections to ensure the language model has a clear structure
 * for understanding the query and the context before generating an answer.
 *
 * @param {string} query - The user's input query.
 * @param {string} docsContext - Contextual information from documents related to the query.
 * @returns {string} A structured prompt ready to be processed by a language model.
 */
const buildFullPrompt = (query, docsContext) => {
    // Define sections of the prompt for clarity and structure
    const introBoilerplate = "Answer the question posed in the user query section using the provided context.";
    const querySection = "USER QUERY: ";
    const contextSection = "CONTEXT: ";
    const answerSection = "Final Answer: ";

    // Assemble the complete prompt using the defined sections
    const fullPrompt = `
      ${introBoilerplate}
      ${querySection} ${query}
      ${contextSection} ${docsContext}
      ${answerSection}`;

    return fullPrompt; // Return the fully constructed prompt
};



/**
 * Fetches and returns a response from a language model based on a provided query.
 * The function generates an embedding for the query, fetches relevant documents based on that embedding,
 * builds a full prompt from those documents, and gets a response from a language model.
 * 
 * @param {string} query - The user's query to process.
 * @returns {Promise<string|null>} The answer from the language model, or null in case of errors.
 */
export const runPrompt = async (query) => {
    try {
        // Log the user's query
        console.log('User prompt => ', query);

        // Generate an embedding for the user query
        const queryEmbedding = await generateEmbedding(query);
        if (!queryEmbedding) {
            throw new Error('Failed to generate query embedding');
        }

        // Fetch matching data from the database using the generated embedding
        const { data, error } = await supabase.rpc(process.env.SUPABASE_DB_FUNCTION_NAME, {
            query_embedding: queryEmbedding,
            match_threshold: 0.40, // Set the similarity threshold for matching
            match_count: 1        // Number of matches to retrieve
        });

        if (error) {
            throw new Error('Database matching error: ' + error.message);
        }
        // if (!data || data.length === 0) {
        //     throw new Error('No matching documents found');
        // }

        // Fetch PDF data based on the matched results
        let documents = await Promise.all(data.map(doc => fetchCustomDataPdf(doc.id)));
        if (!documents || documents.length === 0) {
            //throw new Error('Failed to fetch documents');
            documents = "Welcome to Food on Wheels Customer Support! You can ask me about your recent orders, feedbacks, payments info, or fnq about the company. How can I assist you today?";
        }

        // Build the prompt with the retrieved document data
        const fullPrompt = buildFullPrompt(query, documents);
        console.log('Prompt to LLM => ', fullPrompt);

        // Get the response from the language model using the built prompt
        const answer = await completion(fullPrompt);
        console.log("Successfully fetched answer via LLM:", answer);

        return answer; // Return the fetched answer
    } catch (error) {
        console.error('Error running prompt:', error);
        return null; // Return null in case of an error
    }
};


/**
 * Streams responses from a language model as server-sent events based on a provided query.
 * This function generates an embedding for the query, matches it against a database to fetch related documents,
 * constructs a full prompt from these documents, and then streams the language model's response.
 * 
 * @param {string} query - The user's input query.
 * @returns {Promise<Stream>} A stream of the language model's responses.
 */
export const runPromptStream = async (query, max_token = 1024) => {
    try {
        console.log('User prompt => ', query);

        // Generate an embedding for the user query
        const queryEmbedding = await generateEmbedding(query);
        if (!queryEmbedding) {
            throw new Error('Failed to generate query embedding');
        }

        // Fetch matching data from the database using the query embedding
        const { data, error } = await supabase.rpc('fn_match_food', {
            query_embedding: queryEmbedding,
            match_threshold: 0.40, // Similarity threshold for matching documents
            match_count: 1        // Retrieve only one match
        });

        if (error) {
            throw new Error('Database matching error: ' + error.message);
        }

        let documentsContext = '';
        if (!data || data.length === 0) {
            console.log("No matching documents found. Using default context.");
            documentsContext = "Welcome to Food on Wheels Customer Support! You can ask me about your recent orders, feedback, payments info, or FAQs about the company. How can I assist you today?";
        } else {
            // Fetch PDF data based on the matched results
            documentsContext = await Promise.all(data.map(doc => fetchCustomDataPdf(doc.id)));
            documentsContext = documentsContext.join(" ");
        }

        // Build the prompt with the retrieved document data
        const fullPrompt = buildFullPrompt(query, documentsContext);
        console.log('Prompt to LLM => ', fullPrompt);

        // Return the completion stream from the language model
        return completionStream(fullPrompt, max_token);
    } catch (error) {
        console.error('Error in runPromptStream:', error);
        return completionStream("Error processing your request. Please try again.", max_token);
    }
};



//runPrompt("Who founded Food on Wheels? ")
//runPrompt("Did I ordered for Chole Bhature and when ?")
//runPrompt("Which is the most rated order?, can you tell the name of items ")
//runPrompt("can you help me decide what to order next ")
//runPrompt('What happens after I make a complaint about my order?');