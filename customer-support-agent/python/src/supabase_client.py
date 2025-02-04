# Wrapper for Supabase functionality
# type: ignore
from supabase import create_client
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configures Supabase client with URL and Key from environment variables
url = os.getenv("SUPABASE_PROJECT_URL")
key = os.getenv("SUPABASE_PROJECT_KEY")
supabase = create_client(url, key)
print(supabase)
