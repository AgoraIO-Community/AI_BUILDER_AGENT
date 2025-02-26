# Custom Agent for Meeting Summary

This repository contains a Node.js application designed to handle meeting summary or Minutes of meeting when during a call. It uses OpenAI to get the summary from meeting context

## Overview

The application exposes an endpoint that can accept queries related to food delivery options. It leverages custom data uploaded by users in PDF format, processes this data to create vector embeddings, and stores these embeddings in a Supabase database for quick retrieval and accurate response generation.

## Prerequisites

- Node.js (>= 18.0) installed on your machine

## Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
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

Run the server to start listening for incoming queries:

```bash
npm run start
```

## Server Endpoints

**POST** `/mycustomagent/meetingSummaryStream`

This endpoint handles streaming responses to user queries by accepting POST requests with a `messages` array. It analyzes the conversation context, matches the query to relevant database content using Supabase, and dynamically generates responses using OpenAI's chat completion API, streaming them back to the client.

### Usage

To interact with this endpoint, send a POST request with a JSON body containing a `messages` array that details the conversation context. Below is an example of how to format the request:

```bash
curl -X POST http://localhost:3000/mycustomagent/meetingSummaryStream -H 'Content-Type: application/json' -d '{
  "messages": [
     {
      "role": "user",
      "content": "Welcome everyone for meetup on AI Agents? "
    },
    {
      "role": "user",
      "content": "An Autonomous AI agent can interact with the environment, make decisions, take action, and learn from the process."
    },
    {
      "role": "user",
      "content": "AI agents are designed to make decisions without human intervention to perform predefined (for now) tasks.? "
    },
  ]
}'
```

This request format supports an interactive and context-aware communication flow, enhancing user experience by providing tailored responses based on the ongoing dialogue.

## Deployment

[Railway](https://railway.com/) offers a simple cloud platform for quickly deploying and scaling applications. Deploy this Node.js app on Railway to make your RAG app accessible from anywhere in the cloud.

## Contributing

Contributions to this project are welcome! Please feel free to fork the repository, make changes, and submit pull requests.
