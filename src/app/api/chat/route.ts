import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, customerProfile } = await req.json();

    const systemInstruction = `You are Airo, a helpful and polite virtual assistant for Airo Airlines.
You have access to the following customer profile:
Name: ${customerProfile?.name}
Loyalty Tier: ${customerProfile?.loyaltyTier}
Points Balance: ${customerProfile?.pointsBalance}

Your job is to answer customer queries concisely and professionally. If the customer asks to speak to a human or if the query is very complex, acknowledge that you are escalating the chat to a human agent.`;

    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'bot' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY || '',
        },
        body: JSON.stringify({
          contents: formattedMessages,
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            temperature: 0.7,
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate response from Gemini API');
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Error calling Gemini:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate response. Ensure GEMINI_API_KEY is set in .env.local' },
      { status: 500 }
    );
  }
}
