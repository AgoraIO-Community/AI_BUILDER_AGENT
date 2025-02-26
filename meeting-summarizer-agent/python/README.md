# Custom Agent for Customer Support in Food Delivery

This repository contains a Python application designed to handle meeting summary or Minutes of meeting when during a call. It uses OpenAI to get the summary from meeting context

## Overview

The application exposes an endpoint that can accept user speech and generate a summary or minutes of a meeting. It uses OpenAI's GPT model to generate summaries based on user input and context from the conversations.

## Prerequisites

- Python 3.8 or higher installed on your machine

## Setup Instructions

### Step 1: Install Dependencies

If you are using a virtual environment, make sure it's activated before running the script. Activation commands depend on your operating system:

-For Windows:

```bash
.\venv\Scripts\activate
```

-For Unix or MacOS:

```bash
source venv/bin/activate
```

Replace venv with whatever your virtual environment directory is named if it's different.

-Ensure all dependencies are installed in your environment as required by your requirements.txt:

```bash
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables

Copy the .env.example file to .env and update it with your actual configuration details:

```bash
cp .env.example .env
```

Update these variables in your .env file:

- **OPENAI_API_KEY**: Your OpenAI API key.
- **PORT**: The port number on which your server will run.

### Step 3: Run the Application

Before starting your server, it's important to populate your database with the necessary embeddings from your PDF data.

Run the server to start listening for incoming queries:

```bash
python src/server.py
```

## Server Endpoints

**POST** `/mycustomagent/meetingSummaryStream`

This endpoint handles streaming responses to user queries by accepting POST requests with a `messages` array. It analyzes the conversation context, matches the query to relevant database content using Supabase, and dynamically generates responses using OpenAI's chat completion API, streaming them back to the client.t

### Usage

To interact with this endpoint, send a POST request with a JSON body containing a `messages` array that details the conversation context. Below is an example of how to format the request:

```bash
curl -X POST http://localhost:3000/mycustomagent/meetingSummaryStream -H 'Content-Type: application/json' -d '{
    "messages": [
        {
            "role": "user",
            "content": "Welcome everyone to our roundtable discussion on the future of AI agents in technology. Let's start with introductions. First, we have Alex"
        },
        {
            "role": "user",
            "content": "Hi, I'm Alex, a data scientist working on integrating AI into real-time decision-making systems"
        },
        {
            "role": "user",
            "content": "Agent, can you summarize the meeting ?"
        }
    ]
}'
```

This request format supports an interactive and context-aware communication flow, enhancing user experience by providing tailored responses based on the ongoing dialogue.

## Deployment

Consider using platforms like [Heroku](https://www.heroku.com/), [AWS Lambda](https://aws.amazon.com/lambda/), or [Google Cloud Run](https://cloud.google.com/run) for deploying Python applications. These platforms offer great support for Python applications and can scale as needed.

## Contributing

Contributions to this project are welcome! Please feel free to fork the repository, make changes, and submit pull requests.
