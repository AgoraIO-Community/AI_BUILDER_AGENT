import OpenAI from 'openai'
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


export const generateEmbedding = async (input) => {
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input,
        encoding_format: "float",
    })
    const vector = embedding.data[0].embedding
    return vector

}

export const completion = async (prompt) => {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "user", content: prompt },
        ],
    });
    // console.log('completion', completion.choices[0])
    return completion.choices[0].message.content

}