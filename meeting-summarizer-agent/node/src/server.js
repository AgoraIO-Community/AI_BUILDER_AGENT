import express from 'express';
import dotenv from 'dotenv';
import { getMeetingHistory, getMeetingHistoryStream } from './prompt.js';
import { getClarifiedQuestion } from './openai_services.js';


// Load environment variables
dotenv.config();

const app = express();
app.use(express.json()); // Middleware for parsing JSON bodies

const msgHistory = [];
const msgHistoryStream = [];


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
app.post('/mycustomagent/meetingSummary', async (req, res) => {
    const { messages, max_token = 1024 } = req.body;
    console.log('Received request with body:', req.body);
    // since max history is of 10  then we need to store the last conversation;
    const latestMsg = messages[messages.length - 1].role === 'user' ? messages[messages.length - 1].content : "";
    const userWantsSummary = await getClarifiedQuestion(latestMsg, max_token);
    console.log('user wants summary', userWantsSummary);
    const isSummaryAsked = userWantsSummary.toLowerCase() === "yes";
    console.log('meeting history uptill now', msgHistoryStream.join(","));
    if (isSummaryAsked) {
        try {
            if (msgHistory.length === 0) {
                res.json({ message: "No Meeting Conversation found" });
                return;
            }
            const response = await getMeetingHistory(msgHistory.join(";"), max_token);
            res.json({ message: response });
        } catch (error) {
            console.error('Error processing prompt:', error);
            res.status(500).json({ error: 'Error processing your request' });
        }
    } else {
        msgHistory.push(latestMsg);
        res.status(200).json({ message: "messge stored in history" });
    }
});

/**
 * Endpoint to handle streaming responses based on clarified user queries.
 */
app.post('/mycustomagent/meetingSummaryStream', async (req, res) => {
    const { messages, max_token = 1024 } = req.body;
    console.log('Received stream request with body:', req.body);
    // since max history is of 10  then we need to store the last conversation;
    const latestMsg = messages[messages.length - 1].role === 'user' ? messages[messages.length - 1].content : "";
    const userWantsSummary = await getClarifiedQuestion(latestMsg, max_token);
    console.log('user wants summary', userWantsSummary);
    const isSummaryAsked = userWantsSummary.toLowerCase() === "yes";

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    if (isSummaryAsked) {
        try {
            if (msgHistoryStream.length === 0) {
                res.write('data: {"message": "No Meeting Conversation found"}\n\n');
                res.end('data: [DONE]\n\n');
                return;
            }
            console.log('meeting history uptill now', msgHistoryStream.join(","));
            const stream = await getMeetingHistoryStream(msgHistoryStream.join(";"), max_token);
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

    } else {
        msgHistoryStream.push(latestMsg);
        res.write('data: {"message": "Message stored in history"}\n\n');
        res.end('data: [DONE]\n\n');
    }

});

// Middleware to handle not found errors
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Set port from environment and start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Agent Server running on port ${PORT}`));
