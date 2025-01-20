import { completion, generateEmbedding } from "./embeddings.js"
import { fetchCustomData, fetchCustomDataPdf } from "./getData.js";
import supabase from "./supabase.js";

const buildFullPrompt = (query, docsContext) => {
    const prompt_boilerplate =
        "Answer the question posed in the user query section using the provided context";
    const user_query_boilerplate = "USER QUERY: ";
    const document_context_boilerplate = "CONTEXT: ";
    const final_answer_boilerplate = "Final Answer: ";

    const filled_prompt_template = `
      ${prompt_boilerplate}
      ${user_query_boilerplate} ${query}
      ${document_context_boilerplate} ${docsContext} 
      ${final_answer_boilerplate}`;
    return filled_prompt_template;
};

const runPrompt = async (query) => {
    const vector = await generateEmbedding(query)
    console.log('\x1b[32m%s\x1b[0m', 'User prompt => ', query);

    let llmContext = '';
    const { data, error } = await supabase.rpc('match_food', {
        query_embedding: vector,
        match_threshold: .40, // similarity threshold
        match_count: 1
    })
    console.log('\x1b[33m%s\x1b[0m', 'Matching Vectors => ', data);

    const docs = await Promise.all(data.map(doc => fetchCustomData(doc.id)));
    //const docs = await Promise.all(data.map(doc => fetchCustomDataPdf(doc.id)));
    llmContext = docs.map(doc => doc.body).join(" ")

    //console.log('docs context', llmContext)
    // build prompt with RAG (mergwe with context)
    const filledPrompt = buildFullPrompt(query, llmContext);
    console.log('\x1b[35m%s\x1b[0m', 'Prompt to LLM => ', filledPrompt);
    // pass above to LLM 
    const answer = await completion(filledPrompt)
    console.log('\x1b[32m%s\x1b[0m', 'Answer from llm => ', answer);  // Cyan color for text


}

//runPrompt("Who founded Food on Wheels? ")
// runPrompt("Did I ordered for Chole Bhature and when ?")
runPrompt("Which is the most rated order?, can you tell the name of items ")
//runPrompt("can you help me decide what to order next ")