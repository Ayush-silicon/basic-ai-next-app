import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    // Ensure messages is an array (required by OpenAI)
    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request format: messages must be an array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    return new Response(
      JSON.stringify({ reply: response.choices[0].message }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error generating response:", error);

    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message || error }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
