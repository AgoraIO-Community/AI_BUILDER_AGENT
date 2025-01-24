import express from 'express';
import dotenv from 'dotenv';
import { runPrompt, runPromptStream } from './prompt.js';

dotenv.config();

const app = express();
app.use(express.json());

function validateRequestData(req, res, next) {
    const { data } = req.body;
    if (data === undefined || data.trim() === "") {
        return res.status(400).json({ error: 'Invalid data format: "data" field is required' });
    }
    next();
}

app.post('/mycustomagent/prompt', validateRequestData, async (req, res) => {
    const { data } = req.body;
    try {
        const response = await runPrompt(data);
        res.json({ message: response });
    } catch (error) {
        console.log('error', error)
        res.status(500).json({ error: 'Error processing your request' });
    }
});

app.post('/mycustomagent/promptStream', async (req, res) => {
    //const { data } = req.body;
    console.log('req to glue url:', req.body)

    try {
        const stream = await runPromptStream("Did I ordered for dosa ?");

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        // Process each chunk from the stream
        for await (const chunk of stream.iterator()) {
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('Error during streaming completion:', error);
        if (!res.headersSent) {
            res.status(500).send("Error processing your request");
        }
    }
});

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
