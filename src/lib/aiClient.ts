import OpenAI from "openai";

const USE_STUB_AI = false; // toggle for local dev
const AI_API_KEY = process.env.OPENAI_API_KEY;

if (!USE_STUB_AI && !AI_API_KEY) {
  throw new Error("AI_API_KEY missing in .env");
}

// ✅ Create OpenAI client
const client = new OpenAI({
  apiKey: AI_API_KEY,
});

/**
 * Send conversation history to AI provider and get a response.
 */
export async function complete(
  messages: { role: "user" | "assistant" | "system"; content: string }[]
) {
  if (USE_STUB_AI) {
    const lastUser = messages.filter((m) => m.role === "user").pop();
    return lastUser ? `Echo: ${lastUser.content}` : "Hello (stubbed AI).";
  }

  try {
    // Join messages into a plain text prompt
    const input = [
      "You are a career counselor who provides supportive, thoughtful, and empathetic advice. Also, you are a world-class expert in resume writing and job searching.",
      ...messages.map((m) => `${m.role}: ${m.content}`),
    ].join("\n");

    const response = await client.responses.create({
      model: "gpt-4o", // 👈 adjust model as needed
      input,
    });

    if (response.output_text) {
      return response.output_text;
    }

    return "(no output)";
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes("429")) {
        return "⚠️ AI is busy (rate limit). Please try again in a moment.";
      }
      if (err.message.includes("timeout")) {
        return "⚠️ AI took too long to respond. Try again.";
      }
      console.error("AI error:", err);
      return "⚠️ Failed to fetch AI response. Please retry.";
    }
    return "⚠️ Unknown error from AI.";
  }
}
