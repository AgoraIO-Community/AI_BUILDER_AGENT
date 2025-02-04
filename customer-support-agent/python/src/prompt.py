# type: ignore
import os
from pathlib import Path
import PyPDF2
from dotenv import load_dotenv
from supabase_client import supabase
from openai_services import completion,completion_stream,generate_embedding
import asyncio


# Load environment variables
load_dotenv()


async def fetch_custom_data_pdf(slug: str) -> str | None:
    """
    Reads and extracts text from a specified PDF file located within a predefined directory.

    :param slug: The unique identifier for the PDF file to be read.
    :return: The extracted text as a string or None if an error occurs.
    """
    try:
        # Determine the directory of the current module
        module_directory = Path(__file__).resolve().parent
        # Build the file path for the PDF using the slug
        pdf_file_path = module_directory / "../../assets/pdfs" / f"{slug}.pdf"

        # Read the PDF file
        with open(pdf_file_path, "rb") as pdf_file:
            reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()

            # Clean the text from typical PDF formatting characters
            cleaned_text = text.replace("\u2022", "").replace("\u2023", "").replace("\u25E6", "").replace("\u2043", "").replace("\u2219", "").replace("-", "").replace("•", "").replace("◦", "").strip()
            return cleaned_text
    except Exception as error:
        print("Error reading the PDF file:", error)
        return None

def build_full_prompt(query: str, docs_context: str) -> str:
    """
    Constructs a formatted prompt for a language model based on the user's query and provided document context.

    :param query: The user's input query.
    :param docs_context: Contextual information from documents related to the query.
    :return: A structured prompt ready to be processed by a language model.
    """
    intro_boilerplate = "Answer the question posed in the user query section using the provided context."
    query_section = "USER QUERY: "
    context_section = "CONTEXT: "
    answer_section = "Final Answer: "

    full_prompt = f"""
    {intro_boilerplate}
    {query_section} {query}
    {context_section} {docs_context}
    {answer_section}"""

    return full_prompt

async def run_prompt(query: str) -> str | None:
    """
    Fetches and returns a response from a language model based on a provided query.

    :param query: The user's query to process.
    :return: The answer from the language model, or None in case of errors.
    """
    try:
        print("User prompt =>", query)

        # Generate an embedding for the user query
        query_embedding = await generate_embedding(query)
        if not query_embedding:
            raise Exception("Failed to generate query embedding")

        # Fetch matching data from the database using the generated embedding
        response = supabase.rpc(
            os.getenv("SUPABASE_DB_FUNCTION_NAME"),
            {
                "query_embedding": query_embedding,
                "match_threshold": 0.40,  # Set the similarity threshold for matching
                "match_count": 1,         # Number of matches to retrieve
            },
        ).execute()

        print("response after atching vector", response)

        if not response.data or len(response.data) == 0:
            raise Exception("No matching documents found")
        
     
        # Fetch PDF data based on the matched results
        documents = await asyncio.gather(*[fetch_custom_data_pdf(doc["id"]) for doc in response.data])

        print("matched documents", documents)

        if not documents or len(documents) == 0:
            raise Exception("Failed to fetch documents")

        # Build the prompt with the retrieved document data
        full_prompt = build_full_prompt(query, " ".join(documents))
        print("Prompt to LLM =>", full_prompt)

        # Get the response from the language model using the built prompt
        answer = await completion(full_prompt)
        print("Successfully fetched answer via LLM:", answer)

        return answer  # Return the fetched answer
    except Exception as error:
        print("Error running prompt:", error)
        return None  # Return None in case of an error

async def run_prompt_stream(query: str):
    """
    Streams responses from a language model as server-sent events based on a provided query.

    :param query: The user's input query.
    :return: A stream of the language model's responses.
    """
    try:
        print("User prompt =>", query)

        # Generate an embedding for the user query
        query_embedding = await generate_embedding(query)
        if not query_embedding:
            raise Exception("Failed to generate query embedding")

        # Fetch matching data from the database using the query embedding
        response = supabase.rpc(
            "fn_match_food",
            {
                "query_embedding": query_embedding,
                "match_threshold": 0.40,  # Similarity threshold for matching documents
                "match_count": 1,         # Retrieve only one match
            },
        ).execute()

        if not response.data or len(response.data) == 0:
            print("No matching documents found. Using default context.")
            return await completion_stream("No Information Available, please try again!")

        # Fetch PDF data based on the matched results
        documents_context = await asyncio.gather(*[fetch_custom_data_pdf(doc["id"]) for doc in response.data])

        # Build the prompt with the retrieved document data
        full_prompt = build_full_prompt(query, " ".join(documents_context))
        print("Prompt to LLM =>", full_prompt)

        # Return the completion stream from the language model
        return await completion_stream(full_prompt)
    except Exception as error:
        print("Error in run_prompt_stream:", error)
        return await completion_stream("Error processing your request. Please try again.")
    


    
# Example call to run_prompt
# if __name__ == "__main__":
#     loop = asyncio.get_event_loop()
#     question = "Which was my last order?"
#     answer = loop.run_until_complete(run_prompt(question))
#     print("Answer:", answer)