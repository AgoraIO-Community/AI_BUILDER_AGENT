import express from 'express';
import dotenv from 'dotenv';
import { runPrompt } from './prompt.js';

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

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
