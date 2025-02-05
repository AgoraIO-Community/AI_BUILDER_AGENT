# type: ignore
from flask import Flask, request, jsonify, Response
import asyncio
import os
from dotenv import load_dotenv
from prompt import run_prompt,run_prompt_stream
from openai_services import get_clarified_question

# Load environment variables
load_dotenv()

app = Flask(__name__)

@app.route('/mycustomagent/prompt', methods=['POST'])
async def handle_prompt():
    data = request.json.get('data')
    print("data in req",data)
    if not data or data.strip() == "":
        return jsonify(error='Invalid data format: "data" field is required and cannot be empty.'), 400

    try:
        response = await run_prompt(data)  # Ensure that runPrompt is appropriately adapted to synchronous or asynchronous
        return jsonify(message=response)
    except Exception as e:
        print(f'Error processing prompt: {e}')
        return jsonify(error='Error processing your request'), 500

@app.route('/mycustomagent/promptStream', methods=['POST'])
async def handle_prompt_stream():
    messages = request.json.get('messages')
    if not messages:
        return jsonify(error='Invalid request'), 400

    conversationContext = '\n'.join([f"{msg['role']}: {msg['content']}" for msg in messages])
    clarifiedQuestion = await getClarifiedQuestion(conversationContext)  # Adapt this to be synchronous or handle async correctly

    if not clarifiedQuestion:
        return jsonify(error="Failed to clarify the user's query"), 500

    try:
        response_stream = await run_prompt_stream(clarifiedQuestion)  # This function must be adapted to yield data for the stream
        return Response(response_stream(), mimetype="text/event-stream")
    except Exception as e:
        print(f'Error during streaming completion: {e}')
        return jsonify(error='Error processing your request'), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify(error='Endpoint not found'), 404


if __name__ == "__main__":
    PORT = int(os.getenv("PORT", 8000))
    app.run(port=PORT, debug=True) 