# Custom Agent for Customer Support in Food Delivery

This repository contains a Node.js application designed to handle customer support queries related to food delivery services using a Retrieval-Augmented Generation (RAG) approach. The application utilizes vector embeddings and a Supabase database to provide accurate and context-aware responses.

## Overview

The application exposes an endpoint that can accept queries related to food delivery options. It leverages custom data uploaded by users in PDF format, processes this data to create vector embeddings, and stores these embeddings in a Supabase database for quick retrieval and accurate response generation.

## Prerequisites

- Node.js (>= 18.0) installed on your machine
- Access to a Supabase project
- PDF files containing data relevant to your customer support needs

## Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Prepare Your Data

Upload your custom data in PDF format. Ensure that these PDFs contain information relevant to the queries you expect from your users. Add your pdf files in assets/pdfs/ folder.

### Step 3: Configure Supabase

Create a new table in your [Supabase](https://supabase.com/) project to store vector embeddings. Set up the necessary configurations in your application to connect to your Supabase instance.

### Step 4: Configure Environment Variables

Copy the .env.example file to .env and update it with your actual configuration details:

```bash
cp .env.example .env
```

Update these variables in your .env file:

- **OPENAI_API_KEY**: Your OpenAI API key.
- **PORT**: The port number on which your server will run.
- **SUPABASE_PROJECT_URL**: The URL of your Supabase project.
- **SUPABASE_PROJECT_KEY**: Your Supabase project key.
- **SUPABASE_DB_FUNCTION_NAME**: The name of the database function in Supabase that your application will use.
- **SUPABASE_DB_TABLE**: The name of the table where vectors of custom content are stored.

### Step 6: Run the Application

Before starting your server, it's important to populate your database with the necessary embeddings from your PDF data.

```bash
npm run process-embeddings
```

Run the server to start listening for incoming queries:

```bash
npm run start
```

## Server Endpoints

**POST** `/mycustomagent/promptStream`

This endpoint handles streaming responses to user queries by accepting POST requests with a `messages` array. It analyzes the conversation context, matches the query to relevant database content using Supabase, and dynamically generates responses using OpenAI's chat completion API, streaming them back to the client.

### Usage

To interact with this endpoint, send a POST request with a JSON body containing a `messages` array that details the conversation context. Below is an example of how to format the request:

```bash
curl -X POST http://localhost:3000/mycustomagent/promptStream -H 'Content-Type: application/json' -d '{
  "messages": [
     {
      "role": "user",
      "content": "What did I ordered yesterday? "
    },
    {
      "role": "assistant",
      "content": "You ordered Butter Naan (3, ₹90) and Dal Makhani (1, ₹210) yesterday, January 12, 2025. The total amount for your order was ₹480, and you requested extra butter on the naan."
    },
    {
      "role": "user",
      "content": "Did I order paneer? "
    },
  ]
}'
```

This request format supports an interactive and context-aware communication flow, enhancing user experience by providing tailored responses based on the ongoing dialogue.

## Deployment

[Railway](https://railway.com/) offers a simple cloud platform for quickly deploying and scaling applications. Deploy this Node.js app on Railway to make your RAG app accessible from anywhere in the cloud.

## Contributing

Contributions to this project are welcome! Please feel free to fork the repository, make changes, and submit pull requests.
