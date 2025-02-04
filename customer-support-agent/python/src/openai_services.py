# type: ignore
import os
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# migrate to 1.0 version of openai => https://github.com/openai/openai-python/discussions/742

# Initialize OpenAI client with API key from environment variables
#openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
# Initialize OpenAI client with API key from environment variables
openai.api_key = os.getenv("OPENAI_API_KEY")

async def generate_embedding(input_text):
    """
    Generates an embedding vector for the given text input using OpenAI's embedding model.

    :param input_text: The text input to be embedded.
    :return: The embedding vector as a list of floats.
    """
    response = openai.Embedding.create(
        model="text-embedding-3-small",
        input=input_text,
        encoding_format="float",
    )
    vector = response.data[0].embedding
    return vector

async def completion(prompt):
    """
    Generates a completion based on the given prompt using OpenAI's GPT model.

    :param prompt: The prompt to be processed.
    :return: The generated completion text.
    """
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
    )

    print("response after completion", response)
    
    return response.choices[0].message.content

async def get_clarified_question(conversation_context):
    """
    Clarifies the user's question based on a conversation context, using OpenAI's chat completion.

    :param conversation_context: The context of the conversation.
    :return: The clarified question or None if an error occurs.
    """
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {
                    "role": "user",
                    "content": f"Given the following conversation, what is the user specifically asking about?\n\n{conversation_context}",
                }
            ],
        )
        print("Clarification response:", response)
        return response.choices[0].message.content.strip()
    except Exception as error:
        print("Failed to get clarification from OpenAI:", error)
        return None
    
async def completion_stream(prompt):
    """
    Streams a response from the OpenAI chat model for the given prompt, showing usage statistics.

    :param prompt: The prompt to be processed.
    :return: A stream of responses from the chat model.
    """
    stream = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
        stream_options={"include_usage": True},
        response_format={"type": "text"},
    )
    return stream
