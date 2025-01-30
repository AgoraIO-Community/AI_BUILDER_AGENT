import { generateEmbedding } from './openai_services.js';
import supabase from './supabase.js';
import { fetchCustomDataPdf } from './getData.js';
import dotenv from 'dotenv';
dotenv.config();

// Define the verticals for food delivery services
const foodDeliveryVerticals = ['customers', 'faq', 'feedbacks', 'orders', 'payments', 'complaints']

// Process Overview:
// 1. Retrieve custom data from a PDF file.
// 2. Generate embeddings using the model 'text-embedding-3-small'.
// 3. Store the generated embeddings in the Supabase VectorDB.
// 4. For user prompts, create embeddings and match them in the database to retrieve relevant results.
// 5. Prepare the prompt for the LLM (Language Model) and obtain the final answer.

const createEmbeddings = async (slug) => {
    // Fetch custom data from the PDF file associated with the given slug
    const data = await fetchCustomDataPdf(slug);
    // Generate embeddings for the fetched data
    const vector = await generateEmbedding(data)

    // Insert the generated vector into the Supabase database
    const { error } = await supabase
        .from(process.env.SUPABASE_DB_TABLE) // Supabase database table for storing PDF embeddings
        .insert([
            { id: slug, vector },
        ])
        .select()
    // Log any errors that occur during the insertion
    console.log(error)

}

// Initialize the application by creating embeddings for all defined verticals
const initApp = async () => {
    await Promise.all(foodDeliveryVerticals.map(slug => createEmbeddings(slug)));
}

// Start the application
initApp()




