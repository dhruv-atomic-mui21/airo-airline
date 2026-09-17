import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, customerProfile } = await req.json();

    const systemInstruction = `You are Airo, a helpful and polite virtual assistant for Airo Airlines.
You have access to the following customer profile:
Name: ${customerProfile?.name}
Loyalty Tier: ${customerProfile?.loyaltyTier}
Points Balance: ${customerProfile?.pointsBalance}
Last Booking: ${customerProfile?.lastBooking}
Preferences: Seat ${customerProfile?.preferences?.seat}, Meal ${customerProfile?.preferences?.meal}

You must evaluate whether the customer's request can be resolved automatically by you (AI), or if it needs further assistance and must be escalated to alert the human agent workspace.

CAN BE HANDLED BY AI:
- FAQs, baggage allowances, loyalty tier perks, points balance inquiries
- General flight schedule questions, seat/meal preference confirmations
- Standard check-in policies and general assistance

REQUIRES HUMAN AGENT ESCALATION (needsEscalation = true):
- Flight cancellations, significant delays requesting compensation, refunds, or vouchers
- Lost, damaged, or delayed baggage claims and tracing
- Complex booking re-routes, payment disputes, or emergency travel issues
- Severe passenger frustration, complaints, or threats to take legal action
- Explicit request to speak with a human/live agent

You must output a single JSON object with the following schema:
{
  "reply": "Your concise, polite customer-facing message. If escalating, inform the customer warmly that you are alerting and connecting them to a human agent.",
  "needsEscalation": boolean,
  "escalationReason": "Brief description of why agent assistance is needed (e.g. 'Flight delay compensation request', 'Lost luggage trace', 'Customer requested live agent'), or null if handled by AI",
  "urgency": "normal" | "high" | "critical"
}`;

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
            temperature: 0.3,
            responseMimeType: 'application/json',
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate response from Gemini API');
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    let parsed: {
      reply: string;
      needsEscalation: boolean;
      escalationReason?: string | null;
      urgency?: 'normal' | 'high' | 'critical';
    };

    try {
      // Clean up in case there are markdown code blocks
      const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback if parsing fails
      const needsEscalation = /escalat|human|agent|representative/i.test(rawText);
      parsed = {
        reply: rawText,
        needsEscalation,
        escalationReason: needsEscalation ? 'Inquiry requires agent assistance' : null,
        urgency: 'normal',
      };
    }

    return NextResponse.json({
      reply: parsed.reply,
      needsEscalation: Boolean(parsed.needsEscalation),
      escalationReason: parsed.escalationReason || (parsed.needsEscalation ? 'Agent assistance requested' : null),
      urgency: parsed.urgency || 'normal',
    });
  } catch (error: any) {
    console.error('Error calling Gemini:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate response. Ensure GEMINI_API_KEY is set in .env' },
      { status: 500 }
    );
  }
}
