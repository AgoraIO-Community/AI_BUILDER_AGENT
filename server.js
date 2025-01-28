import express from 'express';
import dotenv from 'dotenv';
import { runPrompt, runPromptStream } from './prompt.js';
import { getClarifiedQuestion } from "./openai_services.js";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json()); // Middleware for parsing JSON bodies

/**
 * Middleware to validate the presence and non-emptiness of the 'data' field in the request body.
 */
function validateRequestData(req, res, next) {
    const { data } = req.body;
    if (!data || data.trim() === "") {
        return res.status(400).json({ error: 'Invalid data format: "data" field is required and cannot be empty.' });
    }
    next();
}

/**
 * Endpoint to handle POST requests, running a prompt based on the provided data.
 */
app.post('/mycustomagent/prompt', validateRequestData, async (req, res) => {
    const { data } = req.body;
    try {
        const response = await runPrompt(data);
        res.json({ message: response });
    } catch (error) {
        console.error('Error processing prompt:', error);
        res.status(500).json({ error: 'Error processing your request' });
    }
});

/**
 * Endpoint to handle streaming responses based on clarified user queries.
 */
app.post('/mycustomagent/promptStream', async (req, res) => {
    const { messages } = req.body;
    console.log('Received request with body:', req.body);
    const conversationContext = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');

    const clarifiedQuestion = await getClarifiedQuestion(conversationContext);
    if (!clarifiedQuestion) {
        res.status(500).json({ error: "Failed to clarify the user's query" });
        return;
    }

    try {
        console.log("User query clarified:", clarifiedQuestion);
        const stream = await runPromptStream(clarifiedQuestion);

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        for await (const chunk of stream.iterator()) {
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }

        res.end('data: [DONE]\n\n');
    } catch (error) {
        console.error('Error during streaming completion:', error);
        if (!res.headersSent) {
            res.status(500).send("Error processing your request");
        }
    }
});

// Middleware to handle not found errors
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Set port from environment and start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
