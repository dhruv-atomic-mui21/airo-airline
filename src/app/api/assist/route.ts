import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, customerProfile } = await req.json();

    const prompt = `You are an AI assistant helping a human customer service agent for Airo Airlines.
Below is the chat history between the customer and the bot (or the human agent). 
Also, here is the customer profile:
Name: ${customerProfile?.name}
Loyalty Tier: ${customerProfile?.loyaltyTier}
Points Balance: ${customerProfile?.pointsBalance}

Review the conversation and suggest a helpful, professional, and concise reply for the HUMAN AGENT to send to the customer. The suggestion should address their latest concern, offering compensation or alternatives if they are dealing with a disruption. Only output the suggested response text, nothing else.

Conversation History:
${messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

SUGGESTED AGENT REPLY:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY || '',
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate assistance from Gemini API');
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Error in agent assist:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate assistance. Ensure GEMINI_API_KEY is set in .env.local' },
      { status: 500 }
    );
  }
}
