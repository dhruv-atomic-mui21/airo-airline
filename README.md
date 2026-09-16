# Airo Airlines CRM Demo MVP

This is a Next.js application designed as a minimum viable product (MVP) to demonstrate an AI-powered airline CRM and Helpline Automation tool, as outlined in the deep research report.

## Features

- **Customer Persona (`/customer`)**: An airline-branded chat interface. Passengers can ask FAQs, request booking changes, and escalate issues. The chat is powered by the Gemini API, simulating a robust RAG (Retrieval-Augmented Generation) pipeline using a mock customer profile context.
- **Agent Persona (`/agent`)**: A CRM workspace for human agents. It displays real-time active customer sessions, the customer's profile (Loyalty Tier, Preferences), and features an **"Agent Assist"** button. This button uses Gemini to instantly analyze the conversation history and suggest professional, context-aware responses.
- **Real-time Synchronization**: State is synchronized across browser tabs using `localStorage`, allowing for a real-time, interactive demo without needing a complex backend database.

## Prerequisites

1. Node.js (v18+)
2. A Gemini API Key from Google AI Studio.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables:
   Create a `.env.local` file in the root of the project and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Demo

To fully experience the application as intended:
1. Go to the landing page and click **Launch Customer Portal**. This will open a new tab.
2. Go back to the landing page and click **Launch Agent Workspace**. This will open another new tab.
3. Place the two tabs side-by-side.
4. Type a message as the Customer. Notice how it instantly appears in the Agent Workspace.
5. In the Agent Workspace, click the **Agent Assist (AI)** button. Notice how Gemini generates a contextual, professional reply for the agent to send.
6. Click send as the agent, and see it appear back in the customer's view!

## Deployment (Vercel)

Deploying this Next.js app to Vercel is highly recommended:

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Go to [Vercel](https://vercel.com/) and create a new project.
3. Import your repository.
4. In the **Environment Variables** section, add `GEMINI_API_KEY` and set it to your Gemini API key.
5. Click **Deploy**.

Because this MVP uses client-side storage for real-time syncing, **users testing the deployed version must have both tabs open in the same browser on the same device** to see the real-time syncing effect.
