import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { messages } = await request.json();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{role: "user", content: messages}]
    });

    return new Response(JSON.stringify(response.choices[0].message), {
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error generating response:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}