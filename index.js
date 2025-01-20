

import { foodAppCategories } from "./slugs.js"
import { generateEmbedding } from './embeddings.js';
import supabase from './supabase.js';
import { fetchCustomData, fetchCustomDataPdf } from './getData.js';

// Retrive Custom Data --> Create Emebedding (model:text-embedding-3-small) --> store in VectorDB
// User Prompt --> Create Emebedding (model:text-embedding-3-small) --> match embedding in DB --> Out of relevant results prepare the prompt to LLM --> Get Final Answer

const createEmbeddings = async (slug) => {
    const data = await fetchCustomData(slug);
    // const data = await fetchCustomDataPdf(slug);

    // console.log('slug info', data)

    // generate  vectors for content
    const vector = await generateEmbedding(data.body)
    console.log(vector)

    const { error } = await supabase
        .from('food') // supabase db table
        .insert([
            { id: slug, title: data.attributes.title, url: slug, vector },
        ])
        .select()
    console.log(error)

}

const initApp = async () => {
    await Promise.all(foodAppCategories.map(slug => createEmbeddings(slug)));
}
initApp()

// Fetch Docs
// const handleDocs = async () => {
//     await Promise.all(docsList.map(slug => handleDoc(slug)));
// }
//handleDocs()
// const handleDoc = async (slug) => {
//     const data = await parseDocs(slug)
//     // gen vector
//     const vector = await generateEmbedding(data.body)
//     console.log(vector)

//     // store vecor with meta dta in vector db 

//     const { error } = await supabase
//         .from('docs')
//         .insert([
//             { id: slug, title: data.attributes.title, url: `https://reactnative.dev/docs/${slug}`, vector },
//         ])
//         .select()
//     console.log(error)

// }



