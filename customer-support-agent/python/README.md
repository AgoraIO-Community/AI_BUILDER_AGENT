# Custom Agent for Customer Support in Food Delivery

This repository contains a Python application designed to handle customer support queries related to food delivery services using a Retrieval-Augmented Generation (RAG) approach. The application utilizes vector embeddings and a Supabase database to provide accurate and context-aware responses.

## Overview

The application leverages custom data uploaded by users in PDF format, processes this data to create vector embeddings, and stores these embeddings in a Supabase database for quick retrieval and accurate response generation.

## Prerequisites

- Python 3.8 or higher installed on your machine
- Access to a Supabase project
- PDF files containing data relevant to your customer support needs

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

### Step 2: Prepare Your Data

Upload your custom data in PDF format. Ensure that these PDFs contain information relevant to the queries you expect from your users. Add your PDF files in `assets/pdfs/` folder.

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

### Step 5: Database Function

This project uses a Supabase function to perform vector similarity searches to facilitate efficient querying of data based on embeddings. Here’s how to set up the necessary database function within your Supabase project:

You need to create a SQL function in your Supabase project that will perform the similarity matching. The below function `fn_match_food` calculates the cosine similarity between a query vector and vectors stored in your database, returning the closest matches based on the provided threshold.

Here's the definition of the function you need to add to your Supabase project:

```sql
CREATE OR REPLACE FUNCTION fn_match_food (
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id TEXT,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    food.id,
    1 - (food.vector <=> query_embedding) AS similarity
  FROM food
  WHERE 1 - (food.vector <=> query_embedding) > match_threshold
  ORDER BY (food.vector <=> query_embedding) ASC
  LIMIT match_count;
$$;
```

### Step 6: Run the Application

Before starting your server, it's important to populate your database with the necessary embeddings from your PDF data.

```bash
python src/main.py
```

Run the server to start listening for incoming queries:

```bash
python src/server.py
```

## Server Endpoints

**POST** `/mycustomagent/promptStream`

This endpoint handles streaming responses to user queries by accepting POST requests with a `messages` array. It analyzes the conversation context, matches the query to relevant database content using Supabase, and dynamically generates responses using OpenAI's chat completion API, streaming them back to the client

### Usage

To interact with this endpoint, send a POST request with a JSON body containing a `messages` array that details the conversation context. Below is an example of how to format the request:

```bash
curl -X POST http://localhost:000/mycustomagent/promptStream -H 'Content-Type: application/json' -d '{
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

Consider using platforms like [Heroku](https://www.heroku.com/), [AWS Lambda](https://aws.amazon.com/lambda/), or [Google Cloud Run](https://cloud.google.com/run) for deploying Python applications. These platforms offer great support for Python applications and can scale as needed.

## Contributing

Contributions to this project are welcome! Please feel free to fork the repository, make changes, and submit pull requests.
