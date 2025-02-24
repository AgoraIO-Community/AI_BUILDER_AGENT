import express from 'express';
import dotenv from 'dotenv';
import { getMeetingHistory, getMeetingHistoryStream } from './prompt.js';


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
    // const conversationContext = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    //console.log("conversational context till history =>", conversationContext);
    // since max history is of 10  then we need to store the last conversation;
    const latestMsg = messages[messages.length - 1].content;
    const isSummaryAsked = latestMsg.includes("summary");
    if (isSummaryAsked) {
        try {

            const response = await getMeetingHistory(msgHistory.join("\n"), max_token);
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
    const conversationContext = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    console.log("conversational context stream till history =>", conversationContext);
    // since max history is of 10  then we need to store the last conversation;
    const latestMsg = messages[messages.length - 1].content;
    const isSummaryAsked = latestMsg.includes("summary");
    if (isSummaryAsked) {
        try {

            const stream = await getMeetingHistoryStream(msgHistoryStream.join("\n"), max_token);

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

    } else {
        msgHistoryStream.push(latestMsg);
        res.status(200).json({ message: "messge stored in history" });
    }

});

// Middleware to handle not found errors
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Set port from environment and start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Agent Server running on port ${PORT}`));
