import connectDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { message, role } = await req.json();

    const prompt = `You are a delivery chat assistant helping with real-time order delivery conversations.

Role: ${role}
Last message: "${message}"

Generate exactly 5 unique, realistic WhatsApp-style reply suggestions for the ${role === "delivery_boy" ? "delivery boy" : "customer"} to send.

Rules:
- All replies must be in English only
- Each reply must be different and cover different angles (location update, ETA, confirmation, help offer, reassurance)
- Max 10 words per reply
- At most one emoji per reply, used naturally
- Relevant to: delivery status, location, ETA, instructions, or help
- No numbering, no bullet points, no extra text
- Return ONLY the 5 replies separated by | character

Example format: Reply one here | Reply two here | Reply three here | Reply four here | Reply five here`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    );

    const data = await response.json();
    console.log("FULL GEMINI RESPONSE:", JSON.stringify(data, null, 2));
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("RAW GEMINI:", JSON.stringify(replyText));

    if (!replyText) {
      const fallback =
        role === "delivery_boy"
          ? [
              "On my way! 🚴",
              "Reached nearby, coming up!",
              "5 mins away, hold on!",
              "Your order is almost there!",
              "Need any help with delivery?",
            ]
          : [
              "Where is my order? 📦",
              "How far are you now?",
              "Please come to main gate",
              "Can you call me on arrival?",
              "Is my order on the way?",
            ];
      return NextResponse.json(fallback, { status: 200 });
    }

    const suggestions = replyText
      .split("|")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0)
      .slice(0, 5);

    return NextResponse.json(suggestions, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `gemini error ${error}` },
      { status: 500 },
    );
  }
}
