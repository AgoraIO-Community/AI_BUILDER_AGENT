# type: ignore
import os
from dotenv import load_dotenv
from supabase_client import supabase
from openai_services import generate_embedding
from prompt import fetch_custom_data_pdf

# Load environment variables
load_dotenv()

# Define the verticals for food delivery services
food_delivery_verticals = ['customers', 'faq', 'feedbacks', 'orders', 'payments', 'complaints']

def create_embeddings(slug):
    # Fetch custom data from the PDF file associated with the given slug
    data = fetch_custom_data_pdf(slug)
    # Generate embeddings for the fetched data
    vector = generate_embedding(data)
    
    # Insert the generated vector into the Supabase database
    response = supabase.table(os.getenv("SUPABASE_DB_TABLE")).insert({"id": slug, "vector": vector}).execute()
    # Log any errors that occur during the insertion
    if response.error:
        print(response.error)
    else:
        print(f"Embeddings successfully stored for {slug}")

def init_app():
    # Create embeddings for all defined verticals
    for slug in food_delivery_verticals:
        create_embeddings(slug)

if __name__ == "__main__":
    init_app()
